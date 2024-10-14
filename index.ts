import { PROCESSED_PROD_ICON_PATH, RAW_ICON_PATH } from "./constants.ts";
import singleThreadExample from "./benchmark/single-thread/main.ts";

console.log("Processing icons...");
await singleThreadExample(RAW_ICON_PATH, PROCESSED_PROD_ICON_PATH);
console.log("Icons processed !");
