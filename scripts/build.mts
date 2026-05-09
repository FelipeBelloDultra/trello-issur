import { resolve } from "node:path";

import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.ts"],
  minify: true,
  bundle: true,
  packages: "external",
  platform: "node",
  format: "esm",
  outdir: "dist",
  alias: { "@": resolve("src") },
});
