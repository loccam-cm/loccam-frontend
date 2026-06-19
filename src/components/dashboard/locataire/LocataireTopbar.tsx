'use client'

import Link from 'next/link'
import { useT } from '@/hooks/useT'
import NotificationBell from '@/components/NotificationBell'
import { IconMenu2, IconRefresh, IconCreditCard } from '@tabler/icons-react'

interface Props {
  onMenuOpen: () => void
  loading: boolean
  onRefresh: () => void
  ini: string
}

export function LocataireTopbar({ onMenuOpen, loading, onRefresh, ini }: Props) {
  const t = useT()
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header className="flex items-center gap-3 px-4 sm:px-5 h-14 flex-shrink-0"
            style={{ background: '#fff', borderBottom: '1px solid #D1FAE5', boxShadow: '0 1px 4px rgba(5,150,105,.05)' }}>
      <button className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: '#F0FDF4', border: '1px solid #D1FAE5' }}
              onClick={onMenuOpen}>
        <IconMenu2 size={17} style={{ color: '#059669' }} />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-bold" style={{ color: '#0F172A' }}>
          {t('dashboard.tableau_de_bord')}
        </h1>
        <p className="text-xs capitalize hidden sm:block truncate" style={{ color: '#94A3B8' }}>{today}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onRefresh} className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: '#F0FDF4', border: '1px solid #D1FAE5' }}>
          <IconRefresh size={15} style={{ color: '#059669', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
        <NotificationBell color="#059669" bgColor="#F0FDF4" borderColor="#D1FAE5" />
        <Link href="/locataire/paiement"
              className="flex items-center gap-2 px-3 sm:px-4 h-9 rounded-xl text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 2px 8px rgba(5,150,105,.35)', textDecoration: 'none' }}>
          <IconCreditCard size={14} />
          <span className="hidden sm:inline">Payer mon loyer</span>
        </Link>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
             style={{ background: 'linear-gradient(135deg,#059669,#7C3AED)' }}>
          {ini}
        </div>
      </div>
    </header>
  )
}
