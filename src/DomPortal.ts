
type PortalState = "closed" | "opening" | "open" | "closing";

// TODO: Might refactor...
// TODO: With new set up, I only need two outer zones, one for left and one for right. Leave for now
const zones: string[] = [
  "top-left-outer",
  "top-left-inner",
  "top-right-outer",
  "top-right-inner",
  "bottom-left-outer",
  "bottom-left-inner",
  "bottom-right-outer",
  "bottom-right-inner",
];

export class DomPortal {
  // DOM references
  private targetElement: HTMLElement;
  private parentElement: HTMLElement | null;
  private portalElement: HTMLElement | null = null; // Wrapper for the portal dom elements
  // private holeElement: HTMLElement | null = null; // Hole element, where we place the content of the portal
  // private holeLayers: HTMLElement[] = [];

  // Geometry
  private targetRect: DOMRect | undefined;
  private parentRect: DOMRect | undefined;
  private portalCenterX: number = 0;
  private portalCenterY: number = 0;
  private portalWidthOpenHalf: number = 0;

  // State & animation
  private state: PortalState = "closed";
  // private transitionProgress: number = 0;
  private animationFrameId: number | null = null;
  private transitionTimeoutId: number | null = null;
  private resizeObserver: ResizeObserver;
  private handleGlobalClick: (event: MouseEvent) => void;
  // private handleWindowResize: () => void;

  constructor(targetElement: HTMLElement) {
    this.targetElement = targetElement;
    this.parentElement = targetElement.parentElement; // IF NULL, error?

    // Target parent must have relative position
    const parentStyle = window.getComputedStyle(this.parentElement!);
    const parentIsRelativeOrAbsolute =
      parentStyle.position === "relative" ||
      parentStyle.position === "absolute";
    if (!parentIsRelativeOrAbsolute) {
      console.error(
        "Dom portal only works if the parent of the target element is positioned relative or absolute"
      );
      // TODO: Throw error?
    }

    this.resizeObserver = new ResizeObserver(() => {
      if (this.state === "closed") return;

      this.measureRects();

      this.portalElement?.style.setProperty(
        "--clone-width",
        `${Math.round(this.targetRect!.width)}px`
      );
      this.portalElement?.style.setProperty(
        "--clone-height",
        `${Math.round(this.targetRect!.height)}px`
      );
    });
    this.resizeObserver.observe(this.targetElement);

    this.handleGlobalClick = (event: MouseEvent) => {
      if (this.state === "closed") return;

      console.log('handleGlobalClick', event);

      const target = event.target as HTMLElement;

      // Keep portal open when interacting with the content container
      if (target.closest(".metervara-portal-content-container")) {
        return;
      }

      // Any other click while the portal is open closes it
      console.log('closePortal from handleGlobalClick');
      this.closePortal(0, 0);
    };

    // Capture phase to ensure we see the click even if underlying elements handle it
    document.addEventListener("click", this.handleGlobalClick, true);

    // this.handleWindowResize = () => {
    //   if (this.state === "closed") return;
    //   this.closePortal(0, 0, { instant: true });
    // };
    // window.addEventListener("resize", this.handleWindowResize);
  }

  /**
   * Public methods
   */
  /**
   * Open that ensures content container is ready for loading
   */
  public async openAndReady(
    posX: number,
    posY: number,
    size?: string
  ): Promise<HTMLElement> {
    this.openPortal(posX, posY, size);

    return new Promise((resolve, reject) => {
      const check = () => {
        const container = document.querySelector(
          ".metervara-portal-content-container"
        ) as HTMLElement;
        if (container) {
          resolve(container);
        } else if (this.state === "closed") {
          reject(new Error("Portal closed before container was ready"));
        } else {
          requestAnimationFrame(check);
        }
      };

      requestAnimationFrame(check);
    });
  }

  public openPortal(posX: number, posY: number, size?: string): void {
    if (this.state !== "closed") return;

    this.measureRects();

    this.portalWidthOpenHalf = this.parseSize(size) * 0.5;
    // this.portalWidthOpenHalfDiagonal = 

    // Reevaluate this. Should we just use whatever is passed in?
    this.portalCenterX = posX - this.parentRect!.left;
    this.portalCenterY = posY - this.parentRect!.top;

    this.createPortalElements();

    // Delay open, to ensure transition runs
    requestAnimationFrame(() => {
      this.open(); // Apply transition-triggering class here
    });
  }

  public closePortal(
    posX: number,
    posY: number,
    opts: { instant?: boolean } = {}
  ): void {
    if (this.state !== "open" && this.state !== "opening") return;
    console.log('closePortal', this.state);

    if (opts.instant) {
      console.log('closePortal instant');
      this.clearTransitionTimeout();
      this.setState("closed");
      this.deletePortalElements();
      return;
    }

    // If we are mid-opening, mark as open so the close animation can run
    if (this.state === "opening") {
      this.clearTransitionTimeout();
      this.setState("open");
    }

    this.close();
  }

  public togglePortal(posX: number, posY: number): void {
    if (this.state === "closed") {
      this.openPortal(posX, posY);
    } else if (this.state === "open" || this.state === "opening") {
      this.closePortal(posX, posY);
    }
  }

  public destroy() {
    this.resizeObserver.disconnect();
    document.removeEventListener(
      "click",
      this.handleGlobalClick,
      true
    );
    // window.removeEventListener("resize", this.handleWindowResize);

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.clearTransitionTimeout();
    this.deletePortalElements();
  }

  /**
   * Private methods - DOM utils
   */
  private parseSize(size?: string): number {
    const defaultSize = this.parentRect!.width * 0.25;
    if (!size) {
      return defaultSize;
    }

    if (size.endsWith("px")) {
      return parseFloat(size);
    } else if (size.endsWith("vw")) {
      const vw = parseFloat(size);
      return (window.innerWidth * vw) / 100;
    } else if (size.endsWith("vh")) {
      const vh = parseFloat(size);
      return (window.innerHeight * vh) / 100;
    }

    return defaultSize;
  }

  private measureRects() {
    this.parentRect = this.parentElement!.getBoundingClientRect();
    this.targetRect = this.targetElement.getBoundingClientRect();

    // Pick the size of the fully open portal
    // this.portalWidthOpenHalf = this.parentRect.width * 0.25;
  }

  private createPortalElements(holeLayerCount: number = 1) {
    this.portalElement = document.createElement("div");
    this.portalElement.classList.add("metervara-portal");
    this.parentElement?.appendChild(this.portalElement);

    this.portalElement.style.setProperty(
      "--portal-center-x",
      `${Math.round(this.portalCenterX)}px`
    );
    this.portalElement.style.setProperty(
      "--portal-center-y",
      `${Math.round(this.portalCenterY)}px`
    );
    // this.portalElement.style.setProperty("--portal-width", "0px");
    this.portalElement.style.setProperty(
      "--clone-width",
      `${Math.round(this.targetRect!.width)}px`
    );
    this.portalElement.style.setProperty(
      "--clone-height",
      `${Math.round(this.targetRect!.height)}px`
    );

    const holeLayerWidth: number = 50;
    this.portalElement.style.setProperty(
      "--hole-layer-width",
      `${holeLayerWidth}px`
    ); // breakpoints?

    this.portalElement.style.setProperty(
      "--portal-width-open-half",
      `${Math.round(this.portalWidthOpenHalf)}px`
    );
    this.portalElement.style.setProperty(
      "--portal-width-inner-half",
      `${Math.round(this.portalWidthOpenHalf - holeLayerWidth * (holeLayerCount - 1))}px`
    );

    // ZONES 
    zones.forEach((id) => {
      const zoneEl = document.createElement("div");
      zoneEl.classList.add("metervara-portal-zone");
      // zoneEl.classList.add(id); // TEMP
      zoneEl.classList.add(...id.split("-").map((a) => `zone-${a}`));

      // CLONE
      const cloneEl = this.targetElement.cloneNode(true) as HTMLElement;
      cloneEl.classList.add("metervara-portal-clone");

      zoneEl.appendChild(cloneEl);
      this.portalElement!.appendChild(zoneEl);
    });

    // HOLE BORDERS
    const borderTop = document.createElement("div");
    borderTop.classList.add("metervara-portal-border", "top");
    this.portalElement!.appendChild(borderTop);

    const borderBottom = document.createElement("div");
    borderBottom.classList.add("metervara-portal-border", "bottom");
    this.portalElement!.appendChild(borderBottom);
    
    // CONTENT CONTAINER
    // Add content wrapper to the last hole layer
    const contentWRapper = document.createElement("div");
    contentWRapper.classList.add("metervara-portal-content-container");
    this.portalElement!.appendChild(contentWRapper);

    // Close when clicking anywhere on the portal except inside the content container
    // this.portalElement.addEventListener("pointerdown", (event) => {
    //   const target = event.target as HTMLElement;
    //   if (target.closest(".metervara-portal-content-container")) return;
    //   this.closePortal(0, 0);
    // });
    

    /*
    // Add close button. Not sure about the visual of this one...
    const closeButton = document.createElement('button');
    closeButton.classList.add('metervara-portal-close-button');
    closeButton.innerText = '+'; //×'; // or use an icon

    closeButton.addEventListener("click", () => {
      this.closePortal(0, 0);
    });
    this.holeLayers[this.holeLayers.length - 1].appendChild(closeButton);
    */

    
  }

  private deletePortalElements() {
    if (this.portalElement) {
      this.portalElement.innerHTML = "";
      this.portalElement.remove();
      this.portalElement = null;
    }

    // this.holeLayers.forEach((holeLayer) => {
    //   holeLayer.innerHTML = "";
    //   holeLayer.remove();
    // });

    // this.holeLayers = [];
  }

  /**
   * Private methods - state & animation
   */
  private setState(state: PortalState) {
    this.state = state;

    const shouldHideTarget = state !== "closed";
    this.targetElement.style.visibility = shouldHideTarget
      ? "hidden"
      : "visible";

    const event = new CustomEvent("portal:" + state, {
      detail: {
        portalElement: this.portalElement,
        targetElement: this.targetElement,
      },
    });
    window.dispatchEvent(event);
  }

  private open(duration = 750, stagger = 100) {
    if (this.state !== "closed") return;
    this.setState("opening");
    this.animateTransition(0, 1, duration, stagger, this.onOpened.bind(this));
  }

  private close(duration = 750, stagger = 100) {
    if (this.state !== "open") return;
    this.setState("closing");
    this.animateTransition(1, 0, duration, stagger, this.onClosed.bind(this));
  }

  private onOpened() {
    this.setState("open");
  }

  private onClosed() {
    this.setState("closed");
    this.deletePortalElements();
  }

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
  private animateTransition(
    from: number,
    to: number,
    duration: number,
    stagger: number,
    onComplete: () => void
  ) {
    // const startTime = performance.now();
    // const staggerItemCount = this.holeLayers.length;
    // const totalDuration = duration + stagger * (staggerItemCount - 1);
    // const normalizedStagger = stagger / totalDuration;
    // const normalizedDuration = duration / totalDuration;

    // DIRECT: Animate using css transition with this
    if (to === 1) {
      this.portalElement?.classList.add('open');
    } else if (to === 0) {
      this.portalElement?.classList.remove('open');
    }

    this.clearTransitionTimeout();
    this.transitionTimeoutId = window.setTimeout(() => {
      this.transitionTimeoutId = null;
      onComplete();
    }, duration);

    /*
    // JS Animation loop. 
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalDuration, 1); // easing.easeInOutCubic(Math.min(elapsed / totalDuration, 1)); // No easing yet...
      
      const value = from + (to - from) * progress; 
      
      const staggeredProgress0 = easing.easeInOutCubic(getStaggeredTime(value, 0, normalizedStagger, normalizedDuration) / normalizedDuration); // 0 to 1
      // debug.push(staggeredProgress0);

      // this.portalElement?.style.setProperty('--portal-width', `${ this.transitionProgress * this.portalWidthOpenHalf}px`);
      this.portalElement?.style.setProperty('--portal-width', `${ staggeredProgress0 * this.portalWidthOpenHalf}px`);

      // Staggered progress for holes
      this.holeLayers.forEach((hole, i) => {
        const staggeredProgressIndex = easing.easeInOutCubic(getStaggeredTime(value, i, normalizedStagger, normalizedDuration) / normalizedDuration);
        hole.style.setProperty('--portal-width', `${ staggeredProgressIndex * this.portalWidthOpenHalf}px`);
      })

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };
    this.animationFrameId = requestAnimationFrame(animate);
    */
  }

  private clearTransitionTimeout() {
    if (this.transitionTimeoutId !== null) {
      clearTimeout(this.transitionTimeoutId);
      this.transitionTimeoutId = null;
    }
  }
}
