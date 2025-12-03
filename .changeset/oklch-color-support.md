---
"rics": minor
"codemirror-lang-rics": patch
---

Add oklch color format support with format preservation. Colors now retain their original format (hex, rgb, hsl, oklch) through transformations like mix(), lighten(), and darken(). Fix color highlighter to prevent lch/lab from matching inside oklch/oklab.
