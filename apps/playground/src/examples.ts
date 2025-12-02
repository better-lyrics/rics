export const examples: Record<string, string> = {
  basic: `$primary: #f43f5e;
$spacing: 8px;

.button {
  color: $primary;
  padding: $spacing * 2;

  &:hover {
    color: darken($primary, 10%);
    background: lighten($primary, 40%);
  }

  &--large {
    padding: $spacing * 4;
    font-size: 18px;
  }

  .icon {
    margin-right: $spacing;

    &.left { margin-left: 0; }
  }
}`,

  mixins: `@mixin button($bg, $color: white, $radius: 4px) {
  background: $bg;
  color: $color;
  border-radius: $radius;
  padding: 10px 20px;
  border: none;
  cursor: pointer;

  &:hover {
    background: darken($bg, 10%);
  }

  &:active {
    transform: scale(0.98);
  }
}

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  @include button(#f43f5e);
}

.btn-danger {
  @include button(#dc3545, white, 8px);
}

.centered-box {
  @include flex-center;
  width: 200px;
  height: 200px;
}`,

  conditionals: `$theme: dark;
$size: large;

.panel {
  @if $theme == dark {
    background: #1a1a1a;
    color: white;
  } @else {
    background: white;
    color: #1a1a1a;
  }

  @if $size == small {
    padding: 8px;
    font-size: 12px;
  } @else if $size == large {
    padding: 24px;
    font-size: 18px;
  } @else {
    padding: 16px;
    font-size: 14px;
  }
}

// Mixin with conditional logic
@mixin button-variant($style) {
  @if $style == primary {
    background: #f43f5e;
    color: white;
  } @else if $style == secondary {
    background: transparent;
    color: #f43f5e;
    border: 1px solid #f43f5e;
  } @else if $style == ghost {
    background: transparent;
    color: inherit;
  }
}

.btn-primary { @include button-variant(primary); }
.btn-secondary { @include button-variant(secondary); }
.btn-ghost { @include button-variant(ghost); }`,

  loops: `// Generate utility classes with @for
@for $i from 1 through 5 {
  .mt-#{$i} { margin-top: #{$i * 4}px; }
  .mb-#{$i} { margin-bottom: #{$i * 4}px; }
  .p-#{$i} { padding: #{$i * 4}px; }
}

// Generate grid columns
@for $i from 1 through 12 {
  .col-#{$i} {
    width: percentage($i / 12);
  }
}

// Opacity utilities
@for $i from 0 through 10 {
  .opacity-#{$i * 10} {
    opacity: #{$i / 10};
  }
}`,

  each: `$colors: (
  primary: #f43f5e,
  success: #22c55e,
  warning: #f59e0b,
  danger: #ef4444,
  info: #3b82f6
);

@each $name, $color in $colors {
  .text-#{$name} {
    color: $color;
  }

  .bg-#{$name} {
    background: $color;
    color: white;

    &:hover {
      background: darken($color, 10%);
    }
  }

  .border-#{$name} {
    border: 2px solid $color;
  }
}

// List iteration
$sizes: sm, md, lg, xl;
$values: 576px, 768px, 1024px, 1280px;

@for $i from 1 through length($sizes) {
  .container-#{nth($sizes, $i)} {
    max-width: nth($values, $i);
  }
}`,

  functions: `@function rem($px) {
  @return #{$px / 16}rem;
}

@function spacing($multiplier) {
  $base: 4px;
  @return $base * $multiplier;
}

@function tint($color, $percent) {
  @return mix(white, $color, $percent);
}

@function shade($color, $percent) {
  @return mix(black, $color, $percent);
}

.card {
  padding: #{rem(24)};
  margin: spacing(4);
  font-size: #{rem(16)};
  line-height: #{rem(24)};
}

$brand: #f43f5e;

.brand-palette {
  --tint-10: #{tint($brand, 10%)};
  --tint-20: #{tint($brand, 20%)};
  --tint-30: #{tint($brand, 30%)};
  --shade-10: #{shade($brand, 10%)};
  --shade-20: #{shade($brand, 20%)};
  --shade-30: #{shade($brand, 30%)};
}`,

  colors: `$primary: #f43f5e;
$secondary: #8b5cf6;

.color-palette {
  .primary {
    color: $primary;
    background: lighten($primary, 35%);
    border-color: darken($primary, 10%);
  }

  .complement {
    color: complement($primary);
  }

  .overlay {
    background: rgba($primary, 0.5);
  }

  .gradient {
    background: linear-gradient(
      to right,
      $primary,
      mix($primary, $secondary, 50%),
      $secondary
    );
  }

  .inverted {
    background: invert($primary);
  }

  .grayscale {
    color: grayscale($primary);
  }

  .saturated {
    color: saturate($primary, 20%);
  }

  .desaturated {
    color: desaturate($primary, 20%);
  }
}`,

  breakpoints: `$breakpoints: (
  sm: 576px,
  md: 768px,
  lg: 1024px,
  xl: 1280px
);

$container-widths: (
  sm: 540px,
  md: 720px,
  lg: 960px,
  xl: 1140px
);

@each $name, $width in $breakpoints {
  @media (min-width: $width) {
    .container {
      max-width: map-get($container-widths, $name);
    }

    .hide-#{$name}-up {
      display: none;
    }

    .show-#{$name}-up {
      display: block;
    }
  }
}

// Generate grid columns for each breakpoint
@each $bp, $width in $breakpoints {
  @media (min-width: $width) {
    @for $i from 1 through 12 {
      .col-#{$bp}-#{$i} {
        width: percentage($i / 12);
      }
    }
  }
}`,

  duration: `@function duration-exclusions($max) {
  $result: "";
  @for $i from 0 through ($max * 100) {
    $val: $i / 100;
    @if $result != "" {
      $result: $result + ", ";
    }
    $result: $result + '[data-duration="#{$val}"]';
  }
  @return $result;
}

.lyrics--word[data-duration]:not(#{duration-exclusions(1)})::after {
  --glow-color: white;
  text-shadow: 0 0 10px var(--glow-color);
}`,

  blur: `@for $i from 1 through 6 {
  $selector: ".active-line";
  @for $j from 1 through $i {
    $selector: $selector + " + .line";
  }

  .container:not(.scrolling) > #{$selector} {
    filter: blur(#{$i * 1.5}px);
    opacity: #{1 - $i * 0.1};
    transform: translateY(#{$i * 2}px);
  }
}

$layers: (1, 2, 3, 4, 5);

@each $layer in $layers {
  .layer-#{$layer} {
    z-index: $layer * 10;

    @if $layer > 3 {
      box-shadow: 0 #{$layer * 2}px #{$layer * 4}px rgba(0, 0, 0, 0.2);
    }
  }
}`,

  palette: `$base: #f43f5e;

// Generate a full color palette
@for $i from 1 through 9 {
  $lightness: 100 - ($i * 10);

  .color-#{$i * 100} {
    @if $i < 5 {
      background: mix(white, $base, (5 - $i) * 20%);
    } @else if $i == 5 {
      background: $base;
    } @else {
      background: mix(black, $base, ($i - 5) * 15%);
    }
  }
}

// Semantic color tokens
$colors: (
  primary: #f43f5e,
  secondary: #8b5cf6,
  success: #22c55e,
  warning: #f59e0b,
  error: #ef4444
);

:root {
  @each $name, $color in $colors {
    --#{$name}: #{$color};
    --#{$name}-light: #{mix(white, $color, 30%)};
    --#{$name}-dark: #{mix(black, $color, 20%)};
  }
}`,

  grid: `$columns: 12;
$gutter: 24;
$half-gutter: $gutter / 2;

.row {
  display: flex;
  flex-wrap: wrap;
  margin-left: -#{$half-gutter}px;
  margin-right: -#{$half-gutter}px;
}

@for $i from 1 through $columns {
  .col-#{$i} {
    flex: 0 0 percentage($i / $columns);
    max-width: percentage($i / $columns);
    padding: 0 #{$half-gutter}px;
  }
}

// Offset classes (0-11)
@for $i from 0 through 11 {
  .offset-#{$i} {
    margin-left: percentage($i / $columns);
  }
}

// Responsive variants
$breakpoints: (sm: 576px, md: 768px, lg: 1024px);

@each $bp, $width in $breakpoints {
  @media (min-width: $width) {
    @for $i from 1 through $columns {
      .col-#{$bp}-#{$i} {
        flex: 0 0 percentage($i / $columns);
        max-width: percentage($i / $columns);
      }
    }
  }
}`,

  utilities: `// Spacing utilities
$spacer: 4px;
$spacers: (0, 1, 2, 3, 4, 5, 6, 8, 10, 12);

@each $size in $spacers {
  .m-#{$size} { margin: $spacer * $size; }
  .mt-#{$size} { margin-top: $spacer * $size; }
  .mb-#{$size} { margin-bottom: $spacer * $size; }
  .ml-#{$size} { margin-left: $spacer * $size; }
  .mr-#{$size} { margin-right: $spacer * $size; }
  .mx-#{$size} { margin-left: $spacer * $size; margin-right: $spacer * $size; }
  .my-#{$size} { margin-top: $spacer * $size; margin-bottom: $spacer * $size; }

  .p-#{$size} { padding: $spacer * $size; }
  .pt-#{$size} { padding-top: $spacer * $size; }
  .pb-#{$size} { padding-bottom: $spacer * $size; }
  .pl-#{$size} { padding-left: $spacer * $size; }
  .pr-#{$size} { padding-right: $spacer * $size; }
  .px-#{$size} { padding-left: $spacer * $size; padding-right: $spacer * $size; }
  .py-#{$size} { padding-top: $spacer * $size; padding-bottom: $spacer * $size; }
}

// Display utilities
$displays: none, block, inline, inline-block, flex, grid;

@each $display in $displays {
  .d-#{$display} { display: $display; }
}

// Flex utilities
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }

// Gap utilities
@for $i from 1 through 8 {
  .gap-#{$i} { gap: $spacer * $i; }
}`,

  typography: `// Type scale
$type-scale: (
  xs: 12px,
  sm: 14px,
  base: 16px,
  lg: 18px,
  xl: 20px,
  2xl: 24px,
  3xl: 30px,
  4xl: 36px
);

@each $name, $size in $type-scale {
  .text-#{$name} {
    font-size: $size;
    line-height: $size * 1.5;
  }
}

// Font weights
$weights: (light: 300, normal: 400, medium: 500, semibold: 600, bold: 700);

@each $name, $weight in $weights {
  .font-#{$name} {
    font-weight: $weight;
  }
}

// Text colors
$text-colors: (
  primary: #0f172a,
  secondary: #475569,
  muted: #94a3b8,
  inverse: #f8fafc
);

@each $name, $color in $text-colors {
  .text-#{$name} {
    color: $color;
  }
}`,

  animations: `// Animation durations
@for $i from 1 through 5 {
  .duration-#{$i * 100} {
    transition-duration: #{$i * 100}ms;
  }
}

// Delays
@for $i from 0 through 4 {
  .delay-#{$i * 100} {
    transition-delay: #{$i * 100}ms;
    animation-delay: #{$i * 100}ms;
  }
}

// Keyframe animations
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Animation utilities
.animate-fade-in { animation: fade-in 300ms ease-out; }
.animate-slide-up { animation: slide-up 400ms ease-out; }
.animate-pulse { animation: pulse 2s infinite; }
.animate-spin { animation: spin 1s linear infinite; }

// Transition properties
$properties: opacity, transform, colors, all;

@each $prop in $properties {
  .transition-#{$prop} {
    transition-property: $prop;
    transition-duration: 150ms;
    transition-timing-function: ease-in-out;
  }
}`,

  buttons: `$btn-colors: (
  primary: #f43f5e,
  secondary: #6366f1,
  success: #22c55e,
  danger: #ef4444
);

@mixin button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 150ms ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@each $name, $color in $btn-colors {
  .btn-#{$name} {
    @include button-base;
    background: $color;
    color: white;

    &:hover:not(:disabled) {
      background: darken($color, 8%);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  .btn-#{$name}-outline {
    @include button-base;
    background: transparent;
    color: $color;
    border: 2px solid $color;

    &:hover:not(:disabled) {
      background: rgba($color, 0.1);
    }
  }
}

// Size variants
$btn-sizes: (
  sm: (8px 16px, 14px),
  md: (10px 20px, 16px),
  lg: (14px 28px, 18px)
);

@each $name, $values in $btn-sizes {
  .btn-#{$name} {
    padding: nth($values, 1);
    font-size: nth($values, 2);
  }
}`,

  cards: `$card-variants: (
  default: (bg: white, border: #e5e7eb, shadow: 0 1px 3px rgba(0,0,0,0.1)),
  elevated: (bg: white, border: transparent, shadow: 0 10px 40px rgba(0,0,0,0.1)),
  outlined: (bg: transparent, border: #e5e7eb, shadow: none)
);

@mixin card-base {
  border-radius: 12px;
  overflow: hidden;
}

@each $name, $props in $card-variants {
  .card-#{$name} {
    @include card-base;
    background: map-get($props, bg);
    border: 1px solid map-get($props, border);
    box-shadow: map-get($props, shadow);
  }
}

// Card parts
.card {
  @include card-base;
  background: white;
  border: 1px solid #e5e7eb;

  &__header {
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  &__body {
    padding: 20px;
  }

  &__footer {
    padding: 16px 20px;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
  }

  &--interactive {
    cursor: pointer;
    transition: all 200ms ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.12);
    }
  }
}`,

  forms: `$input-states: (
  default: #d1d5db,
  focus: #f43f5e,
  error: #ef4444,
  success: #22c55e
);

@mixin input-base {
  width: 100%;
  padding: 10px 14px;
  font-size: 15px;
  border-radius: 8px;
  border: 2px solid map-get($input-states, default);
  background: white;
  transition: all 150ms ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: map-get($input-states, focus);
    box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1);
  }
}

.input {
  @include input-base;
}

.input-error {
  @include input-base;
  border-color: map-get($input-states, error);

  &:focus {
    border-color: map-get($input-states, error);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
}

.label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.helper-text {
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;

  &--error {
    color: map-get($input-states, error);
  }
}`,

  shadows: `// Shadow scale
$shadows: (
  sm: 0 1px 2px rgba(0, 0, 0, 0.05),
  md: 0 4px 6px rgba(0, 0, 0, 0.07),
  lg: 0 10px 15px rgba(0, 0, 0, 0.1),
  xl: 0 20px 25px rgba(0, 0, 0, 0.15),
  2xl: 0 25px 50px rgba(0, 0, 0, 0.25)
);

@each $name, $shadow in $shadows {
  .shadow-#{$name} {
    box-shadow: $shadow;
  }
}

// Colored shadows
$colors: (
  primary: #f43f5e,
  blue: #3b82f6,
  purple: #8b5cf6,
  green: #22c55e
);

@each $name, $color in $colors {
  .shadow-#{$name} {
    box-shadow: 0 10px 40px rgba($color, 0.3);
  }

  .shadow-#{$name}-lg {
    box-shadow: 0 20px 60px rgba($color, 0.4);
  }
}

// Inner shadows
.shadow-inner {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.shadow-none {
  box-shadow: none;
}`,

  math: `// Mathematical operations
$base: 16px;
$ratio: 1.25;

// Modular scale
@for $i from -2 through 6 {
  $size: $base;
  @if $i > 0 {
    @for $j from 1 through $i {
      $size: $size * $ratio;
    }
  } @else if $i < 0 {
    @for $j from $i through -1 {
      $size: $size / $ratio;
    }
  }

  .scale-#{$i + 3} {
    font-size: round($size);
  }
}

// Aspect ratios
$ratios: (
  square: 1/1,
  video: 16/9,
  portrait: 3/4,
  wide: 21/9
);

@each $name, $ratio in $ratios {
  .aspect-#{$name} {
    aspect-ratio: $ratio;
  }
}

// Percentage widths
@for $i from 1 through 6 {
  .w-#{$i}of6 {
    width: percentage($i / 6);
  }
}`,

  responsive: `// Responsive breakpoints
$breakpoints: (
  sm: 640px,
  md: 768px,
  lg: 1024px,
  xl: 1280px
);

// Generate responsive visibility utilities
@each $bp, $width in $breakpoints {
  @media (min-width: $width) {
    .hidden-#{$bp}-up {
      display: none;
    }

    .visible-#{$bp}-up {
      display: block;
    }

    .container-#{$bp} {
      max-width: $width;
      margin: 0 auto;
      padding: 0 16px;
    }
  }
}

// Responsive text sizes
$text-sizes: (
  sm: (14px, 16px, 18px),
  md: (16px, 18px, 20px),
  lg: (18px, 20px, 24px)
);

@each $bp, $width in $breakpoints {
  @if map-has-key($text-sizes, $bp) {
    @media (min-width: $width) {
      .text-responsive {
        font-size: nth(map-get($text-sizes, $bp), 2);
      }
    }
  }
}

// Responsive grid
@each $bp, $width in $breakpoints {
  @media (min-width: $width) {
    @for $i from 1 through 4 {
      .grid-#{$bp}-#{$i} {
        display: grid;
        grid-template-columns: repeat($i, 1fr);
        gap: 16px;
      }
    }
  }
}`,

  // Advanced examples
  theming: `// Theme configuration
$themes: (
  light: (
    bg: #ffffff,
    text: #1a1a1a,
    border: #e5e7eb,
    accent: #f43f5e
  ),
  dark: (
    bg: #0f0f0f,
    text: #fafafa,
    border: #27272a,
    accent: #fb7185
  )
);

@each $theme, $colors in $themes {
  [data-theme="#{$theme}"] {
    --bg: #{map-get($colors, bg)};
    --text: #{map-get($colors, text)};
    --border: #{map-get($colors, border)};
    --accent: #{map-get($colors, accent)};

    background: var(--bg);
    color: var(--text);
  }
}

// Component that uses theme variables
.card {
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);

  .title {
    color: var(--accent);
  }
}`,

  flexbox: `// Flexbox utilities generator
$flex-directions: row, row-reverse, column, column-reverse;
$flex-wraps: nowrap, wrap, wrap-reverse;

$justify-values: (
  start: flex-start,
  end: flex-end,
  center: center,
  between: space-between,
  around: space-around,
  evenly: space-evenly
);

$align-values: (
  start: flex-start,
  end: flex-end,
  center: center,
  baseline: baseline,
  stretch: stretch
);

@each $dir in $flex-directions {
  .flex-#{$dir} {
    display: flex;
    flex-direction: $dir;
  }
}

@each $wrap in $flex-wraps {
  .flex-#{$wrap} {
    flex-wrap: $wrap;
  }
}

@each $name, $value in $justify-values {
  .justify-#{$name} {
    justify-content: $value;
  }
}

@each $name, $value in $align-values {
  .items-#{$name} {
    align-items: $value;
  }
}

// Flex grow/shrink
@for $i from 0 through 3 {
  .grow-#{$i} { flex-grow: $i; }
  .shrink-#{$i} { flex-shrink: $i; }
}`,

  borders: `// Border radius scale
$radii: (
  none: 0,
  sm: 2px,
  md: 4px,
  lg: 8px,
  xl: 12px,
  2xl: 16px,
  full: 9999px
);

@each $name, $value in $radii {
  .rounded-#{$name} {
    border-radius: $value;
  }
}

// Border widths
@for $i from 0 through 4 {
  .border-#{$i} {
    border-width: #{$i}px;
    border-style: solid;
  }
}

// Border colors
$border-colors: (
  default: #e5e7eb,
  dark: #374151,
  light: #f3f4f6,
  accent: #f43f5e
);

@each $name, $color in $border-colors {
  .border-#{$name} {
    border-color: $color;
  }
}

// Individual sides
$sides: (top, right, bottom, left);

@each $side in $sides {
  @for $i from 0 through 4 {
    .border-#{$side}-#{$i} {
      border-#{$side}-width: #{$i}px;
      border-#{$side}-style: solid;
    }
  }
}`,

  zindex: `// Z-index scale
$z-indices: (
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  backdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70
);

@each $name, $value in $z-indices {
  .z-#{$name} {
    z-index: $value;
  }
}

// Numeric z-index (0-50, step 10)
@for $i from 0 through 5 {
  .z-#{$i * 10} {
    z-index: $i * 10;
  }
}

// Stacking context helper
@mixin stacking-context($z: 0) {
  position: relative;
  z-index: $z;
  isolation: isolate;
}

.stacking-base {
  @include stacking-context(0);
}

.stacking-modal {
  @include stacking-context(50);
}`,

  gradients: `// Gradient directions
$directions: (
  t: to top,
  r: to right,
  b: to bottom,
  l: to left,
  tr: to top right,
  br: to bottom right,
  bl: to bottom left,
  tl: to top left
);

// Gradient color stops
$gradient-colors: (
  sunset: (#f43f5e, #fb7185, #fda4af),
  ocean: (#3b82f6, #60a5fa, #93c5fd),
  forest: (#22c55e, #4ade80, #86efac),
  purple: (#8b5cf6, #a78bfa, #c4b5fd)
);

@each $name, $colors in $gradient-colors {
  @each $dir-name, $dir in $directions {
    .gradient-#{$name}-#{$dir-name} {
      background: linear-gradient(
        $dir,
        nth($colors, 1),
        nth($colors, 2),
        nth($colors, 3)
      );
    }
  }
}

// Radial gradients
@each $name, $colors in $gradient-colors {
  .gradient-#{$name}-radial {
    background: radial-gradient(
      circle,
      nth($colors, 1),
      nth($colors, 2),
      nth($colors, 3)
    );
  }
}`,

  aspect: `// Common aspect ratios
$aspects: (
  square: 1,
  video: 1.778,
  photo: 1.333,
  portrait: 0.75,
  wide: 2.333
);

@each $name, $ratio in $aspects {
  .aspect-#{$name} {
    aspect-ratio: $ratio;
  }
}

// Common numeric ratios
$ratios: (
  1x1: 1,
  4x3: 1.333,
  16x9: 1.778,
  21x9: 2.333,
  3x4: 0.75,
  9x16: 0.5625
);

@each $name, $ratio in $ratios {
  .ratio-#{$name} {
    aspect-ratio: $ratio;
  }
}

// Aspect box container for responsive media
.aspect-box {
  position: relative;
  width: 100%;

  &--video { aspect-ratio: 1.778; }
  &--square { aspect-ratio: 1; }
  &--portrait { aspect-ratio: 0.75; }

  img,
  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.video-container {
  aspect-ratio: 1.778;
  background: #000;
}

.thumbnail {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}`,

  // Stress test examples
  tailwind: `// Tailwind-style utility generator
// Generates ~500+ utility classes

$spacer: 4px;
$spacing-scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64;

// Spacing utilities (margin & padding)
@each $size in $spacing-scale {
  .m-#{$size} { margin: $spacer * $size; }
  .mx-#{$size} { margin-left: $spacer * $size; margin-right: $spacer * $size; }
  .my-#{$size} { margin-top: $spacer * $size; margin-bottom: $spacer * $size; }
  .mt-#{$size} { margin-top: $spacer * $size; }
  .mr-#{$size} { margin-right: $spacer * $size; }
  .mb-#{$size} { margin-bottom: $spacer * $size; }
  .ml-#{$size} { margin-left: $spacer * $size; }

  .p-#{$size} { padding: $spacer * $size; }
  .px-#{$size} { padding-left: $spacer * $size; padding-right: $spacer * $size; }
  .py-#{$size} { padding-top: $spacer * $size; padding-bottom: $spacer * $size; }
  .pt-#{$size} { padding-top: $spacer * $size; }
  .pr-#{$size} { padding-right: $spacer * $size; }
  .pb-#{$size} { padding-bottom: $spacer * $size; }
  .pl-#{$size} { padding-left: $spacer * $size; }

  .gap-#{$size} { gap: $spacer * $size; }
  .w-#{$size} { width: $spacer * $size; }
  .h-#{$size} { height: $spacer * $size; }
}

// Colors with variants
$colors: (
  slate: #64748b,
  gray: #6b7280,
  red: #ef4444,
  orange: #f97316,
  amber: #f59e0b,
  yellow: #eab308,
  lime: #84cc16,
  green: #22c55e,
  emerald: #10b981,
  teal: #14b8a6,
  cyan: #06b6d4,
  sky: #0ea5e9,
  blue: #3b82f6,
  indigo: #6366f1,
  violet: #8b5cf6,
  purple: #a855f7,
  fuchsia: #d946ef,
  pink: #ec4899,
  rose: #f43f5e
);

@each $name, $color in $colors {
  .text-#{$name} { color: $color; }
  .bg-#{$name} { background-color: $color; }
  .border-#{$name} { border-color: $color; }

  .text-#{$name}-light { color: lighten($color, 20%); }
  .bg-#{$name}-light { background-color: lighten($color, 30%); }

  .text-#{$name}-dark { color: darken($color, 15%); }
  .bg-#{$name}-dark { background-color: darken($color, 15%); }
}

// Opacity utilities
@for $i from 0 through 10 {
  .opacity-#{$i * 10} { opacity: $i / 10; }
}`,

  matrix: `// CSS Grid matrix generator
// Creates a complete responsive grid system

$columns: 12;
$breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
  2xl: 1536px
);

// Base grid
.grid {
  display: grid;
  gap: 16px;
}

// Generate columns for each breakpoint
@each $bp, $width in $breakpoints {
  @if $width == 0 {
    // Base classes (no media query)
    @for $i from 1 through $columns {
      .col-#{$i} {
        grid-column: span $i;
      }
      .col-start-#{$i} {
        grid-column-start: $i;
      }
    }
    @for $i from 1 through 6 {
      .grid-cols-#{$i} {
        grid-template-columns: repeat($i, 1fr);
      }
      .grid-rows-#{$i} {
        grid-template-rows: repeat($i, 1fr);
      }
    }
  } @else {
    @media (min-width: $width) {
      @for $i from 1 through $columns {
        .col-#{$bp}-#{$i} {
          grid-column: span $i;
        }
        .col-#{$bp}-start-#{$i} {
          grid-column-start: $i;
        }
      }
      @for $i from 1 through 6 {
        .grid-#{$bp}-cols-#{$i} {
          grid-template-columns: repeat($i, 1fr);
        }
      }
    }
  }
}

// Gap utilities
$gaps: 0, 1, 2, 4, 6, 8, 12, 16;
@each $gap in $gaps {
  .gap-#{$gap} { gap: #{$gap}px; }
  .gap-x-#{$gap} { column-gap: #{$gap}px; }
  .gap-y-#{$gap} { row-gap: #{$gap}px; }
}`,

  colorSystem: `// Complete color system with shades
// Generates full 50-950 palette for multiple colors

@function shade-color($color, $weight) {
  @if $weight < 500 {
    @return mix(white, $color, (500 - $weight) / 5 * 10%);
  } @else if $weight > 500 {
    @return mix(black, $color, ($weight - 500) / 5 * 8%);
  }
  @return $color;
}

$base-colors: (
  rose: #f43f5e,
  pink: #ec4899,
  violet: #8b5cf6,
  indigo: #6366f1,
  blue: #3b82f6,
  cyan: #06b6d4,
  teal: #14b8a6,
  green: #22c55e,
  yellow: #eab308,
  orange: #f97316,
  red: #ef4444,
  gray: #6b7280
);

$weights: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950;

:root {
  @each $name, $base in $base-colors {
    @each $weight in $weights {
      --#{$name}-#{$weight}: #{shade-color($base, $weight)};
    }
  }
}

// Generate utility classes for each shade
@each $name, $base in $base-colors {
  @each $weight in $weights {
    $color: shade-color($base, $weight);

    .text-#{$name}-#{$weight} {
      color: $color;
    }

    .bg-#{$name}-#{$weight} {
      background-color: $color;
    }

    .border-#{$name}-#{$weight} {
      border-color: $color;
    }
  }
}`,

  stressTest: `// Stress test: nested loops and conditionals
// Tests compiler performance with deep nesting

$sizes: xs, sm, md, lg, xl, 2xl;
$variants: solid, outline, ghost, link;
$states: default, hover, active, focus, disabled;

$theme: (
  primary: #f43f5e,
  secondary: #6366f1,
  success: #22c55e,
  warning: #f59e0b,
  danger: #ef4444,
  info: #0ea5e9
);

// Generate button variants - O(sizes * variants * theme * states)
@each $size in $sizes {
  @each $variant in $variants {
    @each $name, $color in $theme {
      .btn-#{$size}-#{$variant}-#{$name} {
        @if $size == xs {
          padding: 4px 8px;
          font-size: 12px;
        } @else if $size == sm {
          padding: 6px 12px;
          font-size: 14px;
        } @else if $size == md {
          padding: 8px 16px;
          font-size: 16px;
        } @else if $size == lg {
          padding: 12px 24px;
          font-size: 18px;
        } @else if $size == xl {
          padding: 16px 32px;
          font-size: 20px;
        } @else {
          padding: 20px 40px;
          font-size: 24px;
        }

        @if $variant == solid {
          background: $color;
          color: white;
          border: none;
        } @else if $variant == outline {
          background: transparent;
          color: $color;
          border: 2px solid $color;
        } @else if $variant == ghost {
          background: transparent;
          color: $color;
          border: none;
        } @else {
          background: none;
          color: $color;
          border: none;
          text-decoration: underline;
        }

        &:hover {
          @if $variant == solid {
            background: darken($color, 10%);
          } @else {
            background: rgba($color, 0.1);
          }
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }
}`,

  designTokens: `// Design token system
// Complex token generation with multiple categories

// Spacing tokens
$spacing: (
  0: 0,
  px: 1px,
  1: 4px,
  2: 8px,
  3: 12px,
  4: 16px,
  5: 20px,
  6: 24px,
  7: 28px,
  8: 32px,
  9: 36px,
  10: 40px,
  12: 48px,
  14: 56px,
  16: 64px,
  20: 80px,
  24: 96px
);

// Radius tokens
$radius: (
  none: 0,
  sm: 2px,
  default: 4px,
  md: 6px,
  lg: 8px,
  xl: 12px,
  2xl: 16px,
  3xl: 24px,
  full: 9999px
);

// Shadow tokens
$shadows: (
  sm: (0 1px 2px rgba(0, 0, 0, 0.05)),
  default: (0 1px 3px rgba(0, 0, 0, 0.1)),
  md: (0 4px 6px rgba(0, 0, 0, 0.1)),
  lg: (0 10px 15px rgba(0, 0, 0, 0.1)),
  xl: (0 20px 25px rgba(0, 0, 0, 0.15)),
  2xl: (0 25px 50px rgba(0, 0, 0, 0.25))
);

// Font size tokens
$font-sizes: (
  xs: 12px,
  sm: 14px,
  base: 16px,
  lg: 18px,
  xl: 20px,
  2xl: 24px,
  3xl: 30px,
  4xl: 36px,
  5xl: 48px,
  6xl: 60px
);

// Generate CSS custom properties
:root {
  @each $name, $value in $spacing {
    --spacing-#{$name}: #{$value};
  }

  @each $name, $value in $radius {
    --radius-#{$name}: #{$value};
  }

  @each $name, $value in $shadows {
    --shadow-#{$name}: #{$value};
  }

  @each $name, $value in $font-sizes {
    --text-#{$name}: #{$value};
  }
}

// Generate spacing utilities
@each $name, $value in $spacing {
  .m-#{$name} { margin: $value; }
  .mt-#{$name} { margin-top: $value; }
  .mr-#{$name} { margin-right: $value; }
  .mb-#{$name} { margin-bottom: $value; }
  .ml-#{$name} { margin-left: $value; }
  .mx-#{$name} { margin-left: $value; margin-right: $value; }
  .my-#{$name} { margin-top: $value; margin-bottom: $value; }

  .p-#{$name} { padding: $value; }
  .pt-#{$name} { padding-top: $value; }
  .pr-#{$name} { padding-right: $value; }
  .pb-#{$name} { padding-bottom: $value; }
  .pl-#{$name} { padding-left: $value; }
  .px-#{$name} { padding-left: $value; padding-right: $value; }
  .py-#{$name} { padding-top: $value; padding-bottom: $value; }

  .gap-#{$name} { gap: $value; }
  .w-#{$name} { width: $value; }
  .h-#{$name} { height: $value; }
  .size-#{$name} { width: $value; height: $value; }
}

// Generate radius utilities
@each $name, $value in $radius {
  .rounded-#{$name} { border-radius: $value; }
}

// Generate shadow utilities
@each $name, $value in $shadows {
  .shadow-#{$name} { box-shadow: $value; }
}

// Generate font size utilities
@each $name, $value in $font-sizes {
  .text-#{$name} {
    font-size: $value;
    line-height: $value * 1.5;
  }
}`,

  animation: `// Complex animation system
// Generates keyframes and animation utilities

@mixin generate-keyframes($name, $from, $to) {
  @keyframes #{$name} {
    from { #{$from} }
    to { #{$to} }
  }
}

// Base animations
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slide-in-up {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-down {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-left {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-25%); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

// Duration scale
$durations: 75, 100, 150, 200, 300, 500, 700, 1000;

@each $duration in $durations {
  .duration-#{$duration} {
    animation-duration: #{$duration}ms;
    transition-duration: #{$duration}ms;
  }
}

// Delay scale
$delays: 0, 75, 100, 150, 200, 300, 500, 700, 1000;

@each $delay in $delays {
  .delay-#{$delay} {
    animation-delay: #{$delay}ms;
    transition-delay: #{$delay}ms;
  }
}

// Animation utilities
$animations: fade-in, fade-out, slide-in-up, slide-in-down,
             slide-in-left, slide-in-right, scale-in,
             bounce, pulse, spin, ping;

@each $name in $animations {
  .animate-#{$name} {
    animation-name: $name;
    animation-fill-mode: both;
  }
}

// Timing functions
$easings: (
  linear: linear,
  ease: ease,
  ease-in: ease-in,
  ease-out: ease-out,
  ease-in-out: ease-in-out
);

@each $name, $value in $easings {
  .ease-#{$name} {
    animation-timing-function: $value;
    transition-timing-function: $value;
  }
}

// Iteration count
.animate-once { animation-iteration-count: 1; }
.animate-infinite { animation-iteration-count: infinite; }

@for $i from 2 through 5 {
  .animate-#{$i}x { animation-iteration-count: $i; }
}`,

  playground: `// rics playground styles - dogfooding our own preprocessor!

// Color palette
$bg-primary: #09090b;
$bg-secondary: #0f0f12;
$bg-tertiary: #18181b;
$bg-elevated: #1f1f23;
$border-color: #27272a;
$border-subtle: #1c1c1f;
$text-primary: #fafafa;
$text-secondary: #a1a1aa;
$text-muted: #71717a;
$accent-primary: #f43f5e;
$accent-green: #4ade80;
$accent-red: #f87171;
$accent-blue: #60a5fa;
$accent-yellow: #fbbf24;

// Font stacks
$font-sans: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
$font-mono: "DM Mono", "SF Mono", Monaco, "Cascadia Code", Consolas, monospace;

// Mixins
@mixin button-base {
  font-family: inherit;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid $border-color;
  background: $bg-tertiary;
  color: $text-primary;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: $bg-elevated;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    border-color: #3f3f46;
  }
}

@mixin status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
}

// Reset
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  color-scheme: dark;
}

body {
  font-family: $font-sans;
  background: $bg-primary;
  color: $text-primary;
  height: 100vh;
  overflow: hidden;
}

// Header
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: $bg-secondary;
  border-bottom: 1px solid $border-color;
  height: 52px;

  h1 {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    letter-spacing: -0.01em;

    span {
      color: $accent-primary;
    }
  }

  select, button {
    @include button-base;
    font-size: 13px;
    padding: 6px 12px;
  }

  button:active {
    transform: scale(0.98);
  }
}

.header-actions {
  display: flex;
  gap: 8px;
}

// Dropdown
.dropdown {
  position: relative;

  &.open {
    .dropdown-trigger svg {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    transition: transform 0.15s ease;
  }
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: $bg-elevated;
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 12px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: all 0.15s ease;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

  button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 6px 8px;
    font-size: 12px;
    font-weight: 400;
    color: $text-secondary;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: $bg-tertiary;
      color: $text-primary;
    }

    &.active {
      background: rgba(244, 63, 94, 0.15);
      color: $accent-primary;
    }
  }
}

// Main layout
.main {
  display: flex;
  height: calc(100vh - 52px - 36px);
}

.pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

// Status bar
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: $bg-secondary;
  border-top: 1px solid $border-color;
  font-size: 12px;
  height: 36px;
  font-family: $font-mono;
}

.status-success {
  color: $accent-green;
  @include status-indicator;
}

.status-error {
  color: $accent-red;
  @include status-indicator;
}

.stats {
  color: $text-muted;
  font-size: 11px;

  .delta-positive { color: $accent-green; }
  .delta-negative { color: $accent-red; }
  .delta-neutral { color: $text-muted; }
}`,
};
