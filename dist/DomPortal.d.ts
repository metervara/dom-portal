export declare class DomPortal {
    private targetElement;
    private parentElement;
    private portalElement;
    private targetRect;
    private parentRect;
    private portalCenterX;
    private portalCenterY;
    private portalWidthOpenHalf;
    private state;
    private animationFrameId;
    private transitionGeneration;
    private transitionEndHandler;
    private transitionElement;
    private resizeObserver;
    private handleGlobalClick;
    constructor(targetElement: HTMLElement);
    /**
     * Public methods
     */
    /**
     * Open that ensures content container is ready for loading
     */
    openAndReady(posX: number, posY: number, size?: string): Promise<HTMLElement>;
    openPortal(posX: number, posY: number, size?: string): void;
    closePortal(posX: number, posY: number, opts?: {
        instant?: boolean;
    }): void;
    togglePortal(posX: number, posY: number): void;
    destroy(): void;
    /**
     * Private methods - DOM utils
     */
    private parseSize;
    private measureRects;
    private createPortalElements;
    private deletePortalElements;
    /**
     * Private methods - state & animation
     */
    private setState;
    private open;
    private close;
    private onOpened;
    private onClosed;
    /**
     *
     * @param from The starting value for the item beeing animated
     * @param to  The end valeu for the item beeing animated (ms)
     * @param duration duration of animation of single item (ms)
     * @param stagger stagger delay if multiple holes
     * @param onComplete
     *
     * // TODO: Fix ranges. using multiple ranges, normalized, staggered is less, and then we have the full...
     * // TODO: Fix ranges. At the moment this might not work if from and to are not in the raneg 0 to 1
     */
    private animateTransition;
    private clearTransitionListener;
}
//# sourceMappingURL=DomPortal.d.ts.map