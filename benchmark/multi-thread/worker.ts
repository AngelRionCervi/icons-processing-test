import { nameTransformers, processSvgFile } from "../../utils/utils.ts";

const partialTokenMap = new Map<string, string>();

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
          const newIconFilePath = `${newIconPath}/${newSvgName}`;
          await Deno.writeTextFile(newIconFilePath, newSvgContent, { create: true });

          const tokenKey = `${newIconTypeDirName}-${newIconDirName}-${newSvgName}`;
          partialTokenMap.set(tokenKey, newIconFilePath);
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
  self.postMessage(partialTokenMap);
  self.close();
};
