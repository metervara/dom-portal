import "./styles/portal.css";
import "./styles/content.css";

export function hello(name: string) {
  return `Hello, ${name}!`;
}

export { DomPortal } from './DomPortal.js';
export { PortalRouter } from './portalRouter.js';
export { loadPortalContent, unloadPortalContent } from './portalLoader.js';
export type { PortalContentSource } from './portalLoader.js';
export { enhancePortalLinks } from './portalLinks.js';
export { setupDomPortal } from './setupDomPortal.js';