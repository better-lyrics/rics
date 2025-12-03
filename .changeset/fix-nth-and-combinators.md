---
"rics": patch
---

Fix nth() function not evaluating when passed a list variable without interpolation, fix nesting with combinator selectors (+, ~, >) not being recognized as nested rules, and fix SCSS functions inside CSS functions (e.g., `blur(nth($list, 1))`) not being evaluated.
