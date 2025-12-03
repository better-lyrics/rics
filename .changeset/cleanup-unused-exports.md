---
"rics": patch
"vite-plugin-rics": patch
"codemirror-lang-rics": patch
---

Clean up unused exports and fix code organization:
- Remove unused internal exports from core compiler (Compiler class, parseValue, compareValues, performMath, Tokenizer class)
- Remove duplicate LinterConfig definition in codemirror package
- Remove redundant default export from vite-plugin (use named import `{ ricsPlugin }` instead)
