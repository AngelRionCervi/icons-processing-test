Needs at least Deno 2.0

for generating icon set:
`deno run -RW index.ts`

for benchmarking single / multi threaded solutions:

first: 
`deno run -RW generateDataSets.ts`
to generate the icons data sets

then:
`deno run -RW benchmark.ts` 
to start the benchmark
