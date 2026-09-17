---
title: "Events"
---

Uno normalizes pointer, click, wheel, scroll, focus, and blur behavior across its DOM and WebGPU renderers. Node events bubble from the hit target through its ancestors.

```ts
node.on('click', (event) => {
    console.log(event.target, event.current_target, event.x, event.y)
    event.stopPropagation()
})
```

## Public event exports

```ts
import {
    EVENT,
    PLATFORM_EVENT_NAMES,
    DEFINED_EVENTS,
    EventEmitter,
} from 'uno-ui/events'
import type { NodeEventMap, UIEventMap } from 'uno-ui/events'
```

| Event | Framework prop | Source must be forwarded | Additional data |
| --- | --- | --- | --- |
| `pointerdown` | `onPointerDown` | Yes | `x`, `y`, optional `distance_to_camera` |
| `pointermove` | `onPointerMove` | Yes | `x`, `y`, optional `distance_to_camera` |
| `pointerup` | `onPointerUp` | Yes | `x`, `y`, optional `distance_to_camera` |
| `pointercancel` | `onPointerCancel` | Yes | `x`, `y`, optional `distance_to_camera` |
| `pointerover` | `onPointerOver` | No, derived | Coordinates and `related_target` |
| `pointerout` | `onPointerOut` | No, derived | Coordinates and `related_target` |
| `click` | `onClick` | No, derived | Coordinates |
| `wheel` | `onWheel` | Yes | Coordinates, `delta_x`, `delta_y` |
| `scroll` | `onScroll` | No, derived | `scroll_left`, `scroll_top` |
| `focus` | `onFocus` | No, derived | `related_target` |
| `blur` | `onBlur` | No, derived | `related_target` |

Every `NodeEventMap` value also contains:

```ts
{
    type: string
    source_event: EventSource | null
    target: Node
    current_target: Node
    stopPropagation(): void
}
```

`Node` and `EventSource` are shown structurally here; neither has a public import path. `EventSource` is a browser `Event` or the pointer/wheel-compatible source object accepted by Uno. `target` stays fixed during bubbling while `current_target` changes for each listener. `event.stopPropagation()` stops Uno's node bubbling only; call `event.source_event?.stopPropagation()` separately when the platform event must also stop.

## Forwarding WebGPU events

`PLATFORM_EVENT_NAMES` contains exactly `pointerdown`, `pointermove`, `pointerup`, `pointercancel`, and `wheel`.

```ts
import { PLATFORM_EVENT_NAMES } from 'uno-ui/events'

for (const type of PLATFORM_EVENT_NAMES) {
    canvas.addEventListener(type, (source_event) => {
        ui.dispatchPlatformEvent(source_event as PointerEvent | WheelEvent)
    })
}
```

`UIWebGPU` transforms client coordinates into logical UI coordinates. World-space adapters additionally need the engine camera:

```ts
canvas.addEventListener('pointermove', (source_event) => {
    world_ui.dispatchPlatformEvent(source_event, { camera })
})
```

`UIDom` installs listeners on its root element during creation, so do not forward the same events manually in DOM mode.

## WebGPU dispatch behavior

- A pointer target is captured on `pointerdown`; move/up/cancel continue to that target until the pointer ends.
- Hover follows the current hit-tested node and produces `pointerover`/`pointerout` transitions.
- `click` is synthesized only when pointer up resolves to the original target and scrolling did not begin.
- Pointer down moves Uno focus. `node.focus()` and `node.blur()` can change it programmatically.
- An eligible non-mouse pointer drag updates scrolling on each move. Once either movement axis exceeds 10 pixels, Uno marks the gesture as scrolling and suppresses click synthesis. Mouse dragging is not used for scrolling.
- Wheel line deltas are normalized to 16 pixels. Scrolling selects the first scrollable ancestor that can move in the requested direction.
- `pointerEvents: 'none'` excludes a WebGPU node from hit testing.

`UIDom` instead delegates pointer targeting, hover, click, and scroll detection to native DOM events, then presents them through the same Uno payloads and bubbling API.

## Imperative listeners

`node.on()` and `node.off()` use normalized events:

```ts
function onPointerMove(event: NodeEventMap['pointermove']) {
    position.text(`${event.x}, ${event.y}`)
}

node.on('pointermove', onPointerMove)
node.off('pointermove', onPointerMove)
```

Unlike `EventEmitter.on()`, `node.on()` does not return an unsubscribe function. Node destruction removes all of its listeners.

`ui.events` exposes the pre-bubbling UI event payloads described by `UIEventMap`. Most applications should prefer node listeners.

## `EventEmitter`

`EventEmitter<TEvents>` is exported for application and integration use:

```ts
const events = new EventEmitter<{ ready: { time: number } }>()
const off = events.on('ready', ({ time }) => console.log(time))

events.emit('ready', { time: performance.now() })
off()
events.destroy()
```

Methods are:

- `on(type, listener)`: adds a set-backed listener and returns an unsubscribe callback.
- `off(type, listener)`: removes the listener.
- `emit(type, payload?)`: synchronously calls current listeners.
- `destroy()`: clears all listeners.

Adding the same function more than once for one event type does not duplicate it.

## Custom event definitions

Every UI creation option accepts `defined_events`, an array of factories. Built-in definitions are already prepended; do not add `DEFINED_EVENTS` again to `UIWebGPU` or a world-space adapter.

```ts
import UIWebGPU from 'uno-ui/UIWebGPU'
import type { UIWebGPUOptions } from 'uno-ui/UIWebGPU'

type DefinedEventFactory = NonNullable<UIWebGPUOptions['defined_events']>[number]

const definePress: DefinedEventFactory = ({ ui }) => {
    const off = ui.events_source.on('press-source', ({ target, value }) => {
        ui.events.emit('press', {
            source_event: null,
            event_data: { value },
            target,
        })
    })

    return {
        types: [{
            platform: false,
            name: 'press',
            prop: 'onPress',
            priority: 'discrete',
        }],
        destroy: off,
    }
}

const { ui } = await UIWebGPU.create({
    resources,
    loadYoga,
    defined_events: [definePress],
})
```

Each returned definition has `types`, `destroy()`, and an optional `destroyNode(node)` cleanup hook. Framework adapters map each descriptor's `prop` to the normalized event `name`. React recognizes the priorities `discrete`, `continuous`, and `default` when scheduling updates.
