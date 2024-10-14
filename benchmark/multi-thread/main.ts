import process from "node:process";
import { MAX_THREAD, PROCESSED_MULTI_ICON_PATH } from "../../constants.ts";
import { genIconMapFile } from "../../utils/codeGen.ts";
import { init } from "../../utils/utils.ts";

export default async function main(dataSetPath: string, processedPath: string = PROCESSED_MULTI_ICON_PATH) {
  const startTime = performance.now();

  await init(processedPath);

  const tokenMap = new Map<string, string>();

  const topDirs = [...Deno.readDirSync(dataSetPath)]
    .filter((file) => file.isDirectory)
    .map((dir) => dir.name);

  const coreCount = Math.min(MAX_THREAD, navigator.hardwareConcurrency);
  const dirsPerWorker = Math.ceil(topDirs.length / coreCount);
  const dirsPerWorkerRemainder = topDirs.length % coreCount;
  const threadNumber = Math.min(coreCount, topDirs.length);

  const workerList = Array.from(
    { length: threadNumber },
    () => new Worker(import.meta.resolve("./worker.ts"), { type: "module" }),
  );

  for (let i = 0; i < threadNumber; i++) {
    const start = i * dirsPerWorker;
    const end = start + dirsPerWorker;
    const dirPaths = topDirs.slice(start, end).map((dir) => `${dataSetPath}/${dir}`);
    workerList[i].postMessage({ dirPaths, processedPath });
  }

  const memoryUsageMb = process.memoryUsage.rss() / 1024 / 1024;

  await Promise.all(
    workerList.map((worker) => new Promise<void>((resolve) => {
      worker.onmessage = (event) => {
        const partialTokenMap = event.data;
        partialTokenMap.forEach((value: string, key: string) => {
          tokenMap.set(key, value);
        });
        resolve();
      }
    })),
  );

  await genIconMapFile(processedPath, tokenMap);

  const endTime = performance.now();
  const perf = performance.measure("Execution time", { start: startTime, end: endTime });

  const logData = [
    ["Thread count", threadNumber],
    [
      "Dirs per worker",
      `${dirsPerWorker}${
        dirsPerWorker - dirsPerWorkerRemainder > 0
          ? ` + ${dirsPerWorker - dirsPerWorkerRemainder}`
          : ""
      }`,
    ],
    ["Total dirs", topDirs.length],
    ["Duration (ms)", Math.round(perf.duration)],
    ["Memory usage (mb)", memoryUsageMb],
  ];

  console.table(logData);
}
