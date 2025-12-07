---
"rics": patch
---

rics: Multiple compiler fixes:
- Fix "unclosed block" error when declaration lacks semicolon before closing brace
- Fix `@each` with two variables inside mixin body (interpolation selectors like `#{$sel}` now work correctly)
- Fix parsing of stray semicolons after block definitions (e.g., `@mixin foo { ... };`)
