// window.__MF_REMOTES__(/config.js)로 remote URL 을 fetch 직전에 런타임 교체한다.
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
