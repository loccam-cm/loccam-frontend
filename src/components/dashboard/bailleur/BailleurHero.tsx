'use client'

import { useT } from '@/hooks/useT'
import { Skeleton } from '@/components/dashboard/shared/Skeleton'
import { AnimatedNumber } from '@/components/dashboard/shared/AnimatedNumber'
import { BailleurStats } from '@/types/bailleur'
import { IconShieldCheck, IconAlertTriangle } from '@tabler/icons-react'

interface Props {
  prenom: string
  nom: string
  stats: BailleurStats | null
  loading: boolean
}

export function BailleurHero({ prenom, nom, stats, loading }: Props) {
  const t = useT()

  return (
    <div className="fade-up rounded-2xl p-4 sm:p-5 mb-5 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg,#0C1F35 0%,#1E3A5F 50%,#2563EB 100%)', minHeight: '110px' }}>
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10"
           style={{ background: 'radial-gradient(circle,#60A5FA,transparent)' }} />
      <div className="absolute right-20 bottom-0 w-24 h-24 rounded-full opacity-5"
           style={{ background: 'radial-gradient(circle,#A78BFA,transparent)' }} />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1"
               style={{ color: 'rgba(255,255,255,.45)' }}>
            {t('dashboard.bienvenue')}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mb-1">{prenom} {nom}</div>
          <div className="flex items-center gap-2">
            <IconShieldCheck size={13} style={{ color: '#34D399' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>
              {t('dashboard.cni_validee')}
            </span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {loading ? Array(3).fill(0).map((_,i) => (
            <div key={i} className="rounded-xl px-4 py-3 w-24" style={{ background: 'rgba(255,255,255,.08)' }}>
              <Skeleton className="h-6 mb-1" /><Skeleton className="h-3 w-16" />
            </div>
          )) : [
            { val: stats?.total_biens ?? 0,     lbl: t('dashboard.logements'), suf: '',  alert: false },
            { val: stats?.taux_occupation ?? 0, lbl: t('dashboard.occupation'), suf: '%', alert: false },
            { val: stats?.impayes ?? 0,         lbl: t('dashboard.impayes'),   suf: '',  alert: true },
          ].map(s => (
            <div key={s.lbl} className="rounded-xl px-4 py-3 text-center"
                 style={{ background: s.alert && s.val > 0 ? 'rgba(220,38,38,.2)' : 'rgba(255,255,255,.1)', border: `1px solid ${s.alert && s.val > 0 ? 'rgba(220,38,38,.4)' : 'rgba(255,255,255,.12)'}` }}>
              <div className="text-xl font-bold text-white"><AnimatedNumber value={s.val} />{s.suf}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.5)' }}>{s.lbl}</div>
              {s.alert && s.val > 0 && (
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <IconAlertTriangle size={10} style={{ color: '#FCA5A5' }} />
                  <span className="text-xs" style={{ color: '#FCA5A5' }}>{t('common.action_requise')}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
