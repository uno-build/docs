import ResourcesWebGPU from '@uno/ui/ResourcesWebGPU'
import UI from '@uno/ui/UI'
import { registerRootComponent } from '@uno/ui/react'
import App from '../App.jsx'

const canvas = document.querySelector('canvas')
const resources = await ResourcesWebGPU.create({ canvas })
const { ui } = await UI.create({ resources })

// Font
const font_name = 'ChangaOne'
const response_image = await fetch(`assets/${font_name}.png`)
const blob = await response_image.blob()
const image = await createImageBitmap(blob)
const response_data = await fetch(`assets/${font_name}.json`)
const data = await response_data.json()
resources.registerFont(font_name, { image, data })

// Image
const image_url = 'assets/coin.png'
const response = await fetch(image_url)
const coin_blob = await response.blob()
const coin = await createImageBitmap(coin_blob)
resources.registerImage(image_url, { image: coin })

// React
registerRootComponent(App, { ui }).render({})

ui.root.style('padding', '20px')

function onResize() {
  canvas.width = canvas.clientWidth * window.devicePixelRatio
  canvas.height = canvas.clientHeight * window.devicePixelRatio
  ui.setViewport(canvas.clientWidth, canvas.clientHeight)
  ui.setDevicePixelRatio(window.devicePixelRatio)
  ui.update()
}
window.addEventListener('resize', onResize)
onResize()

requestAnimationFrame(function render() {
  ui.draw()
  requestAnimationFrame(render)
})
