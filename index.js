if (!module.pnpApiPath) {
  console.error(
    "Error: pnpApi not found. Are you running command with yarn? `yarn node ...`"
  );
  process.exit(1);
}
let pnpapi = require("pnpapi");
let fs = require("fs");

let pnpResolve = args => {
  const path = pnpapi.resolveRequest(args.path, args.resolveDir + "/", {
    considerBuiltins: true,
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  });
  return path ? { path, namespace: "pnp" } : { external: true };
};

module.exports = ({ external = [] } = {}) => {
  let externalsSet = new Set(external);
  return {
    name: "pnp-plugin",
    setup(build) {
      // Initial resolve if not a relative path
      build.onResolve({ filter: /^[^\.\/]/ }, args => {
        if (externalsSet.has(args.path)) return { external: true };
        return pnpResolve(args);
      });
      // Subsequent resolves within pnp zip files
      build.onResolve({ filter: /.*/, namespace: "pnp" }, pnpResolve);

      build.onLoad({ filter: /.*/, namespace: "pnp" }, async args => {
        let resolveDir = args.path.match(/(.+\/)/)[1];
        let contents = await fs.promises.readFile(args.path, "utf8");
        return {
          contents,
          resolveDir,
          loader: "default",
        };
      });
    },
  };
};
