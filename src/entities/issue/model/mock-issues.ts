// TODO(임시): 발표용 목 데이터. 서버 이슈 API를 연동하면 이 파일을 지운다.
import { type Issue, type IssueStatus } from '@/entities/issue/model/issue';

export const MOCK_ISSUES: Record<IssueStatus, Issue[]> = {
  PLANNED: [
    {
      id: 14,
      title: '음성 채널 인원 제한 설정 UI',
      labels: [
        { name: '음성', color: 'green' },
        { name: 'UI', color: 'green' },
      ],
      dueDate: '03.20',
      assignee: '서연',
    },
    {
      id: 16,
      title: '웹훅 보안 모드 시크릿 재발급 플로우',
      labels: [
        { name: '백엔드', color: 'amber' },
        { name: '보안', color: 'red' },
      ],
      assignee: '도윤',
    },
    {
      id: 21,
      title: '파일 채널 갤러리/리스트 뷰 토글',
      labels: [{ name: '프론트', color: 'blue' }],
      assignee: '민재',
    },
  ],
  IN_PROGRESS: [
    {
      id: 42,
      title: '재연결 로직 리팩터링 — useEffect 의존성',
      labels: [{ name: '버그', color: 'red' }],
      dueDate: '03.15',
      assignee: '도윤',
    },
    {
      id: 33,
      title: '계정 공유 PW 마스킹 권한 게이팅',
      labels: [
        { name: '보안', color: 'red' },
        { name: 'UI', color: 'green' },
      ],
      assignee: '서연',
    },
  ],
  DONE: [
    {
      id: 40,
      title: '토스트 프로바이더 API 추가',
      labels: [{ name: '완료', color: 'green' }],
      assignee: '민재',
    },
    {
      id: 37,
      title: '다크 테마 토큰 정의 및 Pretendard 적용',
      labels: [{ name: '디자인', color: 'blue' }],
      assignee: '서연',
    },
  ],
};
