type PortalRoute = {
  page: string;
  portal?: string;
};

type PortalRouterOptions = {
  mode?: 'query' | 'hash';
  portalKey?: string;
};

type PortalRouterCallback = (route: PortalRoute) => void;

export class PortalRouter {
  private mode: 'query' | 'hash';
  private key: string;
  private callback?: PortalRouterCallback;

  constructor(options: PortalRouterOptions = {}) {
    this.mode = options.mode || 'query';
    this.key = options.portalKey || 'portal';
  }

  public init(callback: PortalRouterCallback): void {
    this.callback = callback;
    window.addEventListener('popstate', () => this.handleRouteChange());
    window.addEventListener('hashchange', () => this.handleRouteChange());
    this.handleRouteChange();
  }

  private handleRouteChange() {
    const route = this.getCurrentRoute();
    this.callback?.(route);
  }

  public getCurrentRoute(): PortalRoute {
    if (this.mode === 'hash') {
      const [page, portal] = window.location.hash.slice(1).split('/');
      return { page: page || '', portal };
    } else {
      const url = new URL(window.location.href);
      return {
        page: url.pathname.replace(/^\/+/, ''),
        portal: url.searchParams.get(this.key) || undefined
      };
    }
  }

  public open(portalName: string): void {
    if (this.mode === 'hash') {
      const { page } = this.getCurrentRoute();
      window.location.hash = `${page}/${portalName}`;
    } else {
      const url = new URL(window.location.href);
      url.searchParams.set(this.key, portalName);
      history.pushState({}, '', url.toString());
    }
    this.handleRouteChange();
  }

  public close(): void {
    if (this.mode === 'hash') {
      const { page } = this.getCurrentRoute();
      window.location.hash = `${page}/`;
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete(this.key);
      history.pushState({}, '', url.toString());
    }
    this.handleRouteChange();
  }
}
