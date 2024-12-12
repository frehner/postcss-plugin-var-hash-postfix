# PostCSS Plugin Var Hash Postfix

A PostCSS plugin to add hashes or other postfixes to your CSS Variables (CSS Custom Properties). Take your source CSS from

```css
--purple: rebeccapurple;

div {
  color: var(--purple);
}
```

to

```css
--purple-abc123: rebeccapurple;

div {
  color: var(--purple-abc123);
}
```

Will also transform CSS Variables declared using the [@property at-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/@property) synatx.

## Setup

Install the `postcss-plugin-var-hash-postfix` package:

```bash
npm i postcss-plugin-var-hash-postfix
```

Add the `postcss-plugin-var-hash-postfix` plugin to your PostCSS config:

```js
import postCssVarHashPostfix from "postcss-plugin-var-hash-postfix";

await postCss([
  postCssVarHashPostfix({
    hash: "abc123",
  }),
]);
```

See [below](#config) for additional configuration and setup.

## Why

CSS Variables (CSS Custom Properties) are a great way to share config, styles, colors, etc. across an app, website, or framework; they even penetrate the shadow dom of custom web components.

But maybe you want to make it so some of your CSS Variables aren't easily overridden by other developers; perhaps you're using them for some config that's internal to your library but isn't meant to be used by external developers.

This plugin enables you to append a hash to your variables automatically, as often as each build if you want. This way the variable changes frequently enough to discourage use by others.

Or, alternatively, you just want to add a hash to your CSS Variables for fun.

## Config

Plugin Options

### `hash`

The hash to apply as a postfix to your CSS Variables. You can hardcode a hash and update it manually:

```js
postCssVarHashPostfix({
  hash: "abc123",
});
```

Or use an environment variable to change the hash on every build, such as:

```js
postCssVarHashPostfix({
  hash: process.env.GIT_SHA,
});
```

If you don't want a full-length SHA for the hash, add the [maxLength](#maxlength) option as well.

#### Falsy `hash`

If the hash is [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) (`''`, `false`, `null`, `undefined`, etc.), then **no hash is appended**.

This is intended to help you easily skip appending a hash (e.g. for local development) while still applying a hash at build time.

Note: when `hash` is falsy, the plugin will bail early and not apply any other config options.

### `maxLength`

Will truncate your hashes to a specific length, so you don't have to do it manually.

```js
// input: --test: rebeccapurple;

postCssVarHashPostfix({
  hash: "1234567890",
  maxLength: 5,
});

// output: --test-12345: rebeccapurple;
```

### `ignorePrefixes`

An array of strings for which any CSS Variable that starts with the prefix will not have a hash appended to them. This allows you to provide CSS Variables that are intended to be used by other developers, while still protecting the CSS Variables you don't intend to be part of your public API.

```js
// input: --ignore: blue; --test: green;

postCssVarHashPostfix({
  hash: "123abc",
  ignorePrefixes: ["ignore"],
});

// output: --ignore: blue; --test-abc123: green;
```

Note that this option will ignore _anything_ that starts with the string; with the example above, both `--ignore` and `--ignorethis` would not have a hash appended to them.

### `delimiter`

Customize the delimiter used to separate the existing CSS Variable name and the hash.

```js
// input: --test: rebeccapurple;

postCssVarHashPostfix({
  hash: "123abc",
  delimiter: "_",
});

// output: --test_123abc: rebeccapurple;
```
