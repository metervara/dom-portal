type EasingFunction = (t: number, from?: number, to?: number) => number;

export const easing = {
  linear: (t: number, from = 0, to = 1): number =>
    from + (to - from) * t,

  easeInQuad: (t: number, from = 0, to = 1): number =>
    from + (to - from) * (t * t),

  easeOutQuad: (t: number, from = 0, to = 1): number =>
    from + (to - from) * (t * (2 - t)),

  easeInOutQuad: (t: number, from = 0, to = 1): number =>
    from + (to - from) * (t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t),

  easeInCubic: (t: number, from = 0, to = 1): number =>
    from + (to - from) * (t * t * t),

  easeOutCubic: (t: number, from = 0, to = 1): number =>
    from + (to - from) * (--t * t * t + 1),

  easeInOutCubic: (t: number, from = 0, to = 1): number =>
    from + (to - from) * (t < 0.5
      ? 4 * t * t * t
      : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
};

/**
 * Calculates individual progress for staggered animations
 * Returns value between 0 and duration
 */
export const getStaggeredTime = function(
  currentTime: number,
  index: number,
  stagger: number,
  duration: number
): number {
  // console.log(`Stagger ${currentTime}, ${index}, ${duration}, ${stagger}`)
  const delay = index * stagger;
  const localTime = currentTime - delay;

  return Math.min(Math.max(localTime, 0), duration);
}