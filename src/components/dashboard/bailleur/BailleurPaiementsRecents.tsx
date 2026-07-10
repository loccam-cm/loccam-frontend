/**
 * ImpaiesSection — Section impayés du dashboard bailleur
 * Intégration : importer et placer dans bailleur/page.tsx
 *
 * Usage :
 *   import ImpaiesSection from '@/components/dashboard/bailleur/ImpaiesSection'
 *   <ImpaiesSection />
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import {
  IconAlertTriangle, IconHome2, IconUser,
  IconClock, IconChevronRight, IconRefresh,
  IconCircleCheck, IconLoader2,
} from '@tabler/icons-react'

// ── Types ──────────────────────────────────────────────────────
interface Impaye {
  contrat_id    : number
  locataire     : { id: number; nom_complet: string; email: string; telephone: string }
  bien          : { id: number; titre: string; adresse: string }
  loyer_mensuel : number
  mois          : number
  annee         : number
  jours_retard  : number
  paiement_id   : number | null
  statut        : 'non_initie' | 'en_attente' | 'echoue'
}

const MOIS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
]

const STATUT_CONFIG = {
  non_initie : { label:'Non initié',   bg:'#FEF2F2', col:'#DC2626', border:'#FECACA' },
  en_attente : { label:'En attente',   bg:'#FFFBEB', col:'#D97706', border:'#FDE68A' },
  echoue     : { label:'Échoué',       bg:'#FEF2F2', col:'#DC2626', border:'#FECACA' },
}

// ════════════════════════════════════════════════════════════════
export default function ImpaiesSection() {
  const [impayes, setImpayes] = useState<Impaye[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/paiements/impayes/')
      // Support tableau direct ou { results: [...] }
      const data = Array.isArray(res.data) ? res.data : res.data.results ?? []
      setImpayes(data)
    } catch {
      setImpayes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Rien à afficher ──────────────────────────────────────────
  if (!loading && impayes.length === 0) {
    return (
      <div style={{
        background:'#F0FDF4', border:'1px solid #A7F3D0',
        borderRadius:'16px', padding:'20px',
        display:'flex', alignItems:'center', gap:'12px',
      }}>
        <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <IconCircleCheck size={20} style={{ color:'#059669' }}/>
        </div>
        <div>
          <div style={{ fontSize:'14px', fontWeight:700, color:'#065F46' }}>
            Aucun impayé en cours
          </div>
          <div style={{ fontSize:'12px', color:'#059669', marginTop:'2px' }}>
            Tous vos locataires sont à jour pour le mois de {MOIS[new Date().getMonth()]}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* En-tête section */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <IconAlertTriangle size={16} style={{ color:'#DC2626' }}/>
          </div>
          <div>
            <div style={{ fontSize:'14px', fontWeight:700, color:'#0F172A' }}>
              Impayés en cours
            </div>
            <div style={{ fontSize:'12px', color:'#94A3B8' }}>
              {loading ? '...' : `${impayes.length} locataire${impayes.length > 1 ? 's' : ''} en retard`}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <button onClick={load}
            style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#F1F5F9', border:'1px solid #E2E8F0', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <IconRefresh size={14} style={{ color:'#64748B', animation: loading ? 'spin 1s linear infinite':'none' }}/>
          </button>
          <Link href="/bailleur/impayes"
            style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', fontWeight:600, color:'#DC2626', textDecoration:'none' }}>
            Voir tout <IconChevronRight size={13}/>
          </Link>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {[1,2].map(i => (
            <div key={i} style={{ height:'72px', borderRadius:'12px', background:'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}/>
          ))}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {impayes.map((imp, i) => {
            const statut = STATUT_CONFIG[imp.statut] ?? STATUT_CONFIG.non_initie
            return (
              <motion.div key={imp.contrat_id}
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background:'#fff',
                  border:`1px solid ${statut.border}`,
                  borderRadius:'12px',
                  padding:'14px 16px',
                  display:'flex',
                  alignItems:'center',
                  gap:'12px',
                }}>

                {/* Icone statut */}
                <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:statut.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <IconAlertTriangle size={18} style={{ color:statut.col }}/>
                </div>

                {/* Infos */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'13px', fontWeight:700, color:'#0F172A' }}>
                      {imp.locataire.nom_complet}
                    </span>
                    <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'100px', background:statut.bg, color:statut.col }}>
                      {statut.label}
                    </span>
                    {imp.jours_retard > 0 && (
                      <span style={{ fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'100px', background:'#FEF2F2', color:'#DC2626', display:'flex', alignItems:'center', gap:'3px' }}>
                        <IconClock size={10}/>
                        {imp.jours_retard} jour{imp.jours_retard > 1 ? 's':''} de retard
                      </span>
                    )}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'12px', color:'#64748B', display:'flex', alignItems:'center', gap:'4px' }}>
                      <IconHome2 size={11}/>
                      {imp.bien.titre}
                    </span>
                    <span style={{ fontSize:'12px', color:'#64748B', display:'flex', alignItems:'center', gap:'4px' }}>
                      <IconClock size={11}/>
                      {MOIS[imp.mois - 1]} {imp.annee}
                    </span>
                  </div>
                </div>

                {/* Montant + action */}
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:'14px', fontWeight:800, color:'#DC2626', marginBottom:'4px' }}>
                    {imp.loyer_mensuel.toLocaleString('fr-FR')} XAF
                  </div>
                  <Link
                    href={`/bailleur/impayes?contrat=${imp.contrat_id}`}
                    style={{ fontSize:'11px', fontWeight:600, color:'#DC2626', textDecoration:'none', display:'flex', alignItems:'center', gap:'3px', justifyContent:'flex-end' }}>
                    Relancer <IconChevronRight size={11}/>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes spin    { to { transform:rotate(360deg) } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  )
}