---
title: "Styles"
---

Uno implements a strict CSS-like subset. Style names may use camel case or kebab case, but exported `StyleName` values use camel case. Every value must be a string, including numbers.

```ts
node.style('backgroundColor', '#1f6fb2')
node.style('padding', '12px 16px')
node.style('flex-grow', '1')

// Invalid: numeric values are not accepted.
// node.style('opacity', 0.5)
```

Framework adapters expose the same API as `StyleProps`:

```tsx
<View style={{ width: '100%', opacity: '0.5' }} />
```

All properties accept `'unset'`. Framework adapters use it internally when a previously applied property disappears from a style object.

## Units and common values

| Value family | Accepted values |
| --- | --- |
| Length | `px`, `rem`, `vw`, or `vh` |
| Percentage length | The length units above plus `%` |
| Color | Hex only: `#RGB`, `#RGBA`, `#RRGGBB`, or `#RRGGBBAA` |
| Number | A number encoded as a string, for example `'1'` or `'0.5'` |
| Integer | An integer encoded as a string |

In WebGPU, `rem` uses the value set by `ui.setRootSize()` (`16` by default), while `vw` and `vh` use the last values supplied to `ui.setViewport()`. The DOM renderer assigns native CSS values: `setRootSize()` changes the document root font size, and the browser resolves viewport units.

CSS-wide keywords other than `unset`, CSS functions such as `calc()` and `var()`, named colors, `rgb()`, `em`, and arbitrary CSS declarations are not supported.

## Layout properties

| Properties | Accepted values |
| --- | --- |
| `display` | `flex`, `none`, `contents` |
| `position` | `static`, `relative`, `absolute` |
| `top`, `right`, `bottom`, `left` | Signed percentage length or `auto` |
| `width`, `height` | Non-negative percentage length or `auto` |
| `minWidth`, `minHeight`, `maxWidth`, `maxHeight` | Non-negative percentage length |
| `boxSizing` | `border-box`, `content-box` |
| `aspectRatio` | Non-negative number |
| `flexDirection` | `column`, `column-reverse`, `row`, `row-reverse` |
| `flexWrap` | `nowrap`, `wrap`, `wrap-reverse` |
| `flexGrow`, `flexShrink` | Non-negative number |
| `flexBasis` | Non-negative percentage length or `auto` |
| `justifyContent` | `flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly` |
| `alignContent` | Values above plus `stretch`, `baseline` |
| `alignItems` | `normal`, `flex-start`, `center`, `flex-end`, `stretch`, `baseline` |
| `alignSelf` | `auto`, `normal`, `flex-start`, `center`, `flex-end`, `stretch`, `baseline` |
| `marginTop`, `marginRight`, `marginBottom`, `marginLeft` | Signed percentage length or `auto` |
| `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft` | Non-negative percentage length |
| `gap`, `rowGap`, `columnGap` | Non-negative percentage length |
| `overflowX`, `overflowY` | `visible`, `hidden`, `scroll` |
| `direction` | `inherit`, `ltr`, `rtl` |

## Paint and interaction properties

| Properties | Accepted values |
| --- | --- |
| `backgroundColor` | Hex color |
| `backgroundImage` | A key registered in the UI's resource store |
| `backgroundSizeWidth`, `backgroundSizeHeight` | Non-negative percentage length, `cover`, or `contain` |
| `backgroundPositionX`, `backgroundPositionY` | Signed percentage length |
| `backgroundRepeat` | `no-repeat`, `repeat`, `repeat-x`, `repeat-y` |
| `borderTopWidth`, `borderRightWidth`, `borderBottomWidth`, `borderLeftWidth` | Non-negative length (no `%`) |
| `borderTopStyle`, `borderRightStyle`, `borderBottomStyle`, `borderLeftStyle` | `none`, `solid` |
| `borderTopColor`, `borderRightColor`, `borderBottomColor`, `borderLeftColor` | Hex color |
| `borderTopLeftRadius`, `borderTopRightRadius`, `borderBottomRightRadius`, `borderBottomLeftRadius` | Non-negative percentage length |
| `boxShadow` | `offset-x offset-y blur spread [color]`; length units only, non-negative blur, black default color |
| `opacity` | Number from `0` through `1` |
| `zIndex` | Integer |
| `pointerEvents` | `all`, `none` |

`pointerEvents: 'none'` removes a node from WebGPU hit testing. In DOM mode it maps to the corresponding CSS property.

## Text properties

| Properties | Accepted values |
| --- | --- |
| `color` | Hex color |
| `fontFamily` | Font name; case is preserved. WebGPU requires a registered font, while DOM resolves the browser font and uses registered metrics when available. |
| `fontSize` | Non-negative length (no `%`) |
| `lineHeight` | Non-negative unitless number or non-negative length |
| `letterSpacing` | Signed length |
| `textAlign` | `left`, `right`, `center`, `justify` |
| `whiteSpace` | `normal`, `nowrap`, `pre-wrap` |
| `textShadow` | `offset-x offset-y blur [color]`; length units only, non-negative blur, black default color |
| `textStroke` | `width color`; non-negative length and a hex color |

The WebGPU renderer uses MTSDF alpha distance for strokes and shadows and the RGB distance field for the glyph fill. See [Current limitations](./limitations.md) for renderer differences.

## Shorthands

| Shorthand | Expansion |
| --- | --- |
| `overflow` | `overflowX`, `overflowY` |
| `border` | Width, style, and color for all four sides |
| `borderRadius` | One to four corner radii |
| `backgroundSize` | One or two dimensions, or `cover`/`contain` alone |
| `backgroundPosition` | X and optional Y; Y defaults to `50%` |
| `margin` | One to four edge values |
| `padding` | One to four edge values |
| `flex` | CSS-like one-, two-, or three-value expansion to grow/shrink/basis; `auto` is supported, `none` is not |

Longhands are also public style names. For example, `backgroundSizeWidth`, `backgroundPositionY`, and every side-specific border property can be assigned directly.

## Complete property list

The public `StyleName` union contains:

```text
zIndex
overflow overflowX overflowY
opacity boxShadow textShadow textStroke
border borderRadius
borderTopLeftRadius borderTopRightRadius borderBottomRightRadius borderBottomLeftRadius
borderTopStyle borderRightStyle borderBottomStyle borderLeftStyle
borderTopColor borderRightColor borderBottomColor borderLeftColor
borderTopWidth borderRightWidth borderBottomWidth borderLeftWidth
backgroundColor backgroundImage
backgroundSize backgroundSizeWidth backgroundSizeHeight
backgroundPosition backgroundPositionX backgroundPositionY backgroundRepeat
color fontFamily fontSize lineHeight letterSpacing textAlign whiteSpace
position top right bottom left
alignContent alignItems alignSelf justifyContent
flex flexDirection flexWrap flexGrow flexShrink flexBasis
margin marginTop marginRight marginBottom marginLeft
padding paddingTop paddingRight paddingBottom paddingLeft
width height minWidth minHeight maxWidth maxHeight
boxSizing aspectRatio display pointerEvents direction
gap rowGap columnGap
```

## Images and `objectFit`

`objectFit` is not a core style name. It is an `Image` component option implemented by the framework adapters:

| `objectFit` | Applied background size |
| --- | --- |
| `fill` (default) | `100% 100%` |
| `contain` | `contain` |
| `cover` | `cover` |
| `none` | `unset` |

When neither dimension is supplied, `Image` uses the registered resource dimensions. When only one is supplied, it derives `aspectRatio`. Values inside `style` take precedence over the component's `width` and `height` props.
