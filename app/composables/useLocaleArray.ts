import enRaw from '../../i18n/locales/en.json?raw'
import esRaw from '../../i18n/locales/es.json?raw'
import frRaw from '../../i18n/locales/fr.json?raw'

const catalogs = {
  es: JSON.parse(esRaw) as Record<string, unknown>,
  en: JSON.parse(enRaw) as Record<string, unknown>,
  fr: JSON.parse(frRaw) as Record<string, unknown>,
}

function resolvePath(source: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in (node as object)) {
      return (node as Record<string, unknown>)[part]
    }
    return undefined
  }, source)
}

/** Arrays del JSON de idioma sin compilación i18n (servicios, highlights, etc.). */
export function useLocaleArray<T = Record<string, string>>(key: string) {
  const { locale } = useI18n()

  return computed(() => {
    const messages = catalogs[locale.value as keyof typeof catalogs]
    const value = resolvePath(messages, key)
    return Array.isArray(value) ? (value as T[]) : []
  })
}