---
title: "Public API reference"
---

The package is ESM-only and has no root entrypoint. Every supported import is one of the 14 subpaths documented below. A default-exported class is both a runtime value and a TypeScript type; entries under **Type-only exports** are erased at runtime.

## Export matrix

| Subpath | Runtime exports | Type-only named exports |
| --- | --- | --- |
| `uno-ui/events` | `DEFINED_EVENTS`, `EVENT`, `EventEmitter`, `PLATFORM_EVENT_NAMES` | `NodeEventMap`, `UIEventMap` |
| `uno-ui/ResourcesWebGPU` | default `ResourcesWebGPU` | None |
| `uno-ui/UIWebGPU` | default `UIWebGPU` | `DefinedEvent`, `UIWebGPUOptions` |
| `uno-ui/UIThree` | default `UIThree` | `UIThreeMaterial`, `UIThreeOptions` |
| `uno-ui/UIBabylon` | default `UIBabylon` | `UIBabylonMaterial`, `UIBabylonOptions`, `WebGPUHardwareTexture` |
| `uno-ui/UIBabylonLite` | default `UIBabylonLite` | `MaterialPlugin`, `Texture2D`, `UIBabylonLiteMaterial`, `UIBabylonLiteOptions` |
| `uno-ui/UIPlayCanvas` | default `UIPlayCanvas` | `UIPlayCanvasMaterial`, `UIPlayCanvasOptions` |
| `uno-ui/react` | `Image`, `Input`, `ScrollView`, `Text`, `View`, `registerRootComponent`, `useUI` | `ComponentProps`, `ImageProps`, `InputHandle`, `InputProps`, `NodeHandle`, `ScrollViewHandle`, `ScrollViewProps`, `StyleName`, `StyleProps`, `TextChildren`, `TextProps` |
| `uno-ui/solid` | `Image`, `Input`, `ScrollView`, `Text`, `View`, `applyRef`, `createComponent`, `createElement`, `createTextNode`, `effect`, `insert`, `insertNode`, `memo`, `mergeProps`, `ref`, `registerRootComponent`, `setProp`, `spread`, `useUI` | `ComponentProps`, `ImageProps`, `InputHandle`, `InputProps`, `NodeHandle`, `ScrollViewHandle`, `ScrollViewProps`, `StyleName`, `StyleProps` |
| `uno-ui/solid/config` | `compilerConfig` | None |
| `uno-ui/vue` | `Image`, `Input`, `ScrollView`, `Text`, `View`, `registerRootComponent`, `registerStyleSheet`, `removeStyleSheet`, `useUI` | `ClassValue`, `ImageProps`, `InputHandle`, `InputProps`, `NodeHandle`, `ScrollViewHandle`, `ScrollViewProps`, `StyleName`, `StyleProps`, `StyleRule`, `TextProps`, `ViewProps` |
| `uno-ui/vue/config` | `compileStyles`, `compilerConfig`, `stylesPlugin` | None |

## Shared returned interfaces

Several entrypoints return the same underlying UI and node objects. Their base classes are not standalone package exports, but the following members are available on the returned objects.

### UI instances

Every exported UI class provides these inherited members:

```ts
root: Node | null
renderer: Renderer | null
resources: Resources | null
defined_events: DefinedEvent[]
events: EventEmitter<UIEventMap>
events_source: EventEmitter
operations: Operations

create(): Node | undefined
update(): void
draw(options?): unknown
setDevicePixelRatio(device_pixel_ratio: number): void
setViewport(width: number, height: number): void
setRootSize(root_size: number): void
destroy(): boolean | void
addChild(parent: Node, child: Node, before_node: Node | null): void
detachNode(node: Node): void
destroyNode(node: Node): void
```

`create()` returns a detached node and returns `undefined` after destruction. `update()` commits queued tree, style, layout, resource, and scroll work. Framework adapters schedule updates around framework commits; imperative users call it explicitly. The inherited `destroy()` returns `true` on the first call and `false` later; world-space subclasses expose `void` because their overrides consume that result while releasing the offscreen texture. Destruction does not dispose a shared resource store. Renderer-specific `draw()` signatures are documented with their entrypoints.

### Node instances

Nodes are returned by `ui.root`, `ui.create()`, and framework handles:

```ts
id: number
ui: UI | null
element: unknown | null
parent: Node | null
children: Node[]
path: number[]
layout: NodeLayout
text_content: string | undefined
order: number
scroll_top: number
scroll_left: number
scrolling: boolean
styles: Partial<Record<StyleName | (string & {}), ResolvedStyle>>
scrollHeight: number
scrollWidth: number
clientHeight: number
clientWidth: number

add(child: Node, before_node?: Node | null): void
remove(child: Node): void
detach(): void
destroy(): void
focus(source_event?: EventSource | null): void
blur(source_event?: EventSource | null): void
on<TName extends string>(type: TName, listener: (event: EventPayload<TName>) => void): void
off<TName extends string>(type: TName, listener: (event: EventPayload<TName>) => void): void
destroyEvents(): void
style(name: string, value: string): void
text(value: string): void
isTextNode(): boolean
hasTextContent(): boolean
scrollTop: number
scrollLeft: number
```

`remove()` destroys a child; `detach()` preserves it for reinsertion. A text node cannot contain child nodes. See [Core API](./core-api.md) for lifecycle and ownership details.

### Shared framework types

The framework entrypoints re-export these structural types:

```ts
type StyleProps = Partial<Record<StyleName, string>> & {
  [name: string]: string | undefined
}

type NodeHandle = {
  nodes: { main: Node }
}

type ScrollViewHandle = {
  nodes: { main: Node; content: Node }
}

type InputHandle = {
  readonly nodes: {
    main: Node
    content: Node
    text: Node
    caret: Node | null
  }
  focus(): void
  blur(): void
}
```

`StyleName` is the union of supported style names. `StyleProps`, `NodeHandle`, `ScrollViewHandle`, and `InputHandle` are separately re-exported by `uno-ui/react`, `uno-ui/solid`, and `uno-ui/vue`. See [Styles](../api/styles.md) for the complete property and value reference.

## `uno-ui/events`

```ts
import {
  DEFINED_EVENTS,
  EVENT,
  EventEmitter,
  PLATFORM_EVENT_NAMES,
} from 'uno-ui/events'
import type { NodeEventMap, UIEventMap } from 'uno-ui/events'
```

### Value exports

#### `EVENT`

Metadata used by UI event definitions and framework adapters:

| Key | `name` | `prop` | `platform` | `priority` |
| --- | --- | --- | --- | --- |
| `POINTERDOWN` | `pointerdown` | `onPointerDown` | `true` | `discrete` |
| `POINTERMOVE` | `pointermove` | `onPointerMove` | `true` | `continuous` |
| `POINTERUP` | `pointerup` | `onPointerUp` | `true` | `discrete` |
| `POINTERCANCEL` | `pointercancel` | `onPointerCancel` | `true` | `discrete` |
| `POINTEROVER` | `pointerover` | `onPointerOver` | `false` | `continuous` |
| `POINTEROUT` | `pointerout` | `onPointerOut` | `false` | `continuous` |
| `CLICK` | `click` | `onClick` | `false` | `discrete` |
| `WHEEL` | `wheel` | `onWheel` | `true` | `continuous` |
| `SCROLL` | `scroll` | `onScroll` | `false` | `continuous` |
| `FOCUS` | `focus` | `onFocus` | `false` | `discrete` |
| `BLUR` | `blur` | `onBlur` | `false` | `discrete` |

#### `PLATFORM_EVENT_NAMES`

```ts
const PLATFORM_EVENT_NAMES: Array<
  'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel' | 'wheel'
>
```

Use this list when forwarding canvas events to a WebGPU UI. Click, hover, scroll, focus, and blur are normalized or synthesized from source events.

#### `DEFINED_EVENTS`

The ordered array of built-in WebGPU event-definition factories: pointer, wheel, scroll, click, and focus definitions. Exported UI classes already install their built-ins; this value is mainly useful when constructing compatible integrations.

#### `EventEmitter`

```ts
class EventEmitter<TEvents = Record<string, any>> {
  on<TName extends EventName>(
    type: TName,
    listener: (event_data: TName extends keyof TEvents ? TEvents[TName] : any) => void,
  ): () => void

  off<TName extends EventName>(
    type: TName,
    listener: (event_data: TName extends keyof TEvents ? TEvents[TName] : any) => void,
  ): void

  emit<TName extends EventName>(
    type: TName,
    event_data: TName extends keyof TEvents ? TEvents[TName] : any,
  ): void

  emit<TName extends EventName>(
    type: TName & (
      TName extends keyof TEvents
        ? undefined extends TEvents[TName]
          ? unknown
          : never
        : unknown
    ),
  ): void

  destroy(): void
}
```

Here `EventName` is the declaration-internal union `PropertyKey | object | null | undefined | boolean | bigint`.

`on()` returns an unsubscribe function. A listener is stored once per event name because listeners are held in a `Set`.

### Type-only exports

#### `NodeEventMap`

Maps public node event names to their bubbling payloads:

| Event | Additional payload |
| --- | --- |
| `pointerdown`, `pointermove`, `pointerup`, `pointercancel` | `x`, `y`, optional `distance_to_camera`, pointer source |
| `pointerover`, `pointerout` | Pointer payload plus `related_target: Node | null` |
| `click` | `x`, `y`, optional `distance_to_camera`, mouse or pointer source |
| `wheel` | Coordinates plus normalized `delta_x`, `delta_y` |
| `scroll` | `scroll_left`, `scroll_top` |
| `focus`, `blur` | `related_target: Node | null` |

Every payload also has `type`, `source_event`, `target`, `current_target`, and `stopPropagation()`.

#### `UIEventMap`

The lower-level normalized events emitted by `ui.events`:

```ts
type UIEventMap = {
  [K in keyof NodeEventMap]: {
    source_event: NodeEventMap[K]['source_event']
    target: Node
    event_data: Omit<NodeEventMap[K], keyof NodeEvent<K> | 'related_target'>
    related_target?: Node | null
  }
}
```

## `uno-ui/ResourcesWebGPU`

```ts
import ResourcesWebGPU from 'uno-ui/ResourcesWebGPU'
```

### Value export

The default export is the `ResourcesWebGPU` class. Its constructor is protected; use `create()`.

```ts
class ResourcesWebGPU {
  static create(options: ResourcesWebGPUOptions): Promise<ResourcesWebGPU>

  canvas: WebGPUCanvas | undefined
  adapter: GPUAdapter | null | undefined
  device: GPUDevice
  context: WebGPUContext
  format: GPUTextureFormat
  font_atlas_size: number
  image_atlas_size: number
  font_manager: FontManager
  image_manager: ImageManager
  has_present: boolean
  events: EventEmitter<Record<string, any>>

  registerImage(src: string, image: WebGPUImage): ManagedAtlasImage
  disposeImage(src: string): void
  getImageSize(src: string): { width: number; height: number } | undefined
  registerFont(name: string, image: WebGPUImage, json: FontData): ManagedFont
  disposeFont(name: string): void
  dispose(): void
  present(): void
}
```

The effective creation options are:

```ts
type ResourcesWebGPUOptions = {
  adapter?: GPUAdapter | null
  device?: GPUDevice
  format?: GPUTextureFormat
  image_atlas_size?: number
  font_atlas_size?: number
} & (
  | { canvas: WebGPUCanvas; context?: WebGPUContext }
  | { canvas?: WebGPUCanvas; context: WebGPUContext }
)
```

The atlas sizes default to `2048`. When no device is supplied, creation requests an adapter and device. When no context is supplied, creation obtains and configures the canvas WebGPU context with premultiplied alpha. `present()` calls the optional context `present()` method and is a no-op for contexts without it. `dispose()` releases image and font atlas storage, not the external device or context.

### Type-only exports

None.

## `uno-ui/UIWebGPU`

```ts
import UIWebGPU from 'uno-ui/UIWebGPU'
import type { DefinedEvent, UIWebGPUOptions } from 'uno-ui/UIWebGPU'
```

### Value export

```ts
class UIWebGPU {
  static create(options: UIWebGPUOptions): Promise<{ ui: UIWebGPU }>

  dispatchPlatformEvent(source_event: PlatformEvent): void
  draw(options?: {
    submit?: boolean
    command_encoder?: GPUCommandEncoder
    texture_view?: GPUTextureView
    load_op?: GPULoadOp
  }): { command_encoder: GPUCommandEncoder; texture_view: GPUTextureView } | undefined
}
```

`submit` defaults to `true` and `load_op` defaults to `load`. When omitted, the command encoder and target view are created from the resource device and context. `dispatchPlatformEvent()` maps source coordinates through the source event's current-target rectangle and the UI root layout.

### Type-only exports

```ts
type UIWebGPUOptions = {
  resources: ResourcesWebGPU
  loadYoga: typeof loadYoga
  image_min_filter?: 'linear' | 'nearest'
  image_mag_filter?: 'linear' | 'nearest'
  defined_events?: Array<(options: { ui: UIWebGPU }) => DefinedEvent>
}

type DefinedEvent = {
  types: Array<{
    platform: boolean
    name: string
    prop: string
    priority: string
  }>
  destroy(): void
  destroyNode?(node: Node): void
}
```

`defined_events` adds definitions after the built-ins. Device pixel ratio and viewport are configured through `ui.setDevicePixelRatio()` and `ui.setViewport()`, not as creation options.

## `uno-ui/UIThree`

```ts
import UIThree from 'uno-ui/UIThree'
import type { UIThreeMaterial, UIThreeOptions } from 'uno-ui/UIThree'
```

Requires the optional `three` and `@types/three` peers.

### Value export

```ts
class UIThree {
  static create<
    TMaterial extends UIThreeMaterial = THREE.MeshStandardNodeMaterial,
    TPlane extends { plane: THREE.Mesh } = {
      plane: THREE.Mesh<THREE.PlaneGeometry, TMaterial>
      geometry: THREE.PlaneGeometry
    },
  >(
    options: UIThreeOptions<TMaterial, TPlane>,
  ): Promise<{
    ui: UIThree
  } & UIWorldSpaceOutput<THREE.ExternalTexture, TMaterial, TPlane>>

  dispatchPlatformEvent(
    source_event: PlatformEvent,
    options: { camera: THREE.Camera },
  ): void

  draw(options?: WorldSpaceDrawOptions): WebGPUDrawResult | undefined
  destroy(): void
}
```

The default result contains `ui`, `texture`, `material`, `gpu_texture`, `gpu_texture_view`, `plane`, and `geometry`. The event dispatcher raycasts the returned plane.

### Type-only exports

```ts
type UIThreeMaterial = THREE.NodeMaterial &
  Pick<THREE.MeshBasicNodeMaterial, 'map' | 'color'>

type UIThreeOptions<
  TMaterial extends UIThreeMaterial = THREE.MeshStandardNodeMaterial,
  TPlane extends { plane: THREE.Mesh } = {
    plane: THREE.Mesh<THREE.PlaneGeometry, TMaterial>
    geometry: THREE.PlaneGeometry
  },
> = UIWorldSpaceOptions<THREE.ExternalTexture, TMaterial, TPlane, UIThree>
```

The expanded world-space options are `resources`, `loadYoga`, optional image filters and event definitions, required texture and world dimensions, plus optional `createMaterial()` and `createPlane()` callbacks. Their complete structural shape is listed under [Non-exported types in public signatures](#non-exported-types-in-public-signatures).

## `uno-ui/UIBabylon`

```ts
import UIBabylon from 'uno-ui/UIBabylon'
import type {
  UIBabylonMaterial,
  UIBabylonOptions,
  WebGPUHardwareTexture,
} from 'uno-ui/UIBabylon'
```

Requires the optional `@babylonjs/core` peer and a WebGPU-backed scene.

### Value export

```ts
class UIBabylon {
  static create<
    TMaterial extends UIBabylonMaterial = StandardMaterial,
    TPlane extends { plane: Mesh } = {
      plane: Mesh
      geometry: Geometry | null
    },
  >(
    options: UIBabylonOptions<TMaterial, TPlane>,
  ): Promise<{
    ui: UIBabylon
  } & UIWorldSpaceOutput<Texture, TMaterial, TPlane>>

  dispatchPlatformEvent(
    source_event: PlatformEvent,
    options: { camera: Camera },
  ): void

  draw(options?: WorldSpaceDrawOptions): WebGPUDrawResult | undefined
  destroy(): void
}
```

The default result contains `ui`, Babylon `texture` and `material`, `gpu_texture`, `gpu_texture_view`, `plane`, and `geometry`.

### Type-only exports

```ts
type UIBabylonMaterial = StandardMaterial

type UIBabylonOptions<
  TMaterial extends UIBabylonMaterial = StandardMaterial,
  TPlane extends { plane: Mesh } = {
    plane: Mesh
    geometry: Geometry | null
  },
> = UIWorldSpaceOptions<Texture, TMaterial, TPlane, UIBabylon> & {
  scene: Scene
}
```

`WebGPUHardwareTexture` is re-exported as a type from Babylon.js.

## `uno-ui/UIBabylonLite`

```ts
import UIBabylonLite from 'uno-ui/UIBabylonLite'
import type {
  MaterialPlugin,
  Texture2D,
  UIBabylonLiteMaterial,
  UIBabylonLiteOptions,
} from 'uno-ui/UIBabylonLite'
```

Requires the optional `@babylonjs/lite` peer.

### Value export

```ts
class UIBabylonLite {
  static create<
    TMaterial extends UIBabylonLiteMaterial = StandardMaterialProps,
    TPlane extends { plane: Mesh } = { plane: Mesh },
  >(
    options: UIBabylonLiteOptions<TMaterial, TPlane>,
  ): Promise<{
    ui: UIBabylonLite
  } & UIWorldSpaceOutput<Texture2D, TMaterial, TPlane>>

  dispatchPlatformEvent(
    source_event: PlatformEvent,
    options: { camera: Camera },
  ): Promise<void>

  draw(options?: WorldSpaceDrawOptions): WebGPUDrawResult | undefined
  destroy(): void
}
```

`dispatchPlatformEvent()` is asynchronous because it uses the Babylon Lite GPU picker. The default result contains `ui`, `texture`, `material`, `gpu_texture`, `gpu_texture_view`, and `plane`.

### Type-only exports

```ts
type UIBabylonLiteMaterial = StandardMaterialProps

type UIBabylonLiteOptions<
  TMaterial extends UIBabylonLiteMaterial = StandardMaterialProps,
  TPlane extends { plane: Mesh } = { plane: Mesh },
> = UIWorldSpaceOptions<Texture2D, TMaterial, TPlane, UIBabylonLite> & {
  engine: EngineContext
  scene: SceneContext
}
```

`MaterialPlugin` and `Texture2D` are re-exported as types from Babylon Lite.

## `uno-ui/UIPlayCanvas`

```ts
import UIPlayCanvas from 'uno-ui/UIPlayCanvas'
import type {
  UIPlayCanvasMaterial,
  UIPlayCanvasOptions,
} from 'uno-ui/UIPlayCanvas'
```

Requires the optional `playcanvas` peer and a WebGPU graphics device.

### Value export

```ts
class UIPlayCanvas {
  static create<
    TMaterial extends UIPlayCanvasMaterial = StandardMaterial,
    TPlane extends { plane: Entity } = {
      plane: Entity
      geometry: Geometry
      mesh: Mesh
      mesh_instance: MeshInstance
    },
  >(
    options: UIPlayCanvasOptions<TMaterial, TPlane>,
  ): Promise<{
    ui: UIPlayCanvas
  } & UIWorldSpaceOutput<Texture, TMaterial, TPlane>>

  dispatchPlatformEvent(
    source_event: PlatformEvent,
    options: { camera: Entity },
  ): void

  draw(options?: WorldSpaceDrawOptions): WebGPUDrawResult | undefined
  destroy(): void
}
```

The default result contains `ui`, PlayCanvas `texture` and `material`, `gpu_texture`, `gpu_texture_view`, `plane`, `geometry`, `mesh`, and `mesh_instance`.

### Type-only exports

```ts
type UIPlayCanvasMaterial = StandardMaterial

type UIPlayCanvasOptions<
  TMaterial extends UIPlayCanvasMaterial = StandardMaterial,
  TPlane extends { plane: Entity } = {
    plane: Entity
    geometry: Geometry
    mesh: Mesh
    mesh_instance: MeshInstance
  },
> = UIWorldSpaceOptions<Texture, TMaterial, TPlane, UIPlayCanvas> & {
  app: AppBase
}
```

## `uno-ui/react`

```ts
import {
  Image,
  Input,
  ScrollView,
  Text,
  View,
  registerRootComponent,
  useUI,
} from 'uno-ui/react'
import type {
  ComponentProps,
  ImageProps,
  InputHandle,
  InputProps,
  NodeHandle,
  ScrollViewHandle,
  ScrollViewProps,
  StyleName,
  StyleProps,
  TextChildren,
  TextProps,
} from 'uno-ui/react'
```

Requires the optional `react`, `react-reconciler`, and `@types/react` peers.

### Value exports

```ts
function View(props: ComponentProps): ReactElement
function Text(props: TextProps): ReactElement
function Image(props: ImageProps): ReactElement
function ScrollView(props: ScrollViewProps): ReactElement
function Input(props: InputProps): ReactElement

function registerRootComponent<P extends Record<string, any>>(
  RootComponent: ComponentType<P>,
  options: { ui: UI },
): {
  render(props: P): void
  unmount(): void
}

function useUI<TUI extends UI = UI>(): TUI
```

`registerRootComponent()` creates one React reconciler root for a UI. `render()` commits synchronously and preserves the root across calls; `unmount()` removes its nodes and effects without destroying the UI.

### Type-only exports

```ts
type ComponentProps<TRef = NodeHandle> = BaseProps & {
  children?: ReactNode
  ref?: Ref<TRef>
}

type TextChildren =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly TextChildren[]

type TextProps = Omit<ComponentProps, 'children'> & {
  children?: TextChildren
}

type ImageProps = Omit<ComponentProps, 'style'> & {
  src: string
  width?: string
  height?: string
  style?: (StyleProps & {
    objectFit?: 'fill' | 'contain' | 'cover' | 'none'
  }) | null
}

type ScrollViewProps = ComponentProps<ScrollViewHandle> & {
  horizontal?: boolean
}

type InputProps = Omit<ComponentProps<InputHandle>, 'style'> & {
  value?: string | number | null
  placeholder?: string | number | null
  placeholderTextColor?: string
  style?: StyleProps
}
```

Also exported: `NodeHandle`, `ScrollViewHandle`, `InputHandle`, `StyleName`, and `StyleProps` as defined in [Shared framework types](#shared-framework-types).

`BaseProps` contributes `id?`, `key?`, `style?`, built-in event callback props, and arbitrary `on${string}` callbacks. `Text` accepts nested primitive arrays and ignores booleans, `null`, and `undefined`; React elements inside `Text` are rejected.

## `uno-ui/solid`

```ts
import {
  Image,
  Input,
  ScrollView,
  Text,
  View,
  applyRef,
  createComponent,
  createElement,
  createTextNode,
  effect,
  insert,
  insertNode,
  memo,
  mergeProps,
  ref,
  registerRootComponent,
  setProp,
  spread,
  useUI,
} from 'uno-ui/solid'
import type {
  ComponentProps,
  ImageProps,
  InputHandle,
  InputProps,
  NodeHandle,
  ScrollViewHandle,
  ScrollViewProps,
  StyleName,
  StyleProps,
} from 'uno-ui/solid'
```

Requires the optional `solid-js` and `@solidjs/universal` peers.

### Component and root value exports

```ts
function View(props: ComponentProps): SolidElement
function Text(props: ComponentProps): SolidElement
function Image(props: ImageProps): SolidElement
function ScrollView(props: ScrollViewProps): SolidElement
function Input(props: InputProps): SolidElement

function registerRootComponent<P extends Record<string, any>>(
  RootComponent: Component<P>,
  options: { ui: UI },
): {
  render(props: P): void
  unmount(): void
}

function useUI<TUI extends UI = UI>(): TUI
```

Regular `View`, `Text`, and `Image` refs receive the underlying node directly. `ScrollView` and `Input` refs receive their exported handle types.

### Solid renderer runtime value exports

These functions are the renderer runtime targeted by `uno-ui/solid/config`:

```ts
function effect<T>(
  fn: (prev?: T) => T,
  effect: (value: T, prev?: T) => void,
  options?: RendererEffectOptions,
): void

function memo<T>(fn: () => T, equal: boolean): () => T
function createComponent<T>(Comp: (props: T) => Node, props: T): Node
function createElement(tag: string, staticProps?: Record<string, unknown>): Node
function createTextNode(value: string): Node

function insert<T>(
  parent: any,
  accessor: T | (() => T),
  marker?: any | null,
  initial?: any,
  options?: RendererEffectOptions,
): Node

function insertNode(parent: Node, node: Node, anchor?: Node): void

function spread<T extends object>(
  node: any,
  props: T,
  skipChildren?: boolean,
  options?: RendererEffectOptions,
): void

function setProp<T>(node: Node, name: string, value: T, prev?: T): T
function mergeProps(...sources: unknown[]): unknown

function applyRef(
  ref: ((element: Node) => void) | Array<(element: Node) => void>,
  element: Node,
): void

function ref(
  fn: () => ((element: Node) => void) | Array<(element: Node) => void>,
  element: Node,
): void
```

### Type-only exports

```ts
type ComponentProps<TRef = Node> = BaseProps & {
  children?: SolidElement
  ref?: Ref<TRef>
}

type ImageProps = Omit<ComponentProps, 'style'> & {
  src: string
  width?: string
  height?: string
  style?: (StyleProps & {
    objectFit?: 'fill' | 'contain' | 'cover' | 'none'
  }) | null
}

type ScrollViewProps = ComponentProps<ScrollViewHandle> & {
  horizontal?: boolean
}

type InputProps = Omit<ComponentProps<InputHandle>, 'style'> & {
  value?: string | number | null
  placeholder?: string | number | null
  placeholderTextColor?: string
  style?: StyleProps
}
```

Also exported: `NodeHandle`, `ScrollViewHandle`, `InputHandle`, `StyleName`, and `StyleProps`.

## `uno-ui/solid/config`

```ts
import { compilerConfig } from 'uno-ui/solid/config'
```

### Value export

```ts
const compilerConfig: {
  include: string[]
  solid: {
    moduleName: string
    generate: string
  }
}
```

Its runtime value is:

```ts
{
  include: ['**/*.tsx', '**/*.jsx'],
  solid: {
    moduleName: 'uno-ui/solid',
    generate: 'universal',
  },
}
```

Pass it to the Solid build plugin so generated JSX calls target the exported Solid renderer runtime.

### Type-only exports

None.

## `uno-ui/vue`

```ts
import {
  Image,
  Input,
  ScrollView,
  Text,
  View,
  registerRootComponent,
  registerStyleSheet,
  removeStyleSheet,
  useUI,
} from 'uno-ui/vue'
import type {
  ClassValue,
  ImageProps,
  InputHandle,
  InputProps,
  NodeHandle,
  ScrollViewHandle,
  ScrollViewProps,
  StyleName,
  StyleProps,
  StyleRule,
  TextProps,
  ViewProps,
} from 'uno-ui/vue'
```

Requires the optional `vue` peer.

### Value exports

```ts
const View: DefineComponent<ViewProps, NodeHandle>
const Text: DefineComponent<TextProps, NodeHandle>
const Image: DefineComponent<ImageProps, NodeHandle>
const ScrollView: DefineComponent<ScrollViewProps, ScrollViewHandle>
const Input: DefineComponent<InputProps, InputHandle>

function registerRootComponent<P extends Record<string, any>>(
  RootComponent: Component & (new (...args: any[]) => { $props: P }),
  options: { ui: UI },
): {
  render(props: P): void
  unmount(): void
}

function useUI<TUI extends UI = UI>(): TUI
function registerStyleSheet(id: string, rules: StyleRule[]): void
function removeStyleSheet(id: string): void
```

Registering the same stylesheet ID replaces its rules. Removing it updates all Uno Vue class resolution using the reactive registry.

### Type-only exports

```ts
type ClassValue =
  | string
  | Record<string, unknown>
  | ClassValue[]
  | false
  | null
  | undefined

type StyleRule = {
  classes: string[]
  scope_id: string | null
  style: StyleProps
}

type ViewProps = BaseProps & {
  class?: ClassValue
}

type TextProps = ViewProps

type ImageProps = Omit<ViewProps, 'style'> & {
  src: string
  width?: string
  height?: string
  style?: (StyleProps & {
    objectFit?: 'fill' | 'contain' | 'cover' | 'none'
  }) | null
}

type ScrollViewProps = ViewProps & {
  horizontal?: boolean
}

type InputProps = Omit<ViewProps, 'style'> & {
  value?: string | number | null
  placeholder?: string | number | null
  placeholderTextColor?: string
  style?: StyleProps
}
```

Also exported: `NodeHandle`, `ScrollViewHandle`, `InputHandle`, `StyleName`, and `StyleProps`.

## `uno-ui/vue/config`

```ts
import {
  compileStyles,
  compilerConfig,
  stylesPlugin,
} from 'uno-ui/vue/config'
```

Requires the optional `vue` and `vite` peers when the compiler helpers are used.

### Value exports

```ts
const compilerConfig: {
  template: {
    transformAssetUrls: boolean
    compilerOptions: {
      hoistStatic: boolean
    }
  }
}

function compileStyles(
  descriptor: SFCDescriptor,
  scope_id: string,
): Promise<StyleRule[]>

function stylesPlugin(): Plugin[]
```

`compilerConfig` disables Vue asset URL transforms and static hoisting for Uno component trees. `compileStyles()` converts supported SFC class rules into `StyleRule` objects. `stylesPlugin()` returns the source and post-transform Vite plugins that compile, register, hot-reload, and remove those rules. See [Framework adapters](./frameworks.md) for the supported CSS subset.

### Type-only exports

None.

## Non-exported types in public signatures

The generated declarations preserve several useful internal type names so TypeScript can check calls, but those names are not separately importable package exports. Prefer inference or the public aliases above.

### Base UI and node types

- `UI`, `Renderer`, `Resources`, and `Operations` occur in controller parameters, inherited members, and `useUI()` constraints.
- `Node`, `NodeLayout`, and `ResolvedStyle` occur in `ui.root`, `ui.create()`, handles, event payloads, and node properties.
- `EventSource`, `EventPayload`, `NodeEvent`, `PointerNodeEvent`, `PlatformEvent`, and `EventCoordinates` occur inside the two exported event maps and dispatch methods.

Derive concrete types from an exported class when an annotation is needed:

```ts
type WebGPUCreateResult = Awaited<ReturnType<typeof UIWebGPU.create>>
type WebGPUUI = WebGPUCreateResult['ui']
type WebGPUNode = NonNullable<WebGPUUI['root']>
type WebGPUDrawResult = NonNullable<ReturnType<WebGPUUI['draw']>>
```

### WebGPU resource contract types

The following names appear in `ResourcesWebGPU` signatures but are not exports of that subpath:

```ts
type WebGPUCanvas = {
  getContext(context_id: 'webgpu'): WebGPUContext | null
}

type WebGPUContext = GPUCanvasContext & {
  present?(): void
}

type WebGPUImage = {
  src?: string
  width: number
  height: number
  bitmap: GPUCopyExternalImageSource
  preventBleeding?: boolean
}

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
    emSize?: number
    lineHeight: number
    ascender: number
    descender: number
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

`ManagedAtlasImage` and `ManagedFont` are the concrete return types of resource registration. Treat them as resource records returned by the store; code that only registers assets does not need to name them. `FontManager` and `ImageManager` are the types of the corresponding public instance fields but are not standalone exports.

These inferred aliases remain tied to the public methods:

```ts
type WebGPUResourceOptions = Parameters<typeof ResourcesWebGPU.create>[0]
type RegisteredImage = ReturnType<ResourcesWebGPU['registerImage']>
type RegisteredFont = ReturnType<ResourcesWebGPU['registerFont']>
```

### Renderer and world-space helper types

The following declaration helpers are used by exported option aliases and return types but are not separate package exports:

```ts
type RendererWebGPUOptions = {
  resources: ResourcesWebGPU
  loadYoga: typeof loadYoga
  image_min_filter?: 'linear' | 'nearest'
  image_mag_filter?: 'linear' | 'nearest'
}

type WebGPUDrawOptions = {
  submit?: boolean
  command_encoder?: GPUCommandEncoder
  texture_view?: GPUTextureView
  load_op?: GPULoadOp
}

type WebGPUDrawResult = {
  command_encoder: GPUCommandEncoder
  texture_view: GPUTextureView
}

type MaterialOptions<TTexture> = {
  texture: TTexture
  gpu_texture: GPUTexture
  gpu_texture_view: GPUTextureView
}

type PlaneOptions<TTexture, TMaterial> = MaterialOptions<TTexture> & {
  material: TMaterial
  world_width: number
  world_height: number
}

type UIWorldSpaceOptions<
  TTexture,
  TMaterial,
  TPlane,
  TUI extends UI = UI,
> =
  RendererWebGPUOptions & {
    defined_events?: Array<(options: { ui: TUI }) => DefinedEvent>
    texture_width: number
    texture_height: number
    world_width: number
    world_height: number
    createMaterial?(options: MaterialOptions<TTexture>): TMaterial
    createPlane?(options: PlaneOptions<TTexture, TMaterial>): TPlane
  }

type UIWorldSpaceOutput<TTexture, TMaterial, TPlane> =
  Omit<MaterialOptions<TTexture> & { material: TMaterial }, keyof TPlane> & TPlane

type WorldSpaceDrawOptions = Omit<
  WebGPUDrawOptions,
  'texture_view' | 'load_op'
>
```

Use each exported engine-specific options alias for authoring configuration. Infer customized creation results directly from the relevant `create()` call or wrapper function.

### Framework implementation types

`BaseProps`, `ImageOptions`, and `InputOptions` are composed into the exported framework prop aliases but are not exported themselves. The framework sections show how those internal types compose the public aliases; use the exported aliases when an exact annotation is needed. Framework context objects are implementation details; `useUI()` is the public context accessor.
