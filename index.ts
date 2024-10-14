import { NORMAL_DATA_SET_PATH, PROCESSED_PROD_ICON_PATH } from "./constants.ts";
import singleThreadExample from "./benchmark/single-thread/main.ts";

if (await Deno.stat(NORMAL_DATA_SET_PATH).catch(() => null)) {
  console.log("Processing icons...");
  await singleThreadExample(NORMAL_DATA_SET_PATH, PROCESSED_PROD_ICON_PATH);
} else {
  console.log("Normal data set not found");
}
