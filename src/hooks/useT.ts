import { useLocale } from './useLocale'
import fr from '../../messages/fr.json'
import en from '../../messages/en.json'

const messages = { fr, en } as const

export function useT() {
  const { locale } = useLocale()
  const m: any = messages[locale as keyof typeof messages] ?? messages.fr

  return (key: string): string => {
    const keys = key.split('.')
    let val: any = m
    for (const k of keys) {
      val = val?.[k]
    }
    return val ?? key
  }
}