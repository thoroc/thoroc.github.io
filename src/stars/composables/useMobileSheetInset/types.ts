import type { ComputedRef, Ref } from 'vue'

export type OpenSource = Ref<boolean> | ComputedRef<boolean> | (() => boolean)
