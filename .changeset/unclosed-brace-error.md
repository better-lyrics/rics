---
"rics": patch
---

Add error detection for unclosed braces in rulesets, @media blocks, and control flow blocks. Previously, unclosed braces would silently auto-close without reporting an error.
