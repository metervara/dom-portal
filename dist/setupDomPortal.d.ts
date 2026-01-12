import { DomPortal } from './DomPortal.js';
import { PortalRouter } from './portalRouter.js';
type SetupOptions = {
    routerMode?: 'query' | 'hash' | 'none';
    portalTarget: string;
};
export declare function setupDomPortal(options: SetupOptions): {
    portal: DomPortal;
    router: PortalRouter | undefined;
};
export {};
//# sourceMappingURL=setupDomPortal.d.ts.map