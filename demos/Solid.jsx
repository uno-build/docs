import { createEffect, createSignal, onSettled } from 'solid-js'
import { View, Text, Image, Input } from '@uno/ui/solid'

export default function App() {
  let dom_input = null
  const [getName, setName] = createSignal('Solid')
  const [isHovered, setHovered] = createSignal(false)
  const [isFocused, setFocused] = createSignal(false)

  createEffect(getName, (value) => {
    if (dom_input && dom_input.value !== value) {
      dom_input.value = value
    }
  })

  onSettled(() => () => {
    if (dom_input) {
      dom_input.onblur = null
      dom_input.remove()
      dom_input = null
    }
  })

  function focusInput(event) {
    setFocused(true)
    if (typeof document === 'undefined') return

    if (!dom_input) {
      // The DOM input captures typing, paste, and IME for the Uno input.
      const input = document.createElement('input')
      input.tabIndex = -1
      input.style.cssText = 'position: fixed; left: 0; bottom: 0; width: 0px; height: 0px; opacity: 0; pointer-events: none;'
      input.oninput = () => setName(input.value)
      document.body.appendChild(input)
      dom_input = input
    }

    const input = dom_input
    input.value = getName()
    input.onblur = () => event.target.blur()
    input.focus({ preventScroll: true })
  }

  function blurInput() {
    setFocused(false)
    dom_input?.blur()
  }

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        backgroundColor: '#F5F2EC',
        fontFamily: 'ChangaOne',
      }}
    >
      <Image src="assets/coin.png" width="64px" />

      <Text style={{ fontSize: '28px', color: '#1f3b77' }}>
        {getName() ? `Hello, ${getName()}!` : 'Your name'}
      </Text>

      <Input
        value={getName()}
        placeholder="Your name"
        onFocus={focusInput}
        onBlur={blurInput}
        style={{
          width: '240px',
          height: '44px',
          padding: '0px 12px',
          fontSize: '18px',
          color: '#1f3b77',
          backgroundColor: '#FFFFFF',
          border: isFocused() ? '2px solid #4377bb' : '2px solid #c7dfef',
          borderRadius: '12px',
        }}
      />

      <View
        onClick={() => setName('')}
        onPointerOver={() => getName() && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        style={{
          width: '240px',
          height: '44px',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getName() ? (isHovered() ? '#518ac8' : '#4377bb') : '#c7dfef',
          borderRadius: '12px',
        }}
      >
        <Text style={{ fontSize: '16px', color: '#ffffff', pointerEvents: 'none' }}>
          Clear
        </Text>
      </View>
    </View>
  )
}
