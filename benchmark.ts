import singleThreadExample from "./benchmark/single-thread/main.ts";
import multiThreadExample from "./benchmark/multi-thread/main.ts";
import { HUGE_DATA_SET_PATH, NORMAL_DATA_SET_PATH } from "./constants.ts";

if (await Deno.stat(NORMAL_DATA_SET_PATH).catch(() => null)) {
  console.log("-----TESTING NORMAL DATA SET-----");
  console.log("-----SINGLE THREAD-----");
  await singleThreadExample(NORMAL_DATA_SET_PATH);
  console.log("-----MULTI THREAD-----");
  await multiThreadExample(NORMAL_DATA_SET_PATH);
  console.log("-----END NORMAL DATA SET-----");
} else {
  console.log("Normal data set not found, skipping huge data set test");
}

if (await Deno.stat(HUGE_DATA_SET_PATH).catch(() => null)) {
  console.log("-----TESTING HUGE DATA SET-----");
  console.log("-----SINGLE THREAD-----");
  await singleThreadExample(HUGE_DATA_SET_PATH);
  console.log("-----MULTI THREAD-----");
  await multiThreadExample(HUGE_DATA_SET_PATH);
  console.log("-----END HUGE DATA SET-----");
} else {
  console.log("Huge data set not found, skipping huge data set test");
}
