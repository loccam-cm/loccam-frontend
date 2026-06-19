'use client'

import Link from 'next/link'
import { useT } from '@/hooks/useT'
import { Skeleton } from '@/components/dashboard/shared/Skeleton'
import { AnimatedNumber } from '@/components/dashboard/shared/AnimatedNumber'
import { BailleurStats } from '@/types/bailleur'
import { IconHome2, IconChartBar, IconCreditCard, IconAlertCircle, IconTrendingUp } from '@tabler/icons-react'

interface Props { stats: BailleurStats | null; loading: boolean }

export function BailleurKPIs({ stats, loading }: Props) {
  const t = useT()

  const kpis = [
    {
      label: t('dashboard.total_biens'),
      value: stats?.total_biens ?? 0, suffix: '',
      sub: `${stats?.biens_libres ?? 0} libres · ${stats?.biens_occupes ?? 0} occupés`,
      icon: <IconHome2 size={20}/>, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', progress: null,
    },
    {
      label: t('dashboard.taux_occupation'),
      value: stats?.taux_occupation ?? 0, suffix: '%',
      sub: `${stats?.biens_occupes ?? 0} / ${stats?.total_biens ?? 0} logements`,
      icon: <IconChartBar size={20}/>, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0',
      progress: stats?.taux_occupation ?? 0,
    },
    {
      label: t('dashboard.revenus_mois'),
      value: stats?.revenus_mois ?? 0, suffix: ' XAF',
      sub: t('dashboard.paiements_confirmes'),
      icon: <IconCreditCard size={20}/>, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', progress: null,
    },
    {
      label: t('dashboard.impayes'),
      value: stats?.impayes ?? 0, suffix: '',
      sub: stats?.montant_impayes ? `${stats.montant_impayes.toLocaleString('fr-FR')} XAF` : 'Aucun retard',
      icon: <IconAlertCircle size={20}/>, color: '#DC2626', bg: '#FEF2F2', border: '#FECACA',
      progress: null, alert: true,
    },
  ]

  return (
    <>
      <div className="text-xs font-bold uppercase tracking-widest mb-3 fade-up-1" style={{ color: '#94A3B8' }}>
        {t('dashboard.indicateurs_cles')}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpis.map((k, i) => {
          const card = (
            <div className={`kpi-card bg-white rounded-2xl p-3 sm:p-4 fade-up-${i+2} h-full`}
                 style={{ border: `1px solid ${k.border}`, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="text-xs font-semibold uppercase tracking-wider leading-tight pr-2" style={{ color: '#94A3B8' }}>
                  {k.label}
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: k.bg }}>
                  <span style={{ color: k.color }}>{k.icon}</span>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1"
                   style={{ color: (k as any).alert && (stats?.impayes ?? 0) > 0 ? k.color : '#0F172A' }}>
                {loading ? <Skeleton className="h-7 w-16" /> :
                  k.suffix === ' XAF' ? (
                    <>{(stats?.revenus_mois ?? 0).toLocaleString('fr-FR')}<span className="text-xs font-medium ml-1" style={{ color: '#94A3B8' }}>XAF</span></>
                  ) : k.suffix === '%' ? (
                    <><AnimatedNumber value={k.value} /><span className="text-base">%</span></>
                  ) : <AnimatedNumber value={k.value} />}
              </div>
              <div className="text-xs" style={{ color: k.color }}>
                <IconTrendingUp size={11} className="inline mr-1" />{k.sub}
              </div>
              {k.progress != null && (
                <div className="mt-2 sm:mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                       style={{ width: `${k.progress}%`, background: k.color }} />
                </div>
              )}
            </div>
          )
          return (k as any).alert ? (
            <Link key={k.label} href="/bailleur/impayes" style={{ textDecoration: 'none', display: 'block' }}>
              {card}
            </Link>
          ) : <div key={k.label}>{card}</div>
        })}
      </div>
    </>
  )
}
