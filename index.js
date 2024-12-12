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

        if (typeof opts.maxLength === "number" && opts.maxLength > 0) {
          hash = hash.slice(0, opts.maxLength + 1);
        }

        if (newDecl.prop.startsWith("--")) {
          if (
            opts.ignorePrefixes?.length > 0 &&
            opts.ignorePrefixes.some((prefix) => {
              return newDecl.prop.startsWith("--" + prefix);
            })
          ) {
            // do nothing because it's in the ignorePrefixes
          } else {
            newDecl.prop += hash;
          }
        }

        if (newDecl.value.includes("--")) {
          newDecl.value = newDecl.value.replace(
            /var\(--(.*?)(?=\)|,)/g,
            (_, varName) => {
              if (
                opts.ignorePrefixes?.length > 0 &&
                opts.ignorePrefixes.some((prefix) => {
                  return varName.startsWith(prefix);
                })
              ) {
                // do nothing because it's in the ignorePrefixes
                return `var(--${varName}`;
              }
              return `var(--${varName}${hash}`;
            }
          );
        }

        decl.replaceWith(newDecl);
      }
    },
  };
};

module.exports.postcss = true;
