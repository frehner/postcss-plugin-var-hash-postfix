const postcss = require("postcss");
const { equal } = require("node:assert");
const { test } = require("node:test");

const plugin = require("./");

async function run(input, output, opts = {}) {
  let result = await postcss([plugin(opts)]).process(input, {
    from: undefined,
  });
  equal(result.css, output);
  equal(result.warnings().length, 0);
}

/* Write tests here */

test("replaces var declaration with hash", async () => {
  await run("a{ --test: 123; }", "a{ --test-hash: 123; }", {
    hash: "hash",
  });
});

test("replaces basic var values with hash", async () => {
  await run("a{ color: var(--test); }", "a{ color: var(--test-hash); }", {
    hash: "hash",
  });
});

test("replaces kebab-case var values with hash", async () => {
  await run(
    "a{ color: var(--test-kebab); }",
    "a{ color: var(--test-kebab-hash); }",
    {
      hash: "hash",
    },
  );
});

test("replaces snake-case var values with hash", async () => {
  await run(
    "a{ color: var(--test_kebab); }",
    "a{ color: var(--test_kebab-hash); }",
    {
      hash: "hash",
    },
  );
});

test("replaces multiple var values with hash", async () => {
  await run(
    "a{ font: var(--first-one) var(--second-one); }",
    "a{ font: var(--first-one-hash) var(--second-one-hash); }",
    {
      hash: "hash",
    },
  );
});

test("property: blank options.hash early bails and does nothing", async () => {
  await run("a{ --test: 123; }", "a{ --test: 123; }", {});
});

test("value: blank options.hash early bails and does nothing", async () => {
  await run("a{ color: var(--test); }", "a{ color: var(--test); }", {});
});

test("uses options.maxLength for properties", async () => {
  await run("a{ --test: 123; }", "a{ --test-12345: 123; }", {
    hash: "1234567890",
    maxLength: 5,
  });
});

test("uses options.maxLength for values", async () => {
  await run("a{ color: var(--test); }", "a{ color: var(--test-12345); }", {
    hash: "1234567890",
    maxLength: 5,
  });
});

test("works with multiple vars", async () => {
  await run(
    "a{ color: var(--test); background: var(--test2); }",
    "a{ color: var(--test-hash); background: var(--test2-hash); }",
    {
      hash: "hash",
    },
  );
});

test("works with a fallback value", async () => {
  await run(
    "a{ color: var(--test, rebeccapurple); }",
    "a{ color: var(--test-hash, rebeccapurple); }",
    {
      hash: "hash",
    },
  );
});

test("works with a var as a fallback value", async () => {
  await run(
    "a{ color: var(--test, var(--test2)); }",
    "a{ color: var(--test-hash, var(--test2-hash)); }",
    {
      hash: "hash",
    },
  );
});

test("works with complex nested values and vars", async () => {
  await run(
    "a{ color: var(--test, var(--test2, var(--test3, rebeccapurple))); }",
    "a{ color: var(--test-hash, var(--test2-hash, var(--test3-hash, rebeccapurple))); }",
    {
      hash: "hash",
    },
  );
});

test("allows a custom delimiter for properties", async () => {
  await run("a{ --test: 123; }", "a{ --test_hash: 123; }", {
    hash: "hash",
    delimiter: "_",
  });
});

test("allows a custom delimiter for values", async () => {
  await run("a{ color: var(--test); }", "a{ color: var(--test_hash); }", {
    hash: "hash",
    delimiter: "_",
  });
});

test("doesn't replace class names with BEM syntax that contains --", async () => {
  await run(
    ".a--b{ color: rebeccapurple; }",
    ".a--b{ color: rebeccapurple; }",
    {
      hash: "hash",
    },
  );
});

test("doesn't transform properties that start with the ignorePrefixes", async () => {
  await run("a{ --ignore: 123; }", "a{ --ignore: 123; }", {
    hash: "hash",
    ignorePrefixes: ["ignore"],
  });
});

test("uses multiple ignorePrefixes for properties", async () => {
  await run(
    "a{ --ignore: 123; --ignore2: 123; }",
    "a{ --ignore: 123; --ignore2: 123; }",
    {
      hash: "hash",
      ignorePrefixes: ["ignore", "ignore2"],
    },
  );
});

test("doesn't transform values that start with the ignorePrefixes", async () => {
  await run("a{ color: var(--ignore); }", "a{ color: var(--ignore); }", {
    hash: "hash",
    ignorePrefixes: ["ignore"],
  });
});

test("uses multiple ignorePrefixes for values", async () => {
  await run(
    "a{ color: var(--ignore); background-color: var(--skip); }",
    "a{ color: var(--ignore); background-color: var(--skip); }",
    {
      hash: "hash",
      ignorePrefixes: ["ignore", "skip"],
    },
  );
});

test("ignores some and not others for properties", async () => {
  await run(
    "a{ --ignore: 123; --test: 123; }",
    "a{ --ignore: 123; --test-hash: 123; }",
    {
      hash: "hash",
      ignorePrefixes: ["ignore"],
    },
  );
});

test("ignores some and not others for values", async () => {
  await run(
    "a{ color: var(--ignore); background-color: var(--test); }",
    "a{ color: var(--ignore); background-color: var(--test-hash); }",
    {
      hash: "hash",
      ignorePrefixes: ["ignore"],
    },
  );
});

test("works with complex nested values and vars and ignores some", async () => {
  await run(
    "a{ color: var(--test, var(--skip, var(--test3, rebeccapurple))); }",
    "a{ color: var(--test-hash, var(--skip, var(--test3-hash, rebeccapurple))); }",
    {
      hash: "hash",
      ignorePrefixes: ["skip"],
    },
  );
});

test("works when the value has newlines", async () => {
  await run(
    `a{ color: var(
    --test,
    blue
  );}`,
    `a{ color: var(
    --test-hash,
    blue
  );}`,
    {
      hash: "hash",
    },
  );
});

test("works with at-rules", async () => {
  await run("@property --test {}", "@property --test-hash {}", {
    hash: "hash",
  });
});

test("works with at-rules that have ignorePrefixes", async () => {
  await run("@property --ignore {}", "@property --ignore {}", {
    hash: "hash",
    ignorePrefixes: ["ignore"],
  });
});

test("works with CSS variables used directly without var() syntax in transition", async () => {
  await run(
    "a{ transition: --s-thumb-color 0.3s cubic-bezier(.25, 0, .5, 1); }",
    "a{ transition: --s-thumb-color-hash 0.3s cubic-bezier(.25, 0, .5, 1); }",
    {
      hash: "hash",
    },
  );
});

test("works with named @container queries and container-names that start with --", async () => {
  await run(
    "@container --container (min-width: 100px) {} .container { container-name: --container; }",
    "@container --container-hash (min-width: 100px) {} .container { container-name: --container-hash; }",
    {
      hash: "hash",
    },
  );

  await run(
    "@container container (min-width: 100px) {} .container { container-name: container; }",
    "@container container (min-width: 100px) {} .container { container-name: container; }",
    {
      hash: "hash",
    },
  );
});

test("only transforms properties that start with the includePrefixes", async () => {
  await run("a{ --include: 123; }", "a{ --include-hash: 123; }", {
    hash: "hash",
    includePrefixes: ["include"],
  });
});

test("doesn't transform properties that don't match includePrefixes", async () => {
  await run("a{ --test: 123; }", "a{ --test: 123; }", {
    hash: "hash",
    includePrefixes: ["include"],
  });
});

test("uses multiple includePrefixes for properties", async () => {
  await run(
    "a{ --include: 123; --include2: 123; }",
    "a{ --include-hash: 123; --include2-hash: 123; }",
    {
      hash: "hash",
      includePrefixes: ["include", "include2"],
    },
  );
});

test("only transforms values that start with the includePrefixes", async () => {
  await run("a{ color: var(--include); }", "a{ color: var(--include-hash); }", {
    hash: "hash",
    includePrefixes: ["include"],
  });
});

test("doesn't transform values that don't match includePrefixes", async () => {
  await run("a{ color: var(--test); }", "a{ color: var(--test); }", {
    hash: "hash",
    includePrefixes: ["include"],
  });
});

test("uses multiple includePrefixes for values", async () => {
  await run(
    "a{ color: var(--include); background-color: var(--allow); }",
    "a{ color: var(--include-hash); background-color: var(--allow-hash); }",
    {
      hash: "hash",
      includePrefixes: ["include", "allow"],
    },
  );
});

test("includes some and not others for properties", async () => {
  await run(
    "a{ --include: 123; --test: 123; }",
    "a{ --include-hash: 123; --test: 123; }",
    {
      hash: "hash",
      includePrefixes: ["include"],
    },
  );
});

test("includes some and not others for values", async () => {
  await run(
    "a{ color: var(--include); background-color: var(--test); }",
    "a{ color: var(--include-hash); background-color: var(--test); }",
    {
      hash: "hash",
      includePrefixes: ["include"],
    },
  );
});

test("works with complex nested values and vars and includes only some", async () => {
  await run(
    "a{ color: var(--test, var(--include, var(--test3, rebeccapurple))); }",
    "a{ color: var(--test, var(--include-hash, var(--test3, rebeccapurple))); }",
    {
      hash: "hash",
      includePrefixes: ["include"],
    },
  );
});

test("works with at-rules and includePrefixes", async () => {
  await run("@property --include {}", "@property --include-hash {}", {
    hash: "hash",
    includePrefixes: ["include"],
  });
});

test("doesn't transform at-rules that don't match includePrefixes", async () => {
  await run("@property --test {}", "@property --test {}", {
    hash: "hash",
    includePrefixes: ["include"],
  });
});

test("works with @container queries and includePrefixes", async () => {
  await run(
    "@container --include (min-width: 100px) {} .container { container-name: --include; }",
    "@container --include-hash (min-width: 100px) {} .container { container-name: --include-hash; }",
    {
      hash: "hash",
      includePrefixes: ["include"],
    },
  );
});

test("doesn't transform @container queries that don't match includePrefixes", async () => {
  await run(
    "@container --test (min-width: 100px) {} .container { container-name: --test; }",
    "@container --test (min-width: 100px) {} .container { container-name: --test; }",
    {
      hash: "hash",
      includePrefixes: ["include"],
    },
  );
});

test("includePrefixes and ignorePrefixes work together - include wins", async () => {
  await run(
    "a{ --include: 123; --test: 123; }",
    "a{ --include-hash: 123; --test: 123; }",
    {
      hash: "hash",
      includePrefixes: ["include"],
      ignorePrefixes: ["test"],
    },
  );
});

test("includePrefixes and ignorePrefixes work together - ignore filters included", async () => {
  await run(
    "a{ --include: 123; --include-ignore: 123; }",
    "a{ --include-hash: 123; --include-ignore: 123; }",
    {
      hash: "hash",
      includePrefixes: ["include"],
      ignorePrefixes: ["include-ignore"],
    },
  );
});
