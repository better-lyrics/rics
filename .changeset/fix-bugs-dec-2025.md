---
"rics": patch
---

fix: unit conversion, @media variables, and named mixin arguments

- Fixed inverted em/px conversion ratios in mixed unit math (e.g., `16px + 1em` now correctly outputs `32px`)
- Fixed variables not resolving in @media query preludes (e.g., `@media (min-width: $breakpoint)` now works)
- Added support for named mixin arguments (e.g., `@include button($color: yellow)`)
- Fixed README to accurately describe mixin features (removed incorrect @content claim)
