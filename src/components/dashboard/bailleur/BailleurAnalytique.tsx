'use client'

import Link from 'next/link'
import { useT } from '@/hooks/useT'
import { IconChartBar, IconArrowRight } from '@tabler/icons-react'

export function BailleurAnalytique() {
  const t = useT()

  return (
    <Link href="/bailleur/analytique" style={{ textDecoration: 'none' }}>
      <div className="kpi-card bg-white rounded-2xl p-4 mb-5 fade-up-5 flex items-center gap-3 sm:gap-4 cursor-pointer"
           style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
             style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 4px 12px rgba(124,58,237,.3)' }}>
          <IconChartBar size={20} color="white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold" style={{ color: '#0F172A' }}>
            {t('dashboard.analytique_titre')}
          </div>
          <div className="text-xs mt-0.5 hidden sm:block" style={{ color: '#94A3B8' }}>
            {t('dashboard.analytique_desc')}
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0"
             style={{ background: '#F5F3FF', color: '#7C3AED' }}>
          <span className="hidden sm:inline">{t('dashboard.voir_graphiques')}</span>
          <IconArrowRight size={13} />
        </div>
      </div>
    </Link>
  )
}
