type InlinePortalContentSource = {
    type: "inline";
    selector: string;
    mode?: "clone" | "move";
};
export type PortalContentSource = {
    type: "html";
    path: string;
} | {
    type: "external";
    url: string;
} | InlinePortalContentSource;
export declare function loadPortalContent(container: HTMLElement, name: string, source: PortalContentSource): Promise<void>;
export declare function unloadPortalContent(): void;
export {};
//# sourceMappingURL=portalLoader.d.ts.map