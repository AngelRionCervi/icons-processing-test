import singleThreadExample from "./single-thread/main.ts";
import multiThreadExample from "./multi-thread/main.ts";

const normalDataSetPath = "./icons/set-normal";
const hugeDataSetPath = "./icons/set-huge";

if (await Deno.stat(normalDataSetPath).catch(() => null)) {
  console.log("-----TESTING NORMAL DATA SET-----");
  console.log("-----SINGLE THREAD EXAMPLE-----");
  await singleThreadExample(normalDataSetPath);
  console.log("-----MULTI THREAD EXAMPLE-----");
  await multiThreadExample(normalDataSetPath);
  console.log("-----END NORMAL DATA SET-----");
} else {
  console.log("Normal data set not found, skipping huge data set test");
}

if (await Deno.stat(hugeDataSetPath).catch(() => null)) {
  console.log("-----TESTING HUGE DATA SET-----");
  console.log("-----SINGLE THREAD EXAMPLE-----");
  await singleThreadExample(hugeDataSetPath);
  console.log("-----MULTI THREAD EXAMPLE-----");
  await multiThreadExample(hugeDataSetPath);
  console.log("-----END HUGE DATA SET-----");
} else {
  console.log("Huge data set not found, skipping huge data set test");
}
