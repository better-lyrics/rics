---
"rics": patch
"codemirror-lang-rics": patch
"prettier-plugin-rics": patch
"eslint-plugin-rics": patch
---

fix: CSS-only functions (oklch, oklab, lab, lch, hwb) now pass through without evaluating arguments, preventing `%` from being interpreted as modulo

fix: Font shorthand `font: 16px/1.5` no longer incorrectly interpreted as division

fix: Warnings now include position information for accurate linter highlighting

fix: Add missing named exports for prettier-plugin-rics and eslint-plugin-rics
