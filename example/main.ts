import { setupDomPortal } from "../src";

console.log("Dom Portal Example");

window.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");

  const { portal } = setupDomPortal({
    portalTarget: "#content",
    routerMode: "none",
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      portal.closePortal(0, 0);
      // unloadPortalContent(); // Too soon, portal is  not closed yet
    }
  });
});