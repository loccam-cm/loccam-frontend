'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { IconBuilding, IconX, IconMenu2 } from '@tabler/icons-react'

const LINKS = [
  { label: 'L\'outil',          href: '#fonctionnalites' },
  { label: 'Logique',     href: '#comment' },
  { label: 'Législation', href: '#bail' },
  { label: 'Tarifs',         href: '#tarifs' },
  { label: 'Contact',        href: '#contact' },
  
]

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu]         = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '60px',
        background: scrolled ? 'rgba(8,14,28,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/landing" className="nav-logo">
            <div className="nav-logo-icon">
              <IconBuilding size={17} color="white" />
            </div>
            <span className="nav-logo-text">LocCam</span>
          </Link>

          {/* Links */}
          <div className="nav-links">
            {LINKS.map(l => (
              <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
            ))}
          </div>

          {/* CTA */}
          <div className="nav-actions">
            <Link href="/login" className="nav-btn-ghost">Se connecter</Link>
            <Link href="/register" className="nav-btn-primary">Démarrer</Link>
            <button className="nav-burger" onClick={() => setMenu(!menu)}>
              {menu ? <IconX size={18} color="#F8FAFC" /> : <IconMenu2 size={18} color="#F8FAFC" />}
            </button>
          </div>
        </div>

        {/* Mobile */}
        <AnimatePresence>
          {menu && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden', background: 'rgba(8,14,28,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {LINKS.map(l => (
                  <a key={l.label} href={l.href} onClick={() => setMenu(false)}
                    style={{ fontSize: '15px', fontWeight: 500, color: 'rgba(248,250,252,0.7)', textDecoration: 'none', padding: '10px 8px' }}>
                    {l.label}
                  </a>
                ))}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                <Link href="/login" onClick={() => setMenu(false)}
                  style={{ fontSize: '14px', fontWeight: 600, color: '#60A5FA', textDecoration: 'none', padding: '10px 8px' }}>
                  Se connecter
                </Link>
                <Link href="/register" onClick={() => setMenu(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px', padding: '13px', borderRadius: '12px', background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', color: 'white', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>
                  Démarrer gratuitement
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <style>{`
        .nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
          height: 60px; display: flex; align-items: center; gap: 40px;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; flex-shrink: 0;
        }
        .nav-logo-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(37,99,235,0.45);
        }
        .nav-logo-text {
          font-family: var(--font-display, sans-serif);
          font-weight: 800; font-size: 19px; color: #F8FAFC;
          letter-spacing: -0.3px;
        }
        .nav-links {
          display: flex; gap: 28px; flex: 1;
        }
        .nav-link {
          font-size: 14px; font-weight: 500;
          color: rgba(248,250,252,0.55); text-decoration: none;
          transition: color 0.15s;
        }
        .nav-link:hover { color: #F8FAFC; }
        .nav-actions {
          display: flex; align-items: center; gap: 8px; margin-left: auto;
        }
        .nav-btn-ghost {
          font-size: 14px; font-weight: 600;
          color: rgba(248,250,252,0.65); text-decoration: none;
          padding: 8px 16px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s; background: transparent;
        }
        .nav-btn-ghost:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.2);
          color: #F8FAFC;
        }
        .nav-btn-primary {
          font-size: 14px; font-weight: 700; color: white;
          text-decoration: none; padding: 9px 20px; border-radius: 10px;
          background: linear-gradient(135deg,#2563EB,#1D4ED8);
          box-shadow: 0 4px 14px rgba(37,99,235,0.4);
          transition: all 0.2s;
        }
        .nav-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(37,99,235,0.55);
        }
        .nav-burger {
          display: none; width: 36px; height: 36px; border-radius: 9px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          align-items: center; justify-content: center; cursor: pointer;
        }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-btn-ghost { display: none; }
          .nav-burger { display: flex; }
        }
        @media (max-width: 480px) {
          .nav-btn-primary span { display: none; }
        }
      `}</style>
    </>
  )
}
