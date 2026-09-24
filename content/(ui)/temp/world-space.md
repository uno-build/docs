---
title: "World-space integrations"
---

Uno UI can render a UI into an offscreen WebGPU texture and expose that texture through a Three.js, Babylon.js, Babylon Lite, or PlayCanvas plane. The four adapters use the same node, style, resource, and event APIs as `UIWebGPU`; the engine integration only changes how the texture is wrapped, displayed, and raycast.

| Adapter | Package entrypoint | Optional peer |
| --- | --- | --- |
| Three.js | `uno-ui/UIThree` | `three`, `@types/three` |
| Babylon.js | `uno-ui/UIBabylon` | `@babylonjs/core` |
| Babylon Lite | `uno-ui/UIBabylonLite` | `@babylonjs/lite` |
| PlayCanvas | `uno-ui/UIPlayCanvas` | `playcanvas` |

All four adapters require `ResourcesWebGPU` and Yoga:

```ts
import { loadYoga } from 'yoga-layout/load'
import ResourcesWebGPU from 'uno-ui/ResourcesWebGPU'
```

## Shared WebGPU state

The engine and Uno UI must use the same `GPUDevice`, `GPUCanvasContext`, and texture format. A texture created by one device cannot be consumed by an engine running on another device.

- With Three.js, `ResourcesWebGPU.create({ canvas })` can initialize the WebGPU state first. Pass `resources.device` and `resources.context` to the Three.js `WebGPURenderer`.
- With Babylon.js, Babylon Lite, or PlayCanvas, initialize the engine first, then create `ResourcesWebGPU` with the engine's device, context, and format.

One resource store can be shared by an overlay UI and any number of world-space UIs. Each world-space UI creates and owns a separate offscreen `GPUTexture`; image and font atlases remain shared through `ResourcesWebGPU`.

## Common creation options

Every adapter's `create()` method accepts these options in addition to its engine-specific option:

| Option | Required | Description |
| --- | --- | --- |
| `resources` | Yes | An initialized `ResourcesWebGPU` using the engine's WebGPU state. |
| `loadYoga` | Yes | The `loadYoga` function from `yoga-layout/load`. |
| `texture_width` | Yes | Width of the offscreen GPU texture in physical pixels. |
| `texture_height` | Yes | Height of the offscreen GPU texture in physical pixels. |
| `world_width` | Yes | Width of the default plane in engine world units. |
| `world_height` | Yes | Height of the default plane in engine world units. |
| `image_min_filter` | No | Atlas minification filter: `'linear'` by default or `'nearest'`. |
| `image_mag_filter` | No | Atlas magnification filter: `'linear'` by default or `'nearest'`. |
| `defined_events` | No | Additional event-definition factories. Built-in events are already installed. |
| `createMaterial` | No | Creates an engine-compatible material instead of the adapter's default. |
| `createPlane` | No | Creates the plane and any associated resources instead of the adapter's default. |

`texture_width` and `texture_height` control raster resolution. They do not set the logical layout viewport. Set the viewport and density on the returned UI:

```ts
const pixel_ratio = window.devicePixelRatio

ui.setViewport(logical_width, logical_height)
ui.setDevicePixelRatio(pixel_ratio)
ui.update()
```

For a one-to-one logical-to-physical scale, use `texture_width = logical_width * pixel_ratio` and the equivalent height. Round the physical dimensions to integers.

`device_pixel_ratio` is not a `create()` option. Always set it with `ui.setDevicePixelRatio()`.

### Custom material and plane factories

`createMaterial` receives the newly created engine texture and its underlying WebGPU objects:

```ts
createMaterial({ texture, gpu_texture, gpu_texture_view })
```

The returned material must satisfy the adapter's material type. The adapter then configures it to sample the UI texture with premultiplied alpha.

`createPlane` receives the same values plus the material and world dimensions:

```ts
createPlane({
    texture,
    gpu_texture,
    gpu_texture_view,
    material,
    world_width,
    world_height,
})
```

It must return an object containing `plane`. Any additional fields are included in the result of `create()`. A custom plane must preserve the adapter's picking assumptions: it should represent the requested centered rectangle, and UV-based adapters need UVs covering the full texture.

## Creation result

Every adapter resolves to an object containing:

| Field | Ownership and purpose |
| --- | --- |
| `ui` | The Uno UI instance. Build nodes, update layout, draw, and dispatch events through it. |
| `texture` | The engine-specific wrapper around the offscreen WebGPU texture. |
| `material` | The configured engine material, either default or returned by `createMaterial`. |
| `gpu_texture` | The raw offscreen `GPUTexture`, owned by `ui`. |
| `gpu_texture_view` | The view used internally by `ui.draw()`. |
| `plane` | The engine object used for display and hit testing. |

The default factories add these engine-specific fields:

| Adapter | Additional default fields |
| --- | --- |
| `UIThree` | `geometry` (`THREE.PlaneGeometry`) |
| `UIBabylon` | `geometry` (`Geometry | null`) |
| `UIBabylonLite` | None |
| `UIPlayCanvas` | `geometry`, `mesh`, and `mesh_instance` |

## Minimal Three.js example

This example uses only published Uno UI entrypoints. It renders a blue panel to a Three.js plane, forwards platform events, and keeps layout coordinates independent from texture resolution.

```ts
import { loadYoga } from 'yoga-layout/load'
import * as THREE from 'three/webgpu'
import { PLATFORM_EVENT_NAMES } from 'uno-ui/events'
import ResourcesWebGPU from 'uno-ui/ResourcesWebGPU'
import UIThree from 'uno-ui/UIThree'

const canvas = document.querySelector<HTMLCanvasElement>('canvas')!
const logical_width = 640
const logical_height = 360
const pixel_ratio = window.devicePixelRatio

const resources = await ResourcesWebGPU.create({ canvas })

const {
    ui,
    plane,
    texture,
    material,
    geometry,
} = await UIThree.create({
    resources,
    loadYoga,
    texture_width: Math.round(logical_width * pixel_ratio),
    texture_height: Math.round(logical_height * pixel_ratio),
    world_width: 2,
    world_height: 1.125,
    createMaterial: () => new THREE.MeshBasicNodeMaterial(),
})

ui.setViewport(logical_width, logical_height)
ui.setDevicePixelRatio(pixel_ratio)

const panel = ui.create()!
panel.style('width', '100%')
panel.style('height', '100%')
panel.style('backgroundColor', '#2563eb')
panel.style('borderRadius', '24px')
ui.root!.add(panel)
ui.update()

const renderer = new THREE.WebGPURenderer({
    canvas,
    context: resources.context,
    device: resources.device,
    alpha: true,
})
await renderer.init()
renderer.setPixelRatio(pixel_ratio)
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    50,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    100,
)
camera.position.z = 3
scene.add(plane)

function forwardPlatformEvent(source_event: Event) {
    ui.dispatchPlatformEvent(source_event as PointerEvent | WheelEvent, { camera })
}

for (const type of PLATFORM_EVENT_NAMES) {
    canvas.addEventListener(type, forwardPlatformEvent)
}

let frame_id = 0

function renderFrame() {
    ui.draw()
    renderer.render(scene, camera)
    frame_id = requestAnimationFrame(renderFrame)
}

frame_id = requestAnimationFrame(renderFrame)

function destroy() {
    cancelAnimationFrame(frame_id)

    for (const type of PLATFORM_EVENT_NAMES) {
        canvas.removeEventListener(type, forwardPlatformEvent)
    }

    scene.remove(plane)
    texture.dispose()
    material.dispose()
    geometry.dispose()
    ui.destroy()
    resources.dispose()
    renderer.dispose()
}
```

Call `ui.update()` again after imperative mutations. React, Solid, and Vue roots schedule UI updates through their adapters, but they do not draw the offscreen texture for you.

## Drawing

World-space `draw()` always renders to the adapter's own `gpu_texture_view` and always starts the pass with `loadOp: 'clear'`. Its public options are therefore limited to command encoding and submission:

```ts
ui.update()
ui.draw()
```

With no options, Uno UI creates and submits its own command encoder. The result is `{ command_encoder, texture_view }`.

When the engine exposes an encoder for the current frame, record into it without submitting it from Uno UI:

```ts
ui.update()
ui.draw({
    submit: false,
    command_encoder,
})
```

The engine must submit that encoder later. Do not pass `texture_view` or `load_op`; world-space adapters intentionally control both. Draw before the engine pass that samples the texture. A static UI only needs another draw after its rendered content changes, while animated or continuously changing UIs normally draw every frame.

## Events and picking

World-space adapters do not install DOM listeners. Forward the event names from `uno-ui/events`:

```ts
import { PLATFORM_EVENT_NAMES } from 'uno-ui/events'

for (const type of PLATFORM_EVENT_NAMES) {
    canvas.addEventListener(type, (source_event) => {
        ui.dispatchPlatformEvent(source_event as PointerEvent | WheelEvent, { camera })
    })
}
```

`PLATFORM_EVENT_NAMES` contains `pointerdown`, `pointermove`, `pointerup`, `pointercancel`, and `wheel`. Pointer over/out, click, scroll, focus, and blur are derived internally and must not be forwarded separately.

Each adapter raycasts against the plane it created or received from `createPlane`. A hit is converted to logical UI coordinates and includes `distance_to_camera`; a miss is sent to the event system as no hit so hover and pointer state can transition correctly. The source event's `currentTarget` must provide `getBoundingClientRect()`, which is true for an event received from the canvas.

| Adapter | `camera` passed to `dispatchPlatformEvent` | Dispatch behavior |
| --- | --- | --- |
| `UIThree` | `THREE.Camera` | Synchronous Three.js raycast against the stored plane. |
| `UIBabylon` | Babylon `Camera` | Synchronous `scene.pick()` restricted to the stored plane. |
| `UIBabylonLite` | Babylon Lite `Camera` | Asynchronous GPU pick; the method returns a promise. Await it when event ordering matters. |
| `UIPlayCanvas` | A PlayCanvas `Entity` with a camera component | Synchronous ray/plane intersection in the plane's local space. |

Forward events only after the plane, camera, viewport, and initial `ui.update()` are ready. If camera controls also consume canvas input, use Uno's pointer or hover events to coordinate which system owns the gesture.

## Engine-specific notes

### Three.js

```ts
import UIThree from 'uno-ui/UIThree'
import type { UIThreeMaterial, UIThreeOptions } from 'uno-ui/UIThree'
```

- Use the WebGPU build from `three/webgpu`; the adapter creates a `THREE.ExternalTexture` from the raw GPU texture.
- The default material is `MeshStandardNodeMaterial`. A custom material must be a compatible Three.js node material with `map` and `color` properties.
- The default plane is not added to a scene. Call `scene.add(plane)`.
- The returned default `geometry`, `material`, and `texture` require explicit disposal.

### Babylon.js

```ts
import UIBabylon from 'uno-ui/UIBabylon'
import type { UIBabylonMaterial, UIBabylonOptions } from 'uno-ui/UIBabylon'
```

- `create()` additionally requires `scene`, and that scene must use Babylon's `WebGPUEngine`.
- Build `ResourcesWebGPU` from the initialized Babylon device, canvas context, and swap-chain format.
- The default `StandardMaterial` is configured for premultiplied alpha and receives the Uno texture as both diffuse and opacity texture.
- `MeshBuilder.CreatePlane` adds the default plane to the supplied scene. The result also exposes `geometry`, which can be `null` according to Babylon's type.

### Babylon Lite

```ts
import UIBabylonLite from 'uno-ui/UIBabylonLite'
import type { UIBabylonLiteMaterial, UIBabylonLiteOptions } from 'uno-ui/UIBabylonLite'
```

- `create()` additionally requires both `engine` and `scene`.
- Add the returned plane with `addToScene(scene, plane)`; creation does not attach it automatically.
- Enable material plugins for the scene before rendering so the adapter's premultiplied-alpha material plugin is applied.
- Picking uses Babylon Lite's GPU picker. `dispatchPlatformEvent()` returns a promise, and `ui.destroy()` disposes the picker.
- The default result has no separate geometry field; scene removal or scene disposal owns the mesh-side cleanup.

### PlayCanvas

```ts
import UIPlayCanvas from 'uno-ui/UIPlayCanvas'
import type { UIPlayCanvasMaterial, UIPlayCanvasOptions } from 'uno-ui/UIPlayCanvas'
```

- `create()` additionally requires an initialized WebGPU `AppBase` as `app`.
- Create `ResourcesWebGPU` from the PlayCanvas WebGPU device, context, and configured canvas format.
- Add the returned entity with `app.root.addChild(plane)`.
- The adapter supports `bgra8unorm` and `rgba8unorm` resource formats.
- The default result exposes `geometry`, `mesh`, and `mesh_instance` in addition to the plane, material, and texture.

## Ownership and cleanup

Creation crosses two ownership systems. Uno UI owns its renderer state and raw offscreen GPU texture; the application or engine owns the scene objects and engine wrappers returned alongside it. Those wrappers can still reference Uno's texture, so release them while that backing texture is available.

Use this order when removing one world-space UI:

1. Stop scheduling draws and remove the platform-event listeners for that UI.
2. Remove or detach the plane from the scene so the engine no longer renders it.
3. Dispose the engine texture wrapper, material, geometry, mesh, or entity according to the engine.
4. Call `ui.destroy()`. This releases Uno nodes, events, Yoga and renderer buffers, including the raw offscreen texture. Do not call `gpu_texture.destroy()` yourself.
5. Call `resources.dispose()` only after every overlay and world-space UI sharing that store has been destroyed.
6. Dispose the scene, renderer, application, or engine separately if the application owns them.

Typical engine-side cleanup is:

| Adapter | Per-UI engine cleanup |
| --- | --- |
| Three.js | `scene.remove(plane)`, then dispose `texture`, `material`, and `geometry`. |
| Babylon.js | Dispose `plane`, `material`, and `texture`; dispose the scene/engine separately when appropriate. |
| Babylon Lite | `removeFromScene(scene, plane)` for one panel, or let `disposeScene(scene)` remove scene-owned objects. |
| PlayCanvas | Destroy `plane`, `mesh`, `material`, and `texture`; destroy the app separately when appropriate. |

`ui.destroy()` does not dispose the shared `ResourcesWebGPU`, the engine, the scene, or these engine-side objects. Conversely, `resources.dispose()` destroys the shared image and font atlases but does not destroy an externally supplied device or context.
