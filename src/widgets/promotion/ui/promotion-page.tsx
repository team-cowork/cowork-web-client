import { type CSSProperties } from 'react';

import Link from 'next/link';

import {
  DESKTOP_APP_DOWNLOAD_URL,
  GITHUB_ORGANIZATION_URL,
  PROMOTION_MEMBERS,
  PROMOTION_POSITIONS,
  PROMOTION_REPOSITORIES,
} from '@/widgets/promotion/model/promotion-content';
import { cn } from '@/shared/lib/cn';
import { HOME_PATH } from '@/shared/model/paths';
import { Avatar } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { CoworkLogo } from '@/shared/ui/icons/cowork-logo';
import { GithubIcon } from '@/shared/ui/icons/github-icon';
import { FeatureShowcase } from '@/widgets/promotion/ui/feature-showcase';

const accentStyle = (color: string) => ({ '--accent': color }) as CSSProperties;

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
          <Link
            href={openWebHref}
            className={cn(linkButton, 'h-9 bg-primary text-on-primary')}
          >
            웹에서 열기
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <PromotionHero openWebHref={openWebHref} />
        <FeatureShowcase />
        <PromotionPositions />
        <PromotionRepositories />
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
            target="_blank"
            rel="noopener noreferrer"
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

function PromotionPositions() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading title="팀원" description="cowork을 만드는 사람들" />
        <div className="flex flex-col gap-12">
          {PROMOTION_POSITIONS.map((position) => (
            <article
              key={position.name}
              style={accentStyle(position.color)}
              className="grid gap-6 border-t border-outline-variant pt-10 lg:grid-cols-[2fr_3fr]"
            >
              <div className="flex flex-col gap-3">
                <span className="size-2.5 rounded-full bg-(--accent)" />
                <h3 className="typography-title-medium">{position.name}</h3>
                <p className="typography-body-x-small break-keep text-on-surface-variant">
                  {position.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {position.technologies.map((technology) => (
                    <Badge key={technology}>{technology}</Badge>
                  ))}
                </div>
              </div>
              <ul className="flex flex-wrap content-start gap-3">
                {PROMOTION_MEMBERS.filter((member) =>
                  member.roles.includes(position.name),
                ).map((member) => (
                  <li key={member.github}>
                    <a
                      href={`https://github.com/${member.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-2xl bg-surface-container py-2.5 pr-4 pl-2.5 transition-colors hover:bg-surface-container-high"
                    >
                      <Avatar
                        src={`https://avatars.githubusercontent.com/${member.github}?s=64`}
                        name={member.name}
                        size={32}
                        shape="circle"
                      />
                      <span className="flex flex-col">
                        <span className="typography-label-x-small">
                          {member.name}
                        </span>
                        <span className="typography-subtext-small text-on-surface-variant">
                          {member.generation}기
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
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
