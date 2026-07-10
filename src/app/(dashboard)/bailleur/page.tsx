'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useBailleurDashboard } from '@/hooks/useBailleurDashboard'
import { BailleurSidebar }          from '@/components/dashboard/bailleur/BailleurSidebar'
import { BailleurTopbar }           from '@/components/dashboard/bailleur/BailleurTopbar'
import { BailleurHero }             from '@/components/dashboard/bailleur/BailleurHero'
import { BailleurKPIs }             from '@/components/dashboard/bailleur/BailleurKPIs'
import { BailleurSuiviParc }        from '@/components/dashboard/bailleur/BailleurSuiviParc'
import { BailleurAnalytique }       from '@/components/dashboard/bailleur/BailleurAnalytique'
import { BailleurPaiementsRecents } from '@/components/dashboard/bailleur/BailleurPaiementsRecents'
import { BailleurPanneauDroit }     from '@/components/dashboard/bailleur/BailleurPanneauDroit'
import ImpaiesSection               from '@/components/dashboard/bailleur/ImpaiesSection'

export default function BailleurDashboardPage() {
  const { user, deconnexion } = useAuth()
  const { stats, paiements, notifs, loading, chargerDonnees } = useBailleurDashboard()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav]     = useState('Dashboard')

  if (!user) return null
  const initiales = `${user.prenom[0]}${user.nom[0]}`

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fade-up{animation:fadeUp .4s ease both}
        .fade-up-1{animation:fadeUp .4s .05s ease both}
        .fade-up-2{animation:fadeUp .4s .1s ease both}
        .fade-up-3{animation:fadeUp .4s .15s ease both}
        .fade-up-4{animation:fadeUp .4s .2s ease both}
        .fade-up-5{animation:fadeUp .4s .25s ease both}
        .fade-up-6{animation:fadeUp .4s .3s ease both}
        .nav-item{transition:background .15s,color .15s}
        .nav-item:hover{background:rgba(255,255,255,.06)}
        .kpi-card{transition:transform .2s,box-shadow .2s}
        .kpi-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}
        .row-hover{transition:background .15s}.row-hover:hover{background:#F8FAFD}
        .notif-dot{animation:pulse 2s infinite}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#E6EDF4;border-radius:4px}
        @media(max-width:1024px){
          .sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:40}
          .sidebar-mobile{position:fixed;left:0;top:0;bottom:0;z-index:50;transform:translateX(-100%);transition:transform .3s}
          .sidebar-mobile.open{transform:translateX(0)}
        }
      `}</style>

      <div className="flex h-screen overflow-hidden"
           style={{ background: '#F1F5F9', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div className="sidebar-overlay lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <BailleurSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          initiales={initiales}
          nomComplet={user.nom_complet}
          onDeconnexion={deconnexion}
        />

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          <BailleurTopbar
            onMenuOpen={() => setSidebarOpen(true)}
            loading={loading}
            onRefresh={chargerDonnees}
            initiales={initiales}
          />

          <div className="flex-1 overflow-y-auto">
            <div className="flex h-full">

              {/* Zone centrale */}
              <div className="flex-1 p-4 sm:p-5 min-w-0 overflow-y-auto">
                <BailleurHero prenom={user.prenom} nom={user.nom} stats={stats} loading={loading} />
                <BailleurKPIs stats={stats} loading={loading} />

                {/* Section impayés — charge /paiements/impayes/ elle-même */}
                <div className="mb-5">
                  <ImpaiesSection />
                </div>

                <BailleurSuiviParc stats={stats} loading={loading} />
                <BailleurAnalytique />
                <BailleurPaiementsRecents paiements={paiements} loading={loading} />
              </div>

              {/* Panneau droit */}
              <BailleurPanneauDroit
                stats={stats}
                notifs={notifs}
                loading={loading}
                cniStatut={user.cni_statut ?? 'non_soumis'}
                onRefreshCNI={chargerDonnees}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
