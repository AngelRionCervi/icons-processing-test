import * as parser from "npm:node-html-parser";
import type { HTMLElement } from "npm:node-html-parser";

const nameTransformers = {
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

async function processSvgFile(svgPath: string) {
  const svgContent = await Deno.readTextFile(svgPath);

  const root = parser.parse(svgContent);
  const svg = root.querySelector("svg");

  if (!svg) return;

  svg.removeAttribute("width");
  svg.removeAttribute("height");

  const paths = svg.querySelectorAll("path");

  paths.forEach((path: HTMLElement) => {
    path.setAttribute("fill", "currentColor");
  });

  const newSvgContent = root.toString();

  return newSvgContent;
}

async function processDirs(dirPaths: string[], processedPath: string) {
  for (const typeDirEntry of dirPaths) {
    const newIconTypeDirName = nameTransformers.typeDir(typeDirEntry.split("/").pop() || "");

    for await (const iconDirEntry of Deno.readDir(typeDirEntry)) {
      if (!iconDirEntry.isDirectory) continue;

      const newIconDirName = nameTransformers.iconDir(iconDirEntry.name);
      const iconsPath = `${typeDirEntry}/${iconDirEntry.name}`;

      for await (const iconFileEntry of Deno.readDir(iconsPath)) {
        if (!iconFileEntry.name.endsWith(".svg")) continue;

        const iconPath = `${iconsPath}/${iconFileEntry.name}`;
        const newSvgContent = await processSvgFile(iconPath);
        const newSvgName = nameTransformers.svg(iconFileEntry.name);

        if (newSvgContent) {
          const newIconPath = `${processedPath}/${newIconTypeDirName}/${newIconDirName}`;
          await Deno.mkdir(newIconPath, { recursive: true });
          await Deno.writeTextFile(`${newIconPath}/${newSvgName}`, newSvgContent, { create: true });
        }
      }
    }
  }
}

// @ts-ignore: lack of types in deno
self.onmessage = async (event) => {
  const { dirPaths, processedPath } = event.data;
  await processDirs(dirPaths, processedPath);
  // @ts-ignore: lack of types in deno
  self.postMessage("done");
  self.close();
};
