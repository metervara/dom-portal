type PortalRoute = {
    page: string;
    portal?: string;
};
type PortalRouterOptions = {
    mode?: 'query' | 'hash';
    portalKey?: string;
};
type PortalRouterCallback = (route: PortalRoute) => void;
export declare class PortalRouter {
    private mode;
    private key;
    private callback?;
    constructor(options?: PortalRouterOptions);
    init(callback: PortalRouterCallback): void;
    private handleRouteChange;
    getCurrentRoute(): PortalRoute;
    open(portalName: string): void;
    close(): void;
}
export {};
//# sourceMappingURL=portalRouter.d.ts.map