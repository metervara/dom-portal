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

type InlinePortalContentSource = {
  type: "inline";
  selector: string;
  mode?: "clone" | "move";
};

export type PortalContentSource =
  | { type: "html"; path: string }
  | { type: "external"; url: string }
  | InlinePortalContentSource;

function findPortalRegion(element: HTMLElement): HTMLElement | null {
  if (element.dataset.portalRegion === "main") {
    return element;
  }
  return element.querySelector('[data-portal-region="main"]');
}

function stripIds(element: HTMLElement): void {
  if (element.id) {
    element.removeAttribute("id");
  }
  element.querySelectorAll("[id]").forEach((el) => {
    el.removeAttribute("id");
  });
}

type MovedInlineRegion = {
  placeholder: Comment;
  parent: Node;
  wasHidden: boolean;
  previousDisplay: string | null;
};

const movedInlineRegions = new Map<HTMLElement, MovedInlineRegion>();

function restoreMovedInlineRegions() {
  for (const [region, info] of movedInlineRegions) {
    const { placeholder, parent, wasHidden, previousDisplay } = info;

    if (placeholder.parentNode) {
      placeholder.parentNode.replaceChild(region, placeholder);
    } else {
      parent.appendChild(region);
    }

    if (wasHidden) {
      region.setAttribute("hidden", "");
    } else {
      region.removeAttribute("hidden");
    }

    if (previousDisplay !== null) {
      region.style.display = previousDisplay;
    } else {
      region.style.removeProperty("display");
    }

    movedInlineRegions.delete(region);
  }
}

export async function loadPortalContent(
  container: HTMLElement,
  name: string,
  source: PortalContentSource
): Promise<void> {
  restoreMovedInlineRegions();
  container.innerHTML = ""; // clear existing content

  if (source.type === "inline") {
    const inlineElement = document.querySelector(source.selector) as HTMLElement | null;
    if (!inlineElement) {
      throw new Error(`Inline portal source "${source.selector}" not found`);
    }

    const region = findPortalRegion(inlineElement);
    if (!region) {
      throw new Error(`No content region found in inline source "${source.selector}"`);
    }

    const mode = source.mode || "clone";

    if (mode === "move") {
      const parent = region.parentNode;
      if (!parent) {
        throw new Error(`Inline portal source "${source.selector}" has no parent`);
      }

      const placeholder = document.createComment("portal-inline-placeholder");
      parent.insertBefore(placeholder, region);

      const previousDisplay = region.style.display || null;
      const wasHidden = region.hasAttribute("hidden");

      region.removeAttribute("hidden");
      region.style.removeProperty("display");

      movedInlineRegions.set(region, {
        placeholder,
        parent,
        wasHidden,
        previousDisplay,
      });

      container.appendChild(region);
      return;
    }

    const clone = inlineElement.cloneNode(true) as HTMLElement;
    clone.removeAttribute("hidden");
    clone.style.removeProperty("display");
    stripIds(clone);

    const clonedRegion = findPortalRegion(clone);
    if (!clonedRegion) {
      throw new Error(`No content region found in inline source "${source.selector}"`);
    }

    container.appendChild(clonedRegion);
    runScripts(clonedRegion);
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

  // Handle local HTML file
  const html = await fetch(source.path).then((res) => res.text());

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
  restoreMovedInlineRegions();

  const regions = document.querySelectorAll(
    ".metervara-portal .metervara-portal-content-container [data-portal-region='main']"
  );

  /*
  console.log("unloading content in portal", regions.length);
  regions.forEach((region, index) => {
    console.log("content parent", index, region.parentElement);
  });
  */

  regions.forEach((region) => region.remove());

}
