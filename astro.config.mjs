import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://thoroc.github.io',
  integrations: [vue()],
})
