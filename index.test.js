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
  await run("a{ --test: 123; }", "a{ --test-hash: 123; }", {});
});

test("replaces basic var values with hash", async () => {
  await run("a{ color: var(--test); }", "a{ color: var(--test-hash); }", {});
});

test("replaces kebab-case var values with hash", async () => {
  await run(
    "a{ color: var(--test-kebab); }",
    "a{ color: var(--test-kebab-hash); }",
    {}
  );
});

test("replaces multiple var values with hash", async () => {
  await run(
    "a{ font: var(--first-one) var(--second-one); }",
    "a{ font: var(--first-one-hash) var(--second-one-hash); }",
    {}
  );
});

test("uses options.staticHash for properties", async () => {
  await run("a{ --test: 123; }", "a{ --test-static: 123; }", {
    staticHash: "static",
  });
});

test("uses options.staticHash for values", async () => {
  await run("a{ color: var(--test); }", "a{ color: var(--test-static); }", {
    staticHash: "static",
  });
});

test("uses options.maxLength for properties", async () => {
  await run("a{ --test: 123; }", "a{ --test-12345: 123; }", {
    staticHash: "1234567890",
    maxLength: 5,
  });
});

test("uses options.maxLength for values", async () => {
  await run("a{ color: var(--test); }", "a{ color: var(--test-12345); }", {
    staticHash: "1234567890",
    maxLength: 5,
  });
});

test("works with multiple vars", async () => {
  await run(
    "a{ color: var(--test); background: var(--test2); }",
    "a{ color: var(--test-hash); background: var(--test2-hash); }",
    {}
  );
});

test("works with a fallback value", async () => {
  await run(
    "a{ color: var(--test, red); }",
    "a{ color: var(--test-hash, red); }",
    {}
  );
});

test("works with a var as a fallback value", async () => {
  await run(
    "a{ color: var(--test, var(--test2)); }",
    "a{ color: var(--test-hash, var(--test2-hash)); }",
    {}
  );
});
