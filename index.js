const alreadyProcessed = Symbol("alreadyProcessed");

/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (opts = {}) => {
  return {
    postcssPlugin: "postcss-plugin-hash-vars",
    Declaration(decl, postcss) {
      if (decl[alreadyProcessed]) return;

      if (
        !decl[alreadyProcessed] &&
        (decl.prop.startsWith("--") || decl.value.includes("--"))
      ) {
        // console.log(decl);
        const newDecl = decl.clone();
        newDecl[alreadyProcessed] = true;

        let hash = "-" + (opts.staticHash ? opts.staticHash : "hash");

        if (opts.maxLength && opts.maxLength > 0) {
          hash = hash.slice(0, opts.maxLength + 1);
        }

        if (newDecl.prop.startsWith("--")) {
          newDecl.prop += hash;
        }
        if (newDecl.value.includes("--")) {
          newDecl.value = newDecl.value.replace(
            /var\(--(.*?)(?=\)|,)(.*?)(?:\))/g,
            `var(--$1${hash}$2)`
          );
        }

        decl.replaceWith(newDecl);
      }
    },
  };
};

module.exports.postcss = true;
