export type PortalContentSource = {
    type: "html";
    path: string;
} | {
    type: "external";
    url: string;
} | {
    type: "inline";
    selector: string;
};
export declare function loadPortalContent(container: HTMLElement, name: string, source: PortalContentSource): Promise<void>;
export declare function unloadPortalContent(): void;
//# sourceMappingURL=portalLoader.d.ts.map