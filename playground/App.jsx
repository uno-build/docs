import { useState } from 'react'
import { View, Text, Image, ScrollView } from '@uno/ui/react'

const PACKS = [
  { id: 'single', name: 'Just a coin', description: 'Every little bit counts.', value: 1, color: '#FFF0CF' },
  { id: 'stack', name: 'A little stack', description: 'Keep the good things growing.', value: 10, color: '#EAE7FF' },
  { id: 'pouch', name: 'The treasure pouch', description: 'A big boost for your vault.', value: 50, color: '#DEF2E8' },
]
const GOAL = 500

function Button({ children, onClick, disabled = false, subtle = false, compact = false }) {
  const [hovered, setHovered] = useState(false)

  return (
    <View
      onClick={disabled ? undefined : onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      style={{
        height: '40px',
        minWidth: '40px',
        padding: compact ? '0px' : '0px 16px',
        flexShrink: '0',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        backgroundColor: subtle ? (hovered ? '#DED9F4' : '#EFECF7') : (hovered ? '#5E49CD' : '#7962EF'),
        opacity: disabled ? '0.4' : '1',
        pointerEvents: disabled ? 'none' : 'all',
      }}
    >
      <Text style={{ fontSize: '16px', color: subtle ? '#44356B' : '#FFFFFF', pointerEvents: 'none' }}>
        {children}
      </Text>
    </View>
  )
}

export default function App() {
  const [quantities, setQuantities] = useState({ single: 2, stack: 1, pouch: 1 })
  const coin_total = PACKS.reduce((total, pack) => total + pack.value * quantities[pack.id], 0)
  const pack_total = PACKS.reduce((total, pack) => total + quantities[pack.id], 0)
  const collected_packs = PACKS.filter((pack) => quantities[pack.id] > 0)
  const progress = Math.min(100, (coin_total / GOAL) * 100)

  function changeQuantity(id, change) {
    setQuantities((current) => ({ ...current, [id]: Math.max(0, current[id] + change) }))
  }

  return (
    <ScrollView
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F2EC',
        borderRadius: '24px',
        fontFamily: 'ChangaOne',
      }}
    >
      <View style={{ width: '100%', maxWidth: '900px', alignSelf: 'center', flexDirection: 'column', padding: '24px', gap: '24px' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <View style={{ flexDirection: 'column', gap: '4px' }}>
            <Text style={{ fontSize: '32px', color: '#302840' }}>Pocket vault</Text>
            <Text style={{ fontSize: '16px', color: '#867E92' }}>Little coins. Big possibilities.</Text>
          </View>
          <View style={{ padding: '8px 12px', backgroundColor: '#E8E1F4', borderRadius: '10px' }}>
            <Text style={{ fontSize: '13px', color: '#7962B4' }}>YOUR PERSONAL TREASURE</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '24px', backgroundColor: '#7962EF', borderRadius: '20px' }}>
          <View style={{ flexDirection: 'column', gap: '4px' }}>
            <Text style={{ fontSize: '15px', color: '#DFD7FF' }}>TOTAL IN YOUR VAULT</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
              <Text style={{ fontSize: '56px', color: '#FFFFFF' }}>{coin_total}</Text>
              <Text style={{ fontSize: '22px', color: '#DFD7FF' }}>coins</Text>
            </View>
            <Text style={{ fontSize: '16px', color: '#DFD7FF' }}>
              {pack_total} {pack_total === 1 ? 'pack' : 'packs'} collected so far
            </Text>
          </View>
          <View style={{ width: '104px', height: '104px', alignItems: 'center', justifyContent: 'center', borderRadius: '28px', backgroundColor: '#917CF6' }}>
            <Image src="assets/coin.png" width="84px" />
          </View>
        </View>

        <View style={{ flexDirection: 'column', gap: '12px' }}>
          <Text style={{ fontSize: '22px', color: '#302840' }}>Add a little treasure</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '12px' }}>
            {PACKS.map((pack) => (
              <View key={pack.id} style={{ flexDirection: 'column', flexGrow: '1', flexBasis: '200px', minWidth: '180px', padding: '18px', gap: '12px', backgroundColor: '#FFFFFF', borderRadius: '18px' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ width: '58px', height: '58px', backgroundColor: pack.color, borderRadius: '16px', alignItems: 'center', justifyContent: 'center' }}>
                    <Image src="assets/coin.png" width="42px" />
                  </View>
                  <Text style={{ fontSize: '26px', color: '#7962EF' }}>+{pack.value}</Text>
                </View>
                <View style={{ flexDirection: 'column', gap: '4px', flexGrow: '1' }}>
                  <Text style={{ fontSize: '20px', color: '#302840' }}>{pack.name}</Text>
                  <Text style={{ fontSize: '14px', color: '#867E92' }}>{pack.description}</Text>
                </View>
                <Button onClick={() => changeQuantity(pack.id, 1)}>+ Add to vault</Button>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'column', padding: '20px', gap: '16px', backgroundColor: '#FFFFFF', borderRadius: '20px' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <Text style={{ fontSize: '22px', color: '#302840' }}>Inside your vault</Text>
            <Button subtle disabled={pack_total === 0} onClick={() => setQuantities({ single: 0, stack: 0, pouch: 0 })}>
              Empty vault
            </Button>
          </View>

          {collected_packs.length === 0 ? (
            <View style={{ flexDirection: 'column', alignItems: 'center', padding: '24px 8px', gap: '8px' }}>
              <Image src="assets/coin.png" width="48px" style={{ opacity: '0.4' }} />
              <Text style={{ fontSize: '20px', color: '#302840', textAlign: 'center' }}>Room for something good.</Text>
              <Text style={{ fontSize: '15px', color: '#867E92', textAlign: 'center' }}>Pick a pack above to start collecting.</Text>
            </View>
          ) : collected_packs.map((pack) => (
            <View key={pack.id} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px', backgroundColor: '#F8F6FB', borderRadius: '14px' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                <Image src="assets/coin.png" width="32px" />
                <View style={{ flexDirection: 'column', gap: '4px' }}>
                  <Text style={{ fontSize: '18px', color: '#302840' }}>{pack.name}</Text>
                  <Text style={{ fontSize: '14px', color: '#867E92' }}>
                    {pack.value} {pack.value === 1 ? 'coin' : 'coins'} per pack
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <Button subtle compact onClick={() => changeQuantity(pack.id, -1)}>-</Button>
                <Text style={{ width: '32px', fontSize: '20px', color: '#302840', textAlign: 'center' }}>{quantities[pack.id]}</Text>
                <Button subtle compact onClick={() => changeQuantity(pack.id, 1)}>+</Button>
                <Text style={{ minWidth: '48px', fontSize: '20px', color: '#7962EF', textAlign: 'right' }}>
                  {quantities[pack.id] * pack.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'column', gap: '10px', padding: '4px' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px' }}>
            <Text style={{ fontSize: '18px', color: '#302840' }}>
              {coin_total >= GOAL ? 'Treasure goal unlocked!' : 'Next stop: 500 coins'}
            </Text>
            <Text style={{ fontSize: '16px', color: '#867E92' }}>{Math.floor(progress)}% collected</Text>
          </View>
          <View style={{ height: '10px', backgroundColor: '#E7E1EF', borderRadius: '5px', overflow: 'hidden' }}>
            <View style={{ width: `${progress}%`, height: '100%', backgroundColor: coin_total >= GOAL ? '#53B28E' : '#7962EF', borderRadius: '5px' }} />
          </View>
          <Text style={{ fontSize: '14px', color: '#867E92' }}>
            {coin_total >= GOAL ? 'Keep collecting. Your vault has room for more.' : `${GOAL - coin_total} more coins to fill your treasure chest.`}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
