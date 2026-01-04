# Dom Portal

Open content in portal holes in a page, skwing the page to make room for the content. 

## Install
```bash
npm i git+https://github.com/metervara/dom-portal.git#v1.0.0
```

## Quick start (one line setup)
```ts
import { setupDomPortal } from '@metervara/dom-portal';

setupDomPortal({
  portalTarget: '#content',   // element that gets cloned into the portal
  routerMode: 'query',        // 'hash' or 'none' also works
});
```

Markup for a trigger and inline content:
```html
<div id="content">
  <a data-portal="about" data-portal-inline="#about-portal" href="#">Open</a>
</div>

<div id="about-portal" data-portal-region="main" hidden>
  <div class="safe-area">
    <h2>About</h2>
    <p>Inline content rendered inside the portal.</p>
  </div>
</div>
```
Clicking the link emits `portal:trigger`, the portal opens at the click position, and the content is loaded.

## Portal content types
- Local HTML file (default): place `data-portal="demo"` on a link and create `/portal/content/demo.html` containing a `[data-portal-region="main"]`.
- Inline snippet: point the trigger at an existing element with `data-portal-inline="#selector"`. The element stays hidden in the page but its `data-portal-region="main"]` is cloned into the portal.
- External page (iframe): use `data-portal-url="https://example.com"`. The URL is loaded in an iframe and gains a `loaded` class when ready.

Optional extras on triggers:
- `data-portal-path` to override the default `/portal/content/{name}.html`
- `data-portal-size` to set portal width (e.g. `640px`, `75vw`, `50vh`)

## Routing (optional)
`setupDomPortal` wires a `PortalRouter` that mirrors portal state in the URL:
- `routerMode: 'query'` → `?portal=about`
- `routerMode: 'hash'` → `#/page/about`
- `routerMode: 'none'` → leaves the URL untouched (no routing)
Deep-linking works automatically: visiting a URL with a portal param opens the matching trigger and recenters the viewport.

## Helpful APIs
- `DomPortal.openAndReady(x, y, size?)` – open and wait for the content container.
- `DomPortal.closePortal()` / `togglePortal()` – control the portal manually (e.g. bind to `Escape`).
- `enhancePortalLinks()` – listens for clicks on `[data-portal]` and dispatches `portal:trigger`.
- `loadPortalContent(container, name, source)` / `unloadPortalContent()` – load or clear portal content.

## Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
git add .
git commit -m "Release v1.0.0"
git tag v1.0.0
git push --follow-tags
```