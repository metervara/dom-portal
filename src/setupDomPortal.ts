import { DomPortal } from './DomPortal';
import { PortalRouter } from './portalRouter';
import { enhancePortalLinks } from './portalLinks';
import { loadPortalContent, unloadPortalContent } from './portalLoader';

type SetupOptions = {
  routerMode?: 'query' | 'hash' | 'none';
  portalTarget: string;
};

export function setupDomPortal(options: SetupOptions) {
  const targetElement = document.querySelector(options.portalTarget) as HTMLElement;
  if (!targetElement) {
    throw new Error(`Portal target "${options.portalTarget}" not found`);
  }

  const portal = new DomPortal(targetElement);
  const routerMode = options.routerMode || 'query';
  const router = routerMode === 'none' ? undefined : new PortalRouter({ mode: routerMode });
  let suppressNextRoute = false;

  enhancePortalLinks();

  // Handle click-based opening
  window.addEventListener('portal:trigger', async (e: any) => {
    const {
      portalName,
      clickX,
      clickY,
      path,
      externalUrl,
      inlineSelector,
      size,
      scrollIntoView = false
    } = e.detail;
    
    try {
      const container = await portal.openAndReady(clickX, clickY, size);
      let source: Parameters<typeof loadPortalContent>[2];
      if (inlineSelector) {
        source = { type: 'inline', selector: inlineSelector };
      } else if (externalUrl) {
        source = { type: 'external', url: externalUrl };
      } else {
        const resolvedPath = path || `/portal/content/${portalName}.html`;
        source = { type: 'html', path: resolvedPath };
      }

      await loadPortalContent(container, portalName, source);

      if (router) {
        suppressNextRoute = true;
        try {
          router.open(portalName);
        } finally {
          suppressNextRoute = false;
        }
      }

      if(scrollIntoView) {
        window.scrollTo({
          top: clickY - (window.innerHeight / 2),
          behavior: 'smooth'
        });
      }
    } catch (err) {
      console.error('Portal failed to open:', err);
    }

  });

  window.addEventListener('portal:closed', () => {
    unloadPortalContent();

    if (router) {
      suppressNextRoute = true;
      try {
        router.close();
      } finally {
        suppressNextRoute = false;
      }
    }
  });


  // Handle routing (on load or URL change)
  router?.init(async ({ portal: portalName }) => {
    if (suppressNextRoute) return;

    if (!portalName) {
      portal.closePortal(0, 0);
      return;
    }
  
    const link = document.querySelector(`[data-portal="${portalName}"]`) as HTMLElement;
    if (!link) {
      console.warn(`No portal link found for '${portalName}'`);
      return;
    }
    const customPath = link?.getAttribute('data-portal-path');
    const externalUrl = link?.getAttribute('data-portal-url');
    const inlineSelector = link?.getAttribute('data-portal-inline');
  
    const rect = link?.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = (rect.top + rect.height / 2) + window.scrollY; // Absolute from the top...
    
    const event = new CustomEvent('portal:trigger', {
      detail: {
        portalName,
        clickX: x,
        clickY: y,
        path: customPath || (inlineSelector ? undefined : `/portal/content/${portalName}.html`),
        externalUrl,
        inlineSelector,
        scrollIntoView: true,
      },
    });
    
    window.dispatchEvent(event);
  });

  return {
    portal,
    router,
  };
}
