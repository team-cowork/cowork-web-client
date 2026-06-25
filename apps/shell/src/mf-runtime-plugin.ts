/**
 * 배포 시 nginx 가 env 로 생성하는 /config.js 가 window.__MF_REMOTES__ 를 주입한다.
 * beforeRequest 훅에서 매니페스트 fetch 직전에 remote entry URL 을 런타임 값으로 교체한다.
 *
 * registerRemotes 를 main.tsx 에서 호출하면 asyncStartup 의 remote 소비보다 늦어
 * 빌드타임 localhost URL 로 fetch 가 일어난다. beforeRequest 는 요청 시점에 개입하므로
 * 타이밍과 무관하게 런타임 URL 이 확실히 적용된다.
 * (dev 에는 config.js 가 없어 window.__MF_REMOTES__ 가 없으므로 빌드타임 URL 이 유지된다.)
 */

// 라이브러리 타입에 의존하지 않도록 사용하는 필드만 최소로 선언한다.
interface BeforeRequestArgs {
  id: string;
  options: { remotes: Array<{ name: string; entry?: string }> };
}

const remoteUrlOverride = () => ({
  name: 'cowork-remote-url-override',
  beforeRequest(args: BeforeRequestArgs) {
    const remotes = window.__MF_REMOTES__;
    if (remotes) {
      args.options.remotes.forEach((remote) => {
        const url = remotes[remote.name];
        if (url) {
          remote.entry = url;
        }
      });
    }
    return args;
  },
});

export default remoteUrlOverride;
