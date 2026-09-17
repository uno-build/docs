---
title: "Current limitations"
---

This page records behavior visible in the current public API. It is not a roadmap.

## Package boundary

- The package is ESM-only and has no `uno-ui` root export.
- Base types such as `UI`, `Node`, `ResourcesWebGPUOptions`, `WebGPUImage`, `FontData`, and WebGPU draw types appear through public signatures but are not available as named imports from supported subpaths.
- Assets used by the repository examples are not shipped by the package. Applications must load and register their own images and fonts.
- Pixi and TypeGPU examples compose the generic `UIWebGPU`; there is no `UIPixi` or `UITypeGPU` entrypoint.

## WebGPU renderer

### Opacity is per drawable

WebGPU accumulates ancestor opacity and applies it to each drawable rectangle. It does not first composite a subtree into an offscreen surface as CSS group opacity does. Overlapping descendants can therefore look different from DOM when an ancestor has `opacity < 1`.

### Rounded overflow clips are rectangular

`overflow: hidden` and `overflow: scroll` clip descendants to ancestor layout rectangles. An ancestor's `borderRadius` is not included in the clip shape, so descendants can remain visible in the rounded-corner area.

### Fonts are MTSDF resources

WebGPU text requires registered atlas/JSON data. The RGB distance field renders fill and the alpha distance field renders `textShadow` and `textStroke`. Registering a browser font alone is insufficient.

### Atlas sampling can bleed

Images share an atlas. Magnifying a small image or sampling its edge with linear filtering can blend adjacent atlas pixels. Register affected images with `preventBleeding: true`; use distinct resource keys if the same source needs both padded and unpadded registrations.

### Engine frame ownership is explicit

When sharing a command encoder or texture view with an engine, call `draw({ submit: false, ... })` and let the engine submit. World-space UIs always target and clear their own texture.

## DOM renderer

- `setRootSize()` updates `document.documentElement.style.fontSize`, which is global page state.
- `ResourcesDom.registerFont()` stores metrics but does not load a font. The application must install the corresponding browser font.
- Text is intended to be plain text. The current DOM backend writes node text through `innerHTML`; do not pass untrusted content without escaping it.
- DOM layout/paint and WebGPU layout/paint are close but not identical, particularly for the WebGPU clipping and opacity cases above.

## Components and framework adapters

- Text must be inside `Text`. Text directly under `View`, or element/component children inside `Text`, throws.
- `Input` is a controlled visual component with focus, placeholder, and caret behavior. It does not collect keyboard input, edit its value, or emit an `onChange`; applications must bridge their own keyboard/text-input source and pass the updated `value`.
- `id` is accepted by shared component prop types but is not materialized as a DOM id or GPU attribute by the current drivers.
- No adapter exposes an SSR or hydration entrypoint. The React driver explicitly disables hydration and does not provide dedicated portal, Suspense, or Activity integration.
- Framework commits call or schedule `ui.update()`, but WebGPU applications still own the `draw()` loop.
- Vue `<style>` support is a strict subset: class selectors only, with no descendant/pseudo selectors, at-rules, `!important`, CSS variables, modules, external blocks, preprocessors, or CSS `v-bind()`.

## Cleanup

- `root.unmount()` removes a framework tree and its effects but does not destroy the UI or resources.
- `ui.destroy()` releases the UI, renderer allocations, nodes, and listeners but does not dispose shared `ResourcesWebGPU`.
- World-space `ui.destroy()` destroys its internal GPU render target. The application remains responsible for removing and disposing engine-owned plane, geometry, material, and texture wrappers returned by `create()` where the engine requires it.
