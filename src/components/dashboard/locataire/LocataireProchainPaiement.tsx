'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { LocataireSkeleton } from '@/components/dashboard/locataire/LocataireSkeleton'
import { CircleProgress } from '@/components/dashboard/shared/CircleProgress'
import { Contrat } from '@/types'
import { IconCalendar, IconClock } from '@tabler/icons-react'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const } }),
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number>(0)
  useEffect(() => {
    const start = Date.now()
    const run = () => {
      const p = Math.min((Date.now() - start) / 900, 1)
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value))
      if (p < 1) raf.current = requestAnimationFrame(run)
    }
    raf.current = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf.current)
  }, [value])
  return <>{display.toLocaleString('fr-FR')}{suffix}</>
}

interface Props {
  contrat: Contrat | null
  loading: boolean
  joursRestants: number
  progressMois: number
  dateEcheance: string
}

export function LocataireProchainPaiement({ contrat, loading, joursRestants, progressMois, dateEcheance }: Props) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
      className="card-hover bg-white rounded-2xl p-4 sm:p-5 mb-4"
      style={{ border: '1px solid #D1FAE5', boxShadow: '0 2px 8px rgba(5,150,105,.06)' }}>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#ECFDF5' }}>
              <IconCalendar size={13} style={{ color: '#059669' }} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#059669' }}>
              Prochain paiement
            </span>
          </div>
          {loading ? <LocataireSkeleton className="h-10 w-44 mb-1" /> : (
            <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#059669' }}>
              <AnimatedNumber value={contrat?.loyer_mensuel ?? 0} suffix=" XAF" />
            </div>
          )}
          <div className="text-xs mt-1" style={{ color: '#64748B' }}>
            Loyer de base — charges selon relevé mensuel
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-wider mb-0.5"
                 style={{ color: joursRestants <= 5 ? '#DC2626' : '#D97706' }}>
              Échéance
            </div>
            <div className="text-xl font-bold" style={{ color: joursRestants <= 5 ? '#DC2626' : '#D97706' }}>
              {joursRestants} jours
            </div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <IconClock size={10} style={{ color: '#94A3B8' }} />
              <span className="text-xs" style={{ color: '#94A3B8' }}>{dateEcheance}</span>
            </div>
          </div>
          <CircleProgress pct={progressMois} color="#059669" size={56} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
          className="relative flex items-center justify-center gap-3 py-3.5 rounded-2xl overflow-hidden font-bold text-sm text-white"
          style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', boxShadow: '0 4px 16px rgba(255,107,0,.35)' }}>
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 80% 50%, #fff, transparent)' }} />
          <img src="/orange-money.jpg" alt="Orange Money" className="relative z-10 h-7 w-auto object-contain" style={{ maxWidth: '100px' }} />
          <span className="relative z-10 text-xs sm:text-sm">Orange Money</span>
        </motion.button>

        <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
          className="relative flex items-center justify-center gap-1.5 sm:gap-3 py-3.5 rounded-2xl overflow-hidden font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #FFCC00, #FFB800)', color: '#1C1C1E', boxShadow: '0 4px 16px rgba(255,204,0,.35)' }}>
          <div className="absolute inset-0 opacity-20 pr-2" style={{ background: 'radial-gradient(circle at 80% 50%, #fff, transparent)' }} />
          <img src="/mtn-money.jpg" alt="MTN Mobile Money" className="relative z-10 h-5 sm:h-7 w-auto object-contain" style={{ maxWidth: '100px' }} />
          <span className="relative z-10 text-xs sm:text-sm">MTN Mobile Money</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
