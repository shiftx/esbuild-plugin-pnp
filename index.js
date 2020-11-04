const pnpapi = require("pnpapi");
const { PosixFS, ZipOpenFS } = require(`@yarnpkg/fslib`);
const libzip = require(`@yarnpkg/libzip`).getLibzipSync();
const zipOpenFs = new ZipOpenFS({ libzip });
const crossFs = new PosixFS(zipOpenFs);

const pnpResolve = args => {
  const path = pnpapi.resolveRequest(args.path, args.resolveDir + "/", {
    considerBuiltins: true,
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  });
  return path ? { path, namespace: "pnp" } : { external: true };
};

module.exports = ({ external = [] }) => {
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

      build.onLoad({ filter: /.*/, namespace: "pnp" }, args => {
        const resolveDir = args.path.match(/(.+\/)/)[1];
        return {
          contents: crossFs.readFileSync(args.path),
          resolveDir,
          loader: "default",
        };
      });
    },
  };
};
