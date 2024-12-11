const alreadyProcessed = Symbol("alreadyProcessed");

/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (opts = {}) => {
  return {
    postcssPlugin: "postcss-plugin-hash-vars",
    Declaration(decl) {
      if (decl[alreadyProcessed]) return;
      if (!opts.hash) return;

      if (
        !decl[alreadyProcessed] &&
        (decl.prop.startsWith("--") || decl.value.includes("--"))
      ) {
        // console.log(decl);
        const newDecl = decl.clone();
        newDecl[alreadyProcessed] = true;

        let hash = (opts.delimiter || "-") + (opts.hash || "hash");

        if (opts.maxLength && opts.maxLength > 0) {
          hash = hash.slice(0, opts.maxLength + 1);
        }

        if (newDecl.prop.startsWith("--")) {
          newDecl.prop += hash;
        }

        if (newDecl.value.includes("--")) {
          newDecl.value = newDecl.value.replace(
            /var\(--(.*?)(?=\)|,)/g,
            (_, varName) => `var(--${varName}${hash}`
          );
        }

        decl.replaceWith(newDecl);
      }
    },
  };
};

module.exports.postcss = true;
