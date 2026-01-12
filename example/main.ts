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
    console.log('EVENT: portal:opening');
  });
  
  // Listen for portal fully open
  window.addEventListener('portal:open', (e: Event) => {
    console.log('EVENT: portal:open');
  });
  
  // Listen for portal closing
  window.addEventListener('portal:closing', (e: Event) => {
    console.log('EVENT: portal:closing');
  });
  
  // Listen for portal fully closed
  window.addEventListener('portal:closed', (e: Event) => {
    console.log('EVENT: portal:closed');
  });
});