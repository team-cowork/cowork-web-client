import { createElement, type ReactNode } from 'react';

import Link from 'next/link';

import {
  type LegalBlock,
  type LegalDocument,
  type LegalInline,
  plainText,
} from '@/widgets/promotion/model/legal-document';

function renderInlines(nodes: LegalInline[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.kind) {
      case 'text':
        return node.text;
      case 'strong':
        return <strong key={index}>{renderInlines(node.children)}</strong>;
      case 'link':
        return node.href.startsWith('/') ? (
          <Link key={index} href={node.href}>
            {renderInlines(node.children)}
          </Link>
        ) : (
          <a key={index} href={node.href}>
            {renderInlines(node.children)}
          </a>
        );
    }
  });
}

function Block({
  block,
  level,
  className,
}: {
  block: LegalBlock;
  level: number;
  className?: string;
}) {
  switch (block.kind) {
    case 'paragraph':
      return <p className={className}>{renderInlines(block.children)}</p>;
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag className={className}>
          {block.items.map((item, index) => (
            <li key={index}>{renderInlines(item)}</li>
          ))}
        </ListTag>
      );
    }
    case 'section':
      return (
        <section>
          {createElement(
            `h${Math.min(level, 6)}`,
            null,
            renderInlines(block.heading),
          )}
          {block.blocks.map((child, index) => (
            <Block key={index} block={child} level={level + 1} />
          ))}
        </section>
      );
  }
}

/** Gateway 법적 문서를 그린다. 구조와 클래스는 cowork-server #980의 legal-document.js와 같다. */
export function LegalDocumentView({
  document,
  lang,
}: {
  document: LegalDocument;
  lang: string;
}) {
  return (
    <div lang={lang}>
      <header>
        <h1>{document.title}</h1>
        {document.intro.map((block, index) => (
          <Block
            key={index}
            block={block}
            level={2}
            // 첫 장 앞의 순서 없는 목록은 운영 주체·문의·시행일 정보다.
            className={
              block.kind === 'list' && !block.ordered
                ? 'legal-details'
                : undefined
            }
          />
        ))}
      </header>

      {document.sections.length > 1 && (
        <nav className="legal-toc" aria-label={`${document.title} 목차`}>
          <h2>목차</h2>
          <ol>
            {document.sections.map((section, index) => (
              <li key={index}>
                <a href={`#section-${index + 1}`}>
                  {plainText(section.heading).replace(/^제?\d+조?\.\s*/, '')}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {document.sections.map((section, index) => {
        const id = `section-${index + 1}`;
        return (
          <section
            key={id}
            id={id}
            className="legal-section"
            aria-labelledby={`${id}-title`}
          >
            <h2 id={`${id}-title`}>{renderInlines(section.heading)}</h2>
            {section.blocks.map((child, childIndex) => (
              <Block key={childIndex} block={child} level={3} />
            ))}
          </section>
        );
      })}
    </div>
  );
}
