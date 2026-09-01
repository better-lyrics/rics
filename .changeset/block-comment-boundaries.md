---
"rics": patch
---

Skip `/* */` and `//` comments when scanning for the end of an `@if`, `@else`, `@mixin`, `@for`, or `@each` block. Previously `readBlock` tracked braces and quotes through comment text, so a lone apostrophe (`it's`, `user's`) or a stray brace inside a comment desynced the brace count, producing a false `UNCLOSED_BLOCK` error or silently swallowing rules. The same block-comment blind spot in expression-value scanning (`readUntil`) is fixed too. Comment text inside blocks is preserved unchanged.
