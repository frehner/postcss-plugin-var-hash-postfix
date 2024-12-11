const alreadyProcessed = Symbol("alreadyProcessed");

/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (opts = {}) => {
  return {
    postcssPlugin: "postcss-plugin-hash-vars",
    // eslint-disable-next-line no-unused-vars
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
          // First find all CSS variable names
          const varMatches = [
            ...newDecl.value.matchAll(/var\(--(.*?)(?=\)|,)/g),
          ];

          // Create a map of replacements
          const replacements = varMatches.map((match) => ({
            original: match[0],
            varName: match[1],
            replacement: `var(--${match[1]}${hash}`,
          }));

          // Apply replacements
          replacements.forEach(({ original, replacement }) => {
            newDecl.value = newDecl.value.replace(original, replacement);
          });
        }

        decl.replaceWith(newDecl);
      }
    },
  };
};

module.exports.postcss = true;
