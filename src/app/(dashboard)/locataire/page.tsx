'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useT } from '@/hooks/useT'
import { useLocataireDashboard }          from '@/hooks/useLocataireDashboard'
import { LocataireSidebar }               from '@/components/dashboard/locataire/LocataireSidebar'
import { LocataireTopbar }                from '@/components/dashboard/locataire/LocataireTopbar'
import { LocataireHeroLogement }          from '@/components/dashboard/locataire/LocataireHeroLogement'
import { LocataireProchainPaiement }      from '@/components/dashboard/locataire/LocataireProchainPaiement'
import { LocataireTabs }                  from '@/components/dashboard/locataire/LocataireTabs'
import { LocatairePanneauDroit }          from '@/components/dashboard/locataire/LocatairePanneauDroit'

type TabKey = 'paiements' | 'documents' | 'messages' | 'signalements'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const } }),
}

export default function LocataireDashboardPage() {
  const t = useT()
  const { user, deconnexion } = useAuth()
  const { data, loading, load, joursRestants, progressMois, dateEcheance } = useLocataireDashboard()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav]     = useState('Tableau de bord')
  const [activeTab, setActiveTab]     = useState<TabKey>('paiements')

  if (!user) return null
  const ini     = `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`
  const contrat = data?.contrat ?? null

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pulse{animation:pulse 2.5s ease-in-out infinite}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#A7F3D0;border-radius:4px}
        *{scrollbar-width:thin;scrollbar-color:#A7F3D0 transparent}
        .nav-item{transition:all .15s ease}
        .nav-item:hover{background:rgba(5,150,105,.07)}
        .row-hover{transition:background .12s}.row-hover:hover{background:#F0FDF4}
        .card-hover{transition:transform .2s ease,box-shadow .2s ease}
        .card-hover:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(5,150,105,.1)}
        @media(max-width:1024px){
          .sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:40}
          .sidebar-mobile{position:fixed;left:0;top:0;bottom:0;z-index:50;transform:translateX(-100%);transition:transform .3s ease}
          .sidebar-mobile.open{transform:translateX(0)}
        }
      `}</style>

      <div className="flex h-screen overflow-hidden"
           style={{ background: '#F0FDF4', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

        {sidebarOpen && <div className="sidebar-overlay lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <LocataireSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          ini={ini}
          nomComplet={user.nom_complet}
          onDeconnexion={deconnexion}
          data={data}
        />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <LocataireTopbar
            onMenuOpen={() => setSidebarOpen(true)}
            loading={loading}
            onRefresh={load}
            ini={ini}
          />

          <div className="flex-1 overflow-y-auto">
            <div className="flex h-full">
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto min-w-0">

                {/* Salutation */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-4">
                  <h2 className="text-xl font-bold" style={{ color: '#0F172A' }}>
                    {t('dashboard.bienvenue')}, {user.prenom}
                  </h2>
                  <p className="text-sm" style={{ color: '#64748B' }}>
                    {t('dashboard.bienvenue_espace')}
                  </p>
                </motion.div>

                <LocataireHeroLogement contrat={contrat} loading={loading} />

                <LocataireProchainPaiement
                  contrat={contrat}
                  loading={loading}
                  joursRestants={joursRestants}
                  progressMois={progressMois}
                  dateEcheance={dateEcheance}
                />

                <LocataireTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  data={data}
                  loading={loading}
                  contrat={contrat}
                />
              </div>

              <LocatairePanneauDroit
                data={data}
                loading={loading}
                contrat={contrat}
                joursRestants={joursRestants}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
