import { useState } from 'react';

import {
  Avatar,
  Button,
  IconButton,
  SegmentedControl,
  Switch,
  TextArea,
  TextField,
} from '@cowork/ui';

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/example')({
  component: ComponentGallery,
});

const sizes = ['S', 'M', 'L'] as const;
const colors = ['brand', 'neutral', 'danger'] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-outline-variant flex flex-col gap-4 border-b pb-8">
      <h2 className="typography-title-small text-on-background">{title}</h2>
      {children}
    </section>
  );
}

function ComponentGallery() {
  const [checked, setChecked] = useState(true);
  const [seg2, setSeg2] = useState('list');
  const [seg3, setSeg3] = useState('all');

  return (
    <div className="bg-background min-h-screen p-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <h1 className="typography-display-small text-on-background">Common Components</h1>

        <Section title="Button">
          {(['fill', 'weak'] as const).map((variant) => (
            <div key={variant} className="flex flex-col gap-3">
              {colors.map((color) => (
                <div key={color} className="flex items-center gap-3">
                  {sizes.map((size) => (
                    <Button key={size} size={size} variant={variant} color={color}>
                      버튼
                    </Button>
                  ))}
                  <Button size="M" variant={variant} color={color} disabled>
                    Disabled
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </Section>

        <Section title="Icon Button">
          {(['fill', 'border', 'clear'] as const).map((variant) => (
            <div key={variant} className="flex items-center gap-3">
              {sizes.map((size) => (
                <IconButton key={size} size={size} variant={variant} aria-label="추가">
                  <PlusIcon />
                </IconButton>
              ))}
              <IconButton size="M" variant={variant} aria-label="추가" disabled>
                <PlusIcon />
              </IconButton>
            </div>
          ))}
        </Section>

        <Section title="Switch">
          <div className="flex items-center gap-4">
            <Switch checked={checked} onCheckedChange={setChecked} aria-label="알림" />
            <Switch checked={!checked} onCheckedChange={(v) => setChecked(!v)} aria-label="알림" />
            <Switch checked disabled aria-label="알림" />
            <Switch checked={false} disabled aria-label="알림" />
          </div>
        </Section>

        <Section title="Segmented Control">
          <div className="flex flex-col gap-3">
            <SegmentedControl
              options={[
                { label: '목록', value: 'list' },
                { label: '지도', value: 'map' },
              ]}
              value={seg2}
              onChange={setSeg2}
              size="M"
            />
            <SegmentedControl
              options={[
                { label: '전체', value: 'all' },
                { label: '미읽음', value: 'unread' },
                { label: '즐겨찾기', value: 'fav' },
              ]}
              value={seg3}
              onChange={setSeg3}
              size="L"
            />
          </div>
        </Section>

        <Section title="Text Field / Text Area">
          <div className="flex max-w-md flex-col gap-4">
            <TextField label="이메일" placeholder="name@cowork.dev" />
            <TextField label="이메일" placeholder="name@cowork.dev" error="잘못된 형식입니다" />
            <TextField label="이메일" placeholder="name@cowork.dev" disabled />
            <TextArea label="메모" placeholder="내용을 입력하세요" />
          </div>
        </Section>

        <Section title="Avatar">
          <div className="flex items-center gap-4">
            <Avatar name="전준연" size={32} />
            <Avatar name="Cowork" size={48} />
            <Avatar name="CW" size={72} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
