import * as fs from "node:fs";
import {
  HUGE_DATA_SET_PATH,
  HUGE_SET_NUMBER_OF_COPY,
  NORMAL_DATA_SET_PATH,
  RAW_ICON_PATH,
  RAW_ICON_PATH_FTV,
} from "./constants.ts";

let iconPath = RAW_ICON_PATH;
const iconPathArg = Deno.args[0];

if (iconPathArg && iconPathArg.toLowerCase() === "-p") {
  iconPath = RAW_ICON_PATH_FTV;
}

console.log("Generating data sets...");

const setPaths = [HUGE_DATA_SET_PATH, NORMAL_DATA_SET_PATH];

for (const setPath of setPaths) {
  const setDirExists = !!(await Deno.stat(setPath).catch(() => null));
  if (setDirExists) {
    await Deno.remove(setPath, { recursive: true });
  }
  await Deno.mkdir(setPath);
}

const topDirs = [...Deno.readDirSync(iconPath)]
  .filter((file) => file.isDirectory)
  .map((dir) => dir.name);

function generateNormalSet() {
  topDirs.forEach((dir) => {
    fs.cpSync(`${iconPath}/${dir}`, `${NORMAL_DATA_SET_PATH}/${dir}`);
  });
}

function generateHugeSet() {
  for (let i = 0; i < HUGE_SET_NUMBER_OF_COPY; i++) {
    topDirs.forEach((dir, index) => {
      fs.cpSync(`${iconPath}/${dir}`, `${HUGE_DATA_SET_PATH}/${dir}-${i}-${index}`);
    });
  }
}

generateNormalSet();
generateHugeSet();
console.log("Data sets generated !");
