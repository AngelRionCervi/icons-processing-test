import process from "node:process";
import { PROCESSED_SINGLE_ICON_PATH } from "../../constants.ts";
import { genFiles } from "../../utils/codeGen.ts";
import { init, nameTransformers, processSvgFile } from "../../utils/utils.ts";

export default async function main(
  dataSetPath: string,
  processedPath: string = PROCESSED_SINGLE_ICON_PATH,
) {
  const startTime = performance.now();

  const tokenMap = new Map<string, string>();
  let topDirCount = 0;

  await init(processedPath);

  for await (const typeDirEntry of Deno.readDir(dataSetPath)) {
    if (!typeDirEntry.isDirectory) continue;
    topDirCount++;

    const newIconTypeDirName = nameTransformers.typeDir(typeDirEntry.name);
    const iconsTypePath = `${dataSetPath}/${typeDirEntry.name}`;

    for await (const iconDirEntry of Deno.readDir(iconsTypePath)) {
      if (!iconDirEntry.isDirectory) continue;

      const newIconDirName = nameTransformers.iconDir(iconDirEntry.name);
      const iconsDirPath = `${iconsTypePath}/${iconDirEntry.name}`;

      for await (const iconFileEntry of Deno.readDir(iconsDirPath)) {
        if (!iconFileEntry.name.endsWith(".svg")) continue;

        const iconPath = `${iconsDirPath}/${iconFileEntry.name}`;
        const newSvgContent = await processSvgFile(iconPath);
        const newSvgName = nameTransformers.svg(iconFileEntry.name);

        if (newSvgContent) {
          const newIconPath = `${processedPath}/${newIconTypeDirName}/${newIconDirName}`;
          const newIconFilePath = `${newIconPath}/${newSvgName}`;
          await Deno.mkdir(newIconPath, { recursive: true });
          await Deno.writeTextFile(newIconFilePath, newSvgContent, { create: true });

          const tokenKey = `${newIconTypeDirName}-${newIconDirName}-${newSvgName}`;
          tokenMap.set(tokenKey, `./${newIconFilePath.split("/").slice(3).join("/")}`);
        }
      }
    }
  }

  await genFiles(processedPath, tokenMap);

  const memoryUsageMb = process.memoryUsage.rss() / 1024 / 1024;

  const endTime = performance.now();
  const perf = performance.measure("Execution time", { start: startTime, end: endTime });

  const logData = [
    ["Thread count", 1],
    ["Total dirs", topDirCount],
    ["Duration (ms)", Math.round(perf.duration)],
    ["Memory usage (mb)", memoryUsageMb],
  ];

  console.table(logData);
}
