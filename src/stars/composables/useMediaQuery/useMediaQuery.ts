import { onMounted, onUnmounted, type Ref, ref } from 'vue'

/** query 例如 '(max-width: 768px)' */
export const useMediaQuery = (query: string): Ref<boolean> => {
  const matches = ref(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  let mql: MediaQueryList | undefined

  const update = (): void => {
    matches.value = !!mql?.matches
  }

  onMounted(() => {
    mql = window.matchMedia(query)
    update()
    mql.addEventListener('change', update)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', update)
  })

  return matches
}
