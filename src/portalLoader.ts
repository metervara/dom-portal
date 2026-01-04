// Re-run <script> tags (especially needed for <script type="module" src="...">)
function runScripts(element: HTMLElement) {
  element.querySelectorAll("script").forEach((oldScript) => {
    const newScript = document.createElement("script");
    newScript.type = oldScript.type || "text/javascript";

    console.log(oldScript)

    if (oldScript.src) {
      newScript.src = oldScript.src;
    } else {
      newScript.textContent = oldScript.textContent;
    }

    // Copy other attributes if needed (like async, defer)
    oldScript.parentNode?.replaceChild(newScript, oldScript);
  });
}

export type PortalContentSource =
  | { type: "html"; path: string }
  | { type: "external"; url: string }
  | { type: "inline"; selector: string };

function findPortalRegion(element: HTMLElement): HTMLElement | null {
  if (element.dataset.portalRegion === "main") {
    return element;
  }
  return element.querySelector('[data-portal-region="main"]');
}

export async function loadPortalContent(
  container: HTMLElement,
  name: string,
  source: PortalContentSource
): Promise<void> {
  container.innerHTML = ""; // clear existing content

  console.log("name", name);
  console.log("container", container);
  console.log("source", source);

  if (source.type === "inline") {
    const inlineElement = document.querySelector(source.selector) as
      | HTMLElement
      | null;
    if (!inlineElement) {
      throw new Error(`Inline portal source "${source.selector}" not found`);
    }

    const clone = inlineElement.cloneNode(true) as HTMLElement;
    clone.removeAttribute("hidden");
    clone.style.removeProperty("display");

    const region = findPortalRegion(clone);
    if (!region) {
      throw new Error(
        `No content region found in inline source "${source.selector}"`
      );
    }

    container.appendChild(region);
    runScripts(region);
    return;
  }

  if (source.type === "external") {
    const iframe = document.createElement("iframe");
    iframe.onload = () => {
      iframe.classList.add("loaded");
    };
    iframe.src = source.url;
    iframe.allow = "fullscreen; pointer-lock"
    
    container.appendChild(iframe);
    return;
  }

  console.log("loding source.path", source.path);
  // Handle local HTML file
  const html = await fetch(source.path).then((res) => res.text());

  // console.log(html);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  const region = findPortalRegion(wrapper);
  if (!region) throw new Error(`No content region found in ${source.path}`);

  container.appendChild(region);
  runScripts(region);

  // Removed for now, also doens't work with js files in public folder
  // Automatically infer JS module path based on HTML path
  // const jsPath = source.path.replace(/\.html$/, '.js');

  // try {
  //   const module: PortalModule = await import(/* @vite-ignore */ jsPath);
  //   module?.init?.(region);
  //   loadedModules[name] = { module, region };
  // } catch (err) {
  //   console.info(`No JS module found for "${name}" (optional):`, jsPath);
  // }
}

export function unloadPortalContent() {
  // Remove the main portal content manually
  const region = document.querySelector('[data-portal-region="main"]');
  if (region) {
    region.remove();
  }
}
