import { useState } from 'react';

import {
  AttachmentCard,
  Avatar,
  Badge,
  Button,
  ChannelListItem,
  Dialog,
  EmptyState,
  ErrorState,
  FileUploadProgress,
  IconButton,
  LoadingPane,
  Menu,
  MenuItem,
  MenuSeparator,
  MessageComposer,
  MessageItem,
  Modal,
  OptionCard,
  SegmentedControl,
  SettingRow,
  StatusBadge,
  Switch,
  TextArea,
  TextField,
  Toast,
  ToastProvider,
  useToast,
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [channel, setChannel] = useState('general');
  const [message, setMessage] = useState('');
  const [plan, setPlan] = useState('dev');
  const [notify, setNotify] = useState(true);

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

        <Section title="Dialog">
          <div>
            <Button variant="weak" color="neutral" onClick={() => setDialogOpen(true)}>
              다이얼로그 열기
            </Button>
            <Dialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              title="채널을 아카이브할까요?"
              description="아카이브한 채널은 언제든 목록에서 복구할 수 있습니다."
            >
              <Button variant="weak" color="neutral" onClick={() => setDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={() => setDialogOpen(false)}>아카이브</Button>
            </Dialog>
          </div>
        </Section>

        <Section title="Toast">
          <Toast icon={<CheckIcon />} message="파일 업로드가 완료되었습니다" />
        </Section>

        <Section title="Toast Provider">
          <ToastProvider>
            <ToastDemo />
          </ToastProvider>
        </Section>

        <Section title="Channel List Item">
          <div className="flex max-w-xs flex-col gap-1">
            <ChannelListItem
              name="일반 채팅"
              active={channel === 'general'}
              unreadCount={3}
              onClick={() => setChannel('general')}
            />
            <ChannelListItem
              name="공지사항"
              active={channel === 'notice'}
              onClick={() => setChannel('notice')}
            />
            <ChannelListItem
              name="개발팀"
              active={channel === 'dev'}
              unreadCount={128}
              onClick={() => setChannel('dev')}
            />
          </div>
        </Section>

        <Section title="Message Item">
          <div className="flex max-w-xl flex-col gap-4">
            <MessageItem
              author="전준연"
              timestamp="오후 14:20"
              content="PR 리뷰 부탁해요. 변경된 상세 설명은 노션 문서에 정리했습니다."
            />
            <MessageItem
              author="Cowork Bot"
              timestamp="오후 14:22"
              content="배포가 성공적으로 완료되었습니다 🎉"
            />
          </div>
        </Section>

        <Section title="Message Composer">
          <div className="max-w-xl">
            <MessageComposer
              value={message}
              onChange={setMessage}
              onSend={() => setMessage('')}
              leading={<PaperclipIcon />}
            />
          </div>
        </Section>

        <Section title="Attachment Card">
          <div className="flex max-w-xs flex-col gap-2">
            <AttachmentCard name="sprint-demo.mov" meta="MOV · 12MB" onRemove={() => {}} />
            <AttachmentCard name="설계-문서-최종-v2-진짜최종.pdf" meta="PDF · 2.4MB" />
          </div>
        </Section>

        <Section title="File Upload Progress">
          <div className="flex max-w-md flex-col gap-4">
            <FileUploadProgress name="leave-log.png" progress={73} />
            <FileUploadProgress name="db-dump.sql" progress={100} />
          </div>
        </Section>

        <Section title="Empty State">
          <EmptyState
            icon={<ChatIcon />}
            title="아직 메시지가 없습니다"
            description="첫 메시지를 보내 팀과 시작하세요"
            action={<Button size="S">메시지 보내기</Button>}
          />
        </Section>

        <Section title="Loading Pane">
          <LoadingPane />
        </Section>

        <Section title="Error State">
          <div className="max-w-md">
            <ErrorState
              title="불러오기에 실패했습니다"
              description="네트워크 상태를 확인한 뒤 다시 시도하세요"
              action={
                <Button color="danger" size="S">
                  다시 시도
                </Button>
              }
            />
          </div>
        </Section>

        <Section title="Badge">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>기본</Badge>
            <Badge color="brand">브랜드</Badge>
            <Badge color="green">완료</Badge>
            <Badge color="blue">정보</Badge>
            <Badge color="amber">경고</Badge>
            <Badge color="red">오류</Badge>
          </div>
        </Section>

        <Section title="Status Badge">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="planned">계획됨</StatusBadge>
            <StatusBadge status="inProgress">진행중</StatusBadge>
            <StatusBadge status="done">완료됨</StatusBadge>
            <StatusBadge status="open">Open</StatusBadge>
            <StatusBadge status="closed">Closed</StatusBadge>
          </div>
        </Section>

        <Section title="Option Card">
          <div className="grid max-w-xl grid-cols-2 gap-3">
            <OptionCard
              icon={<HashIcon />}
              label="일반 채팅"
              description="텍스트·음성 대화"
              selected={plan === 'general'}
              onClick={() => setPlan('general')}
            />
            <OptionCard
              icon={<ChatIcon />}
              label="개발 프로젝트"
              description="채널 5개 자동 구성"
              selected={plan === 'dev'}
              onClick={() => setPlan('dev')}
            />
          </div>
        </Section>

        <Section title="Setting Row">
          <div className="flex max-w-xl flex-col gap-2">
            <SettingRow label="알림 받기" description="새 메시지 푸시 알림">
              <Switch checked={notify} onCheckedChange={setNotify} aria-label="알림" />
            </SettingRow>
            <SettingRow label="공개 범위" description="팀 전체에게 표시">
              <Button size="S" variant="weak" color="neutral">
                변경
              </Button>
            </SettingRow>
          </div>
        </Section>

        <Section title="Menu">
          <Menu className="max-w-[240px]">
            <MenuItem icon={<EyeIcon />}>읽음 표시</MenuItem>
            <MenuItem icon={<BellIcon />} hasSubmenu>
              알림 설정
            </MenuItem>
            <MenuSeparator />
            <MenuItem icon={<GearIcon />}>채널 설정</MenuItem>
            <MenuItem icon={<TrashIcon />} danger>
              채널 삭제
            </MenuItem>
          </Menu>
        </Section>

        <Section title="Modal">
          <div>
            <Button variant="weak" color="neutral" onClick={() => setModalOpen(true)}>
              모달 열기
            </Button>
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="채널 만들기"
              footer={
                <>
                  <Button variant="weak" color="neutral" onClick={() => setModalOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={() => setModalOpen(false)}>만들기</Button>
                </>
              }
            >
              <TextField label="채널 이름" placeholder="# 새-채널" />
              <p className="typography-subtext-medium text-on-surface-variant">
                유형과 공개 범위를 선택하세요.
              </p>
            </Modal>
          </div>
        </Section>
      </div>
    </div>
  );
}

function ToastDemo() {
  const { toast } = useToast();
  return (
    <Button onClick={() => toast('파일 업로드가 완료되었습니다', { icon: <CheckIcon /> })}>
      토스트 띄우기
    </Button>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="m20 6-11 11-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
      className="text-on-surface-variant size-5"
    >
      <path
        d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8 2 2 0 1 1-2.8 2.8 1.6 1.6 0 0 0-2.7 1.1 2 2 0 0 1-4 0 1.6 1.6 0 0 0-2.7-1.1 2 2 0 1 1-2.8-2.8A1.6 1.6 0 0 0 4.6 15a2 2 0 0 1 0-4 1.6 1.6 0 0 0 1.1-2.7 2 2 0 1 1 2.8-2.8A1.6 1.6 0 0 0 11 4.6a2 2 0 0 1 4 0 1.6 1.6 0 0 0 2.7 1.1 2 2 0 1 1 2.8 2.8A1.6 1.6 0 0 0 19.4 11a2 2 0 0 1 0 4z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
