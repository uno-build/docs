<script setup>
import { onUnmounted, ref, watch } from 'vue'
import { View, Text, Image, Input } from '@uno/ui/vue'

let dom_input = null
const name = ref('Vue')
const hovered = ref(false)
const focused = ref(false)

watch(name, (value) => {
  if (dom_input && dom_input.value !== value) {
    dom_input.value = value
  }
})

onUnmounted(() => {
  if (dom_input) {
    dom_input.onblur = null
    dom_input.remove()
    dom_input = null
  }
})

function focusInput(event) {
  focused.value = true
  if (typeof document === 'undefined') return

  if (!dom_input) {
    // The DOM input captures typing, paste, and IME for the Uno input.
    const input = document.createElement("input");
    input.tabIndex = -1;
    input.style.cssText = "position: fixed; left: 0; bottom: 0; width: 0px; height: 0px; opacity: 0; pointer-events: none;";
    input.oninput = () => (name.value = input.value);
    document.body.appendChild(input);
    dom_input = input;
  }

  const input = dom_input
  input.value = name.value
  input.onblur = () => event.target.blur()
  input.focus({ preventScroll: true })
}

function blurInput() {
  focused.value = false
  dom_input?.blur()
}
</script>

<template>
  <View class="page">
    <Image src="assets/coin.png" width="64px" />

    <Text class="greeting">{{ name ? `Hello, ${name}!` : 'Your name' }}</Text>

    <Input
      :value="name"
      placeholder="Your name"
      @focus="focusInput"
      @blur="blurInput"
      class="input"
      :style="{ border: focused ? '2px solid #42B883' : '2px solid #B7C5BF' }"
    />

    <View
      @click="name = ''"
      @pointer-over="name && (hovered = true)"
      @pointer-out="hovered = false"
      class="button"
      :style="{ backgroundColor: name ? (hovered ? '#3DB17E' : '#42B883') : '#B7C5BF' }"
    >
      <Text class="button-text">Clear</Text>
    </View>
  </View>
</template>

<style scoped>
.page {
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border-radius: 12px;
  background-color: #F5F2EC;
  font-family: ChangaOne;
}

.greeting {
  font-size: 28px;
  color: #213547;
}

.input {
  width: 240px;
  height: 44px;
  padding: 0px 12px;
  font-size: 18px;
  color: #213547;
  background-color: #FFFFFF;
  border-radius: 12px;
}

.button {
  width: 240px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.button-text {
  font-size: 16px;
  color: #213547;
  pointer-events: none;
}
</style>
