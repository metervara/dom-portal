export declare const easing: {
    linear: (t: number, from?: number, to?: number) => number;
    easeInQuad: (t: number, from?: number, to?: number) => number;
    easeOutQuad: (t: number, from?: number, to?: number) => number;
    easeInOutQuad: (t: number, from?: number, to?: number) => number;
    easeInCubic: (t: number, from?: number, to?: number) => number;
    easeOutCubic: (t: number, from?: number, to?: number) => number;
    easeInOutCubic: (t: number, from?: number, to?: number) => number;
};
/**
 * Calculates individual progress for staggered animations
 * Returns value between 0 and duration
 */
export declare const getStaggeredTime: (currentTime: number, index: number, stagger: number, duration: number) => number;
//# sourceMappingURL=animation.d.ts.map