---
"rics": patch
---

Fix floating point precision issues in compiled output. Numbers are now rounded to 6 decimal places to avoid values like `0.3999999999999999` appearing instead of `0.4`.
