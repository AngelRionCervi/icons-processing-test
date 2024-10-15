import { camelCase } from "https://deno.land/x/case/mod.ts";

export async function genFiles(iconPath: string, iconMap: Map<string, string>) {
  const rootPath = iconPath.split("/").slice(0, -1).join("/");

  await Promise.all([genIconExports(rootPath, iconMap), genSvelteHelper(rootPath)]);
}

async function genIconExports(rootPath: string, iconMap: Map<string, string>) {
  let file = "";
  const start = "// This file is generated by utils/codeGen.ts\n\n";
  const end = "\n";

  file += start;

  iconMap.forEach((value, key) => {
    file += `import ${camelCase(key.replace(".svg", ""))} from "${value}?raw";\n`;
  });

  file += "\n";

  file += `export const iconExports = {`;

  iconMap.forEach((_, key) => {
    file += `\n  ${camelCase(key.replace(".svg", ""))},`;
  });

  file += "\n};";

  file += end;

  await Deno.writeTextFile(`${rootPath}/iconExports.ts`, file);
}

async function genSvelteHelper(rootPath: string) {
  const helperContent = `<script lang="ts">
	import { iconExports } from './iconExports';

	type IconKey = keyof typeof iconExports;

	export let key: IconKey;

	const svgRaw = iconExports[key];
</script>

{#if svgRaw}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html svgRaw}
{:else}
	<img style="width:fit-content; height:fit-content;" src="#" alt="" />
{/if}
`;

  await Deno.writeTextFile(`${rootPath}/Icon.svelte`, helperContent);
}
