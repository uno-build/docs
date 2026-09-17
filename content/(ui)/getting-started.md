---
title: "Getting started"
---

Uno UI is published as ES modules and has no root entrypoint. Install the package, then import the renderer, resources, events, or framework adapter from a documented subpath.

```sh
npm install uno-ui
```

Optional integrations require their own peer packages:

```sh
# React
npm install react react-reconciler
npm install --save-dev @types/react

# Solid
npm install solid-js @solidjs/universal
npm install --save-dev @solidjs/vite-plugin

# Vue
npm install vue
npm install --save-dev vite @vitejs/plugin-vue

# Install only the engines used by the application
npm install three
npm install --save-dev @types/three
npm install @babylonjs/core
npm install @babylonjs/lite
npm install playcanvas
```

The exact supported peer ranges are recorded in `package.json`. WebGPU also requires a browser context where WebGPU is available, normally HTTPS or localhost.

## DOM quick start

`UIDom` uses the supplied `HTMLElement` as the root element. It installs its DOM event listeners during creation, and framework-free mutations become visible when `ui.update()` runs. `draw()` is not needed for this renderer.

```ts
import ResourcesDom from 'uno-ui/ResourcesDom'
import UIDom from 'uno-ui/UIDom'

const host = document.querySelector<HTMLElement>('#ui')!
const resources = ResourcesDom.create({ canvas: host })
const { ui } = await UIDom.create({ resources })

ui.root!.style('width', '100%')
ui.root!.style('height', '100%')
ui.root!.style('display', 'flex')
ui.root!.style('alignItems', 'center')
ui.root!.style('justifyContent', 'center')

const label = ui.create()!
label.style('fontSize', '24px')
label.style('color', '#16324f')
label.text('Hello from Uno UI')
ui.root!.add(label)

ui.update()

// When the host is no longer used:
// ui.destroy()
```

Use `ResourcesDom.registerImage()` before applying an image resource, and register font metrics when Uno needs a custom line height. The browser must still load the actual CSS font.

## WebGPU quick start

`ResourcesWebGPU.create()` can acquire and configure the adapter, device, and canvas context. `UIWebGPU.create()` additionally needs Yoga's async loader. The viewport is expressed in logical CSS pixels; the canvas backing size is expressed in device pixels.

```ts
import { loadYoga } from 'yoga-layout/load'
import { PLATFORM_EVENT_NAMES } from 'uno-ui/events'
import ResourcesWebGPU from 'uno-ui/ResourcesWebGPU'
import UIWebGPU from 'uno-ui/UIWebGPU'

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
canvas.style.touchAction = 'none'

const resources = await ResourcesWebGPU.create({ canvas })
const { ui } = await UIWebGPU.create({ resources, loadYoga })

function resize() {
    const device_pixel_ratio = window.devicePixelRatio
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    canvas.width = Math.max(1, Math.round(width * device_pixel_ratio))
    canvas.height = Math.max(1, Math.round(height * device_pixel_ratio))
    ui.setViewport(width, height)
    ui.setDevicePixelRatio(device_pixel_ratio)
}

resize()
window.addEventListener('resize', resize)

function forwardPlatformEvent(source_event: Event) {
    ui.dispatchPlatformEvent(source_event as PointerEvent | WheelEvent)
}

for (const type of PLATFORM_EVENT_NAMES) {
    canvas.addEventListener(type, forwardPlatformEvent)
}

ui.root!.style('width', '100%')
ui.root!.style('height', '100%')
ui.root!.style('alignItems', 'center')
ui.root!.style('justifyContent', 'center')

const panel = ui.create()!
panel.style('width', '280px')
panel.style('height', '120px')
panel.style('backgroundColor', '#1f6fb2')
panel.style('borderRadius', '24px')
ui.root!.add(panel)

let frame_id = 0

function frame() {
    ui.update()
    ui.draw({ load_op: 'clear' })
    resources.present()
    frame_id = requestAnimationFrame(frame)
}

frame_id = requestAnimationFrame(frame)

function destroy() {
    cancelAnimationFrame(frame_id)
    window.removeEventListener('resize', resize)

    for (const type of PLATFORM_EVENT_NAMES) {
        canvas.removeEventListener(type, forwardPlatformEvent)
    }

    ui.destroy()
    resources.dispose()
}
```

`resources.present()` is a no-op for standard browser `GPUCanvasContext` implementations and calls `context.present()` for hosts that expose it.

Give the canvas a non-zero CSS width and height; its CSS size defines the logical viewport used by `resize()`, while `canvas.width` and `canvas.height` define the physical backing size. The `touch-action` assignment lets Uno own touch dragging on the canvas. Call `destroy()` when this example is unmounted.

Do not pass `device_pixel_ratio` to `UIWebGPU.create()`; it is not a creation option. Use `ui.setDevicePixelRatio()` whenever the value changes.

## Next steps

- Register images and MTSDF fonts in [Resources and rendering](./resources-and-rendering.md).
- Build the same tree with React, Solid, or Vue in [Framework adapters](./frameworks.md).
- Render a UI onto a scene plane in [World-space integrations](./world-space.md).
- Review supported property values in [Styles](./styles.md) before treating the style object as general CSS.
