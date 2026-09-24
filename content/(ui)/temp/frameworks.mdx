---
title: "Framework adapters"
---

Uno UI provides custom renderers for React, Solid, and Vue. They render the same Uno node tree and can be used with any initialized UI, including `UIWebGPU` and the world-space integrations.

Use only the published entrypoints:

| Framework | Runtime entrypoint | Build configuration |
| --- | --- | --- |
| React | `uno-ui/react` | Standard automatic JSX runtime |
| Solid | `uno-ui/solid` | `uno-ui/solid/config` |
| Vue | `uno-ui/vue` | `uno-ui/vue/config` |

There is no package-root `uno-ui` export.

## Shared component model

Each adapter exports `View`, `Text`, `Image`, `ScrollView`, and `Input`.

| Component | Purpose |
| --- | --- |
| `View` | A layout and paint container. |
| `Text` | A text leaf. It cannot contain component or element children. |
| `Image` | A view whose background uses a registered image resource. |
| `ScrollView` | A clipping view with a separate scrollable content node. |
| `Input` | A controlled value, placeholder, focus state, and caret. It does not collect keyboard input. |

All components accept Uno `style` objects and Uno event props such as `onPointerDown`, `onClick`, `onWheel`, `onScroll`, `onFocus`, and `onBlur`. Style values are strings, including values that are commonly numbers in browser CSS-in-JS:

```tsx
<View style={{ width: '240px', opacity: '0.8', padding: '16px' }} />
```

Event handlers receive Uno events. The event exposes `target`, `current_target`, `source_event`, and `stopPropagation()`, plus data specific to its type. Custom event props are available when the UI was created with matching custom event definitions.

### Root lifecycle and UI context

Every adapter exports the same root interface:

```ts
const root = registerRootComponent(App, { ui })

root.render(props)
root.unmount()
```

Use one framework root per UI. Framework commits call `ui.update()` automatically. The application remains responsible for calling `ui.draw()` when its renderer needs to draw, normally from the application's render loop.

`root.unmount()` removes the framework-owned nodes and runs framework cleanup. It does not destroy the UI or dispose its resources.

React and Vue treat another `root.render(props)` call as an update and preserve component state. Mount a Solid root once and drive subsequent changes with signals; `render()` creates a Solid root rather than acting as a root-prop update API.

Inside a registered component tree, `useUI()` returns that root's UI. Its generic parameter can retain the concrete UI type:

```ts
import type UIWebGPU from 'uno-ui/UIWebGPU'
import { useUI } from 'uno-ui/react'

export function useCurrentUI() {
    return useUI<UIWebGPU>()
}
```

Call `useUI()` only inside a tree mounted by `registerRootComponent`.

### Shared props and handles

The adapters export their component prop types, `StyleProps`, `StyleName`, and these handle types. In the simplified shapes below, `Node` denotes the underlying Uno node carried by the exported handle:

```ts
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

React and Vue refs on `View`, `Text`, and `Image` receive a stable `NodeHandle`. Solid refs on those three components receive the Uno node directly. All three adapters use `ScrollViewHandle` and `InputHandle` for the compound components.

`ScrollView` is vertical by default. Set `horizontal` to use a horizontal flex direction and horizontal scrolling. Its `main` node is the viewport and its `content` node contains the children.

`Image` requires `src` to be registered in the UI's resources before rendering. With neither dimension set, it uses the registered image size. With only `width` or `height`, it preserves the registered aspect ratio. Values in `style` take precedence over the `width` and `height` props. Set `style.objectFit` to `fill`, `contain`, `cover`, or `none`.

### Text restrictions

Text content must be placed inside `Text`; a string directly inside `View` is invalid. `Text` accepts strings, numbers, nested primitive arrays, and empty conditional values. Booleans, `null`, and `undefined` render as empty text.

Elements and components inside `Text` are unsupported because an Uno text node cannot have child nodes. In React, this also means that a React fragment passed as a `Text` child is unsupported. Use sibling `Text` nodes or join the value before passing it.

### Controlled Input

`Input` is a presentation component. Its `value` prop is the only source of displayed input text. It has no `onChange` event, does not create a DOM input, and does not read keyboard, IME, selection, or clipboard input.

The component:

- renders `placeholder` only while the value is empty and the input is unfocused;
- uses `placeholderTextColor`, which defaults to `#777777`;
- displays a blinking caret while focused;
- forwards `onFocus`, `onBlur`, and `onPointerDown`, calling `preventDefault()` on the source pointer event before the pointer callback;
- exposes `focus()` and `blur()` through `InputHandle`.

Calling `focus()` changes Uno focus and caret state; it does not open a platform keyboard. Browser applications that need typing can bridge a hidden native `<input>` and copy its value into framework state. Native hosts should provide their own equivalent text-input bridge.

## React

Install the adapter's optional peers:

```sh
npm install uno-ui react@^19.3.0 react-reconciler@^0.34.0
npm install --save-dev @types/react@^19.3.0
```

Use the standard automatic JSX runtime. No React-specific compiler plugin or `react-dom` is required:

```json
{
    "compilerOptions": {
        "jsx": "react-jsx"
    }
}
```

A root can be mounted around any initialized Uno UI:

```tsx
import { useState } from 'react'
import type UIWebGPU from 'uno-ui/UIWebGPU'
import { Text, View, registerRootComponent } from 'uno-ui/react'

type AppProps = { label: string }

function App({ label }: AppProps) {
    const [count, setCount] = useState(0)

    return (
        <View
            onClick={() => setCount((current) => current + 1)}
            style={{ padding: '16px', backgroundColor: '#172554' }}
        >
            <Text style={{ color: '#ffffff' }}>
                {label}: {count}
            </Text>
        </View>
    )
}

export function mountReactApp(ui: UIWebGPU) {
    const root = registerRootComponent(App, { ui })
    root.render({ label: 'Clicks' })
    return root
}
```

React hooks, context, keyed children, refs, error boundaries, and Strict Mode work through the custom renderer. The adapter does not use the DOM renderer and has no SSR or hydration path. Portals, Suspense, and Activity do not have adapter-specific support.

`uno-ui/react` also exports `ComponentProps`, `TextChildren`, `TextProps`, `ImageProps`, `ScrollViewProps`, and `InputProps` for typed wrappers.

## Solid

Install Solid and its universal renderer. The current adapter targets the Solid 2 release candidate used by the package:

```sh
npm install uno-ui solid-js@^2.0.0-rc.8 @solidjs/universal@^2.0.0-rc.8
npm install --save-dev vite@^8.2.1 @solidjs/vite-plugin@3.0.0-next.28
```

Pass the published compiler configuration to the Solid Vite plugin. It compiles JSX against `uno-ui/solid` instead of the DOM renderer:

```ts
import { defineConfig } from 'vite'
import solid from '@solidjs/vite-plugin'
import { compilerConfig } from 'uno-ui/solid/config'

export default defineConfig({
    plugins: [solid(compilerConfig)],
})
```

Mount once, then use Solid signals for updates:

```tsx
import { createSignal } from 'solid-js'
import type UIWebGPU from 'uno-ui/UIWebGPU'
import { Text, View, registerRootComponent } from 'uno-ui/solid'

function App() {
    const [count, setCount] = createSignal(0)

    return (
        <View onClick={() => setCount((current) => current + 1)} style={{ padding: '16px' }}>
            <Text>Clicks: {count()}</Text>
        </View>
    )
}

export function mountSolidApp(ui: UIWebGPU) {
    const root = registerRootComponent(App, { ui })
    root.render({})
    return root
}
```

`View`, `Text`, and `Image` refs receive the underlying Uno node rather than a `NodeHandle`. `ScrollView` and `Input` refs receive their shared compound handles.

`uno-ui/solid` exports `ComponentProps`, `ImageProps`, `ScrollViewProps`, and `InputProps` for typed wrappers.

The `uno-ui/solid` entrypoint also exports the renderer primitives expected by compiled Solid output: `effect`, `memo`, `createComponent`, `createElement`, `createTextNode`, `insert`, `insertNode`, `spread`, `setProp`, `mergeProps`, `applyRef`, and `ref`. They form the adapter's compiler-facing surface; application code normally uses JSX instead of calling them directly.

## Vue

Install Vue and its Vite plugin:

```sh
npm install uno-ui vue@^3.5.42
npm install --save-dev vite@^8.2.1 @vitejs/plugin-vue@^6.0.9
```

Use both published configuration exports. `compilerConfig` disables DOM-specific asset transforms and static hoisting. `stylesPlugin()` converts supported SFC styles into Uno style rules:

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { compilerConfig, stylesPlugin } from 'uno-ui/vue/config'

export default defineConfig({
    plugins: [vue(compilerConfig), stylesPlugin()],
})
```

Register an SFC directly instead of creating a DOM Vue application:

```ts
import type UIWebGPU from 'uno-ui/UIWebGPU'
import { registerRootComponent } from 'uno-ui/vue'
import App from './App.vue'

export function mountVueApp(ui: UIWebGPU) {
    const root = registerRootComponent(App, { ui })
    root.render({ title: 'Uno' })
    return root
}
```

Components are used normally in the SFC template:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Text, View } from 'uno-ui/vue'

defineProps<{ title: string }>()

const active = ref(false)
</script>

<template>
    <View class="card" :class="{ active }" @click="active = !active">
        <Text>{{ title }}</Text>
    </View>
</template>

<style scoped>
.card {
    padding: 16px;
    background-color: #ffffff;
}

.card.active {
    background-color: #d9f0e4;
}
</style>
```

### Vue CSS subset

`View`, `Text`, `Image`, `ScrollView`, and `Input` accept Vue `class` values as strings, arrays, or objects. Inline `:style` values override class rules. Class rules use class specificity followed by stylesheet source order.

Both `<style>` and `<style scoped>` are supported. Unscoped rules apply to Uno Vue components globally. Scoped rules apply to the component's own nodes and to child-component root nodes.

The supported syntax is intentionally small:

- selectors must be class selectors such as `.card`, `.card.active`, or comma-separated class selectors;
- declarations must use properties and values supported by Uno UI;
- CSS property names use kebab case and are converted to Uno's camel-case names;
- style blocks must be inline plain CSS.

Descendant selectors, pseudo-classes, at-rules, nested rules, `!important`, CSS custom properties, `var()`, CSS `v-bind()`, CSS modules, external style blocks, and preprocessors are unsupported. Represent interaction state with `:class` and computed values with `:style`.

### Programmatic Vue styles

Most applications should use `stylesPlugin()`. Tooling can register rules directly through the runtime entrypoint:

```ts
import { registerStyleSheet, removeStyleSheet } from 'uno-ui/vue'
import type { StyleRule } from 'uno-ui/vue'

const style_rules: StyleRule[] = [
    {
        classes: ['card', 'active'],
        scope_id: null,
        style: { backgroundColor: '#d9f0e4' },
    },
]

registerStyleSheet('cards', style_rules)
removeStyleSheet('cards')
```

`uno-ui/vue` also exports the recursive `ClassValue` type. `uno-ui/vue/config` exports `compileStyles(descriptor, scope_id)` for custom SFC tooling; normal Vite applications should use `stylesPlugin()` instead.

The Vue runtime entrypoint exports `ViewProps`, `TextProps`, `ImageProps`, `ScrollViewProps`, and `InputProps` for typed wrappers.
