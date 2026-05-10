---
"rics": patch
---

Strip inline `//` line comments inside expression values (variable assignments, map/list literals, property values) so they no longer leak into downstream parsing. Previously, comments inside a map literal corrupted keys and values, causing `map-get` to miss. URLs containing `//` (e.g. `url(https://example.com)`, `url(//cdn.example.com)`) are preserved.
