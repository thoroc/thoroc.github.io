<script setup lang="ts">
import { computed } from 'vue'
import { useStarsI18n } from '../composables/useStarsI18n'
import {
  patchLanguageInQuery,
  useStarsStore,
} from '../composables/useStarsStore'
import { langColor, langSlug } from '../utils/lang-colors'
import { OTHER_LANGUAGE_KEY } from '../utils/other-language'
import { buildLanguageOptions } from '../utils/stars-filter'

const store = useStarsStore()
const { t } = useStarsI18n()

const langLabel = (name: string): string =>
  name === OTHER_LANGUAGE_KEY ? t.value('otherLang') : name

const allItem = computed(() => ({
  key: 'all',
  name: 'all',
  count: store.total,
  label: t.value('langAll'),
  active: store.language === 'all',
}))

const langItems = computed(() => {
  const options = buildLanguageOptions(store.items || [])
  return options.map((opt) => ({
    key: opt.name,
    name: opt.name,
    count: opt.count,
    label: langLabel(opt.name),
    active: store.language === opt.name,
  }))
})

const onLangClick = (key: string): void => {
  patchLanguageInQuery(key === 'all' ? 'all' : key)
}
</script>

<template>
  <div v-if="!store.loading && !store.error" class="stars-sidebar-lang-wrap">
    <button
      type="button"
      class="stars-sidebar-lang__link stars-sidebar-lang__all"
      :class="{ 'is-active': allItem.active }"
      @click="onLangClick('all')"
    >
      <span class="stars-sidebar-lang__label">{{ allItem.label }}</span>
      <span class="stars-sidebar-lang__count">{{ allItem.count }}</span>
    </button>
    <nav class="stars-sidebar-lang" :aria-label="t('filterLang')">
      <button
        v-for="item in langItems"
        :key="item.key"
        type="button"
        class="stars-sidebar-lang__link"
        :class="[{ 'is-active': item.active }, `lang--${langSlug(item.name)}`]"
        :style="{ '--lang-accent': langColor(item.name) }"
        @click="onLangClick(item.key)"
      >
        <span class="stars-sidebar-lang__dot" />
        <span class="stars-sidebar-lang__label">{{ item.label }}</span>
        <span class="stars-sidebar-lang__count">{{ item.count }}</span>
      </button>
    </nav>
  </div>
</template>
