'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  IconBuilding, IconFileText, IconDeviceMobile,
  IconBell, IconMessage, IconCheck,
  IconGift, IconCut, IconClipboardList,
  IconHome2, IconCreditCard, IconTrendingUp, IconAlertCircle,
} from '@tabler/icons-react'

const KPIS = [
  { l: 'Biens',     v: '24',   c: '#60A5FA', bg: 'rgba(59,130,246,0.12)',  ico: <IconHome2 size={13}/> },
  { l: 'Taux occ.', v: '87%',  c: '#34D399', bg: 'rgba(16,185,129,0.12)', ico: <IconTrendingUp size={13}/> },
  { l: 'Revenus',   v: '1.8M', c: '#FBBF24', bg: 'rgba(245,158,11,0.12)', ico: <IconCreditCard size={13}/> },
  { l: 'Impayés',   v: '3',    c: '#F87171', bg: 'rgba(239,68,68,0.12)',   ico: <IconAlertCircle size={13}/> },
]

const FEATURES = [
  { ico: <IconFileText size={16}/>,     color: '#34D399', title: 'Documents automatiques',    desc: 'Contrats, quittances, attestations — conformes au droit camerounais' },
  { ico: <IconDeviceMobile size={16}/>, color: '#60A5FA', title: 'Orange Money & MTN Money',  desc: 'Paiement en 30 secondes, quittance générée instantanément' },
  { ico: <IconBell size={16}/>,         color: '#FBBF24', title: 'Relances automatiques',     desc: 'Rappels J-3, J-7 · Relances impayés J+7, J+15, J+30' },
  { ico: <IconMessage size={16}/>,      color: '#C084FC', title: 'Messagerie & signalements', desc: 'Communication directe liée à chaque logement' },
]

const AVANTAGES = [
  { ico: <IconGift size={18} style={{ color: '#60A5FA' }} />,         title: 'Essai gratuit 30 jours', sub: 'Toutes fonctionnalités incluses' },
  { ico: <IconClipboardList size={18} style={{ color: '#34D399' }} />, title: 'Sans carte bancaire',    sub: 'Aucun moyen de paiement requis' },
  { ico: <IconCut size={18} style={{ color: '#FBBF24' }} />,           title: 'Sans engagement',        sub: 'Résiliable à tout moment' },
]

export default function RegisterLeftPanel() {
  return (
    <div className="rg-left">
      <div className="rg-left-bg" />
      <div className="rg-left-grid" />
      <motion.div className="rg-orb rg-orb-1"
        animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="rg-orb rg-orb-2"
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />

      <div className="rg-left-inner">

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <Link href="/landing" className="rg-mkt-logo" style={{ textDecoration: 'none' }}>
            <div className="rg-mkt-logo-icon">
              <IconBuilding size={17} color="white" />
            </div>
            <span className="rg-mkt-logo-text">LocCam</span>
          </Link>
        </motion.div>

        {/* Titre */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <h2 className="rg-mkt-title">
            Inscrivez-vous et gérez<br />
            vos biens plus facilement
          </h2>
          <p className="rg-mkt-sub">
            LocCam vous donne tous les outils pour gérer seul vos locations au Cameroun — documents, paiements Mobile Money, messagerie et suivi des impayés.
          </p>
        </motion.div>

        {/* Avantages */}
        <motion.div className="rg-advantages"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.6 }}>
          {AVANTAGES.map((a, i) => (
            <motion.div key={a.title} className="rg-advantage-card"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }}>
              <div className="rg-advantage-ico">{a.ico}</div>
              <div className="rg-advantage-title">{a.title}</div>
              <div className="rg-advantage-sub">{a.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}>
          <div className="rg-mkt-label">Sur LocCam :</div>
          <div className="rg-features">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} className="rg-feature-row"
                initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.09, duration: 0.45 }}>
                <div className="rg-feature-ico" style={{ background: `${f.color}18`, color: f.color }}>
                  {f.ico}
                </div>
                <div>
                  <div className="rg-feature-title">{f.title}</div>
                  <div className="rg-feature-desc">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Témoignage */}
        <motion.div className="rg-temo"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}>
          <div className="rg-temo-stars">
            {[1,2,3,4,5].map(i => <IconCheck key={i} size={12} style={{ color: '#FCD34D' }} />)}
          </div>
          <p className="rg-temo-txt">
            &laquo;&nbsp;Cela fait 2 ans que j&apos;utilise LocCam et c&apos;est génial. La création du bail, les quittances, les relances — tout se génère automatiquement.&nbsp;&raquo;
          </p>
          <div className="rg-temo-author">
            <div className="rg-temo-av">ML</div>
            <div>
              <div className="rg-temo-name">Mbida Lionel</div>
              <div className="rg-temo-role">Bailleur · 12 biens · Douala</div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div className="rg-stats"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.6 }}>
          {[
            { v: '1 200+', l: 'Bailleurs' },
            { v: '500+',   l: 'Logements' },
            { v: '4,8/5', l: 'Satisfaction' },
            { v: '30 min', l: 'par mois' },
          ].map(s => (
            <div key={s.l} className="rg-stat">
              <div className="rg-stat-val">{s.v}</div>
              <div className="rg-stat-lbl">{s.l}</div>
            </div>
          ))}
        </motion.div>

        <motion.p className="rg-legal"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 0.5 }}>
          *Essai gratuit hors contrat de bail, état des lieux, caution solidaire.<br />
          Sans engagement. Résiliable à tout moment et sans frais.
        </motion.p>
      </div>
    </div>
  )
}
