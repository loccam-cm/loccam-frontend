'use client'

import { useT } from '@/hooks/useT'
import { Skeleton } from '@/components/dashboard/shared/Skeleton'
import { AnimatedNumber } from '@/components/dashboard/shared/AnimatedNumber'
import { BailleurStats } from '@/types/bailleur'
import { IconCheck, IconAlertCircle, IconTool, IconFileText } from '@tabler/icons-react'

interface Props { stats: BailleurStats | null; loading: boolean }

export function BailleurSuiviParc({ stats, loading }: Props) {
  const t = useT()

  const items = [
    { label: t('dashboard.loyers_confirmes'), value: stats?.loyers_confirmes ?? 0, sub: t('dashboard.ce_mois_label'), icon: <IconCheck size={16}/>,        color: '#059669', bg: '#ECFDF5' },
    { label: t('dashboard.impayes'),          value: stats?.impayes ?? 0,          sub: t('dashboard.relances_actives'), icon: <IconAlertCircle size={16}/>, color: '#DC2626', bg: '#FEF2F2' },
    { label: 'Signalements',                  value: stats?.signalements ?? 0,     sub: t('dashboard.en_traitement'),   icon: <IconTool size={16}/>,         color: '#D97706', bg: '#FFFBEB' },
    { label: t('dashboard.baux_renouveler'),  value: stats?.baux_renouveler ?? 0,  sub: t('dashboard.dans_30_jours'),   icon: <IconFileText size={16}/>,     color: '#7C3AED', bg: '#F5F3FF' },
  ]

  return (
    <>
      <div className="text-xs font-bold uppercase tracking-widest mb-3 fade-up-3" style={{ color: '#94A3B8' }}>
        {t('dashboard.suivi_parc')}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 fade-up-4">
        {items.map(s => (
          <div key={s.label} className="kpi-card bg-white rounded-2xl p-3 sm:p-4" style={{ border: '1px solid #E2E8F0' }}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="text-xs font-semibold uppercase tracking-wider leading-tight pr-2" style={{ color: '#94A3B8' }}>
                {s.label}
              </div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
            </div>
            {loading ? <Skeleton className="h-7 w-12 mb-1" /> : (
              <div className="text-xl sm:text-2xl font-bold" style={{ color: s.color }}>
                <AnimatedNumber value={s.value} />
              </div>
            )}
            <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </>
  )
}
