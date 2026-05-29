'use client'

import Link from 'next/link'
import { IconBuilding, IconPhone, IconMail, IconMapPin } from '@tabler/icons-react'

const COLS = [
  {
    title: 'Produit',
    links: [
      { l: 'Fonctionnalités', h: '#fonctionnalites' },
      { l: 'Tarifs', h: '#tarifs' },
      { l: 'Témoignages', h: '#temoignages' },
      { l: 'Nouveautés', h: '#' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { l: 'Documentation', h: '#' },
      { l: 'Guide démarrage', h: '#' },
      { l: 'Blog', h: '#' },
      { l: 'FAQ', h: '#faq' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { l: 'CGU', h: '#' },
      { l: 'Confidentialité', h: '#' },
      { l: 'Cookies', h: '#' },
      { l: 'Mentions légales', h: '#' },
    ],
  },
]

export default function LandingFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Top */}
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
              <div className="footer-contact-item">
                <IconPhone size={13} />
                <span>+237 699 000 000</span>
              </div>
              <div className="footer-contact-item">
                <IconMail size={13} />
                <span>contact@loccam.cm</span>
              </div>
              <div className="footer-contact-item">
                <IconMapPin size={13} />
                <span>Douala, Cameroun</span>
              </div>
            </div>
          </div>

          {/* Cols */}
          {COLS.map(col => (
            <div key={col.title} className="footer-col">
              <div className="footer-col-title">{col.title}</div>
              {col.links.map(l => (
                <a key={l.l} href={l.h} className="footer-link">{l.l}</a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p className="footer-copy">© 2026 LocCam · Tous droits réservés · Made in Cameroon 🇨🇲</p>
          <div className="footer-flag">
            <span style={{ fontSize: 14 }}>🇨🇲</span>
            <span style={{ fontSize: 12, color: 'rgba(248,250,252,0.25)' }}>Solution camerounaise</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background: #030710; padding: 64px 24px 32px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .footer-inner { max-width: 1100px; margin: 0 auto; }
        .footer-top {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px; margin-bottom: 48px;
        }
        .footer-brand {}
        .footer-logo {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; margin-bottom: 14px;
        }
        .footer-logo-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          display: flex; align-items: center; justify-content: center;
        }
        .footer-logo-text {
          font-family: var(--font-display, sans-serif);
          font-weight: 800; font-size: 17px; color: #F8FAFC;
          letter-spacing: -0.2px;
        }
        .footer-tagline {
          font-size: 13px; color: rgba(248,250,252,0.35);
          line-height: 1.65; max-width: 240px; margin-bottom: 20px;
        }
        .footer-contact { display: flex; flex-direction: column; gap: 8px; }
        .footer-contact-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: rgba(248,250,252,0.35);
        }
        .footer-contact-item svg { flex-shrink: 0; color: rgba(248,250,252,0.25); }

        .footer-col {}
        .footer-col-title {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(248,250,252,0.28);
          margin-bottom: 16px;
        }
        .footer-link {
          display: block; font-size: 13px; color: rgba(248,250,252,0.4);
          text-decoration: none; margin-bottom: 10px; transition: color 0.15s;
        }
        .footer-link:hover { color: rgba(248,250,252,0.8); }

        .footer-bottom {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap; gap: 10px;
        }
        .footer-copy { font-size: 12px; color: rgba(248,250,252,0.2); }
        .footer-flag { display: flex; align-items: center; gap: 7px; }

        @media (max-width: 900px) {
          .footer-top { grid-template-columns: 1fr 1fr; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .footer-top { grid-template-columns: 1fr; }
          .footer { padding: 48px 20px 28px; }
        }
      `}</style>
    </footer>
  )
}
