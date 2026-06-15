'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { IconBuilding, IconPhone, IconMail, IconMapPin, IconChevronDown } from '@tabler/icons-react'

const COLS = [
  {
    title: 'Produit',
    links: [
      { l: 'Fonctionnalités', h: '#fonctionnalites' },
      { l: 'Tarifs',          h: '#tarifs' },
      { l: 'Témoignages',     h: '#temoignages' },
      { l: 'Nouveautés',      h: '#' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { l: 'Documentation',   h: '#' },
      { l: 'Guide démarrage', h: '#' },
      { l: 'Blog',            h: '#' },
      { l: 'FAQ',             h: '#faq' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { l: 'CGU',              h: '#' },
      { l: 'Confidentialité',  h: '#' },
      { l: 'Cookies',          h: '#' },
      { l: 'Mentions légales', h: '#' },
    ],
  },
]

function AccordionCol({ col }: { col: typeof COLS[0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="footer-accordion">
      <button
        onClick={() => setOpen(!open)}
        className="footer-accordion-btn">
        <span className="footer-col-title">{col.title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <IconChevronDown size={14} style={{ color: 'rgba(248,250,252,0.3)' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}>
            <div className="footer-accordion-links">
              {col.links.map(l => (
                <a key={l.l} href={l.h} className="footer-link">{l.l}</a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LandingFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* ── TOP ─────────────────────────────────────────── */}
        <div className="footer-top">

          {/* Brand */}
          <div className="footer-brand">
            <Link href="/landing" className="footer-logo">
              <div className="footer-logo-icon">
                <IconBuilding size={16} color="white" />
              </div>
              <span className="footer-logo-text">LocCam</span>
            </Link>
            <p className="footer-tagline">
              La gestion locative camerounaise simplifiée. Contrats, paiements Mobile Money, messagerie et relances automatiques.
            </p>
            <div className="footer-contact">
              {[
                { ico: <IconPhone size={12} />,  txt: '+237 699 000 000' },
                { ico: <IconMail size={12} />,   txt: 'contact@loccam.cm' },
                { ico: <IconMapPin size={12} />, txt: 'Douala, Cameroun' },
              ].map(c => (
                <div key={c.txt} className="footer-contact-item">
                  {c.ico}<span>{c.txt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop : colonnes normales */}
          <div className="footer-cols-desktop">
            {COLS.map(col => (
              <div key={col.title} className="footer-col">
                <div className="footer-col-title">{col.title}</div>
                {col.links.map(l => (
                  <a key={l.l} href={l.h} className="footer-link">{l.l}</a>
                ))}
              </div>
            ))}
          </div>

          {/* Mobile : accordéon */}
          <div className="footer-cols-mobile">
            {COLS.map(col => <AccordionCol key={col.title} col={col} />)}
          </div>
        </div>

        {/* ── BOTTOM ──────────────────────────────────────── */}
        <div className="footer-bottom">
          <p className="footer-copy">© 2026 LocCam · Tous droits réservés</p>
          <div className="footer-flag">
            <span style={{ fontSize: 13 }}>🇨🇲</span>
            <span style={{ fontSize: 11, color: 'rgba(248,250,252,0.25)' }}>Solution camerounaise</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background: #030710;
          padding: 56px 24px 28px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .footer-inner { max-width: 1100px; margin: 0 auto; }

        /* ── Top layout ── */
        .footer-top {
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 48px;
          margin-bottom: 40px;
          align-items: start;
        }

        /* ── Brand ── */
        .footer-logo {
          display: inline-flex; align-items: center; gap: 9px;
          text-decoration: none; margin-bottom: 14px;
        }
        .footer-logo-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .footer-logo-text {
          font-weight: 800; font-size: 16px; color: #F8FAFC; letter-spacing: -0.2px;
        }
        .footer-tagline {
          font-size: 12px; color: rgba(248,250,252,0.35);
          line-height: 1.65; max-width: 220px; margin-bottom: 18px;
        }
        .footer-contact { display: flex; flex-direction: column; gap: 7px; }
        .footer-contact-item {
          display: flex; align-items: center; gap: 7px;
          font-size: 12px; color: rgba(248,250,252,0.35);
        }
        .footer-contact-item svg { flex-shrink: 0; color: rgba(248,250,252,0.22); }

        /* ── Desktop cols ── */
        .footer-cols-desktop {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 24px;
        }
        .footer-cols-mobile { display: none; }

        .footer-col-title {
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(248,250,252,0.28);
          margin-bottom: 14px;
        }
        .footer-link {
          display: block; font-size: 13px; color: rgba(248,250,252,0.4);
          text-decoration: none; margin-bottom: 9px; transition: color 0.15s;
        }
        .footer-link:hover { color: rgba(248,250,252,0.8); }

        /* ── Accordion mobile ── */
        .footer-accordion {
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .footer-accordion-btn {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0; background: none; border: none; cursor: pointer;
          text-align: left;
        }
        .footer-accordion-btn .footer-col-title { margin-bottom: 0; }
        .footer-accordion-links {
          padding-bottom: 12px; display: flex; flex-direction: column; gap: 2px;
        }
        .footer-accordion-links .footer-link { margin-bottom: 0; padding: 6px 0; }

        /* ── Bottom ── */
        .footer-bottom {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap; gap: 10px;
        }
        .footer-copy { font-size: 11px; color: rgba(248,250,252,0.2); }
        .footer-flag { display: flex; align-items: center; gap: 6px; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .footer { padding: 40px 20px 24px; }
          .footer-top {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .footer-brand { text-align: center; }
          .footer-logo { display: inline-flex; }
          .footer-tagline { max-width: 100%; }
          .footer-contact { align-items: center; }
          .footer-cols-desktop { display: none; }
          .footer-cols-mobile { display: block; }
        }
        @media (max-width: 480px) {
          .footer { padding: 32px 16px 20px; }
        }
      `}</style>
    </footer>
  )
}
