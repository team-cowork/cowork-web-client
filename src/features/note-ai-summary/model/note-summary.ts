export interface ActionItem {
  title: string;
  body: string;
}

export interface NoteSummary {
  summary: string;
  decisions: string[];
  actionItems: ActionItem[];
}

export interface NoteSummaryRequest {
  title: string;
  content: string;
}

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item !== '');
}

function actionItems(value: unknown): ActionItem[] {
  if (!Array.isArray(value)) return [];
  const items: ActionItem[] = [];
  for (const raw of value) {
    if (typeof raw === 'string' && raw.trim() !== '') {
      items.push({ title: raw.trim(), body: '' });
    } else if (raw && typeof raw === 'object') {
      const { title, body } = raw as Record<string, unknown>;
      if (typeof title === 'string' && title.trim() !== '') {
        items.push({
          title: title.trim(),
          body: typeof body === 'string' ? body.trim() : '',
        });
      }
    }
  }
  return items;
}

/** 모델이 준 JSON 을 화면이 쓰는 모양으로 정리한다. 형식이 틀리면 null. */
export function parseNoteSummary(raw: unknown): NoteSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const summary = typeof record.summary === 'string' ? record.summary : '';
  const decisions = strings(record.decisions);
  const items = actionItems(record.actionItems);
  if (summary.trim() === '' && decisions.length === 0 && items.length === 0) {
    return null;
  }
  return { summary: summary.trim(), decisions, actionItems: items };
}
