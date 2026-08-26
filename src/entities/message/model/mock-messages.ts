import { type Message } from '@/entities/message/model/message';

interface MockMessageSeed {
  authorId: number;
  authorName: string;
  hour: number;
  minute: number;
  content: string;
}

const MOCK_MESSAGE_SEEDS: MockMessageSeed[] = [
  {
    authorId: 1,
    authorName: 'junjuny',
    hour: 14,
    minute: 20,
    content:
      'PR #2 재연결 로직 리뷰 부탁드려요. 네트워크 상태 감시 부분이 핵심입니다.',
  },
  {
    authorId: 2,
    authorName: '도윤',
    hour: 14,
    minute: 22,
    content:
      '확인했어요. useEffect 의존성 배열에 socket 인스턴스가 빠진 것 같은데 한 번 봐주실래요?',
  },
  {
    authorId: 3,
    authorName: '서연',
    hour: 14,
    minute: 25,
    content: '방금 머지했습니다. CI 통과 확인했고 dev 서버에 반영했어요 🚀',
  },
  {
    authorId: 1,
    authorName: 'junjuny',
    hour: 14,
    minute: 30,
    content: '감사합니다! 그럼 이슈 #14 클로즈할게요.',
  },
  {
    authorId: 4,
    authorName: '민재',
    hour: 14,
    minute: 41,
    content: '다음 스프린트 칸반에 백로그 카드 3개 추가해뒀어요. 확인 부탁!',
  },
];

/**
 * 메시지 API 연동 전까지 채팅 화면을 채우는 퍼블리싱 전용 목 데이터.
 * 실제 API가 붙으면 이 파일과 use-mock-message-thread를 함께 제거한다.
 */
export function createMockMessages(
  channelId: number,
  now = new Date(),
): Message[] {
  return MOCK_MESSAGE_SEEDS.map((seed, index) => {
    const createdAt = new Date(now);

    createdAt.setHours(seed.hour, seed.minute, 0, 0);

    return {
      id: index + 1,
      channelId,
      authorId: seed.authorId,
      authorName: seed.authorName,
      authorImageUrl: null,
      content: seed.content,
      createdAt: createdAt.toISOString(),
    };
  });
}
