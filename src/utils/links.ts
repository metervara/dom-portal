export const splitLinkTextIntoSpans = (doc: Document): Document => {
  const links: NodeListOf<HTMLAnchorElement> = doc.querySelectorAll("a");

  links.forEach((link: HTMLAnchorElement) => {
    const text: string = link.textContent || "";
    link.textContent = ""; // Clear original text

    [...text].forEach((char: string) => {
      const span: HTMLSpanElement = document.createElement("span");
      span.textContent = char;
      link.appendChild(span);
    });
  });

  return doc;
};