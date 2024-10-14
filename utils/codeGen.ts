export async function genIconMapFile(iconPath: string, iconMap: Map<string, string>) {
  let file = "";
  const start = "export default {";
  const end = "\n};\n";

  file += start;

  iconMap.forEach((value, key) => {
    file += `\n  "${key.replace(".svg", "")}": "${value}",`;
  });

  file += end;

  const rootPath = iconPath.split("/").slice(0, -1).join("/");

  await Deno.writeTextFile(`${rootPath}/iconMap.ts`, file);
}
