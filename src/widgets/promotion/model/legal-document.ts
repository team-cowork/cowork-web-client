/** Gateway의 /api/legal/{type} 문서 종류 */
export type LegalDocumentType =
  'privacy-policy' | 'terms-of-service' | 'license';

export type LegalInline =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; children: LegalInline[] }
  | { kind: 'link'; href: string; children: LegalInline[] };

export type LegalBlock =
  | { kind: 'paragraph'; children: LegalInline[] }
  | { kind: 'list'; ordered: boolean; items: LegalInline[][] }
  | { kind: 'section'; heading: LegalInline[]; blocks: LegalBlock[] };

export interface LegalDocument {
  title: string;
  /** 첫 장 앞에 오는 안내 문단과 운영 정보 목록 */
  intro: LegalBlock[];
  sections: Extract<LegalBlock, { kind: 'section' }>[];
}
