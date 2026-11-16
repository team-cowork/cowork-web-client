import {
  PROMOTION_MEMBERS,
  PROMOTION_POSITIONS,
  type PromotionMember,
} from '@/widgets/promotion/model/promotion-content';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/avatar';

import './team-marquee.css';

const positionColor = (member: PromotionMember) =>
  PROMOTION_POSITIONS.find((position) => position.name === member.roles[0])
    ?.color;

function MemberCard({
  member,
  isDuplicate,
}: {
  member: PromotionMember;
  isDuplicate: boolean;
}) {
  return (
    <a
      href={`https://github.com/${member.github}`}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={isDuplicate ? -1 : undefined}
      className="flex min-w-[200px] shrink-0 items-center gap-3 rounded-2xl border border-outline-variant bg-surface px-4 py-3 select-none"
    >
      <Avatar
        src={`https://avatars.githubusercontent.com/${member.github}?s=96`}
        name={member.name}
        size={44}
        shape="circle"
        className="ring-2 ring-outline-variant"
      />
      <div className="min-w-0">
        <p className="truncate text-sm leading-tight font-semibold">
          {member.name}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: positionColor(member) }}
          />
          <span className="truncate text-xs text-on-surface-variant">
            {member.roles.join(' | ')}
          </span>
          <span className="shrink-0 rounded-full bg-surface-container px-1.5 py-0.5 text-xs leading-4 font-medium text-on-surface-variant">
            {member.generation}기
          </span>
        </div>
      </div>
    </a>
  );
}

function MarqueeRow({
  members,
  direction,
}: {
  members: PromotionMember[];
  direction: 'left' | 'right';
}) {
  // 같은 목록을 두 번 이어 붙여 끊김 없이 흐르게 한다. 두 번째 묶음은 보조 기술에서 숨긴다.
  return (
    <div className="marquee-window">
      <div className={cn('marquee-row', `marquee-${direction}`)}>
        {[false, true].map((isDuplicate) => (
          <ul
            key={String(isDuplicate)}
            className="marquee-group"
            aria-hidden={isDuplicate || undefined}
          >
            {members.map((member) => (
              <li key={member.github}>
                <MemberCard member={member} isDuplicate={isDuplicate} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/** 팀원 카드가 두 줄로 서로 반대 방향으로 흐르는 띠. 원본: team-marquee.js */
export function TeamMarquee() {
  const midpoint = Math.ceil(PROMOTION_MEMBERS.length / 2);
  return (
    <section className="py-24">
      <div className="mx-auto mb-12 flex max-w-6xl flex-col gap-2 px-6">
        <h2 className="typography-display-medium">팀원</h2>
        <p className="typography-body-medium text-on-surface-variant">
          cowork을 만드는 사람들
        </p>
      </div>
      <div className="marquee-track space-y-4">
        <MarqueeRow
          members={PROMOTION_MEMBERS.slice(0, midpoint)}
          direction="left"
        />
        <MarqueeRow
          members={PROMOTION_MEMBERS.slice(midpoint)}
          direction="right"
        />
      </div>
    </section>
  );
}
