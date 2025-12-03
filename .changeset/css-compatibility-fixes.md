---
"rics": patch
"codemirror-lang-rics": patch
---

Fix CSS compatibility issues:
- Pass through CSS-only functions (oklch, oklab, lab, lch, hwb, color) without interpreting `%` as modulo
- Fix font shorthand parsing (`font: 16px/1.5`) to not interpret `/` as division
- Fix @font-face and other declaration-block at-rules parsing
- Fix inline comments in rule blocks being parsed as selectors/declarations
- Add position info to compiler warnings for accurate linter highlighting
- Fix CodeMirror tokenizer modifier syntax (`variableName.special` instead of space-separated)
