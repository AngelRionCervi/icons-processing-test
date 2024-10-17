import { camelCase } from "https://deno.land/x/case/mod.ts";

export async function genFiles(iconPath: string, iconMap: Map<string, string>) {
  const rootPath = iconPath.split("/").slice(0, -1).join("/");

  await Promise.all([
    genIconExports(rootPath, iconMap),
    genSvelteHelper(rootPath),
    genTypesFile(rootPath),
  ]);
}

async function genIconExports(rootPath: string, iconMap: Map<string, string>) {
  let file = "";

  iconMap.forEach((value, key) => {
    file += `import ${camelCase(key.replace(".svg", ""))} from "${value}?raw";\n`;
  });

  file += "\n";

  file += `export const iconExports = {`;

  iconMap.forEach((_, key) => {
    file += `\n  ${camelCase(key.replace(".svg", ""))},`;
  });

  file += "\n};\n";

  await Deno.writeTextFile(`${rootPath}/iconExports.ts`, file);
}

async function genSvelteHelper(rootPath: string) {
  const helperContent = `<script lang="ts">
  import { onMount } from "svelte";
  import { iconExports } from "./iconExports";
  import type { IconName } from "./iconTypes";

  export let name: IconName;

  const svgRaw = iconExports[name];
  let dummyNode: HTMLDivElement;
  let parsingFailed = false;

  onMount(() => {
    if (!svgRaw) return;

    const svgEl = new DOMParser().parseFromString(svgRaw, "text/html")?.querySelector("svg");

    if (!svgEl) {
      parsingFailed = true;
      return;
    }

    Object.entries($$restProps).forEach(([key, value]) => {
      svgEl.setAttribute(key, value);
    });
    dummyNode.replaceWith(svgEl);
  });
</script>

{#if !svgRaw || parsingFailed}
  <img style="width:fit-content; height:fit-content;" src="#" alt="" />
{:else}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div bind:this={dummyNode}></div>
{/if}
`;

  await Deno.writeTextFile(`${rootPath}/Icon.svelte`, helperContent);
}

async function genTypesFile(rootPath: string) {
  const typesContent = `import { iconExports } from './iconExports';
  
export type IconName = keyof typeof iconExports;
`;

  await Deno.writeTextFile(`${rootPath}/iconTypes.ts`, typesContent);
}
