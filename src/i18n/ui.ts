export const languages = {
  en: 'English',
  fr: 'Français',
} as const

export type Lang = keyof typeof languages

export const defaultLang: Lang = 'en'

export const ui = {
  en: {
    'site.title': 'thoroc — selected work',
    'nav.home': 'Home',
    'nav.projects': 'Projects',
    'home.tagline': 'A few things I built.',
    'home.intro':
      'Hand-picked projects. Each one has a short write-up of why it exists and what it taught me.',
    'card.demo': 'Live demo',
    'card.source': 'Source',
    'card.readMore': 'Read the story',
    'footer.tagline': 'Built with Astro',
    'notFound.title': 'Page not found',
    'notFound.text': 'This page does not exist.',
    'notFound.back': 'Back home',
    'theme.label': 'Theme',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
  },
  fr: {
    'site.title': 'thoroc — travaux choisis',
    'nav.home': 'Accueil',
    'nav.projects': 'Projets',
    'home.tagline': 'Quelques choses que j’ai construites.',
    'home.intro':
      'Projets sélectionnés à la main. Chacun a une courte note sur pourquoi il existe et ce qu’il m’a appris.',
    'card.demo': 'Démo en ligne',
    'card.source': 'Code source',
    'card.readMore': 'Lire l’histoire',
    'footer.tagline': 'Conçu avec Astro',
    'notFound.title': 'Page introuvable',
    'notFound.text': 'Cette page n’existe pas.',
    'notFound.back': 'Retour à l’accueil',
    'theme.label': 'Thème',
    'theme.light': 'Clair',
    'theme.dark': 'Sombre',
    'theme.system': 'Système',
  },
} as const

export type UiKey = keyof typeof ui.en

export function useTranslations(lang: Lang) {
  return (key: UiKey) => ui[lang][key]
}
