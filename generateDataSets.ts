import * as fs from "node:fs";

console.log("Generating data sets...");

const HUGE_DATA_SET_PATH = "./icons/set-huge";
const NORMAL_DATA_SET_PATH = "./icons/set-normal";
const RAW_ICON_PATH = "./icons/source";
const NUMBER_OF_COPY = 25;

const setPaths = [HUGE_DATA_SET_PATH, NORMAL_DATA_SET_PATH];

for (const setPath of setPaths) {
  const setDirExists = !!(await Deno.stat(setPath).catch(() => null));
  if (setDirExists) {
    await Deno.remove(setPath, { recursive: true });
  }
  await Deno.mkdir(setPath);
}

const topDirs = [...Deno.readDirSync(RAW_ICON_PATH)]
  .filter((file) => file.isDirectory)
  .map((dir) => dir.name);

function generateNormalSet() {
  topDirs.forEach((dir, index) => {
    fs.cpSync(`${RAW_ICON_PATH}/${dir}`, `${NORMAL_DATA_SET_PATH}/${dir}-${index}`);
  });
}

function generateHugeSet() {
  for (let i = 0; i < NUMBER_OF_COPY; i++) {
    topDirs.forEach((dir, index) => {
      fs.cpSync(`${RAW_ICON_PATH}/${dir}`, `${HUGE_DATA_SET_PATH}/${dir}-${i}-${index}`);
    });
  }
}

generateNormalSet();
generateHugeSet();
console.log("Data sets generated !");
