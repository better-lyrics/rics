---
"rics": patch
"codemirror-lang-rics": patch
---

fix: CSS-only functions (oklch, oklab, lab, lch, hwb) now pass through without evaluating arguments, preventing `%` from being interpreted as modulo

fix: Warnings now include position information for accurate linter highlighting
