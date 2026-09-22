export async function getReactComponent(filename) {
    const source = await fetch(`/${filename}`).then((response) => response.text())
    const { code } = Babel.transform(source, {
        filename: filename,
        presets: [['react', { runtime: 'automatic' }]],
    })
    const module_url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))
    const { default: Component } = await import(module_url)
    URL.revokeObjectURL(module_url)
    return Component
}