import { PROCESSED_PROD_ICON_PATH, RAW_ICON_PATH, RAW_ICON_PATH_FTV } from "./constants.ts";
import singleThreadExample from "./benchmark/single-thread/main.ts";

let iconPath = RAW_ICON_PATH;
const iconPathArg = Deno.args[0];

if (iconPathArg && iconPathArg.toLowerCase() === "-p") {
  iconPath = RAW_ICON_PATH_FTV;
}

console.log("Processing icons...");
await singleThreadExample(iconPath, PROCESSED_PROD_ICON_PATH);
console.log("Icons processed !");
