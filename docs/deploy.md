# 배포 가이드

cowork-client 를 Docker Compose + nginx 로 배포하는 방법을 정리한다.

## 구조

rsbuild 로 정적 빌드되는 4개 앱(`shell` host + `cowork-chat`/`cowork-issue`/`cowork-profile` remote)을
Module Federation 으로 통합한다. 런타임 Node 서버는 없고 **nginx 가 정적 파일을 직접 서빙**한다.

```
                         ┌─────────────────────────── VM 1대 ───────────────────────────┐
   브라우저  ──:80──▶  nginx(라우팅)                                                     │
                         │   /                  ──▶  shell    (정적, host SPA)            │
                         │   /_mf/chat/         ──▶  chat      (정적 remote)              │
                         │   /_mf/issue/        ──▶  issue     (정적 remote)              │
                         │   /_mf/profile/      ──▶  profile   (정적 remote)              │
                         │   /config.js         ──▶  envsubst 로 생성된 remote 매핑       │
                         └──────────────────────────────────────────────────────────────┘
```

- **단일 오리진**: 외부엔 nginx 80 포트 하나만 노출 → CORS 없음.
- **앱별 독립 이미지**: 앱마다 ghcr 이미지(`ghcr.io/team-cowork/cowork-client/<app>`)로 분리 → 한 앱만 재배포 가능.
- **런타임 remote 등록**: shell 이 부팅 시 `/config.js`(`window.__MF_REMOTES__`)를 읽어 `registerRemotes` 로 remote URL 을
  런타임에 주입한다. 재빌드 없이 환경·URL 전환이 가능하다.
- **remote 에셋은 `/_mf/<app>/` 네임스페이스**로 분리해 shell 의 SPA 라우트(`/chat` 등)와 충돌하지 않는다.

## 이미지 빌드 / Push (CI)

`develop` 브랜치 push 시 `.github/workflows/deploy.yml` 이 4개 이미지를 빌드해 ghcr 에 push 한다.
태그: `:develop`, `:<commit-sha>`.

수동 빌드도 가능하다(앱별 `APP`/`ASSET_PREFIX`/`SUBPATH` 인자):

```bash
docker build \
  --build-arg APP=cowork-chat \
  --build-arg ASSET_PREFIX=/_mf/chat/ \
  --build-arg SUBPATH=_mf/chat/ \
  -t ghcr.io/team-cowork/cowork-client/cowork-chat:develop .
```

| APP             | ASSET_PREFIX   | SUBPATH      |
| --------------- | -------------- | ------------ |
| shell           | `/`            | (빈값)       |
| cowork-chat     | `/_mf/chat/`   | `_mf/chat/`  |
| cowork-issue    | `/_mf/issue/`  | `_mf/issue/` |
| cowork-profile  | `/_mf/profile/`| `_mf/profile/`|

## VM 배포

1. VM 에 레포(또는 `compose.yaml` + `nginx/` 디렉터리)와 `.env` 를 둔다.
   ```bash
   cp .env.example .env   # SERVER_NAME 등 값 채우기
   ```
2. ghcr 로그인(이미지가 private 인 경우):
   ```bash
   echo $GHCR_TOKEN | docker login ghcr.io -u <github-username> --password-stdin
   ```
3. 전체 배포:
   ```bash
   docker compose pull
   docker compose up -d
   ```
4. `http://<VM-IP>/` 접속 확인.

## 단일 앱 독립 재배포

chat 만 바뀐 경우 다른 앱 무중단으로:

```bash
docker compose pull chat
docker compose up -d chat
```

shell 의 remote URL 은 `/_mf/chat/mf-manifest.json` 로 고정이므로, chat 이미지만 교체해도 shell 재빌드가 필요 없다
(노출 모듈 계약 `./App` 이 유지되는 한).

## 로컬 검증

```bash
docker compose build          # 4개 이미지 로컬 빌드
docker compose up             # http://localhost 접속
```

- `http://localhost/config.js` 가 `window.__MF_REMOTES__` 반환
- `/` → shell 로드 후 `/chat`·`/issue`·`/profile` 이동 시 각 remote 가 마운트(DevTools Network 에서 `/_mf/<app>/mf-manifest.json` fetch 확인)

## env 변수

`.env`(compose 가 자동 로드):

| 변수                 | 기본값                              | 설명                                  |
| -------------------- | ----------------------------------- | ------------------------------------- |
| `IMAGE_TAG`          | `develop`                           | pull 할 이미지 태그                   |
| `SERVER_NAME`        | `_`                                 | nginx server_name (도메인)            |
| `CHAT_REMOTE_URL`    | `/_mf/chat/mf-manifest.json`        | chat remote 매니페스트 URL            |
| `ISSUE_REMOTE_URL`   | `/_mf/issue/mf-manifest.json`       | issue remote 매니페스트 URL           |
| `PROFILE_REMOTE_URL` | `/_mf/profile/mf-manifest.json`     | profile remote 매니페스트 URL         |

> TLS/HTTPS 는 현재 미포함(HTTP 80 만). 도메인 연결 후 certbot 추가는 후속 작업.
