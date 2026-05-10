import { resolve } from "node:path";

import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: {
    "index.http": "src/index.http.ts",
    seed: "src/infra/db/seeds/seed.ts",
  },
  minify: true,
  keepNames: true,
  bundle: true,
  packages: "external",
  platform: "node",
  format: "esm",
  outdir: "dist",
  alias: { "@": resolve("src") },
});
