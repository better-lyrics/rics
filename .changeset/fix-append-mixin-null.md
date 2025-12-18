---
"rics": patch
---

fix: mixin with append in loop returning null

- Fixed empty parens `()` returning null instead of empty list
- Added variadic parameter support (`$props...`) for mixins and functions
- Fixed space-separated variable expressions not being evaluated
- Fixed `@each` not iterating over single values
