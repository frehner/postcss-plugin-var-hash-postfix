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
    }
  );
});

test("replaces snake-case var values with hash", async () => {
  await run(
    "a{ color: var(--test_kebab); }",
    "a{ color: var(--test_kebab-hash); }",
    {
      hash: "hash",
    }
  );
});

test("replaces multiple var values with hash", async () => {
  await run(
    "a{ font: var(--first-one) var(--second-one); }",
    "a{ font: var(--first-one-hash) var(--second-one-hash); }",
    {
      hash: "hash",
    }
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
    }
  );
});

test("works with a fallback value", async () => {
  await run(
    "a{ color: var(--test, rebeccapurple); }",
    "a{ color: var(--test-hash, rebeccapurple); }",
    {
      hash: "hash",
    }
  );
});

test("works with a var as a fallback value", async () => {
  await run(
    "a{ color: var(--test, var(--test2)); }",
    "a{ color: var(--test-hash, var(--test2-hash)); }",
    {
      hash: "hash",
    }
  );
});

test("works with complex nested values and vars", async () => {
  await run(
    "a{ color: var(--test, var(--test2, var(--test3, rebeccapurple))); }",
    "a{ color: var(--test-hash, var(--test2-hash, var(--test3-hash, rebeccapurple))); }",
    {
      hash: "hash",
    }
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
