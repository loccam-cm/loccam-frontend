'use client'

import Link from 'next/link'
import { useT } from '@/hooks/useT'
import { LocataireDashboardData } from '@/types/locataire'
import {
  IconLayoutDashboard, IconFileText, IconCreditCard, IconMessage,
  IconTool, IconUser, IconLogout, IconBuilding, IconX, IconSettings,
} from '@tabler/icons-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  activeNav: string
  onNavChange: (label: string) => void
  ini: string
  nomComplet: string
  onDeconnexion: () => void
  data: LocataireDashboardData | null
}

export function LocataireSidebar({ isOpen, onClose, activeNav, onNavChange, ini, nomComplet, onDeconnexion, data }: Props) {
  const t = useT()

  const navGroups = [
    {
      label: 'Mon logement',
      items: [
        { icon: <IconLayoutDashboard size={15}/>, label: t('nav.dashboard') || 'Tableau de bord', href: '/locataire' },
        { icon: <IconFileText size={15}/>,        label: t('nav.contrats')  || 'Mon contrat',     href: '/locataire/contrat' },
      ],
    },
    {
      label: 'Finances',
      items: [
        { icon: <IconCreditCard size={15}/>, label: 'Payer mon loyer', href: '/locataire/paiement' },
        { icon: <IconFileText size={15}/>,   label: 'Mes quittances',  href: '/locataire/paiement' },
      ],
    },
    {
      label: 'Communication',
      items: [
        { icon: <IconMessage size={15}/>, label: t('nav.messages')     || 'Messagerie',   href: '/locataire/messagerie', badge: data?.messages.filter(m => !m.est_lu).length ?? 0,  badgeColor: '#059669' },
        { icon: <IconTool size={15}/>,    label: t('nav.signalements') || 'Signalements', href: '/locataire/signalements', badge: data?.signalements.filter(s => s.statut === 'ouvert' || s.statut === 'en_cours').length ?? 0, badgeColor: '#DC2626' },
      ],
    },
    {
      label: 'Compte',
      items: [
        { icon: <IconUser size={15}/>,     label: t('nav.compte')     || 'Mon compte',  href: '/locataire/compte' },
        { icon: <IconSettings size={15}/>, label: t('nav.parametres') || 'Paramètres',  href: '/locataire/parametres' },
      ],
    },
  ]

  return (
    <aside className={`sidebar-mobile lg:relative lg:translate-x-0 w-56 flex-shrink-0 flex flex-col h-full ${isOpen ? 'open' : ''}`}
           style={{ background: '#fff', borderRight: '1px solid #D1FAE5', boxShadow: '4px 0 20px rgba(5,150,105,.06)' }}>

      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid #D1FAE5' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 12px rgba(5,150,105,.3)' }}>
          <IconBuilding size={18} color="white" />
        </div>
        <div>
          <div className="font-bold text-sm leading-none" style={{ color: '#059669' }}>LocCam</div>
          <div className="text-xs mt-0.5 font-medium" style={{ color: '#6EE7B7' }}>Espace locataire</div>
        </div>
        <button className="ml-auto lg:hidden" onClick={onClose}
                style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
          <IconX size={15} />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label} className="mb-5">
            <div className="text-xs font-bold uppercase tracking-widest px-2 mb-1.5"
                 style={{ color: '#A7F3D0', letterSpacing: '.1em' }}>
              {group.label}
            </div>
            {group.items.map(item => {
              const isActive = activeNav === item.label
              const cls   = 'nav-item w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-sm text-left'
              const style = isActive
                ? { background: '#ECFDF5', color: '#059669', fontWeight: 600, boxShadow: 'inset 2px 0 0 #059669' }
                : { color: '#64748B' }
              const content = (
                <>
                  <span style={{ color: isActive ? '#059669' : '#94A3B8' }}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                          style={{ background: item.badgeColor, fontSize: '10px', minWidth: '16px', textAlign: 'center' }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )
              return 'href' in item && item.href ? (
                <Link key={item.label} href={item.href}
                      onClick={() => { onNavChange(item.label); onClose() }}
                      className={cls} style={{ ...style, textDecoration: 'none' }}>
                  {content}
                </Link>
              ) : (
                <button key={item.label}
                        onClick={() => { onNavChange(item.label); onClose() }}
                        className={cls} style={style}>
                  {content}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl"
             style={{ background: '#F0FDF4', border: '1px solid #D1FAE5' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
               style={{ background: 'linear-gradient(135deg,#059669,#7C3AED)' }}>
            {ini}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: '#0F172A' }}>{nomComplet}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full pulse" style={{ background: '#10B981' }} />
              <span className="text-xs" style={{ color: '#6EE7B7' }}>En ligne</span>
            </div>
          </div>
          <button onClick={onDeconnexion} title="Déconnexion"
                  style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}>
            <IconLogout size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
