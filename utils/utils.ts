import * as parser from "npm:node-html-parser";

export async function init(processedPath: string) {
  const processedDirExists = !!(await Deno.stat(processedPath).catch(() => null));
  if (processedDirExists) {
    await Deno.remove(processedPath, { recursive: true });
  }
  await Deno.mkdir(processedPath, { recursive: true });
}

export const nameTransformers = {
  typeDir: (name: string) => name.toLowerCase().substring(2, Infinity).replaceAll(" ", "-"),
  iconDir: (name: string) => name.toLowerCase().replaceAll(" ", "-"),
  svg: (name: string) =>
    name
      .toLowerCase()
      .replace("type=", "")
      .replace("size=", "")
      .replaceAll(",", "")
      .replaceAll(" ", "-"),
};

export async function processSvgFile(svgPath: string) {
  const svgContent = await Deno.readTextFile(svgPath);

  const root = parser.parse(svgContent);
  const svg = root.querySelector("svg");

  if (!svg) return;

  svg.removeAttribute("width");
  svg.removeAttribute("height");

  const paths = svg.querySelectorAll("path");

  paths.forEach((path) => {
    path.setAttribute("fill", "currentColor");
  });

  const newSvgContent = root.toString();

  return newSvgContent;
}
