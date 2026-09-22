import { useState } from 'react'
import { View } from '@uno/ui/react'

export default function App({}) {
  const [hovered, setHovered] = useState(false)

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        style={{
          width: '200px',
          height: '150px',
          backgroundColor: '#8080FD',
          opacity: hovered ? '0.5' : '1',
        }}
      ></View>
    </View>
  )
}
