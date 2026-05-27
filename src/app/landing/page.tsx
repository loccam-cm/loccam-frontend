'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IconBuilding, IconPhone, IconMail, IconMapPin,
  IconCheck, IconChevronDown, IconChevronUp,
  IconHome2, IconUsers, IconCreditCard, IconFileText,
  IconBell, IconMessage, IconTool, IconDroplet,
  IconShieldCheck, IconRocket, IconStar,
  IconArrowRight, IconPlayerPlay,
} from '@tabler/icons-react'

// ── DATA ────────────────────────────────────────────────────

const NAV_LINKS = ['L\'outil', 'Tarifs', 'Témoignages', 'En savoir plus', 'Contact', 'Presse']

const FEATURES = [
  { icon: <IconCreditCard size={22} />, bg: '#EEF4FA', col: '#1A3C5E',
    title: 'Paiement Mobile Money intégré',
    items: ['Orange Money & MTN Money', 'Quittance PDF instantanée', 'Notifications bailleur + locataire'] },
  { icon: <IconFileText size={22} />, bg: '#ECFDF5', col: '#0F6E56',
    title: 'Documents PDF automatiques',
    items: ['Contrat de bail conforme', 'Quittances mensuelles', 'Attestation de location'] },
  { icon: <IconShieldCheck size={22} />, bg: '#FFFBEB', col: '#C55A11',
    title: 'Bailleur certifié CNI',
    items: ['Vérification identité', 'Zéro bailleur anonyme', 'Sécurité locataire garantie'] },
  { icon: <IconBell size={22} />, bg: '#FEF2F2', col: '#A32D2D',
    title: 'Rappels et relances automatiques',
    items: ['Rappel loyer J-3, J-7', 'Relance impayé J+7, J+15', 'Suivi en temps réel'] },
  { icon: <IconMessage size={22} />, bg: '#F5F3FF', col: '#6D28D9',
    title: 'Messagerie & signalements',
    items: ['Communication directe', 'Suivi des pannes', 'Interventions tracées'] },
  { icon: <IconDroplet size={22} />, bg: '#E0F2FE', col: '#0369A1',
    title: 'Charges eau & électricité',
    items: ['Relevés index mensuels', 'Calcul automatique', 'Inclus dans quittance'] },
]

const TABS = ['Bailleur', 'Locataire', 'Locataire'] as const

const TEMOIGNAGES = [
  { av: 'NG', bg: '#EEF4FA', col: '#1A3C5E', stars: 5,
    txt: 'Depuis que j\'utilise LocCam, je gère mes 8 appartements en moins de 30 minutes par mois. Les paiements Orange Money arrivent directement et les quittances se génèrent seules.',
    name: 'Ngo Pauline', role: 'Bailleur · 8 biens · Douala' },
  { av: 'TK', bg: '#ECFDF5', col: '#0F6E56', stars: 5,
    txt: 'LocCam m\'a permis de formaliser mes locations. Contrats, quittances, relances — tout est automatisé. Je recommande à tous les bailleurs camerounais.',
    name: 'Tamba Kossé', role: 'Bailleur · 15 biens · Yaoundé' },
  { av: 'MF', bg: '#FFFBEB', col: '#C55A11', stars: 4,
    txt: 'En tant que locataire, j\'apprécie de recevoir ma quittance instantanément après chaque paiement MTN Money. Très pratique pour mes démarches administratives.',
    name: 'Mbida Fernande', role: 'Locataire · Studio 101 · Douala' },
]

const PLANS = [
  { label: 'Garage / Studio', price: '2 500', unit: 'XAF', period: '/mois',
    color: '#5B6E8C', bg: '#F8FAFD', border: '#E6EDF4', btnBg: '#F1F5F9', btnCol: '#1E2A3E',
    features: ['1 bien', 'Contrat de bail', 'Quittances PDF', 'Support email'] },
  { label: 'Appartement', price: '7 500', unit: 'XAF', period: '/mois', popular: true,
    color: '#fff', bg: '#1A3C5E', border: '#1A3C5E', btnBg: '#fff', btnCol: '#1A3C5E',
    features: ['Jusqu\'à 5 biens', 'Mobile Money inclus', 'Rappels automatiques', 'Messagerie', 'Support prioritaire'] },
  { label: 'Immeuble / Résidence', price: '15 000', unit: 'XAF', period: '/mois',
    color: '#5B6E8C', bg: '#F8FAFD', border: '#E6EDF4', btnBg: '#F1F5F9', btnCol: '#1E2A3E',
    features: ['Biens illimités', 'Tout Appartement +', 'État des lieux', 'Logs système', 'Account manager'] },
]

const FAQS = [
  { q: 'J\'ai plusieurs logements à gérer dans tout le Cameroun, comment ça se passe côté propriété ?',
    a: 'Vous pouvez gérer un nombre illimité de biens depuis un seul compte. Chaque bien est associé à une structure (immeuble, résidence, villa divisée) et vous pouvez les répartir par ville.' },
  { q: 'Avez-vous des propriétaires qui utilisent déjà LocCam ?',
    a: 'Oui ! Plus de 1 200 bailleurs actifs utilisent LocCam au Cameroun — principalement à Douala et Yaoundé. Rejoignez une communauté grandissante de propriétaires qui ont simplifié leur gestion.' },
  { q: 'Est-ce que LocCam fonctionne avec l\'Orange Money et MTN Money ?',
    a: 'Absolument. LocCam est intégré nativement avec Orange Money et MTN Money via CinetPay. Le locataire paie en 30 secondes depuis son téléphone et la quittance est générée instantanément.' },
  { q: 'Mon locataire ne peut pas payer ce mois-ci, comment LocCam me prévient ?',
    a: 'LocCam envoie des rappels automatiques au locataire J-3 et J-7 avant l\'échéance. En cas d\'impayé, des relances sont envoyées à J+7, J+15 et J+30 avec un suivi en temps réel depuis votre dashboard.' },
  { q: 'Y a-t-il un engagement minimum ?',
    a: 'Non. LocCam fonctionne sans engagement. Vous pouvez résilier à tout moment depuis vos paramètres. L\'essai gratuit de 30 jours ne nécessite pas de carte bancaire.' },
]

const BIEN_TYPES = [
  '🏠 Studio', '🏢 F1', '🏗 F2', '🏬 F3', '🏛 F4+',
  '🏨 Duplex', '🏡 Villa', '🏪 Boutique', '📦 Magasin',
  '🖥 Bureau', '🏭 Entrepôt', '🏗 Autre',
]

// ── COMPOSANTS ───────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden mb-3 cursor-pointer"
         style={{ border: '1px solid #E6EDF4', background: '#fff' }}
         onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between px-5 py-4">
        <div className="text-sm font-semibold pr-4" style={{ color: '#1E2A3E' }}>{q}</div>
        {open
          ? <IconChevronUp size={16} style={{ color: '#8A9BB0', flexShrink: 0 }} />
          : <IconChevronDown size={16} style={{ color: '#8A9BB0', flexShrink: 0 }} />
        }
      </div>
      {open && (
        <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#5B6E8C' }}>{a}</div>
      )}
    </div>
  )
}

// ── PAGE ─────────────────────────────────────────────────────

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="min-h-screen" style={{ background: '#fff', color: '#1E2A3E' }}>

      {/* ══════════════════════════════════
          TOPBAR
      ══════════════════════════════════ */}
      <div className="w-full py-2 text-center text-xs font-medium"
           style={{ background: '#0F2438', color: 'rgba(255,255,255,0.7)' }}>
        <span>📞 +237 699 000 000</span>
        <span className="mx-6">·</span>
        <span>✉️ contact@loccam.cm</span>
        <span className="mx-6">·</span>
        <span>📍 Douala · Yaoundé · Cameroun</span>
      </div>

      {/* ══════════════════════════════════
          NAVBAR
      ══════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white flex items-center gap-6 px-8 py-3"
           style={{ borderBottom: '1px solid #E6EDF4', boxShadow: '0 1px 8px rgba(30,42,62,0.06)' }}>
        <Link href="/" className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: '#1A3C5E' }}>
            <IconBuilding size={16} color="white" />
          </div>
          <span className="font-bold text-lg" style={{ color: '#1A3C5E' }}>LocCam</span>
        </Link>
        {NAV_LINKS.map(l => (
          <a key={l} href="#" className="text-sm hover:underline" style={{ color: '#5B6E8C' }}>{l}</a>
        ))}
        <div className="flex-1" />
        <Link href="/login"
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ color: '#1A3C5E' }}>
          Se connecter
        </Link>
        <Link href="/register"
              className="px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: '#1A3C5E', boxShadow: '0 2px 8px rgba(26,60,94,0.3)' }}>
          Démarrer gratuitement
        </Link>
      </nav>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #0F2438 0%, #1A3C5E 60%, #2E5580 100%)' }}>
        <div className="max-w-6xl mx-auto px-8 py-20 flex items-center gap-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                 style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
                          border: '1px solid rgba(255,255,255,0.15)' }}>
              🇨🇲 Solution N°1 au Cameroun
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Tout pour gérer<br/>vos locations au<br/>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>Cameroun</span>
            </h1>
            <p className="text-lg mb-2 font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Simple, rapide, efficace !
            </p>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              LocCam est la plateforme tout-en-un pour les bailleurs
              camerounais — contrats PDF, paiements Mobile Money,
              messagerie et relances automatiques en un seul endroit.
            </p>
            <div className="flex gap-3 mb-8">
              <Link href="/register"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                    style={{ background: '#fff', color: '#1A3C5E',
                             boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                <IconRocket size={16} />
                Démarrer gratuitement
              </Link>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.1)',
                               border: '1px solid rgba(255,255,255,0.2)' }}>
                <IconPlayerPlay size={16} />
                Voir la démo
              </button>
            </div>
            {/* Social proof */}
            <div className="flex items-center gap-6">
              {[
                { val: '4.8/5', lbl: '★★★★★' },
                { val: '1200+', lbl: 'Bailleurs' },
                { val: '500+',  lbl: 'Logements' },
              ].map((s) => (
                <div key={s.val} className="text-center">
                  <div className="text-white font-bold text-lg leading-none">{s.val}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="hidden lg:block flex-1">
            <div className="rounded-2xl overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              {/* Fausse barre de navigation */}
              <div className="flex items-center gap-2 px-4 py-3"
                   style={{ background: 'rgba(255,255,255,0.05)',
                            borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: '#A32D2D' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#C55A11' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#0F6E56' }} />
                <div className="flex-1 mx-3 h-6 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  loccam.cm/bailleur
                </span>
              </div>
              {/* Mini dashboard */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { lbl: 'Logements', val: '24', col: '#4ADE80' },
                    { lbl: 'Occupation', val: '87%', col: '#60A5FA' },
                    { lbl: 'Revenus', val: '1.8M XAF', col: '#FCD34D' },
                    { lbl: 'Impayés', val: '3', col: '#F87171' },
                  ].map((k) => (
                    <div key={k.lbl} className="rounded-xl p-3"
                         style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{k.lbl}</div>
                      <div className="font-bold" style={{ color: k.col }}>{k.val}</div>
                    </div>
                  ))}
                </div>
                {/* Mini table */}
                {[
                  { n: 'Mbida Jean', m: 'Orange Money', v: '85 000', s: '✓', sc: '#4ADE80' },
                  { n: 'Ngo Sarah',  m: 'MTN Money',    v: '120 000', s: '✓', sc: '#4ADE80' },
                  { n: 'Bello Eric', m: 'Impayé',       v: '-95 000', s: '⚠', sc: '#F87171' },
                ].map((r) => (
                  <div key={r.n} className="flex items-center gap-2 py-1.5"
                       style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                         style={{ background: 'rgba(255,255,255,0.12)' }}>
                      {r.n[0]}
                    </div>
                    <div className="flex-1 text-xs text-white">{r.n}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{r.m}</div>
                    <div className="text-xs font-bold" style={{ color: r.sc }}>{r.v} XAF</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skyline */}
        <div className="flex items-end gap-1 px-0 opacity-10 absolute bottom-0 left-0 right-0">
          {[20,35,48,22,60,38,44,28,55,32,40,18,50,30,42,25,58,34,46,24,52,36,44,20,38].map((h, i) => (
            <div key={i} className="bg-white flex-1 rounded-t"
                 style={{ height: `${h}px` }} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          6 RAISONS
      ══════════════════════════════════ */}
      <section className="py-16 px-8" style={{ background: '#0F2438' }}>
        <div className="max-w-6xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            {[
              { val: 'N°1', lbl: 'au Cameroun' },
              { val: '500+', lbl: 'Logements gérés' },
              { val: '15 min', lbl: 'de gestion/mois' },
              { val: '100%', lbl: 'en ligne' },
            ].map((s) => (
              <div key={s.val} className="text-center">
                <div className="text-4xl font-bold text-white mb-1">{s.val}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-widest mb-2"
                 style={{ color: 'rgba(255,255,255,0.35)' }}>POURQUOI LOCCAM ?</div>
            <h2 className="text-3xl font-bold text-white">
              6 raisons de choisir LocCam
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl p-5"
                   style={{ background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                     style={{ background: f.bg }}>
                  <span style={{ color: f.col }}>{f.icon}</span>
                </div>
                <div className="text-white font-bold text-sm mb-2">{f.title}</div>
                {f.items.map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs mb-1"
                       style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <IconCheck size={11} style={{ color: '#4ADE80' }} />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FONCTIONNALITÉS — TABS
      ══════════════════════════════════ */}
      <section className="py-16 px-8" style={{ background: '#F8FAFD' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-widest mb-2"
                 style={{ color: '#2E75B6' }}>L&apos;OUTIL</div>
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#1E2A3E' }}>
              Simplifiez et automatisez<br/>votre gestion locative
            </h2>
            <p className="text-sm" style={{ color: '#5B6E8C' }}>
              LocCam est un outil conçu pour les bailleurs et locataires camerounais.<br/>
              Gérez vos locations depuis n&apos;importe quel appareil.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 justify-center mb-8">
            {['Bailleur', 'Locataire', 'Locataire'].map((t, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={activeTab === i
                  ? { background: '#1A3C5E', color: '#fff' }
                  : { background: '#fff', color: '#5B6E8C', border: '1px solid #E6EDF4' }
                }>
                {t}
              </button>
            ))}
          </div>

          {/* Contenu tab */}
          <div className="grid grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#1E2A3E' }}>
                Synchronisez votre gestion locative
              </h3>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: '#5B6E8C' }}>
                Tous vos biens, contrats, paiements et communications
                centralisés dans un tableau de bord intuitif. Accessible
                depuis votre téléphone ou ordinateur.
              </p>
              {[
                'Tableau de bord temps réel', 'Contrats et quittances PDF',
                'Mobile Money Orange & MTN', 'Messagerie intégrée',
                'Rappels et relances automatiques',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                       style={{ background: '#ECFDF5' }}>
                    <IconCheck size={11} style={{ color: '#0F6E56' }} />
                  </div>
                  <span className="text-sm" style={{ color: '#1E2A3E' }}>{item}</span>
                </div>
              ))}
              <Link href="/register"
                    className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: '#1A3C5E' }}>
                Essayer gratuitement <IconArrowRight size={14} />
              </Link>
            </div>
            {/* Preview dashboard */}
            <div className="rounded-2xl overflow-hidden"
                 style={{ border: '1px solid #E6EDF4',
                          boxShadow: '0 10px 40px rgba(30,42,62,0.1)' }}>
              <div className="px-4 py-3 flex items-center gap-2"
                   style={{ background: '#F1F5F9', borderBottom: '1px solid #E6EDF4' }}>
                <div className="text-xs font-bold" style={{ color: '#1A3C5E' }}>Dashboard Bailleur</div>
                <div className="ml-auto flex gap-1">
                  {['#E6EDF4','#E6EDF4','#1A3C5E'].map((c,i) => (
                    <div key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="p-4" style={{ background: '#fff' }}>
                {/* KPIs mini */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { l: 'Biens', v: '24', c: '#2E75B6', bg: '#EEF4FA' },
                    { l: 'Occupation', v: '87%', c: '#0F6E56', bg: '#ECFDF5' },
                    { l: 'Revenus', v: '1.8M', c: '#C55A11', bg: '#FFFBEB' },
                  ].map(k => (
                    <div key={k.l} className="rounded-lg p-2.5" style={{ background: k.bg }}>
                      <div className="text-xs mb-0.5" style={{ color: k.c, opacity: 0.7 }}>{k.l}</div>
                      <div className="font-bold text-sm" style={{ color: k.c }}>{k.v}</div>
                    </div>
                  ))}
                </div>
                {/* Table mini */}
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #E6EDF4' }}>
                  {[
                    { n: 'Mbida Jean',  s: 'Confirmé', c: '#0F6E56', v: '85 000 XAF', bg: '#ECFDF5' },
                    { n: 'Ngo Sarah',   s: 'Confirmé', c: '#0F6E56', v: '120 000 XAF', bg: '#ECFDF5' },
                    { n: 'Bello Eric',  s: 'En retard', c: '#A32D2D', v: '-95 000 XAF', bg: '#FEF2F2' },
                  ].map(r => (
                    <div key={r.n} className="flex items-center gap-3 px-3 py-2"
                         style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                           style={{ background: '#1A3C5E' }}>{r.n[0]}</div>
                      <div className="flex-1 text-xs font-semibold" style={{ color: '#1E2A3E' }}>{r.n}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: r.bg, color: r.c }}>{r.s}</span>
                      <div className="text-xs font-bold" style={{ color: r.c }}>{r.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          MOBILE MONEY
      ══════════════════════════════════ */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-3"
                 style={{ color: '#0F6E56' }}>PAIEMENTS</div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#1E2A3E' }}>
              Sécurisez vos encaissements<br/>avec Mobile Money
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: '#5B6E8C' }}>
              LocCam est connecté à Orange Money et MTN Money. Le locataire
              paie en 30 secondes depuis son téléphone, vous recevez une
              notification immédiate et la quittance est générée automatiquement.
            </p>
            <div className="flex gap-3 mb-6">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm"
                   style={{ background: '#FFF7ED', border: '2px solid #FF6600', color: '#FF6600' }}>
                <span className="text-lg">↗</span> Orange Money
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm"
                   style={{ background: '#FEFCE8', border: '2px solid #FFCC00', color: '#92400E' }}>
                <span className="text-lg">▶</span> MTN Mobile Money
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm"
                   style={{ background: '#F1F5F9', border: '2px solid #E6EDF4', color: '#5B6E8C' }}>
                💵 Cash
              </div>
            </div>
            {[
              'Paiement en 30 secondes', 'Quittance instantanée',
              'Notification bailleur + locataire', 'Historique complet',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center"
                     style={{ background: '#ECFDF5' }}>
                  <IconCheck size={11} style={{ color: '#0F6E56' }} />
                </div>
                <span className="text-sm" style={{ color: '#1E2A3E' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Carte paiement */}
          <div className="rounded-2xl p-5"
               style={{ background: '#0A3D2E',
                        boxShadow: '0 20px 50px rgba(15,110,86,0.25)' }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-3"
                 style={{ color: 'rgba(255,255,255,0.4)' }}>
              PROCHAIN PAIEMENT — JANVIER 2026
            </div>
            {[
              { lbl: 'Loyer mensuel', val: '85 000 XAF' },
              { lbl: 'Eau (12.5 m³)', val: '3 125 XAF' },
              { lbl: 'Électricité (48 kWh)', val: '4 800 XAF' },
            ].map(r => (
              <div key={r.lbl} className="flex justify-between py-2"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{r.lbl}</span>
                <span className="text-sm font-semibold text-white">{r.val}</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 mt-1">
              <span className="font-bold text-white">Total</span>
              <span className="font-bold text-xl" style={{ color: '#4ADE80' }}>92 925 XAF</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button className="h-11 rounded-xl font-bold text-sm"
                      style={{ background: '#FF6600', color: '#fff' }}>
                Orange Money
              </button>
              <button className="h-11 rounded-xl font-bold text-sm"
                      style={{ background: '#FFCC00', color: '#1E2A3E' }}>
                MTN Money
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          TÉMOIGNAGES
      ══════════════════════════════════ */}
      <section className="py-16 px-8" style={{ background: '#F8FAFD' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-widest mb-2"
                 style={{ color: '#2E75B6' }}>TÉMOIGNAGES</div>
            <h2 className="text-3xl font-bold" style={{ color: '#1E2A3E' }}>
              Plus de 1 200 bailleurs<br/>nous font confiance
            </h2>
          </div>
          <div className="flex items-center gap-3 justify-center mb-2">
            {[1,2,3,4,5].map(i => (
              <IconStar key={i} size={20} style={{ color: '#FCD34D' }} fill="#FCD34D" />
            ))}
            <span className="font-bold ml-2" style={{ color: '#1E2A3E' }}>4.8/5</span>
          </div>
          <div className="text-xs text-center mb-8" style={{ color: '#8A9BB0' }}>
            Basé sur 347 avis vérifiés
          </div>
          <div className="grid grid-cols-3 gap-5">
            {TEMOIGNAGES.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-5"
                   style={{ border: '1px solid #E6EDF4',
                            boxShadow: '0 2px 12px rgba(30,42,62,0.06)' }}>
                <div className="flex gap-0.5 mb-3">
                  {Array(t.stars).fill(0).map((_, i) => (
                    <IconStar key={i} size={14} style={{ color: '#FCD34D' }} fill="#FCD34D" />
                  ))}
                </div>
                <p className="text-sm italic mb-4 leading-relaxed" style={{ color: '#5B6E8C' }}>
                  &laquo;{t.txt}&raquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                       style={{ background: t.bg, color: t.col }}>
                    {t.av}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#1E2A3E' }}>{t.name}</div>
                    <div className="text-xs" style={{ color: '#8A9BB0' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          TARIFS
      ══════════════════════════════════ */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-widest mb-2"
                 style={{ color: '#2E75B6' }}>TARIFS</div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1E2A3E' }}>
              Un prix simple qui s&apos;adapte<br/>à vos besoins
            </h2>
            <p className="text-sm" style={{ color: '#5B6E8C' }}>
              Sans engagement. Essai gratuit 30 jours. Résiliable à tout moment.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {PLANS.map((p) => (
              <div key={p.label} className="rounded-2xl p-6 relative"
                   style={{ background: p.bg, border: `2px solid ${p.border}`,
                            boxShadow: p.popular ? '0 10px 40px rgba(26,60,94,0.25)' : 'none' }}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                       style={{ background: '#C55A11' }}>
                    Populaire
                  </div>
                )}
                <div className="text-sm font-bold mb-3"
                     style={{ color: p.popular ? 'rgba(255,255,255,0.6)' : '#8A9BB0' }}>
                  {p.label}
                </div>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-xs font-semibold"
                        style={{ color: p.popular ? 'rgba(255,255,255,0.6)' : '#8A9BB0' }}>
                    XAF
                  </span>
                  <span className="text-4xl font-bold" style={{ color: p.popular ? '#fff' : '#1E2A3E' }}>
                    {p.price}
                  </span>
                  <span className="text-sm"
                        style={{ color: p.popular ? 'rgba(255,255,255,0.5)' : '#8A9BB0' }}>
                    {p.period}
                  </span>
                </div>
                <button className="w-full py-3 rounded-xl text-sm font-bold mb-5 transition-all"
                        style={{ background: p.btnBg, color: p.btnCol }}>
                  Tout gratuit
                </button>
                {p.features.map(f => (
                  <div key={f} className="flex items-center gap-2 mb-2">
                    <IconCheck size={13}
                               style={{ color: p.popular ? '#4ADE80' : '#0F6E56' }} />
                    <span className="text-xs"
                          style={{ color: p.popular ? 'rgba(255,255,255,0.7)' : '#5B6E8C' }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="text-center text-xs mt-5" style={{ color: '#8A9BB0' }}>
            *Essai gratuit hors contrat de bail, état des lieux, caution solidaire. Sans engagement.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════
          TYPES DE BIENS
      ══════════════════════════════════ */}
      <section className="py-10 px-8" style={{ background: '#F8FAFD' }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-xs font-bold uppercase tracking-widest mb-2"
               style={{ color: '#2E75B6' }}>COMPATIBLE AVEC</div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#1E2A3E' }}>
            Un bail adapté à <span style={{ color: '#2E75B6' }}>tous</span> vos biens !
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {BIEN_TYPES.map(b => (
              <span key={b} className="px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ background: '#fff', border: '1.5px solid #E6EDF4', color: '#5B6E8C' }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FAQ
      ══════════════════════════════════ */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-xs font-bold uppercase tracking-widest mb-2"
                 style={{ color: '#2E75B6' }}>FAQ</div>
            <h2 className="text-3xl font-bold" style={{ color: '#1E2A3E' }}>
              Trouvez les réponses<br/>à vos questions
            </h2>
          </div>
          {FAQS.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ══════════════════════════════════
          CTA FINAL
      ══════════════════════════════════ */}
      <section className="py-16 px-8"
               style={{ background: 'linear-gradient(135deg, #0F2438 0%, #1A3C5E 100%)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-xs font-bold uppercase tracking-widest mb-3"
               style={{ color: 'rgba(255,255,255,0.4)' }}>GRATUIT · SANS ENGAGEMENT</div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Essayez LocCam gratuitement !
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
            30 jours gratuits · Aucune carte bancaire requise<br/>
            Résiliable à tout moment
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/register"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                  style={{ background: '#fff', color: '#1A3C5E' }}>
              <IconRocket size={16} />
              Créer mon compte gratuitement
            </Link>
            <Link href="/login"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white"
                  style={{ background: 'rgba(255,255,255,0.1)',
                           border: '1px solid rgba(255,255,255,0.2)' }}>
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer className="py-10 px-8" style={{ background: '#0F2438' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-5 gap-8 mb-8">
            {/* Logo */}
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <IconBuilding size={16} color="white" />
                </div>
                <span className="text-white font-bold">LocCam</span>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                La gestion locative camerounaise simplifiée.
              </p>
              <div className="flex gap-3">
                <IconPhone size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                <IconMail size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                <IconMapPin size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
              </div>
            </div>

            {/* Liens */}
            {[
              { title: 'Produit', links: ['Fonctionnalités', 'Tarifs', 'Témoignages', 'Nouveautés'] },
              { title: 'Ressources', links: ['Documentation', 'Guide démarrage', 'Blog', 'FAQ'] },
              { title: 'Légal', links: ['CGU', 'CGV', 'Confidentialité', 'Cookies'] },
              { title: 'Contact', links: ['+237 699 000 000', 'contact@loccam.cm', 'Douala, Cameroun', 'Support'] },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-xs font-bold uppercase tracking-wider mb-3"
                     style={{ color: 'rgba(255,255,255,0.35)' }}>{col.title}</div>
                {col.links.map(l => (
                  <a key={l} href="#"
                     className="block text-xs mb-2 hover:underline"
                     style={{ color: 'rgba(255,255,255,0.45)' }}>{l}</a>
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6"
               style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              © 2026 LocCam · Tous droits réservés · Made in Cameroon 🇨🇲
            </div>
            <div className="flex gap-4">
              {['CGU', 'Confidentialité', 'Contact'].map(l => (
                <a key={l} href="#" className="text-xs hover:underline"
                   style={{ color: 'rgba(255,255,255,0.25)' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}