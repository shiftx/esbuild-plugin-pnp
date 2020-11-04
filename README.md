# esbuild-plugin-pnp

Experimental support for using esbuild with yarn pnp.
Tested with esbuild 0.8.1

## Usage

```js
const { build } = require("esbuild");
const pnpPlugin = require("esbuild-plugin-pnp");

build({
  entryPoints: ["index.ts"],
  bundle: true,
  outfile: "out.js",
  plugins: [pnpPlugin()],
}).catch(err => {
  console.log(err);
  process.exit(1);
});
```
