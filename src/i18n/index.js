import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import pt from './locales/pt.json'
import es from './locales/es.json'
import en from './locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      es: { translation: es },
      en: { translation: en },
    },
    supportedLngs: ['pt', 'es', 'en'],
    nonExplicitSupportedLngs: true,
    fallbackLng: 'pt',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

// Mantém o <html lang="..."> sempre certo (ajuda leitores de tela e o Google)
i18n.on('languageChanged', (idioma) => {
  document.documentElement.lang = idioma
})

export default i18n