---
"eslint-plugin-rics": patch
"prettier-plugin-rics": patch
---

Remove named exports to fix CJS mixed exports warning. All exports are still accessible via the default export object (e.g., `plugin.configs`, `plugin.rules`, `plugin.parser`).
