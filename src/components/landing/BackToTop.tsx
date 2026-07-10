'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconArrowUp } from '@tabler/icons-react'

export default function BackToTop() {
  const [visible, setVisible]   = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const height    = document.documentElement.scrollHeight - window.innerHeight
      const pct       = height > 0 ? (scrollTop / height) * 100 : 0

      setProgress(pct)
      setVisible(scrollTop > 400)   // apparait après 400px de scroll
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cercle de progression
  const R  = 22
  const C  = 2 * Math.PI * R
  const offset = C - (progress / 100) * C

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          aria-label="Retour en haut"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 90,
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(8,14,28,0.9)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>

          {/* Cercle de progression SVG */}
          <svg
            width="52" height="52"
            style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle
              cx="26" cy="26" r={R}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2.5"
            />
            {/* Progression */}
            <circle
              cx="26" cy="26" r={R}
              fill="none"
              stroke="url(#btt-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
            <defs>
              <linearGradient id="btt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"  stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>

          {/* Flèche */}
          <IconArrowUp size={20} style={{ color: '#F8FAFC', position: 'relative', zIndex: 1 }} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}