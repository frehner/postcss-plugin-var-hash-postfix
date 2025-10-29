const alreadyProcessed = Symbol("alreadyProcessed");

/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (opts = {}) => {
  let hash = (opts.delimiter || "-") + (opts.hash || "hash");

  if (typeof opts.maxLength === "number" && opts.maxLength > 0) {
    hash = hash.slice(0, opts.maxLength + 1);
  }

  return {
    postcssPlugin: "postcss-plugin-var-hash-postfix",
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
            /--([a-zA-Z0-9_-]+)/g,
            (_, varName) => {
              if (
                opts.ignorePrefixes?.length > 0 &&
                opts.ignorePrefixes.some((prefix) => {
                  return varName.startsWith(prefix);
                })
              ) {
                // do nothing because it's in the ignorePrefixes
                return `--${varName}`;
              }
              return `--${varName}${hash}`;
            },
          );
        }

        decl.replaceWith(newDecl);
      }
    },
    AtRule(atRule) {
      if (atRule[alreadyProcessed]) return;
      if (!opts.hash) return;

      if (atRule.name === "property" && atRule.params.startsWith("--")) {
        const newAtRule = atRule.clone();
        newAtRule[alreadyProcessed] = true;

        if (
          opts.ignorePrefixes?.length > 0 &&
          opts.ignorePrefixes.some((prefix) => {
            return newAtRule.params.startsWith("--" + prefix);
          })
        ) {
          // do nothing because it's in the ignorePrefixes
        } else {
          newAtRule.params += hash;
        }

        atRule.replaceWith(newAtRule);
      }
    },
  };
};

module.exports.postcss = true;
