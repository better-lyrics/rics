---
"codemirror-lang-rics": patch
---

Fix CodeMirror tokenizer to use `keyword` instead of `function` for CSS functions (var, calc, rgb, etc.) - `function` is a Lezer modifier, not a base tag
