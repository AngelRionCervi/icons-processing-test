import process from "node:process";

const PROCESSED_ICON_PATH = "./icons/processed-multi";

export default async function main(dataSetPath: string) {
  const startTime = performance.now();

  const topDirs = [...Deno.readDirSync(dataSetPath)]
    .filter((file) => file.isDirectory)
    .map((dir) => dir.name);

  const coreCount = navigator.hardwareConcurrency;
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
    workerList[i].postMessage({ dirPaths, processedPath: PROCESSED_ICON_PATH });
  }

  const memoryUsageMb = process.memoryUsage.rss() / 1024 / 1024;

  await Promise.all(
    workerList.map((worker) => new Promise((resolve) => (worker.onmessage = resolve))),
  );

  const endTime = performance.now();
  const perf = performance.measure("Execution time", { start: startTime, end: endTime });

  const logData = [
    ["Thread number", threadNumber],
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
