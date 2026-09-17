---
title: "Resources and rendering"
---

Renderer choice and framework choice are independent:

| Mode | Resources | UI | Rendering |
| --- | --- | --- | --- |
| DOM | `ResourcesDom` | `UIDom` | Native DOM layout and paint; events are wired automatically |
| WebGPU overlay | `ResourcesWebGPU` | `UIWebGPU` | Yoga layout, explicit `update()` and `draw()`, manual platform-event forwarding |
| WebGPU world space | `ResourcesWebGPU` | `UIThree`, `UIBabylon`, `UIBabylonLite`, or `UIPlayCanvas` | UI draws to a texture displayed by an engine plane |

React, Solid, and Vue can drive any of these UI instances.

## WebGPU resources

`ResourcesWebGPU` is the shared owner of the GPU device/context configuration and the image and font atlases.

```ts
import ResourcesWebGPU from 'uno-ui/ResourcesWebGPU'

const resources = await ResourcesWebGPU.create({ canvas })
```

The `ResourcesWebGPU` module has only a default export. Its option and asset types appear structurally in the declarations but are not named exports.

### Creation options

```ts
type WebGPUContext = GPUCanvasContext & { present?(): void }

type ResourcesWebGPUOptions = {
    adapter?: GPUAdapter | null
    device?: GPUDevice
    format?: GPUTextureFormat
    image_atlas_size?: number
    font_atlas_size?: number
} & (
    | { canvas: { getContext('webgpu'): WebGPUContext | null }; context?: WebGPUContext }
    | { canvas?: { getContext('webgpu'): WebGPUContext | null }; context: WebGPUContext }
)
```

When no device is supplied, `create()` requests an adapter and device. When no format is supplied, it uses `navigator.gpu.getPreferredCanvasFormat()`. When no context is supplied, it obtains one from `canvas` and configures it with premultiplied alpha. Both atlas sizes default to `2048`.

Engine integrations should provide the engine's existing `device`, `context`, and `format` so Uno and the engine share the same WebGPU state.

### Public fields

`adapter`, `device`, `context`, `format`, `image_atlas_size`, `font_atlas_size`, `image_manager`, `font_manager`, `has_present`, `canvas`, and `events` are public on the returned object. Most applications only need `device`, `context`, `format`, and the registration methods.

### Images

Images are registered under an application-defined key. `backgroundImage` and the framework `Image` component resolve this key; they do not fetch a URL by themselves.

```ts
async function loadImage(src: string) {
    const response = await fetch(src)
    const bitmap = await createImageBitmap(await response.blob())

    return {
        src,
        bitmap,
        width: bitmap.width,
        height: bitmap.height,
        preventBleeding: bitmap.width < 32 || bitmap.height < 32,
    }
}

const icon = await loadImage('/assets/icon.png')
resources.registerImage('icon', icon)

const image = ui.create()!
image.style('backgroundImage', 'icon')
image.style('width', '64px')
image.style('height', '64px')
```

The accepted WebGPU image shape is:

```ts
{
    src?: string
    width: number
    height: number
    bitmap: GPUCopyExternalImageSource
    preventBleeding?: boolean
}
```

`preventBleeding: true` duplicates edge pixels into atlas padding. It is useful for small icons, sprites, and high-contrast images that are magnified or sampled near an atlas edge.

`registerImage()` throws for duplicate keys and for images larger than one atlas layer. It returns managed atlas metadata. `getImageSize(key)` returns `{ width, height }` or `undefined`, and `disposeImage(key)` releases the allocation when present.

### MTSDF fonts

The WebGPU renderer consumes an atlas image and compatible MTSDF JSON data:

```ts
const font_image = await loadImage('/assets/Inter.mtsdf.png')
const font_data = await fetch('/assets/Inter.mtsdf.json').then((response) => response.json())

resources.registerFont('Inter', font_image, font_data)
```

The JSON shape is:

```ts
type FontData = {
    atlas: {
        size: number
        distanceRange: number
        effectDistanceRange?: number
        yOrigin: 'bottom' | 'top'
        width?: number
        height?: number
        type?: string
    }
    metrics: {
        lineHeight: number
        ascender: number
        descender: number
        emSize?: number
        underlineY?: number
        underlineThickness?: number
    }
    glyphs: Array<{
        unicode: number
        advance: number
        planeBounds?: { left: number; bottom: number; right: number; top: number }
        atlasBounds?: { left: number; bottom: number; right: number; top: number }
    }>
    kerning?: Array<{ unicode1: number; unicode2: number; advance: number }>
}
```

The first registered font becomes the default. An explicit `fontFamily` must name a registered font. `registerFont()` throws for duplicate names or an atlas larger than the configured layer size, `disposeFont()` releases a font, and the returned value contains managed glyph/atlas metadata.

### Presentation and disposal

`present()` calls `context.present()` only on contexts that expose it. `dispose()` destroys both atlases and emits image/font resource changes; it does not destroy or unconfigure the device or context, whether they were supplied or acquired during creation.

Resource changes queue work in every UI sharing the store. Call `ui.update()` after late registration or disposal.

## `UIWebGPU`

```ts
import { loadYoga } from 'yoga-layout/load'
import UIWebGPU from 'uno-ui/UIWebGPU'

const { ui } = await UIWebGPU.create({
    resources,
    loadYoga,
    image_min_filter: 'linear',
    image_mag_filter: 'linear',
})
```

Creation options are:

| Option | Required | Description |
| --- | --- | --- |
| `resources` | Yes | Initialized `ResourcesWebGPU`. |
| `loadYoga` | Yes | The `loadYoga` function from `yoga-layout/load`. |
| `image_min_filter` | No | `'linear'` by default; `'nearest'` is also supported. |
| `image_mag_filter` | No | `'linear'` by default; `'nearest'` is also supported. |
| `defined_events` | No | Additional event-definition factories. Built-ins are already installed. |

Set viewport and density separately with `ui.setViewport()` and `ui.setDevicePixelRatio()`.

### Drawing

`ui.draw(options?)` accepts:

```ts
type WebGPUDrawOptions = {
    submit?: boolean
    command_encoder?: GPUCommandEncoder
    texture_view?: GPUTextureView
    load_op?: GPULoadOp
}
```

Defaults are `submit: true`, the resource device's new command encoder, the context's current texture view, and `load_op: 'load'`. The return value is `{ command_encoder, texture_view }`.

Use `submit: false` and provide an engine-owned encoder when Uno participates in a larger frame graph:

```ts
ui.update()
ui.draw({
    submit: false,
    command_encoder,
    texture_view,
    load_op: 'load',
})
```

`dispatchPlatformEvent(source_event)` converts client coordinates from the event's `currentTarget` into the logical UI viewport and feeds Uno's built-in pointer/wheel definitions. Register the event names exported by `uno-ui/events`; see [Events](./events.md).

## DOM resources

`ResourcesDom.create()` is synchronous:

```ts
import ResourcesDom from 'uno-ui/ResourcesDom'

const resources = ResourcesDom.create({ canvas: host_element })
```

The module also exports these types:

```ts
type ResourcesDomOptions = { canvas: HTMLElement }
type DomImage = { width: number; height: number; src?: string }
type FontMetrics = {
    lineHeight: number
    emSize?: number
    ascender?: number
    descender?: number
    underlineY?: number
    underlineThickness?: number
}
```

For a visible DOM background, supply `src` as well as dimensions:

```ts
resources.registerImage('icon', {
    src: '/assets/icon.png',
    width: 64,
    height: 64,
})
```

Methods are `registerImage`, `disposeImage`, `getImage`, `getImageSize`, `registerFont`, `disposeFont`, `getFont`, and `observeFonts`. Duplicate image/font keys throw. `observeFonts()` returns a cleanup callback and is managed automatically by `UIDom`.

DOM font registration stores metrics only:

```ts
resources.registerFont('Inter', undefined, {
    metrics: { lineHeight: 1.2 },
})
```

Load the actual font through `@font-face`, the FontFace API, or the page's existing CSS. The DOM renderer watches `document.fonts` and schedules an update when loading completes.

## `UIDom`

```ts
import UIDom from 'uno-ui/UIDom'

const { ui } = await UIDom.create({ resources })
```

Options are `{ resources, defined_events? }`. The renderer uses `resources.canvas` as the root node, installs pointer/wheel/click/scroll/focus adapters, and reads layout from the DOM. `ui.update()` commits mutations and refreshes layout; `ui.draw()` has no useful work.

Calling `ui.setRootSize(value)` in DOM mode writes the root font size to `document.documentElement`, so it affects the surrounding page as well as Uno's `rem` values.

Destroying a DOM UI removes created descendants and listeners but preserves the external root element supplied by the application.

## Shared ownership

One resource store can back multiple UIs. Destroy UIs before the shared store:

```ts
first_ui.destroy()
second_ui.destroy()
resources.dispose()
```

`ResourcesDom` has no store-level `dispose()` method. Destroying each `UIDom` stops its font observer and removes its created nodes.
