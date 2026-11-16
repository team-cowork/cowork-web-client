import Link from 'next/link';

import {
  DESKTOP_APP_DOWNLOAD_URL,
  GITHUB_ORGANIZATION_URL,
  PROMOTION_REPOSITORIES,
} from '@/widgets/promotion/model/promotion-content';
import { cn } from '@/shared/lib/cn';
import { HOME_PATH } from '@/shared/model/paths';
import { Badge } from '@/shared/ui/badge';
import { CoworkLogo } from '@/shared/ui/icons/cowork-logo';
import { GithubIcon } from '@/shared/ui/icons/github-icon';
import { FeatureShowcase } from '@/widgets/promotion/ui/feature-showcase';
import { PositionShowcase } from '@/widgets/promotion/ui/position-showcase';
import { TeamMarquee } from '@/widgets/promotion/ui/team-marquee';
import { TechStack } from '@/widgets/promotion/ui/tech-stack';

const linkButton =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-[18px] typography-label-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

interface PromotionPageProps {
  /** "웹에서 열기"가 이동할 경로 */
  openWebHref: string;
}

export function PromotionPage({ openWebHref }: PromotionPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href={HOME_PATH}
            aria-label="cowork 홈"
            className="flex items-center gap-2.5 text-primary"
          >
            <CoworkLogo className="h-6 w-auto" />
            <span className="typography-label-medium text-on-surface">
              cowork
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <PromotionHero openWebHref={openWebHref} />
        <PromotionRepositories />
        <FeatureShowcase />
        <TechStack />
        <PositionShowcase />
        <TeamMarquee />
      </main>

      <PromotionFooter />
    </div>
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
            className={cn(linkButton, 'bg-primary text-on-primary')}
          >
            웹에서 열기
          </Link>
          <a
            href={DESKTOP_APP_DOWNLOAD_URL}
            className={cn(
              linkButton,
              'bg-inverse-surface text-inverse-on-surface',
            )}
          >
            데스크톱 앱 설치 (macOS)
          </a>
          <a
            href={GITHUB_ORGANIZATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              linkButton,
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

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-12 flex flex-col gap-2">
      <h2 className="typography-display-medium">{title}</h2>
      <p className="typography-body-medium text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}

function PromotionRepositories() {
  return (
    <section className="bg-background px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="레포지토리"
          description="team-cowork 조직을 구성하는 프로젝트들"
        />
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
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PromotionFooter() {
  return (
    <footer className="border-t border-outline-variant px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col flex-wrap items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <CoworkLogo className="h-5 w-auto text-primary" />
          <span className="typography-label-small">cowork</span>
        </div>
        <span className="typography-subtext-medium text-on-surface-variant">
          © 2026 team-cowork · MIT License
        </span>
        <a
          href={GITHUB_ORGANIZATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="typography-subtext-medium text-on-surface-variant transition-colors hover:text-on-surface"
        >
          github.com/team-cowork
        </a>
      </div>
    </footer>
  );
}
