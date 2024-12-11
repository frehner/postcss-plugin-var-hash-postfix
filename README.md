# PostCSS Plugin Hash Vars

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

## Setup

Install the `postcss-plugin-hash-vars` package:

```cli
npm i postcss-plugin-hash-vars
```

Add the `postcss-plugin-hash-vars` plugin to your PostCSS config:

```js
import postCssHashVars from "postcss-plugin-hash-vars";

await postCss([
  postCssHashVars({
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
