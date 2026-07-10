'use client'

import { motion } from 'framer-motion'
import { useLocale } from '@/hooks/useLocale'

/**
 * LanguageSwitch — Bascule FR / EN pour la landing (thème dark)
 *
 * Prérequis : useLocale() doit exposer { locale, setLocale }
 * Usage : <LanguageSwitch />  dans LandingNav
 */
export default function LanguageSwitch() {
  const { locale, setLocale } = useLocale()

  const langues: { code: 'fr' | 'en'; label: string }[] = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
  ]

  return (
    <div
      role="group"
      aria-label="Choix de la langue"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        padding: '3px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
      {langues.map((l) => {
        const actif = locale === l.code
        return (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            aria-pressed={actif}
            style={{
              position: 'relative',
              padding: '5px 12px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              fontSize: '12px',
              fontWeight: 700,
              color: actif ? '#F8FAFC' : 'rgba(248,250,252,0.5)',
              transition: 'color 0.2s',
              zIndex: 1,
            }}>
            {/* Pill actif animé */}
            {actif && (
              <motion.span
                layoutId="lang-pill"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '7px',
                  background: 'linear-gradient(135deg,#2563EB,#1D4ED8)',
                  zIndex: -1,
                }}
              />
            )}
            {l.label}
          </button>
        )
      })}
    </div>
  )
}