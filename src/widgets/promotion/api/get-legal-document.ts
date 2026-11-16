import { XMLParser } from 'fast-xml-parser';

import {
  type LegalBlock,
  type LegalDocument,
  type LegalDocumentType,
  type LegalInline,
} from '@/widgets/promotion/model/legal-document';

// 개인정보처리방침·이용약관·라이선스의 원본은 Gateway가 관리한다(cowork-server #980, #981).
// 서버에서 XML을 받아 검증한 뒤 화면에 그릴 구조로 바꾼다. 문서 형식은 PR의 legal-document.js와 같다.

const FETCH_TIMEOUT_MS = 10_000;
/** 문서가 바뀌어도 다시 배포하지 않도록 짧게만 캐시한다. 실패한 응답은 캐시하지 않는다. */
const REVALIDATE_SECONDS = 600;

type XmlNode = Record<string, unknown> & {
  '#text'?: string;
  ':@'?: Record<string, string>;
};

const parser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: '',
  trimValues: false,
  parseTagValue: false,
  parseAttributeValue: false,
});

const tagOf = (node: XmlNode) =>
  Object.keys(node).find((key) => key !== ':@') ?? '';
const childrenOf = (node: XmlNode) => (node[tagOf(node)] ?? []) as XmlNode[];
const attribute = (node: XmlNode, name: string) => node[':@']?.[name];

/** 공백 텍스트를 뺀 블록 요소들. 블록 자리에 글자가 있으면 형식 오류다. */
function blockChildren(node: XmlNode) {
  return childrenOf(node).filter((child) => {
    if (tagOf(child) !== '#text') return true;
    if (child['#text']?.trim())
      throw new Error('Invalid legal document block.');
    return false;
  });
}

function isAllowedHref(href: string) {
  if (href.startsWith('/') && !href.startsWith('//')) return true;
  if (!/^(?:https:\/\/|mailto:)/.test(href)) return false;
  const url = new URL(href);
  return !url.username && !url.password;
}

function inlines(node: XmlNode): LegalInline[] {
  return childrenOf(node).map((child) => {
    switch (tagOf(child)) {
      case '#text':
        return { kind: 'text', text: child['#text'] ?? '' };
      case 'strong':
        return { kind: 'strong', children: inlines(child) };
      case 'link': {
        const href = attribute(child, 'href') ?? '';
        if (!isAllowedHref(href)) {
          throw new Error('Unsupported legal document link.');
        }
        return { kind: 'link', href, children: inlines(child) };
      }
      default:
        throw new Error('Unsupported legal document inline element.');
    }
  });
}

const plainText = (nodes: LegalInline[]): string =>
  nodes
    .map((node) =>
      node.kind === 'text' ? node.text : plainText(node.children),
    )
    .join('');

function block(node: XmlNode): LegalBlock {
  switch (tagOf(node)) {
    case 'paragraph':
      return { kind: 'paragraph', children: inlines(node) };
    case 'list': {
      const ordered = attribute(node, 'ordered');
      if (ordered !== 'true' && ordered !== 'false') {
        throw new Error('Invalid legal document list.');
      }
      return {
        kind: 'list',
        ordered: ordered === 'true',
        items: blockChildren(node).map((item) => {
          if (tagOf(item) !== 'item') {
            throw new Error('Invalid legal document list item.');
          }
          return inlines(item);
        }),
      };
    }
    case 'section': {
      const [heading, ...rest] = blockChildren(node);
      if (!heading || tagOf(heading) !== 'heading') {
        throw new Error('Missing legal document section heading.');
      }
      const title = inlines(heading);
      if (!plainText(title).trim()) {
        throw new Error('Missing legal document heading.');
      }
      return { kind: 'section', heading: title, blocks: rest.map(block) };
    }
    default:
      throw new Error('Unsupported legal document block.');
  }
}

export function parseLegalDocument(
  xml: string,
  expectedType: LegalDocumentType,
): LegalDocument {
  // Gateway 형식에는 DTD가 없다. 엔티티 확장을 막기 위해 아예 받지 않는다.
  if (xml.includes('<!DOCTYPE')) {
    throw new Error('Unsupported legal document declaration.');
  }

  const root = (parser.parse(xml) as XmlNode[]).find(
    (node) => tagOf(node) === 'document',
  );
  if (!root || attribute(root, 'type') !== expectedType) {
    throw new Error('Invalid legal document XML.');
  }

  const [title, ...rest] = blockChildren(root);
  if (!title || tagOf(title) !== 'title') {
    throw new Error('Missing legal document title.');
  }

  const blocks = rest.map(block);
  const firstSection = blocks.findIndex((item) => item.kind === 'section');
  const intro = firstSection === -1 ? blocks : blocks.slice(0, firstSection);
  const sections = firstSection === -1 ? [] : blocks.slice(firstSection);
  if (sections.some((item) => item.kind !== 'section')) {
    throw new Error('Legal document block outside a section.');
  }

  return {
    title: plainText(inlines(title)),
    intro,
    sections: sections as Extract<LegalBlock, { kind: 'section' }>[],
  };
}

/** Gateway에서 문서를 받는다. 받지 못하거나 형식이 맞지 않으면 null을 돌려준다. */
export async function getLegalDocument(
  type: LegalDocumentType,
): Promise<LegalDocument | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) return null;

  try {
    const response = await fetch(
      new URL(`legal/${type}`, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`),
      {
        headers: { Accept: 'application/xml' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
    const contentType = response.headers
      .get('content-type')
      ?.split(';', 1)[0]
      .trim()
      .toLowerCase();
    if (
      !response.ok ||
      !contentType ||
      !['application/xml', 'text/xml'].includes(contentType)
    ) {
      throw new Error(`Gateway responded ${response.status} ${contentType}`);
    }
    return parseLegalDocument(await response.text(), type);
  } catch (error) {
    console.warn(
      `법적 문서(${type})를 Gateway에서 받지 못했습니다.`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
