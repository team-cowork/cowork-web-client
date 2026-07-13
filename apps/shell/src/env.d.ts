/// <reference types="@rsbuild/core/types" />

/**
 * 배포 시 nginx 가 env 로 치환한 /config.js 가 주입하는 런타임 remote 매핑.
 * key 는 MF remote name(cowork_chat 등), value 는 mf-manifest.json URL.
 */
interface Window {
  __MF_REMOTES__?: Record<string, string>;
  /** config.js가 주입하는 DataGSM PKCE 연동 설정(clientId·Cowork Authorization API 주소). */
  __AUTH_CONFIG__?: {
    clientId: string;
    authApiBaseUrl: string;
  };
}

/**
 * Imports the SVG file as a React component.
 * @requires [@rsbuild/plugin-svgr](https://npmjs.com/package/@rsbuild/plugin-svgr)
 */
declare module '*.svg?react' {
  import type React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module 'cowork_chat/App' {
  import type { ComponentType } from 'react';
  const App: ComponentType<{
    basepath?: string;
    channel?: { id: string; name: string; description?: string };
  }>;
  export default App;
}

declare module 'cowork_profile/App' {
  import type { ComponentType } from 'react';
  const App: ComponentType<{ basepath?: string }>;
  export default App;
}

declare module 'cowork_issue/App' {
  import type { ComponentType } from 'react';
  const App: ComponentType<{ basepath?: string }>;
  export default App;
}
