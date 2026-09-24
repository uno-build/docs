export async function getReactComponent(filename) {
  const response = await fetch(new URL(filename, document.baseURI))
  if (!response.ok) throw new Error(`Failed to load ${filename}: ${response.status}`)
  const source = await response.text()
  const { code } = Babel.transform(source, {
    filename,
    presets: [['react', { runtime: 'automatic' }]],
  })
  const module_url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))
  try {
    const { default: Component } = await import(module_url)
    return Component
  } finally {
    URL.revokeObjectURL(module_url)
  }
}

export async function getSolidComponent(filename) {
  const [{ compilerConfig }, { default: solidJsx }] = await Promise.all([
    import('@uno/ui/solid/config'),
    import('@dom-expressions/babel-plugin-jsx'),
  ])
  const response = await fetch(new URL(filename, document.baseURI))
  if (!response.ok) throw new Error(`Failed to load ${filename}: ${response.status}`)
  const source = await response.text()
  const { code } = Babel.transform(source, {
    filename,
    plugins: [[solidJsx, compilerConfig.solid]],
  })
  const module_url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))
  try {
    const { default: Component } = await import(module_url)
    return Component
  } finally {
    URL.revokeObjectURL(module_url)
  }
}

// Loads one JavaScript <script setup> SFC; its imports must resolve through the import map or absolute URLs.
export async function getVueComponent(filename) {
  const [{ registerStyleSheet }, { compilerConfig, compileStyles }, { parse, compileScript }] = await Promise.all([
    import('@uno/ui/vue'),
    import('@uno/ui/vue/config'),
    import('vue/compiler-sfc'),
  ])
  const source_url = new URL(filename, document.baseURI)
  const response = await fetch(source_url)
  if (!response.ok) throw new Error(`Failed to load ${filename}: ${response.status}`)
  const source = await response.text()
  const { descriptor, errors } = parse(source, { filename })
  if (errors.length > 0) throw new Error(String(errors[0]))

  const scope_id = `data-v-${crypto.randomUUID()}`
  const rules = await compileStyles(descriptor, scope_id)
  const { content: code } = compileScript(descriptor, {
    id: scope_id,
    inlineTemplate: true,
    templateOptions: compilerConfig.template,
  })

  const module_url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))
  try {
    const { default: Component } = await import(module_url)
    if (descriptor.styles.some((block) => block.scoped)) Component.__scopeId = scope_id
    registerStyleSheet(source_url.href, rules)
    return Component
  } finally {
    URL.revokeObjectURL(module_url)
  }
}
