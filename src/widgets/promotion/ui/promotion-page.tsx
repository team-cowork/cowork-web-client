import Link from 'next/link';

import {
  GITHUB_ORGANIZATION_URL,
  PROMOTION_REPOSITORIES,
} from '@/widgets/promotion/model/promotion-content';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { CoworkLogo } from '@/shared/ui/icons/cowork-logo';
import { GithubIcon } from '@/shared/ui/icons/github-icon';
import { DesktopDownloadButton } from '@/widgets/promotion/ui/desktop-download-button';
import { FeatureShowcase } from '@/widgets/promotion/ui/feature-showcase';
import { PositionShowcase } from '@/widgets/promotion/ui/position-showcase';
import { PromotionLayout } from '@/widgets/promotion/ui/promotion-layout';
import { TeamMarquee } from '@/widgets/promotion/ui/team-marquee';
import { TechStack } from '@/widgets/promotion/ui/tech-stack';

export const promotionLinkButton =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-[18px] typography-label-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

interface PromotionPageProps {
  /** "웹에서 열기"가 이동할 경로 */
  openWebHref: string;
}

export function PromotionPage({ openWebHref }: PromotionPageProps) {
  return (
    <PromotionLayout>
      <PromotionHero openWebHref={openWebHref} />
      <PromotionRepositories />
      <FeatureShowcase />
      <TechStack />
      <PositionShowcase />
      <TeamMarquee />
    </PromotionLayout>
  );
}

function PromotionHero({ openWebHref }: PromotionPageProps) {
  return (
    <section className="px-6 pt-28 pb-24 text-center">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <CoworkLogo className="mb-10 h-[119px] w-auto text-primary" />
        <h1 className="mb-5 text-[clamp(4rem,20vw,6rem)] leading-none font-black tracking-tighter">
          cowork
        </h1>
        <p className="mb-2 typography-body-large text-on-surface-variant">
          광주소프트웨어마이스터고등학교
        </p>
        <p className="mb-12 typography-title-large">
          학생들이 만드는 협업 관리 플랫폼
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={openWebHref}
            className={cn(promotionLinkButton, 'bg-primary text-on-primary')}
          >
            웹에서 열기
          </Link>
          <DesktopDownloadButton
            className={cn(
              promotionLinkButton,
              'bg-inverse-surface text-inverse-on-surface',
            )}
          />
          <a
            href={GITHUB_ORGANIZATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              promotionLinkButton,
              'bg-surface-variant text-on-surface-variant',
            )}
          >
            <GithubIcon size={16} />
            GitHub 조직 바로가기
          </a>
        </div>
      </div>
    </section>
  );
}

function PromotionRepositories() {
  return (
    <section className="bg-background px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-2">
          <h2 className="typography-display-medium">레포지토리</h2>
          <p className="typography-body-medium text-on-surface-variant">
            team-cowork 조직을 구성하는 프로젝트들
          </p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2">
          {PROMOTION_REPOSITORIES.map((repository) => (
            <li key={repository.name}>
              <a
                href={`${GITHUB_ORGANIZATION_URL}/${repository.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col gap-2 rounded-3xl bg-surface p-7 transition-colors hover:bg-surface-container-high"
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary-container text-primary">
                    <GithubIcon size={18} />
                  </span>
                  <Badge>{repository.label}</Badge>
                </div>
                <h3 className="typography-label-small font-mono">
                  {repository.name}
                </h3>
                <p className="typography-body-x-small text-on-surface-variant">
                  {repository.description}
                </p>
                <div className="mt-4 overflow-hidden rounded-xl border border-outline-variant">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 외부 서비스가 매번 새로 그리는 SVG 그래프라 이미지 최적화를 거치지 않는다. */}
                  <img
                    src={`https://github-repository-language-graph-wi.vercel.app/api?username=team-cowork&repo=${repository.name}&theme=auto&langs_count=100&precision=2`}
                    alt={`${repository.name} 언어 비율`}
                    width={495}
                    height={repository.graphHeight}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full"
                  />
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
