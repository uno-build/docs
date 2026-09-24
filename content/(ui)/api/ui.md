---
title: 'UI'
---

UI for rendering to a WebGPU canvas. Import from `@uno/ui/UI`. For engine surfaces, see [UIWorldSpace](./ui-world-space.md).

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `root` | `Node \| null` | Root node. |
| `renderer` | `RendererWebGPU \| null` | Renderer instance. |
| `resources` | `ResourcesWebGPU \| null` | [Resource store](./resources-webgpu.md). |
| `defined_events` | `DefinedEvent[]` | Installed event definitions. |
| `events` | `EventEmitter<UIEventMap>` | Normalized UI events. |
| `events_source` | `EventEmitter<CoreEventMap>` | Source and lifecycle events. |
| `operations` | `Operations` | Mutation journal. |

## Methods

| Method | Returns | Description |
| --- | --- | --- |
| `static create(options: UIOptions)` | `Promise<{ ui: UI }>` | Creates and initializes a UI. |
| `create()` | `Node \| undefined` | Creates a detached [Node](./node.md). |
| `update()` | `void` | Applies pending changes. |
| `draw(options?: WebGPUDrawOptions)` | `WebGPUDrawResult \| undefined` | Draws the current UI state. |
| `setViewport(width: number, height: number)` | `void` | Sets logical viewport dimensions. |
| `setDevicePixelRatio(device_pixel_ratio: number)` | `void` | Sets raster density. |
| `setRootSize(root_size: number)` | `void` | Sets the pixel size of `1rem`. |
| `addChild(parent: Node, child: Node, before_node: Node \| null)` | `void` | Inserts a child; `null` appends. |
| `detachNode(node: Node)` | `void` | Detaches a subtree for reuse. |
| `destroyNode(node: Node)` | `void` | Destroys a subtree; the root destroys the UI. |
| `registerPlatformEvents()` | `void` | Registers canvas event listeners. |
| `removePlatformEvents()` | `void` | Removes registered canvas listeners. |
| `dispatchPlatformEvent(source_event: PlatformEvent)` | `void` | Forwards a platform event into the UI. |
| `destroy()` | `boolean \| void` | Destroys the UI. |

## Creation options

| Option | Type | Default |
| --- | --- | --- |
| `resources` | `ResourcesWebGPU` | Required |
| `register_platform_events` | `boolean` | `true` |
| `defined_events` | `Array<(options: { ui: UI }) => DefinedEvent>` | `[]` |
| `image_min_filter` | `'linear' \| 'nearest'` | `'linear'` |
| `image_mag_filter` | `'linear' \| 'nearest'` | `'linear'` |

`register_platform_events` registers canvas listeners during creation. `UIOptions` and `DefinedEvent` are exported by `@uno/ui/UI`.

## Draw options

| Option | Type | Default |
| --- | --- | --- |
| `submit` | `boolean` | `true` |
| `command_encoder` | `GPUCommandEncoder` | New encoder |
| `texture_view` | `GPUTextureView` | Current canvas texture view |
| `load_op` | `'load' \| 'clear'` | `'load'` |

## Draw result

| Property | Type |
| --- | --- |
| `command_encoder` | `GPUCommandEncoder` |
| `texture_view` | `GPUTextureView` |
