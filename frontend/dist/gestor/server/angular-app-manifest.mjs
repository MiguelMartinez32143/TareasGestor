
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: false,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 911, hash: '57c43453181c25683c0383c1d192100c09f6a5a6a180641351f84ddffb735117', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1451, hash: 'd4747cc59c36dd5c6e6f0ddb2a04ed8bfcb4113db24cbc1658002f7b3ce8c43c', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 15926, hash: '9f5f7c5d2545b10f8722453c4783f9303d10296b2f5538af3f086e2ea6c54cf6', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)}
  },
};
