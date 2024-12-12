---
"postcss-plugin-var-hash-postfix": patch
---

Fix bug when there's a newline after var(). Now don't even look for var, just look for --
