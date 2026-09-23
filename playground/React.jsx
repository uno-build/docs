import { useEffect, useRef, useState } from 'react'
import { View, Text, Image, Input } from '@uno/ui/react'

export default function App() {
  const domInput = useRef(null)
  const [name, setName] = useState('')
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (domInput.current && domInput.current.value !== name) {
      domInput.current.value = name
    }
  }, [name])

  useEffect(
    () => () => {
      if (domInput.current) {
        domInput.current.onblur = null
        domInput.current.remove()
        domInput.current = null
      }
    },
    [],
  )

  function focusInput(event) {
    setFocused(true)
    if (typeof document === 'undefined') return

    if (!domInput.current) {
      // The DOM input captures typing, paste, and IME for the Uno input.
      const input = document.createElement('input')
      input.type = 'text'
      input.tabIndex = -1
      input.setAttribute('aria-label', 'Your name')
      input.style.cssText =
        'position: fixed; left: 0; bottom: 0; width: 1px; height: 1px; opacity: 0; pointer-events: none;'
      input.oninput = () => setName(input.value)
      document.body.appendChild(input)
      domInput.current = input
    }

    const input = domInput.current
    input.value = name
    input.onblur = () => event.target.blur()
    input.focus({ preventScroll: true })
  }

  function blurInput() {
    setFocused(false)
    domInput.current?.blur()
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
        borderRadius: '12px',
        backgroundColor: '#F5F2EC',
        fontFamily: 'ChangaOne',
      }}
    >
      <Image src="assets/coin.png" width="64px" />

      <Text style={{ fontSize: '28px', color: '#302840' }}>{name ? `Hello, ${name}!` : 'Your name'}</Text>

      <Input
        value={name}
        placeholder="Your name"
        onFocus={focusInput}
        onBlur={blurInput}
        style={{
          width: '240px',
          height: '44px',
          padding: '0px 12px',
          fontSize: '18px',
          color: '#302840',
          backgroundColor: '#FFFFFF',
          border: focused ? '2px solid #7962EF' : '2px solid #B7B0C5',
          borderRadius: '12px',
        }}
      />

      <View
        onClick={() => setName('')}
        onPointerOver={() => name && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        style={{
          width: '240px',
          height: '44px',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: name ? (hovered ? '#5E49CD' : '#7962EF') : '#B7B0C5',
          borderRadius: '12px',
        }}
      >
        <Text style={{ fontSize: '16px', color: '#FFFFFF', pointerEvents: 'none' }}>Clear</Text>
      </View>
    </View>
  )
}
