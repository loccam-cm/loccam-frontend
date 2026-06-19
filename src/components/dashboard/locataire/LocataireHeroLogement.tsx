'use client'

import { motion } from 'framer-motion'
import { LocataireSkeleton } from '@/components/dashboard/locataire/LocataireSkeleton'
import { Contrat } from '@/types'
import { IconHome2, IconMapPin } from '@tabler/icons-react'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const } }),
}

interface Props { contrat: Contrat | null; loading: boolean }

export function LocataireHeroLogement({ contrat, loading }: Props) {
  const bien = contrat?.bien

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
      className="rounded-2xl p-4 sm:p-5 mb-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#064E3B 0%,#059669 55%,#10B981 100%)' }}>
      <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-10"
           style={{ background: 'radial-gradient(circle,#A7F3D0,transparent)' }} />
      <div className="absolute right-20 -bottom-6 w-24 h-24 rounded-full opacity-5"
           style={{ background: 'radial-gradient(circle,#6EE7B7,transparent)' }} />

      <div className="relative flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
             style={{ background: 'rgba(255,255,255,.12)' }}>
          <IconHome2 size={22} color="white" />
        </div>
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-2">
              <LocataireSkeleton className="h-5 w-52" />
              <LocataireSkeleton className="h-3 w-40" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {Array(4).fill(0).map((_,i) => <LocataireSkeleton key={i} className="h-10" />)}
              </div>
            </div>
          ) : (
            <>
              <div className="text-white font-bold text-base sm:text-lg mb-0.5 truncate">
                {bien?.titre ?? 'Aucun logement actif'}
              </div>
              <div className="flex items-center gap-1.5 text-sm mb-3" style={{ color: 'rgba(255,255,255,.6)' }}>
                <IconMapPin size={12} />
                <span className="truncate">{bien?.adresse ?? '—'}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { lbl: 'Loyer mensuel',  val: contrat ? `${contrat.loyer_mensuel.toLocaleString('fr-FR')} XAF` : '—' },
                  { lbl: 'Caution versée', val: contrat?.caution ? `${contrat.caution.toLocaleString('fr-FR')} XAF` : '—' },
                  { lbl: "Date d'entrée",  val: contrat ? new Date(contrat.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                  { lbl: 'Propriétaire',   val: contrat?.bailleur?.nom_complet ?? '—' },
                ].map(s => (
                  <div key={s.lbl}>
                    <div className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,.4)' }}>{s.lbl}</div>
                    <div className="text-xs sm:text-sm font-semibold text-white truncate">{s.val}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
