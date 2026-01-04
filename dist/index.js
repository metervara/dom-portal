const v = [
  "top-left-outer",
  "top-left-inner",
  "top-right-outer",
  "top-right-inner",
  "bottom-left-outer",
  "bottom-left-inner",
  "bottom-right-outer",
  "bottom-right-inner"
];
class y {
  constructor(t) {
    this.portalElement = null, this.portalCenterX = 0, this.portalCenterY = 0, this.portalWidthOpenHalf = 0, this.state = "closed", this.animationFrameId = null, this.transitionTimeoutId = null, this.targetElement = t, this.parentElement = t.parentElement;
    const e = window.getComputedStyle(this.parentElement);
    e.position === "relative" || e.position === "absolute" || console.error(
      "Dom portal only works if the parent of the target element is positioned relative or absolute"
    ), this.resizeObserver = new ResizeObserver(() => {
      this.state !== "closed" && (this.measureRects(), this.portalElement?.style.setProperty(
        "--clone-width",
        `${Math.round(this.targetRect.width)}px`
      ), this.portalElement?.style.setProperty(
        "--clone-height",
        `${Math.round(this.targetRect.height)}px`
      ));
    }), this.resizeObserver.observe(this.targetElement), this.handleGlobalPointerDown = (a) => {
      this.state === "closed" || a.target.closest(".metervara-portal-content-container") || this.closePortal(0, 0);
    }, document.addEventListener("pointerdown", this.handleGlobalPointerDown, !0), this.handleWindowResize = () => {
      this.state !== "closed" && this.closePortal(0, 0, { instant: !0 });
    }, window.addEventListener("resize", this.handleWindowResize);
  }
  /**
   * Public methods
   */
  /**
   * Open that ensures content container is ready for loading
   */
  async openAndReady(t, e, r) {
    return this.openPortal(t, e, r), new Promise((a, s) => {
      const o = () => {
        const i = document.querySelector(
          ".metervara-portal-content-container"
        );
        i ? a(i) : this.state === "closed" ? s(new Error("Portal closed before container was ready")) : requestAnimationFrame(o);
      };
      requestAnimationFrame(o);
    });
  }
  openPortal(t, e, r) {
    this.state === "closed" && (this.measureRects(), this.portalWidthOpenHalf = this.parseSize(r) * 0.5, this.portalCenterX = t - this.parentRect.left, this.portalCenterY = e - this.parentRect.top, this.createPortalElements(), requestAnimationFrame(() => {
      this.open();
    }));
  }
  closePortal(t, e, r = {}) {
    if (!(this.state !== "open" && this.state !== "opening")) {
      if (r.instant) {
        this.clearTransitionTimeout(), this.setState("closed"), this.deletePortalElements();
        return;
      }
      this.state === "opening" && (this.clearTransitionTimeout(), this.setState("open")), this.close();
    }
  }
  togglePortal(t, e) {
    this.state === "closed" ? this.openPortal(t, e) : (this.state === "open" || this.state === "opening") && this.closePortal(t, e);
  }
  destroy() {
    this.resizeObserver.disconnect(), document.removeEventListener(
      "pointerdown",
      this.handleGlobalPointerDown,
      !0
    ), window.removeEventListener("resize", this.handleWindowResize), this.animationFrameId !== null && cancelAnimationFrame(this.animationFrameId), this.clearTransitionTimeout(), this.deletePortalElements();
  }
  /**
   * Private methods - DOM utils
   */
  parseSize(t) {
    const e = this.parentRect.width * 0.25;
    if (!t)
      return e;
    if (t.endsWith("px"))
      return parseFloat(t);
    if (t.endsWith("vw")) {
      const r = parseFloat(t);
      return window.innerWidth * r / 100;
    } else if (t.endsWith("vh")) {
      const r = parseFloat(t);
      return window.innerHeight * r / 100;
    }
    return e;
  }
  measureRects() {
    this.parentRect = this.parentElement.getBoundingClientRect(), this.targetRect = this.targetElement.getBoundingClientRect();
  }
  createPortalElements(t = 1) {
    this.portalElement = document.createElement("div"), this.portalElement.classList.add("metervara-portal"), this.parentElement?.appendChild(this.portalElement), this.portalElement.style.setProperty(
      "--portal-center-x",
      `${Math.round(this.portalCenterX)}px`
    ), this.portalElement.style.setProperty(
      "--portal-center-y",
      `${Math.round(this.portalCenterY)}px`
    ), this.portalElement.style.setProperty(
      "--clone-width",
      `${Math.round(this.targetRect.width)}px`
    ), this.portalElement.style.setProperty(
      "--clone-height",
      `${Math.round(this.targetRect.height)}px`
    );
    const e = 50;
    this.portalElement.style.setProperty(
      "--hole-layer-width",
      `${e}px`
    ), this.portalElement.style.setProperty(
      "--portal-width-open-half",
      `${Math.round(this.portalWidthOpenHalf)}px`
    ), this.portalElement.style.setProperty(
      "--portal-width-inner-half",
      `${Math.round(this.portalWidthOpenHalf - e * (t - 1))}px`
    ), v.forEach((o) => {
      const i = document.createElement("div");
      i.classList.add("metervara-portal-zone"), i.classList.add(...o.split("-").map((h) => `zone-${h}`));
      const l = this.targetElement.cloneNode(!0);
      l.classList.add("metervara-portal-clone"), i.appendChild(l), this.portalElement.appendChild(i);
    });
    const r = document.createElement("div");
    r.classList.add("metervara-portal-border", "top"), this.portalElement.appendChild(r);
    const a = document.createElement("div");
    a.classList.add("metervara-portal-border", "bottom"), this.portalElement.appendChild(a);
    const s = document.createElement("div");
    s.classList.add("metervara-portal-content-container"), this.portalElement.appendChild(s), this.portalElement.addEventListener("pointerdown", (o) => {
      o.target.closest(".metervara-portal-content-container") || this.closePortal(0, 0);
    });
  }
  deletePortalElements() {
    this.portalElement && (this.portalElement.innerHTML = "", this.portalElement.remove(), this.portalElement = null);
  }
  /**
   * Private methods - state & animation
   */
  setState(t) {
    this.state = t;
    const e = t !== "closed";
    this.targetElement.style.visibility = e ? "hidden" : "visible";
    const r = new CustomEvent("portal:" + t, {
      detail: {
        portalElement: this.portalElement,
        targetElement: this.targetElement
      }
    });
    window.dispatchEvent(r);
  }
  open(t = 750, e = 100) {
    this.state === "closed" && (this.setState("opening"), this.animateTransition(0, 1, t, e, this.onOpened.bind(this)));
  }
  close(t = 750, e = 100) {
    this.state === "open" && (this.setState("closing"), this.animateTransition(1, 0, t, e, this.onClosed.bind(this)));
  }
  onOpened() {
    this.setState("open");
  }
  onClosed() {
    this.setState("closed"), this.deletePortalElements();
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
  animateTransition(t, e, r, a, s) {
    e === 1 ? this.portalElement?.classList.add("open") : e === 0 && this.portalElement?.classList.remove("open"), this.clearTransitionTimeout(), this.transitionTimeoutId = window.setTimeout(() => {
      this.transitionTimeoutId = null, s();
    }, r);
  }
  clearTransitionTimeout() {
    this.transitionTimeoutId !== null && (clearTimeout(this.transitionTimeoutId), this.transitionTimeoutId = null);
  }
}
class P {
  constructor(t = {}) {
    this.mode = t.mode || "query", this.key = t.portalKey || "portal";
  }
  init(t) {
    this.callback = t, window.addEventListener("popstate", () => this.handleRouteChange()), window.addEventListener("hashchange", () => this.handleRouteChange()), this.handleRouteChange();
  }
  handleRouteChange() {
    const t = this.getCurrentRoute();
    this.callback?.(t);
  }
  getCurrentRoute() {
    if (this.mode === "hash") {
      const [t, e] = window.location.hash.slice(1).split("/");
      return { page: t || "", portal: e };
    } else {
      const t = new URL(window.location.href);
      return {
        page: t.pathname.replace(/^\/+/, ""),
        portal: t.searchParams.get(this.key) || void 0
      };
    }
  }
  open(t) {
    if (this.mode === "hash") {
      const { page: e } = this.getCurrentRoute();
      window.location.hash = `${e}/${t}`;
    } else {
      const e = new URL(window.location.href);
      e.searchParams.set(this.key, t), history.pushState({}, "", e.toString());
    }
    this.handleRouteChange();
  }
  close() {
    if (this.mode === "hash") {
      const { page: t } = this.getCurrentRoute();
      window.location.hash = `${t}/`;
    } else {
      const t = new URL(window.location.href);
      t.searchParams.delete(this.key), history.pushState({}, "", t.toString());
    }
    this.handleRouteChange();
  }
}
function w(n) {
  n.querySelectorAll("script").forEach((t) => {
    const e = document.createElement("script");
    e.type = t.type || "text/javascript", console.log(t), t.src ? e.src = t.src : e.textContent = t.textContent, t.parentNode?.replaceChild(e, t);
  });
}
function E(n) {
  return n.dataset.portalRegion === "main" ? n : n.querySelector('[data-portal-region="main"]');
}
function R(n) {
  n.id && n.removeAttribute("id"), n.querySelectorAll("[id]").forEach((t) => {
    t.removeAttribute("id");
  });
}
async function b(n, t, e) {
  if (n.innerHTML = "", e.type === "inline") {
    const o = document.querySelector(e.selector);
    if (!o)
      throw new Error(`Inline portal source "${e.selector}" not found`);
    const i = o.cloneNode(!0);
    i.removeAttribute("hidden"), i.style.removeProperty("display"), R(i);
    const l = E(i);
    if (!l)
      throw new Error(
        `No content region found in inline source "${e.selector}"`
      );
    n.appendChild(l), w(l);
    return;
  }
  if (e.type === "external") {
    const o = document.createElement("iframe");
    o.onload = () => {
      o.classList.add("loaded");
    }, o.src = e.url, o.allow = "fullscreen; pointer-lock", n.appendChild(o);
    return;
  }
  const r = await fetch(e.path).then((o) => o.text()), a = document.createElement("div");
  a.innerHTML = r;
  const s = E(a);
  if (!s) throw new Error(`No content region found in ${e.path}`);
  n.appendChild(s), w(s);
}
function C() {
  document.querySelectorAll(
    ".metervara-portal .metervara-portal-content-container [data-portal-region='main']"
  ).forEach((t) => t.remove());
}
function T() {
  document.addEventListener("click", (n) => {
    const e = n.target.closest("[data-portal]");
    if (e) {
      n.preventDefault();
      const r = e.getAttribute("data-portal");
      if (!r) return;
      const a = e.getAttribute("data-portal-path"), s = e.getAttribute("data-portal-url"), o = e.getAttribute("data-portal-inline"), i = n.clientX, l = n.clientY, h = e.getAttribute("data-portal-size") || void 0;
      window.dispatchEvent(new CustomEvent("portal:trigger", {
        detail: {
          portalName: r,
          clickX: i,
          clickY: l,
          path: a,
          externalUrl: s,
          inlineSelector: o,
          size: h
        }
      }));
    }
  });
}
function x(n) {
  const t = document.querySelector(n.portalTarget);
  if (!t)
    throw new Error(`Portal target "${n.portalTarget}" not found`);
  const e = new y(t), r = n.routerMode || "query", a = r === "none" ? void 0 : new P({ mode: r });
  let s = !1;
  return T(), window.addEventListener("portal:trigger", async (o) => {
    const {
      portalName: i,
      clickX: l,
      clickY: h,
      path: d,
      externalUrl: c,
      inlineSelector: p,
      size: m,
      scrollIntoView: f = !1
    } = o.detail;
    try {
      const g = await e.openAndReady(l, h, m);
      let u;
      if (p ? u = { type: "inline", selector: p } : c ? u = { type: "external", url: c } : u = { type: "html", path: d || `/portal/content/${i}.html` }, await b(g, i, u), a) {
        s = !0;
        try {
          a.open(i);
        } finally {
          s = !1;
        }
      }
      f && window.scrollTo({
        top: h - window.innerHeight / 2,
        behavior: "smooth"
      });
    } catch (g) {
      console.error("Portal failed to open:", g);
    }
  }), window.addEventListener("portal:closed", () => {
    if (C(), a) {
      s = !0;
      try {
        a.close();
      } finally {
        s = !1;
      }
    }
  }), a?.init(async ({ portal: o }) => {
    if (s) return;
    if (!o) {
      e.closePortal(0, 0);
      return;
    }
    const i = document.querySelector(`[data-portal="${o}"]`);
    if (!i) {
      console.warn(`No portal link found for '${o}'`);
      return;
    }
    const l = i?.getAttribute("data-portal-path"), h = i?.getAttribute("data-portal-url"), d = i?.getAttribute("data-portal-inline"), c = i?.getBoundingClientRect(), p = c.left + c.width / 2, m = c.top + c.height / 2 + window.scrollY, f = new CustomEvent("portal:trigger", {
      detail: {
        portalName: o,
        clickX: p,
        clickY: m,
        path: l || (d ? void 0 : `/portal/content/${o}.html`),
        externalUrl: h,
        inlineSelector: d,
        scrollIntoView: !0
      }
    });
    window.dispatchEvent(f);
  }), {
    portal: e,
    router: a
  };
}
function S(n) {
  return `Hello, ${n}!`;
}
export {
  y as DomPortal,
  P as PortalRouter,
  T as enhancePortalLinks,
  S as hello,
  b as loadPortalContent,
  x as setupDomPortal,
  C as unloadPortalContent
};
//# sourceMappingURL=index.js.map
