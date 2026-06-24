/**
 * PlanGate — Bloque l'accès à un enfant si le plan est insuffisant.
 *
 * Usage :
 *
 * // 1. Wrapping d'un bouton (mode overlay)
 * <PlanGate fonctionnalite="releves">
 *   <button onClick={...}>Nouveau relevé</button>
 * </PlanGate>
 *
 * // 2. Check inline (mode render prop)
 * <PlanGate fonctionnalite="mobile_money" inline>
 *   {({ autorise, ouvrir }) =>
 *     autorise
 *       ? <BoutonMobileMoney/>
 *       : <button onClick={ouvrir}>🔒 Mobile Money</button>
 *   }
 * </PlanGate>
 *
 * // 3. Limite biens (mode nb_biens)
 * <PlanGate nbBiens={biens.length}>
 *   <button onClick={openAdd}>Ajouter un bien</button>
 * </PlanGate>
 */
'use client'

import { useState } from 'react'
import { IconLock } from '@tabler/icons-react'
import { usePlan } from '@/hooks/usePlan'
import ModalUpgrade from './ModalUpgrade'
import type { Fonctionnalite, PlanId } from '@/hooks/usePlan'

// ── Props ─────────────────────────────────────────────────────
interface PlanGateBaseProps {
  /** Affiche les enfants normalement mais intercepte le clic si non autorisé */
  children: React.ReactNode | ((args: { autorise: boolean; ouvrir: () => void }) => React.ReactNode)
  /** Désactive la vérification (ex: locataire) */
  desactive?: boolean
}

interface PlanGateFonctionnalite extends PlanGateBaseProps {
  fonctionnalite: Fonctionnalite
  nbBiens?: never
}

interface PlanGateNbBiens extends PlanGateBaseProps {
  fonctionnalite?: never
  nbBiens: number
}

type PlanGateProps = PlanGateFonctionnalite | PlanGateNbBiens

// ── Composant ─────────────────────────────────────────────────
export default function PlanGate({ children, fonctionnalite, nbBiens, desactive }: PlanGateProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { peut, plan, loading, limiteBiensAtteinte, planRequis } = usePlan()

  // Pendant le chargement ou si désactivé → passe-plat
  if (loading || desactive) {
    return <>{typeof children === 'function' ? children({ autorise: true, ouvrir: () => {} }) : children}</>
  }

  // Calcul de l'autorisation
  const autorise = fonctionnalite
    ? peut(fonctionnalite)
    : !limiteBiensAtteinte(nbBiens ?? 0)

  const planNecessaire: PlanId = fonctionnalite
    ? planRequis(fonctionnalite)
    : 'pro'

  const featureLabel: Fonctionnalite = (fonctionnalite ?? 'mobile_money') as Fonctionnalite

  const ouvrir = () => setModalOpen(true)

  // ── Mode render prop ─────────────────────────────────────────
  if (typeof children === 'function') {
    return (
      <>
        {children({ autorise, ouvrir })}
        <ModalUpgrade
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          fonctionnalite={featureLabel}
          planRequis={planNecessaire}
          planActuel={plan}
        />
      </>
    )
  }

  // ── Mode wrapper ─────────────────────────────────────────────
  if (autorise) {
    return <>{children}</>
  }

  return (
    <>
      {/* Overlay verrouillé sur l'enfant */}
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        {/* Enfant rendu mais pointer-events désactivés */}
        <div style={{ pointerEvents: 'none', opacity: .5, userSelect: 'none' }}>
          {children}
        </div>

        {/* Couche de capture du clic */}
        <button
          onClick={ouvrir}
          title="Fonctionnalité verrouillée — Voir les offres"
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'inherit',
          }}>
          <div style={{
            background: 'rgba(15,23,42,.7)', backdropFilter: 'blur(4px)',
            borderRadius: '8px', padding: '4px 10px',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <IconLock size={11} style={{ color: '#A78BFA' }}/>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Plan Pro</span>
          </div>
        </button>
      </div>

      <ModalUpgrade
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fonctionnalite={featureLabel}
        planRequis={planNecessaire}
        planActuel={plan}
      />
    </>
  )
}

// ── BanniereUpgrade — bandeau discret pour pages entières ─────
export function BanniereUpgrade({ fonctionnalite }: { fonctionnalite: Fonctionnalite }) {
  const { peut, plan, planRequis } = usePlan()
  const [dismissed, setDismissed] = useState(false)

  if (peut(fonctionnalite) || dismissed) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
      background: 'linear-gradient(135deg,rgba(124,58,237,.08),rgba(37,99,235,.08))',
      border: '1px solid rgba(124,58,237,.2)',
    }}>
      <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:'rgba(124,58,237,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <IconLock size={14} style={{ color:'#7C3AED' }}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A' }}>
          Fonctionnalité disponible dès le plan Pro
        </div>
        <div style={{ fontSize:'12px', color:'#64748B' }}>
          Passez au plan Pro à partir de 5 000 XAF/mois
        </div>
      </div>
      <a href="/bailleur/abonnement"
         style={{ flexShrink:0, padding:'7px 14px', borderRadius:'10px', background:'linear-gradient(135deg,#7C3AED,#2563EB)', color:'#fff', textDecoration:'none', fontSize:'12px', fontWeight:700 }}>
        Voir les offres
      </a>
      <button onClick={() => setDismissed(true)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8', display:'flex', padding:'4px' }}>
        <IconLock size={14}/>
      </button>
    </div>
  )
}
