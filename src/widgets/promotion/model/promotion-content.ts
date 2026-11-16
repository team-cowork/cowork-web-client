// cowork-server/cowork-promotion의 data/*에서 옮겨 온 소개 문구다.
// 프로모션 사이트를 지우기 전까지는 두 곳의 문구를 함께 맞춘다.

export const GITHUB_ORGANIZATION_URL = 'https://github.com/team-cowork';

// 데스크톱 앱은 GitHub Releases로 배포한다. 현재는 macOS(.dmg)만 제공한다.
export const DESKTOP_APP_DOWNLOAD_URL = `${GITHUB_ORGANIZATION_URL}/cowork-desktop-app-client/releases/latest`;

export interface PromotionFeature {
  color: string;
  label: string;
  title: string;
  description: string;
  tags: string[];
}

export const PROMOTION_FEATURES: PromotionFeature[] = [
  {
    color: '#8b5cf6',
    label: 'Workspace',
    title: '실시간 협업 워크스페이스',
    description:
      '팀과 프로젝트별 공간에서 대화하며 함께 작업합니다. 누가 함께하고 있는지 실시간으로 확인합니다.',
    tags: ['Team', 'Channel'],
  },
  {
    color: '#10b981',
    label: 'Task',
    title: '태스크 관리',
    description:
      '할 일을 정리하고 진행 상황을 함께 관리합니다. 팀의 작업 흐름이 한눈에 보입니다.',
    tags: ['Task', 'Progress'],
  },
  {
    color: '#f43f5e',
    label: 'Meeting',
    title: '화상·음성 회의',
    description:
      '워크스페이스를 벗어나지 않고 바로 미팅을 시작합니다. 저지연 화상·음성으로 팀이 즉시 모입니다.',
    tags: ['Video', 'Voice'],
  },
  {
    color: '#6366f1',
    label: 'GitHub',
    title: 'GitHub 연동',
    description:
      '저장소의 변화를 워크스페이스에서 바로 확인합니다. 코드 작업과 팀의 대화가 자연스럽게 이어집니다.',
    tags: ['Repository', 'Integration'],
  },
  {
    color: '#f97316',
    label: 'Tracking',
    title: '진행 상황 추적',
    description:
      '태스크와 코드, 회의에서 일어나는 변화를 한곳에서 따라갑니다. 중요한 순간은 알림으로 바로 받습니다.',
    tags: ['Tracking', 'Notification'],
  },
  {
    color: '#0ea5e9',
    label: 'Search',
    title: '워크스페이스 탐색',
    description:
      '팀의 모든 채널을 가로질러 대화와 파일을 한 번에 찾습니다. 채널, 작성자, 첨부 여부로 원하는 결과만 좁혀 봅니다.',
    tags: ['Search', 'Filter'],
  },
];

export interface PromotionRepository {
  name: string;
  label: string;
  description: string;
}

export const PROMOTION_REPOSITORIES: PromotionRepository[] = [
  {
    name: 'cowork-server',
    label: 'Backend',
    description: 'MSA 기반 통합 백엔드 API 서버',
  },
  {
    name: 'cowork-web-client',
    label: 'Web',
    description: 'Next.js 기반 웹 브라우저 환경의 협업 클라이언트',
  },
  {
    name: 'cowork-desktop-app-client',
    label: 'Desktop',
    description: '데스크탑 환경의 협업 클라이언트',
  },
  {
    name: 'cowork-mobile-app-client',
    label: 'Mobile',
    description: '모바일 환경의 협업 클라이언트',
  },
];

export type PromotionPositionName =
  | 'Server'
  | 'Web Client'
  | 'Desktop App Client'
  | 'Mobile App Client'
  | 'Cloud'
  | 'Design';

export interface PromotionPosition {
  name: PromotionPositionName;
  color: string;
  description: string;
  technologies: string[];
}

export const PROMOTION_POSITIONS: PromotionPosition[] = [
  {
    name: 'Server',
    color: '#8b5cf6',
    description:
      '화면 뒤에서 cowork를 움직입니다. 메시지를 전달하고 업무 기록을 관리하며, 서비스의 핵심 기능을 만듭니다.',
    technologies: [
      'Kotlin',
      'Java',
      'Scala',
      'TypeScript',
      'Go',
      'C#',
      'Spring Boot',
      'Spring Cloud Gateway',
      'OpenFeign',
      'Vert.x',
      'Play Framework',
      'Node.js',
      'NestJS',
      'Gin',
      'Chi',
      'ASP.NET Core',
      'Socket.IO',
      'GraphQL / Apollo',
      'LiveKit',
      'MySQL',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'Elasticsearch',
      'SurrealDB',
      'SeaweedFS',
      'Flyway',
      'Apache Kafka',
      'Firebase Cloud Messaging',
      'Maven',
      'Gradle',
      'Kotlin Toolchain',
      'sbt',
    ],
  },
  {
    name: 'Web Client',
    color: '#eab308',
    description:
      '클릭과 결과 사이의 군더더기를 걷어냅니다. 웹에서 보고 누르는 화면을 만들어, 생각한 일을 곧바로 실행하게 합니다.',
    technologies: [
      'TypeScript',
      'React',
      'Next.js',
      'Tailwind CSS',
      'TanStack Query',
      'Axios',
      'LiveKit',
    ],
  },
  {
    name: 'Desktop App Client',
    color: '#0ea5e9',
    description:
      '컴퓨터를 팀의 작업실로 바꿉니다. 넓은 화면과 키보드에 맞춘 앱을 만들어, 일의 흐름을 이어갑니다.',
    technologies: [
      'Kotlin',
      'Kotlin Multiplatform',
      'Compose Multiplatform',
      'Ktor',
    ],
  },
  {
    name: 'Mobile App Client',
    color: '#f43f5e',
    description:
      '협업을 손안으로 가져옵니다. 이동 중에도 팀의 소식을 확인하고 대화에 참여할 수 있는 휴대폰 앱을 만듭니다.',
    technologies: ['Dart', 'Flutter', 'Bloc'],
  },
  {
    name: 'Cloud',
    color: '#f97316',
    description:
      'cowork가 멈추지 않도록 지켜냅니다. 서비스가 돌아갈 환경을 만들고, 문제를 감지하고 대응하며 안정적인 운영을 책임집니다.',
    technologies: [
      'Python',
      'Docker',
      'Docker Compose',
      'Nomad',
      'Consul',
      'Envoy',
      'Ansible',
      'OpenTofu',
      'GitHub Actions',
      'Vault',
      'NGINX',
      'Vercel',
      'Grafana',
      'Prometheus',
      'Loki',
      'Grafana Alloy',
      'Alertmanager',
    ],
  },
  {
    name: 'Design',
    color: '#14b8a6',
    description:
      '복잡함을 덜어내고, cowork만의 인상을 새깁니다. 화면의 흐름부터 색과 글자까지, 쓰기 쉽고 기억에 남게 다듬습니다.',
    technologies: ['Figma'],
  },
];

export interface PromotionMember {
  github: string;
  name: string;
  generation: number;
  roles: PromotionPositionName[];
}

export const PROMOTION_MEMBERS: PromotionMember[] = [
  {
    github: 'snowykte0426',
    name: '김태은',
    generation: 8,
    roles: ['Server', 'Desktop App Client'],
  },
  { github: 'jihoonwjj', name: '황지훈', generation: 8, roles: ['Server'] },
  { github: 'Sean-mn', name: '박현민', generation: 8, roles: ['Server'] },
  {
    github: 'wwwcomcomcomcom',
    name: '이세민',
    generation: 8,
    roles: ['Server'],
  },
  { github: 'jyx-07', name: '정종윤', generation: 9, roles: ['Server'] },
  { github: 'ZaMan0806', name: '배재현', generation: 9, roles: ['Server'] },
  { github: 'd1ng1724', name: '김동현', generation: 9, roles: ['Server'] },
  {
    github: 'kimseongchan0914',
    name: '김성찬',
    generation: 10,
    roles: ['Server'],
  },
  { github: 'chaeeun-09', name: '박채은', generation: 9, roles: ['Cloud'] },
  { github: 'Dino0204', name: '김준혁', generation: 8, roles: ['Web Client'] },
  { github: 'h-0y28', name: '정효주', generation: 8, roles: ['Web Client'] },
  {
    github: 'junjuny0227',
    name: '전준연',
    generation: 8,
    roles: ['Web Client'],
  },
  {
    github: 'LeeSangHyeok0731',
    name: '이상혁',
    generation: 8,
    roles: ['Web Client'],
  },
  {
    github: 'yeondon125',
    name: '정연돈',
    generation: 9,
    roles: ['Web Client'],
  },
  { github: 'hyooeunn', name: '이효은', generation: 9, roles: ['Web Client'] },
  { github: 'ma94275', name: '김민아', generation: 9, roles: ['Web Client'] },
  {
    github: 'aiden30015',
    name: '이주언',
    generation: 8,
    roles: ['Mobile App Client'],
  },
  {
    github: 'ryusuye0n',
    name: '류수연',
    generation: 9,
    roles: ['Mobile App Client'],
  },
  {
    github: 'leesiuuuu',
    name: '이시우',
    generation: 8,
    roles: ['Desktop App Client'],
  },
  { github: 'SeoRace', name: '서경주', generation: 8, roles: ['Design'] },
  { github: 'minsol1031', name: '김민솔', generation: 8, roles: ['Design'] },
];
