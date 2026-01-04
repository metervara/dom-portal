import "./styles/portal.css";
import "./styles/content.css";

export function hello(name: string) {
  return `Hello, ${name}!`;
}

export { DomPortal } from './DomPortal';
export { PortalRouter } from './portalRouter';
export { loadPortalContent, unloadPortalContent } from './portalLoader';
export type { PortalContentSource } from './portalLoader';
export { enhancePortalLinks } from './portalLinks';
export { setupDomPortal } from './setupDomPortal';