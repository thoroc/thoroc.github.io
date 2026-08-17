import type { SFCScriptBlock } from '@vue/compiler-sfc'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { plugin } from 'bun'

plugin({
  name: 'vue-sfc-loader',
  setup(build) {
    build.onLoad({ filter: /\.vue$/ }, async (args) => {
      const source = await Bun.file(args.path).text()
      const { descriptor } = parse(source, { filename: args.path })
      const id = args.path
      const hasScoped = descriptor.styles.some((s) => s.scoped)
      const scopeId = hasScoped
        ? `data-v-${Bun.hash(id).toString(36)}`
        : undefined

      let scriptBlock: SFCScriptBlock
      try {
        scriptBlock = compileScript(descriptor, { id })
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        throw new Error(`compileScript failed for ${id}: ${message}`)
      }

      let code = scriptBlock.content
      // compileScript emits `export default /*#__PURE__*/ _defineComponent({...})`
      // rename the default export so we can attach a compiled render fn to it.
      code = code.replace('export default', 'const __sfc__ =')

      if (descriptor.template) {
        const templateResult = compileTemplate({
          source: descriptor.template.content,
          filename: id,
          id,
          scoped: hasScoped,
          isProd: false,
          compilerOptions: {
            bindingMetadata: scriptBlock.bindings,
          },
        })
        if (templateResult.errors.length) {
          throw new Error(
            `compileTemplate failed for ${id}: ${templateResult.errors.join('; ')}`,
          )
        }
        code += `\n${templateResult.code.replace('export function render', 'function render')}`
        code += `\n__sfc__.render = render`
      }
      if (scopeId) {
        code += `\n__sfc__.__scopeId = ${JSON.stringify(scopeId)}`
      }
      code += `\n__sfc__.__file = ${JSON.stringify(id)}`
      code += `\nexport default __sfc__`

      return { contents: code, loader: 'ts' }
    })
  },
})
