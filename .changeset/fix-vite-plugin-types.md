---
"vite-plugin-rics": patch
---

Fix TypeScript error where `enforce` property type was being widened to `string` instead of `"pre" | "post"`.
