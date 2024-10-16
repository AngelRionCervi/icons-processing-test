Needs at least Deno 2.0

for generating icon set:
`deno run -A index.ts`

for benchmarking single / multi threaded solutions:

first: 
`deno run -A generateDataSets.ts`
to generate the icons data sets

then:
`deno run -A benchmark.ts` 
to start the benchmark
