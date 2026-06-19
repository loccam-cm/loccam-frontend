import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

export default getRequestConfig(async () => {
  // Lire la langue depuis le cookie (mis à jour quand l'utilisateur change ses préférences)
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value ?? 'fr'

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})