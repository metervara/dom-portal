const b = [
  "top-left-outer",
  "top-left-inner",
  "top-right-outer",
  "top-right-inner",
  "bottom-left-outer",
  "bottom-left-inner",
  "bottom-right-outer",
  "bottom-right-inner"
];
class C {
  // private handleWindowResize: () => void;
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
    }), this.resizeObserver.observe(this.targetElement), this.handleGlobalPointerDown = (s) => {
      this.state === "closed" || s.target.closest(".metervara-portal-content-container") || this.closePortal(0, 0);
    }, document.addEventListener("pointerdown", this.handleGlobalPointerDown, !0);
  }
  /**
   * Public methods
   */
  /**
   * Open that ensures content container is ready for loading
   */
  async openAndReady(t, e, i) {
    return this.openPortal(t, e, i), new Promise((s, a) => {
      const r = () => {
        const o = document.querySelector(
          ".metervara-portal-content-container"
        );
        o ? s(o) : this.state === "closed" ? a(new Error("Portal closed before container was ready")) : requestAnimationFrame(r);
      };
      requestAnimationFrame(r);
    });
  }
  openPortal(t, e, i) {
    this.state === "closed" && (this.measureRects(), this.portalWidthOpenHalf = this.parseSize(i) * 0.5, this.portalCenterX = t - this.parentRect.left, this.portalCenterY = e - this.parentRect.top, this.createPortalElements(), requestAnimationFrame(() => {
      this.open();
    }));
  }
  closePortal(t, e, i = {}) {
    if (!(this.state !== "open" && this.state !== "opening")) {
      if (i.instant) {
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
    ), this.animationFrameId !== null && cancelAnimationFrame(this.animationFrameId), this.clearTransitionTimeout(), this.deletePortalElements();
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
      const i = parseFloat(t);
      return window.innerWidth * i / 100;
    } else if (t.endsWith("vh")) {
      const i = parseFloat(t);
      return window.innerHeight * i / 100;
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
    ), b.forEach((r) => {
      const o = document.createElement("div");
      o.classList.add("metervara-portal-zone"), o.classList.add(...r.split("-").map((l) => `zone-${l}`));
      const d = this.targetElement.cloneNode(!0);
      d.classList.add("metervara-portal-clone"), o.appendChild(d), this.portalElement.appendChild(o);
    });
    const i = document.createElement("div");
    i.classList.add("metervara-portal-border", "top"), this.portalElement.appendChild(i);
    const s = document.createElement("div");
    s.classList.add("metervara-portal-border", "bottom"), this.portalElement.appendChild(s);
    const a = document.createElement("div");
    a.classList.add("metervara-portal-content-container"), this.portalElement.appendChild(a), this.portalElement.addEventListener("pointerdown", (r) => {
      r.target.closest(".metervara-portal-content-container") || this.closePortal(0, 0);
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
    const i = new CustomEvent("portal:" + t, {
      detail: {
        portalElement: this.portalElement,
        targetElement: this.targetElement
      }
    });
    window.dispatchEvent(i);
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
  animateTransition(t, e, i, s, a) {
    e === 1 ? this.portalElement?.classList.add("open") : e === 0 && this.portalElement?.classList.remove("open"), this.clearTransitionTimeout(), this.transitionTimeoutId = window.setTimeout(() => {
      this.transitionTimeoutId = null, a();
    }, i);
  }
  clearTransitionTimeout() {
    this.transitionTimeoutId !== null && (clearTimeout(this.transitionTimeoutId), this.transitionTimeoutId = null);
  }
}
class R {
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
function y(n) {
  n.querySelectorAll("script").forEach((t) => {
    const e = document.createElement("script");
    e.type = t.type || "text/javascript", console.log(t), t.src ? e.src = t.src : e.textContent = t.textContent, t.parentNode?.replaceChild(e, t);
  });
}
function w(n) {
  return n.dataset.portalRegion === "main" ? n : n.querySelector('[data-portal-region="main"]');
}
function T(n) {
  n.id && n.removeAttribute("id"), n.querySelectorAll("[id]").forEach((t) => {
    t.removeAttribute("id");
  });
}
const E = /* @__PURE__ */ new Map();
function v() {
  for (const [n, t] of E) {
    const { placeholder: e, parent: i, wasHidden: s, previousDisplay: a } = t;
    e.parentNode ? e.parentNode.replaceChild(n, e) : i.appendChild(n), s ? n.setAttribute("hidden", "") : n.removeAttribute("hidden"), a !== null ? n.style.display = a : n.style.removeProperty("display"), E.delete(n);
  }
}
async function A(n, t, e) {
  if (v(), n.innerHTML = "", e.type === "inline") {
    const r = document.querySelector(e.selector);
    if (!r)
      throw new Error(`Inline portal source "${e.selector}" not found`);
    const o = w(r);
    if (!o)
      throw new Error(`No content region found in inline source "${e.selector}"`);
    if ((e.mode || "clone") === "move") {
      const h = o.parentNode;
      if (!h)
        throw new Error(`Inline portal source "${e.selector}" has no parent`);
      const p = document.createComment("portal-inline-placeholder");
      h.insertBefore(p, o);
      const u = o.style.display || null, m = o.hasAttribute("hidden");
      o.removeAttribute("hidden"), o.style.removeProperty("display"), E.set(o, {
        placeholder: p,
        parent: h,
        wasHidden: m,
        previousDisplay: u
      }), n.appendChild(o);
      return;
    }
    const l = r.cloneNode(!0);
    l.removeAttribute("hidden"), l.style.removeProperty("display"), T(l);
    const c = w(l);
    if (!c)
      throw new Error(`No content region found in inline source "${e.selector}"`);
    n.appendChild(c), y(c);
    return;
  }
  if (e.type === "external") {
    const r = document.createElement("iframe");
    r.onload = () => {
      r.classList.add("loaded");
    }, r.src = e.url, r.allow = "fullscreen; pointer-lock", n.appendChild(r);
    return;
  }
  const i = await fetch(e.path).then((r) => r.text()), s = document.createElement("div");
  s.innerHTML = i;
  const a = w(s);
  if (!a) throw new Error(`No content region found in ${e.path}`);
  n.appendChild(a), y(a);
}
function L() {
  v(), document.querySelectorAll(
    ".metervara-portal .metervara-portal-content-container [data-portal-region='main']"
  ).forEach((t) => t.remove());
}
function $() {
  document.addEventListener("click", (n) => {
    const e = n.target.closest("[data-portal]");
    if (e) {
      n.preventDefault();
      const i = e.getAttribute("data-portal");
      if (!i) return;
      const s = e.getAttribute("data-portal-path"), a = e.getAttribute("data-portal-url"), r = e.getAttribute("data-portal-inline"), o = e.getAttribute("data-portal-inline-mode"), d = n.clientX, l = n.clientY, c = e.getAttribute("data-portal-size") || void 0;
      window.dispatchEvent(new CustomEvent("portal:trigger", {
        detail: {
          portalName: i,
          clickX: d,
          clickY: l,
          path: s,
          externalUrl: a,
          inlineSelector: r,
          inlineMode: o,
          size: c
        }
      }));
    }
  });
}
function S(n) {
  const t = document.querySelector(n.portalTarget);
  if (!t)
    throw new Error(`Portal target "${n.portalTarget}" not found`);
  const e = new C(t), i = n.routerMode || "query", s = i === "none" ? void 0 : new R({ mode: i });
  let a = !1;
  return $(), window.addEventListener("portal:trigger", async (r) => {
    const {
      portalName: o,
      clickX: d,
      clickY: l,
      path: c,
      externalUrl: h,
      inlineSelector: p,
      inlineMode: u,
      size: m,
      scrollIntoView: P = !1
    } = r.detail;
    try {
      const g = await e.openAndReady(d, l, m);
      let f;
      if (p ? f = { type: "inline", selector: p, mode: u } : h ? f = { type: "external", url: h } : f = { type: "html", path: c || `/portal/content/${o}.html` }, await A(g, o, f), s) {
        a = !0;
        try {
          s.open(o);
        } finally {
          a = !1;
        }
      }
      P && window.scrollTo({
        top: l - window.innerHeight / 2,
        behavior: "smooth"
      });
    } catch (g) {
      console.error("Portal failed to open:", g);
    }
  }), window.addEventListener("portal:closed", () => {
    if (L(), s) {
      a = !0;
      try {
        s.close();
      } finally {
        a = !1;
      }
    }
  }), s?.init(async ({ portal: r }) => {
    if (a) return;
    if (!r) {
      e.closePortal(0, 0);
      return;
    }
    const o = document.querySelector(`[data-portal="${r}"]`);
    if (!o) {
      console.warn(`No portal link found for '${r}'`);
      return;
    }
    const d = o?.getAttribute("data-portal-path"), l = o?.getAttribute("data-portal-url"), c = o?.getAttribute("data-portal-inline"), h = o?.getBoundingClientRect(), p = h.left + h.width / 2, u = h.top + h.height / 2 + window.scrollY, m = new CustomEvent("portal:trigger", {
      detail: {
        portalName: r,
        clickX: p,
        clickY: u,
        path: d || (c ? void 0 : `/portal/content/${r}.html`),
        externalUrl: l,
        inlineSelector: c,
        scrollIntoView: !0
      }
    });
    window.dispatchEvent(m);
  }), {
    portal: e,
    router: s
  };
}
function k(n) {
  return `Hello, ${n}!`;
}
export {
  C as DomPortal,
  R as PortalRouter,
  $ as enhancePortalLinks,
  k as hello,
  A as loadPortalContent,
  S as setupDomPortal,
  L as unloadPortalContent
};
//# sourceMappingURL=index.js.map
