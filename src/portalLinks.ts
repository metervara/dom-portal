import { PortalRouter } from './portalRouter';

export function enhancePortalLinks(): void {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('[data-portal]') as HTMLElement;


    if (link) {
      console.log("PortalLink clicked");
      e.preventDefault();

      const portalName = link.getAttribute('data-portal');
      if (!portalName) return;

      const path = link.getAttribute('data-portal-path');
      const externalUrl = link.getAttribute('data-portal-url');
      const inlineSelector = link.getAttribute('data-portal-inline');

      // Use actual mouse position
      const clickX = e.clientX;
      const clickY = e.clientY;

      const size = link.getAttribute('data-portal-size') || undefined;


    console.log("Router init, portal:trigger", portalName);
      // Dispatch custom event that setupPortalSystem listens to
      window.dispatchEvent(new CustomEvent('portal:trigger', {
        detail: {
          portalName,
          clickX,
          clickY,
          path,
          externalUrl,
          inlineSelector,
          size,
        }
      }));
    }
  });
}
