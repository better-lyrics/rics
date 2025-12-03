---
"rics": patch
"codemirror-lang-rics": patch
---

- Fix CodeMirror tokenizer to use `keyword` instead of `function` for CSS functions - `function` is a Lezer modifier
- Fix infinite loop in `@font-face` and `mixin` bodies with incomplete declarations
