---
title: "Core API"
---

Every exported UI class inherits the same UI and node behavior. The base `UI` and `Node` classes do not have public import paths; use the instances returned by `UIWebGPU.create()`, `UIDom.create()`, a world-space `create()` method, `ui.root`, `ui.create()`, or a framework handle.

## UI lifecycle

Creation initializes the renderer and creates one root node. The root starts detached from any parent and remains active until the UI is destroyed.

```ts
const { ui } = await UIWebGPU.create({ resources, loadYoga })

const panel = ui.create()!
panel.style('width', '240px')
panel.style('padding', '16px')
ui.root!.add(panel)

const text = ui.create()!
text.text('Settings')
panel.add(text)

ui.update()
ui.draw()
```

### UI methods

| Method | Behavior |
| --- | --- |
| `create()` | Creates a live, detached node. Returns `undefined` after the UI has been destroyed. |
| `update()` | Captures pending mutations, updates order/styles/layout/render data, and consumes the captured journal. |
| `draw(options?)` | Delegates to the renderer. WebGPU returns its command encoder and target view; DOM has no drawing work. Returns `undefined` after destruction. |
| `setViewport(width, height)` | Sets the WebGPU logical viewport used for layout and `vw`/`vh` resolution. DOM layout uses the native element/browser viewport. Repeated identical values do nothing. |
| `setDevicePixelRatio(ratio)` | Sets WebGPU raster density. It has no rendering effect in the DOM backend. Repeated identical values do nothing. |
| `setRootSize(size)` | Sets the WebGPU pixel size used to resolve `rem` (`16` by default). DOM mode writes the document root font size. |
| `destroy()` | Destroys the renderer, nodes, UI event definitions, and listeners. It is safe to call repeatedly and does not dispose a shared resource store. Screen-space UIs expose the base method's first-call `true`/later-call `false`; world-space overrides return `void`. |
| `addChild(parent, child, before_node)` | Low-level equivalent of `parent.add(child, before_node)`. |
| `detachNode(node)` | Low-level equivalent of `node.detach()`. |
| `destroyNode(node)` | Low-level equivalent of `node.destroy()`. Destroying the root destroys the UI. |

### UI properties

| Property | Description |
| --- | --- |
| `root` | Root node, or `null` after destruction. |
| `renderer` | Renderer instance, or `null` after destruction. Prefer the UI methods unless renderer-specific access is required. |
| `resources` | Resource store supplied at creation, or `null` after destruction. |
| `defined_events` | Active event-definition objects, including built-ins and definitions supplied by the application. |
| `events` | Emitter for normalized UI events. Node listeners subscribe through it. |
| `events_source` | Lower-level emitter used to feed platform/source events into event definitions. |
| `operations` | Pending/captured mutation journal. It is observable for advanced integrations but is normally managed by `update()`. |

`update()` is safe to call when nothing changed; it returns without asking the renderer to recompute layout. Changes queued during an update remain pending for the next call. If rendering throws, the captured operations remain available for a later retry.

## Node tree

`ui.create()` allocates a node immediately but does not attach it. A node becomes part of the visible tree after it is added beneath `ui.root` and the UI is updated.

```ts
const first = ui.create()!
const second = ui.create()!
const inserted = ui.create()!

ui.root!.add(first)
ui.root!.add(second)
ui.root!.add(inserted, second)
// Order: first, inserted, second
```

A child must belong to the same UI, must be detached, and cannot introduce a cycle. The `before_node` argument must already be a child of the target parent.

### Node methods

| Method | Behavior |
| --- | --- |
| `add(child, before_node = null)` | Appends a detached node, or inserts it before an existing child. |
| `remove(child)` | Destroys a direct child and its complete subtree. Throws when the node is not a direct child. |
| `detach()` | Removes the node and subtree from the active tree without destroying them, so they can be reinserted. |
| `destroy()` | Detaches and permanently releases the node and subtree. Destroying the root destroys the UI. |
| `style(name, value)` | Validates and queues a style. Both arguments and all style values must be strings. |
| `text(value)` | Makes the node a text node or replaces its text. A text node cannot have children. |
| `isTextNode()` | Reports whether `text()` has initialized the node as text. |
| `hasTextContent()` | Reports whether the node is text with a non-empty value. |
| `on(type, listener)` | Adds a normalized event listener to the node. Events bubble through ancestors. |
| `off(type, listener)` | Removes a previously added node listener. |
| `destroyEvents()` | Removes every listener registered through this node. Node destruction calls it automatically. |
| `focus(source_event = null)` | Moves Uno focus to this node and emits the corresponding focus/blur transitions. |
| `blur(source_event = null)` | Clears focus when this node currently owns it. |

Calling mutation methods on a destroyed node is a no-op because its `ui` reference is `null`.

### Node state

| Property | Meaning |
| --- | --- |
| `id` | UI-local numeric identifier. |
| `ui` | Owning UI, or `null` after destruction. |
| `element` | Renderer-specific element; an `HTMLElement` for DOM and `undefined` for the current WebGPU renderer. Becomes `null` after destruction. |
| `parent`, `children` | Current tree relationships. |
| `path` | Child-index path from the root. Updated on insertion, removal, and reordering. |
| `layout` | Last computed layout. Read it after `ui.update()`. |
| `styles` | Resolved longhand styles currently stored on the node. |
| `text_content` | Current text, or `undefined` before the node becomes a text node. |
| `order` | Current paint/hit-test order. |
| `scrollTop`, `scrollLeft` | Read/write scroll offsets. Setting a changed value queues a scroll operation. |
| `scrollHeight`, `scrollWidth`, `clientHeight`, `clientWidth` | Renderer-computed scroll metrics, refreshed by `ui.update()`. |

Fields named `scroll_top` and `scroll_left` are backing state used by the renderer. Consumer code should use the camel-case accessors.

The observable layout shape is:

```ts
type NodeLayout = Partial<{
    x: number
    y: number
    width: number
    height: number
    top: number
    left: number
    centerX: number
    centerY: number
    padding: { top: number; right: number; bottom: number; left: number }
    border: { top: number; right: number; bottom: number; left: number }
}>
```

An active node's `path` is its child-index path from the root. A detached node can retain its last path until it is inserted again.

## Text nodes and containers

A node is either a container or a text node:

```ts
const container = ui.create()!
const text = ui.create()!
text.text('A label')
container.add(text)
```

Calling `text()` on a node that already has children throws. Adding a child to a text node also throws. Use a parent container when text and other nodes need to appear together.

## Detach, destroy, and ownership

`detach()` preserves the node, descendants, styles, listeners, and layout objects so the subtree can be reinserted. The WebGPU renderer releases that detached subtree's draw records and rebuilds them after reinsertion. `remove()` and `destroy()` permanently release the complete subtree; references to released nodes remain JavaScript objects but no longer mutate a UI.

`ui.destroy()` does not call `resources.dispose()`. A resource store can be shared by multiple UIs, so dispose WebGPU resources only after the final UI using them has been destroyed. Framework `root.unmount()` only removes that framework root; it does not destroy the UI or its resources.
