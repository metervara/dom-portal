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

  window.addEventListener('portal:opening', (e: Event) => {
    console.log('Portal is opening', e);
  });
  
  // Listen for portal fully open
  window.addEventListener('portal:open', (e: Event) => {
    console.log('Portal is now open', e);
  });
  
  // Listen for portal closing
  window.addEventListener('portal:closing', (e: Event) => {
    console.log('Portal is closing', e);
  });
  
  // Listen for portal fully closed
  window.addEventListener('portal:closed', (e: Event) => {
    console.log('Portal is now closed', e);
  });
});