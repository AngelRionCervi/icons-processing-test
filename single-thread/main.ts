import process from "node:process";
import * as parser from "npm:node-html-parser";

const PROCESSED_ICON_PATH = "./icons/processed-single";

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

async function init() {
  const processedDirExists = !!(await Deno.stat(PROCESSED_ICON_PATH).catch(() => null));
  if (processedDirExists) {
    await Deno.remove(PROCESSED_ICON_PATH, { recursive: true });
  }
  await Deno.mkdir(PROCESSED_ICON_PATH);
}

async function processSvgFile(svgPath: string) {
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

export default async function main(dataSetPath: string) {
  const startTime = performance.now();
  let topDirCount = 0;

  await init();

  for await (const typeDirEntry of Deno.readDir(dataSetPath)) {
    if (!typeDirEntry.isDirectory) continue;
    topDirCount++;

    const newIconTypeDirName = nameTransformers.typeDir(typeDirEntry.name);
    const iconsTypePath = `${dataSetPath}/${typeDirEntry.name}`;

    for await (const iconDirEntry of Deno.readDir(iconsTypePath)) {
      if (!iconDirEntry.isDirectory) continue;

      const newIconDirName = nameTransformers.iconDir(iconDirEntry.name);
      const iconsPath = `${iconsTypePath}/${iconDirEntry.name}`;

      for await (const iconFileEntry of Deno.readDir(iconsPath)) {
        if (!iconFileEntry.name.endsWith(".svg")) continue;

        const iconPath = `${iconsPath}/${iconFileEntry.name}`;
        const newSvgContent = await processSvgFile(iconPath);
        const newSvgName = nameTransformers.svg(iconFileEntry.name);

        if (newSvgContent) {
          const newIconPath = `${PROCESSED_ICON_PATH}/${newIconTypeDirName}/${newIconDirName}`;
          await Deno.mkdir(newIconPath, { recursive: true });
          await Deno.writeTextFile(`${newIconPath}/${newSvgName}`, newSvgContent, { create: true });
        }
      }
    }
  }

  const memoryUsageMb = process.memoryUsage.rss() / 1024 / 1024;

  const endTime = performance.now();
  const perf = performance.measure("Execution time", { start: startTime, end: endTime });

  const logData = [
    ["Thread number", 1],
    ["Total dirs", topDirCount],
    ["Duration (ms)", Math.round(perf.duration)],
    ["Memory usage (mb)", memoryUsageMb],
  ];

  console.table(logData);
}
