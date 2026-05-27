'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion'
import {
  IconBuilding, IconCheck, IconChevronDown, IconArrowRight,
  IconHome2, IconCreditCard, IconFileText, IconBell,
  IconMessage, IconTool, IconDroplet, IconShieldCheck,
  IconRocket, IconStar, IconPlayerPlay, IconX, IconMenu2,
  IconUsers, IconDeviceMobile, IconClipboardList, IconRefresh,
  IconLock, IconChevronRight, IconPhone, IconMail, IconMapPin,
  IconTrendingUp, IconCircleCheck,
} from '@tabler/icons-react'

// ────────────────────────────────────────────────────────────────
//  DATA
// ────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: <IconCreditCard size={22}/>, color:'#F59E0B', bg:'rgba(245,158,11,.1)',
    title:'Mobile Money natif',
    desc:'Orange Money & MTN Money intégrés nativement. Le locataire paie en 30 secondes, la quittance PDF est générée et envoyée instantanément.' },
  { icon: <IconFileText size={22}/>, color:'#10B981', bg:'rgba(16,185,129,.1)',
    title:'Documents automatiques',
    desc:'Contrats de bail, quittances mensuelles, attestations — générés automatiquement, conformes au droit camerounais.' },
  { icon: <IconShieldCheck size={22}/>, color:'#3B82F6', bg:'rgba(59,130,246,.1)',
    title:'Bailleurs certifiés CNI',
    desc:'Chaque bailleur est vérifié par photo CNI. Zéro anonymat. Locataires protégés dès l\'inscription.' },
  { icon: <IconBell size={22}/>, color:'#EF4444', bg:'rgba(239,68,68,.1)',
    title:'Relances automatiques',
    desc:'Rappels J-3, J-7. Relances impayés J+7, J+15, J+30. Suivi en temps réel, zéro effort de votre part.' },
  { icon: <IconMessage size={22}/>, color:'#8B5CF6', bg:'rgba(139,92,246,.1)',
    title:'Messagerie intégrée',
    desc:'Communication directe liée à chaque bien. Signalements de pannes tracés, assignés et suivis jusqu\'à résolution.' },
  { icon: <IconDroplet size={22}/>, color:'#06B6D4', bg:'rgba(6,182,212,.1)',
    title:'Charges eau & électricité',
    desc:'Relevés mensuels d\'index, calcul automatique des charges, inclus automatiquement dans la quittance.' },
]

const TEMOIGNAGES = [
  { stars:5, av:'NP', col:'#3B82F6',
    txt:'Depuis LocCam, je gère mes 8 appartements en moins de 30 minutes par mois. Les paiements Orange Money arrivent directement et les quittances se génèrent seules.',
    name:'Ngo Pauline', role:'Bailleur · 8 biens · Douala' },
  { stars:5, av:'TK', col:'#10B981',
    txt:'LocCam m\'a permis de formaliser toutes mes locations. Contrats, quittances, relances — tout est automatisé. Je recommande à tous les bailleurs camerounais.',
    name:'Tamba Kossé', role:'Bailleur · 15 biens · Yaoundé' },
  { stars:4, av:'MF', col:'#F59E0B',
    txt:'En tant que locataire, je reçois ma quittance instantanément après chaque paiement MTN Money. Très pratique pour mes démarches administratives.',
    name:'Mbida Fernande', role:'Locataire · Studio 101 · Douala' },
]

const PLANS = [
  { label:'Studio', price:'2 500', popular:false,
    features:['1 bien géré','Contrat de bail PDF','Quittances mensuelles','Support email'] },
  { label:'Appartement', price:'7 500', popular:true,
    features:['Jusqu\'à 5 biens','Mobile Money inclus','Rappels automatiques','Messagerie & signalements','Support prioritaire 24h'] },
  { label:'Résidence', price:'15 000', popular:false,
    features:['Biens illimités','Tout Appartement inclus','État des lieux','Logs système avancés','Account manager dédié'] },
]

const FAQS = [
  { q:'Comment fonctionne l\'essai gratuit ?',
    a:'30 jours complets avec toutes les fonctionnalités. Aucune carte bancaire requise. Vous pouvez résilier à tout moment sans frais ni contrainte.' },
  { q:'LocCam fonctionne avec Orange Money et MTN Mobile Money ?',
    a:'Absolument. LocCam est intégré nativement avec Orange Money Cameroun et MTN Mobile Money via CinetPay. Le locataire reçoit un lien de paiement et règle en 30 secondes depuis son téléphone.' },
  { q:'Mon locataire ne peut pas payer, comment je suis prévenu ?',
    a:'LocCam envoie des rappels automatiques J-3 et J-7 avant l\'échéance. En cas d\'impayé, des relances sont envoyées à J+7, J+15 et J+30 avec suivi en temps réel depuis votre tableau de bord.' },
  { q:'Les contrats générés sont-ils légalement valides ?',
    a:'Oui. Tous les contrats et quittances générés par LocCam sont conformes au droit camerounais en vigueur et reconnus par les administrations.' },
  { q:'Puis-je gérer des biens dans plusieurs villes ?',
    a:'Oui. Un seul compte vous permet de gérer des biens répartis dans toutes les villes du Cameroun. Douala, Yaoundé, Bafoussam, Limbé — tout centralisé.' },
]

// ────────────────────────────────────────────────────────────────
//  HOOKS & UTILS
// ────────────────────────────────────────────────────────────────
function useParallax(offset = 80) {
  const { scrollY } = useScroll()
  return useTransform(scrollY, [0, 600], [0, -offset])
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div layout className="overflow-hidden rounded-2xl mb-3 cursor-pointer select-none"
      style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)' }}
      onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        <span className="text-sm font-semibold" style={{ color:'#F1F5F9' }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration:.2 }} className="flex-shrink-0">
          <IconChevronDown size={16} style={{ color:'rgba(255,255,255,.35)' }} />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body"
            initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:.25, ease:'easeInOut' }}>
            <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color:'rgba(241,245,249,.5)' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────────
//  MAIN
// ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menu, setMenu] = useState(false)
  const [video, setVideo] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const heroY = useParallax(60)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=Outfit:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Outfit',sans-serif;background:#080E1C;color:#F1F5F9;overflow-x:hidden}
        h1,h2,h3,.display{font-family:'Cabinet Grotesk',sans-serif}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#080E1C}
        ::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:4px}

        .grad-text{
          background:linear-gradient(135deg,#60A5FA 0%,#34D399 55%,#FBBF24 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text
        }
        .grad-text-green{
          background:linear-gradient(90deg,#34D399,#10B981);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text
        }

        .glass-card{
          background:rgba(255,255,255,.03);
          border:1px solid rgba(255,255,255,.07);
          backdrop-filter:blur(8px);
        }
        .glass-card:hover{
          background:rgba(255,255,255,.05);
          border-color:rgba(99,153,255,.25);
          transform:translateY(-3px);
          box-shadow:0 16px 40px rgba(0,0,0,.35);
        }
        .glass-card{transition:all .28s cubic-bezier(.22,1,.36,1)}

        .btn-cta{
          background:linear-gradient(135deg,#2563EB,#1E40AF);
          box-shadow:0 4px 20px rgba(37,99,235,.45);
          transition:all .2s ease;
        }
        .btn-cta:hover{box-shadow:0 8px 32px rgba(37,99,235,.65);transform:translateY(-2px)}
        .btn-cta:active{transform:translateY(0);box-shadow:0 2px 10px rgba(37,99,235,.4)}

        .btn-outline{
          border:1px solid rgba(255,255,255,.15);
          transition:all .2s ease;
        }
        .btn-outline:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.3)}

        .noise-overlay{
          position:fixed;inset:0;pointer-events:none;z-index:999;opacity:.025;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .hero-glow{
          position:absolute;inset:0;
          background:
            radial-gradient(ellipse 70% 55% at 15% 55%,rgba(37,99,235,.14) 0%,transparent 55%),
            radial-gradient(ellipse 50% 40% at 80% 25%,rgba(16,185,129,.09) 0%,transparent 50%),
            radial-gradient(ellipse 35% 50% at 50% 95%,rgba(139,92,246,.07) 0%,transparent 50%);
          pointer-events:none;
        }

        .dot-grid{
          background-image:radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px);
          background-size:28px 28px;
        }

        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes floatB{0%,100%{transform:translateY(-5px)}50%{transform:translateY(5px)}}
        @keyframes ping{75%,100%{transform:scale(1.8);opacity:0}}
        .float{animation:float 5s ease-in-out infinite}
        .floatB{animation:floatB 4.5s ease-in-out infinite .6s}
        .ping{animation:ping 1.8s cubic-bezier(0,0,.2,1) infinite}

        .plan-popular{
          background:linear-gradient(160deg,rgba(37,99,235,.18),rgba(29,78,216,.08));
          border:1.5px solid rgba(59,130,246,.4)!important;
          box-shadow:0 0 40px rgba(37,99,235,.2);
        }
        .plan-popular:hover{box-shadow:0 0 60px rgba(37,99,235,.35)!important}

        .feature-icon-wrap{transition:transform .3s ease}
        .glass-card:hover .feature-icon-wrap{transform:scale(1.12) rotate(4deg)}

        @media(max-width:768px){
          .hero-title{font-size:clamp(2rem,9vw,3.2rem)!important}
          .hide-mobile{display:none!important}
          .stack-mobile{flex-direction:column!important}
        }
      `}</style>

      <div className="noise-overlay" />

      <div style={{ minHeight:'100vh', background:'#080E1C' }}>

        {/* ── NAVBAR ──────────────────────────────────────────── */}
        <motion.nav
          initial={{ y:-20, opacity:0 }}
          animate={{ y:0, opacity:1 }}
          transition={{ duration:.55 }}
          style={{
            position:'fixed', top:0, left:0, right:0, zIndex:50,
            transition:'all .3s ease',
            background: scrolled ? 'rgba(8,14,28,.92)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(255,255,255,.06)' : '1px solid transparent',
          }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px', height:'64px', display:'flex', alignItems:'center', gap:'32px' }}>
            {/* Logo */}
            <Link href="/" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none', flexShrink:0 }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#2563EB,#1D4ED8)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(37,99,235,.45)' }}>
                <IconBuilding size={18} color="white" />
              </div>
              <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'19px', color:'#F1F5F9', letterSpacing:'-.3px' }}>LocCam</span>
            </Link>

            {/* Links */}
            <div className="hide-mobile" style={{ display:'flex', gap:'28px', flex:1 }}>
              {['Fonctionnalités','Tarifs','Témoignages','FAQ'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`}
                   style={{ fontSize:'14px', fontWeight:500, color:'rgba(241,245,249,.55)', textDecoration:'none', transition:'color .15s' }}
                   onMouseEnter={e=>(e.currentTarget.style.color='#F1F5F9')}
                   onMouseLeave={e=>(e.currentTarget.style.color='rgba(241,245,249,.55)')}>
                  {l}
                </a>
              ))}
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginLeft:'auto' }}>
              <Link href="/login"
                    className="hide-mobile btn-outline"
                    style={{ fontSize:'13px', fontWeight:600, color:'rgba(241,245,249,.75)', textDecoration:'none', padding:'8px 18px', borderRadius:'12px', background:'transparent' }}>
                Se connecter
              </Link>
              <Link href="/register"
                    className="btn-cta"
                    style={{ fontSize:'13px', fontWeight:700, color:'white', textDecoration:'none', padding:'9px 20px', borderRadius:'12px', display:'flex', alignItems:'center', gap:'7px' }}>
                <IconRocket size={14} />
                <span className="hide-mobile">Démarrer gratuitement</span>
                <span style={{ display:'none' }} className="show-mobile">Démarrer</span>
              </Link>
              <button className="btn-outline" style={{ width:'38px', height:'38px', borderRadius:'10px', background:'transparent', display:'none', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                      id="menu-btn"
                      onClick={() => setMenu(!menu)}>
                {menu ? <IconX size={17} color="#F1F5F9" /> : <IconMenu2 size={17} color="#F1F5F9" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {menu && (
              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                          exit={{ height:0, opacity:0 }} transition={{ duration:.2 }}
                          style={{ overflow:'hidden', background:'rgba(8,14,28,.97)', borderTop:'1px solid rgba(255,255,255,.05)' }}>
                <div style={{ padding:'16px 24px 20px', display:'flex', flexDirection:'column', gap:'8px' }}>
                  {['Fonctionnalités','Tarifs','Témoignages','FAQ'].map(l => (
                    <a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setMenu(false)}
                       style={{ fontSize:'15px', fontWeight:500, color:'rgba(241,245,249,.7)', textDecoration:'none', padding:'8px 0' }}>
                      {l}
                    </a>
                  ))}
                  <Link href="/login" onClick={()=>setMenu(false)}
                        style={{ fontSize:'14px', fontWeight:600, color:'#60A5FA', textDecoration:'none', padding:'8px 0' }}>
                    Se connecter
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="dot-grid" style={{ minHeight:'100vh', display:'flex', alignItems:'center', position:'relative', overflow:'hidden', paddingTop:'64px' }}>
          <div className="hero-glow" />

          {/* Orbes */}
          <div style={{ position:'absolute', top:'15%', right:'5%', width:'340px', height:'340px', borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,.18),transparent 70%)', filter:'blur(40px)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'10%', left:'5%', width:'260px', height:'260px', borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,.12),transparent 70%)', filter:'blur(40px)', pointerEvents:'none' }} />

          <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'80px 24px 100px', width:'100%' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'64px', alignItems:'center' }}>

              {/* LEFT */}
              <motion.div style={{ y: heroY }}>
                <motion.div initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }}
                            transition={{ delay:.15, duration:.5 }}
                            style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 14px', borderRadius:'100px', background:'rgba(37,99,235,.12)', border:'1px solid rgba(59,130,246,.25)', marginBottom:'28px' }}>
                  <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#3B82F6', position:'relative' }}>
                    <div className="ping" style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(59,130,246,.4)' }} />
                  </div>
                  <span style={{ fontSize:'12px', fontWeight:600, color:'#93C5FD', letterSpacing:'.3px' }}>
                    Solution N°1 de gestion locative au Cameroun
                  </span>
                </motion.div>

                <motion.h1 className="hero-title"
                  initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:.25, duration:.65, ease:[.22,1,.36,1] }}
                  style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontSize:'clamp(2.4rem,4.5vw,3.8rem)', fontWeight:800, lineHeight:1.08, letterSpacing:'-.5px', marginBottom:'24px' }}>
                  Gérez vos locations<br/>
                  <span className="grad-text">sans friction.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:.35, duration:.6 }}
                  style={{ fontSize:'17px', lineHeight:1.65, color:'rgba(241,245,249,.55)', maxWidth:'460px', marginBottom:'36px', fontWeight:400 }}>
                  Contrats PDF, paiements Orange Money & MTN Mobile Money, messagerie, relances automatiques — tout ce dont un bailleur camerounais a besoin, en un seul espace.
                </motion.p>

                <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                            transition={{ delay:.45, duration:.55 }}
                            style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'40px' }}>
                  <Link href="/register" className="btn-cta"
                        style={{ display:'flex', alignItems:'center', gap:'9px', padding:'14px 28px', borderRadius:'14px', fontWeight:700, fontSize:'15px', color:'white', textDecoration:'none' }}>
                    <IconRocket size={17} />
                    Démarrer gratuitement — 30 jours
                  </Link>
                  <button onClick={()=>setVideo(true)} className="btn-outline"
                          style={{ display:'flex', alignItems:'center', gap:'10px', padding:'14px 22px', borderRadius:'14px', fontWeight:600, fontSize:'14px', color:'rgba(241,245,249,.75)', background:'transparent', cursor:'pointer' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'rgba(255,255,255,.09)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <IconPlayerPlay size={13} color="#F1F5F9" />
                    </div>
                    Voir la démo
                  </button>
                </motion.div>

                {/* Social proof */}
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.6 }}
                            style={{ display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', marginRight:'-4px' }}>
                    {['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6'].map((c,i) => (
                      <div key={i} style={{ width:'32px', height:'32px', borderRadius:'50%', background:c, border:'2px solid #080E1C', marginLeft: i > 0 ? '-8px' : 0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'white' }}>
                        {['K','N','T','M','B'][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ display:'flex', gap:'2px', marginBottom:'2px' }}>
                      {[1,2,3,4,5].map(i=><IconStar key={i} size={13} style={{ color:'#FCD34D' }} fill="#FCD34D" />)}
                    </div>
                    <p style={{ fontSize:'12px', color:'rgba(241,245,249,.4)', lineHeight:1.4 }}>
                      Utilisé par <strong style={{ color:'#F1F5F9' }}>1 200+</strong> bailleurs
                    </p>
                  </div>
                  <div style={{ width:'1px', height:'30px', background:'rgba(255,255,255,.1)' }} />
                  <div style={{ fontSize:'12px', color:'rgba(241,245,249,.4)' }}>
                    Aucune carte bancaire requise
                  </div>
                </motion.div>
              </motion.div>

              {/* RIGHT — Dashboard card */}
              <div className="hide-mobile" style={{ position:'relative' }}>
                <motion.div className="float"
                  initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:.4, duration:.8, ease:[.22,1,.36,1] }}
                  style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(59,130,246,.2)', borderRadius:'24px', overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04)' }}>

                  {/* Browser bar */}
                  <div style={{ padding:'12px 16px', background:'rgba(255,255,255,.03)', borderBottom:'1px solid rgba(255,255,255,.05)', display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ display:'flex', gap:'5px' }}>
                      {['#EF4444','#F59E0B','#10B981'].map((c,i)=><div key={i} style={{ width:'10px', height:'10px', borderRadius:'50%', background:c }} />)}
                    </div>
                    <div style={{ flex:1, margin:'0 12px', height:'22px', borderRadius:'6px', background:'rgba(255,255,255,.05)', display:'flex', alignItems:'center', padding:'0 10px' }}>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,.25)' }}>app.loccam.cm/bailleur</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding:'20px' }}>
                    {/* KPI row */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
                      {[
                        { l:'Logements', v:'24', c:'#3B82F6', bg:'rgba(59,130,246,.1)' },
                        { l:'Occupation', v:'87%', c:'#10B981', bg:'rgba(16,185,129,.1)' },
                        { l:'Revenus', v:'1.8M XAF', c:'#F59E0B', bg:'rgba(245,158,11,.1)' },
                        { l:'Impayés', v:'3', c:'#EF4444', bg:'rgba(239,68,68,.1)' },
                      ].map(k => (
                        <div key={k.l} style={{ background:k.bg, borderRadius:'12px', padding:'12px' }}>
                          <div style={{ fontSize:'11px', color:'rgba(255,255,255,.4)', marginBottom:'4px' }}>{k.l}</div>
                          <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:700, fontSize:'16px', color:k.c }}>{k.v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Payments list */}
                    <div style={{ background:'rgba(255,255,255,.03)', borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(255,255,255,.05)' }}>
                      <div style={{ padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                        <span style={{ fontSize:'11px', fontWeight:600, color:'rgba(255,255,255,.35)' }}>Paiements récents</span>
                      </div>
                      {[
                        { n:'Mbida Jean', m:'Orange Money', v:'85 000', ok:true },
                        { n:'Ngo Sarah', m:'MTN Money', v:'120 000', ok:true },
                        { n:'Bello Eric', m:'Impayé', v:'95 000', ok:false },
                      ].map(r => (
                        <div key={r.n} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,.03)' }}>
                          <div style={{ width:'26px', height:'26px', borderRadius:'8px', background: r.ok ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color: r.ok ? '#34D399' : '#F87171', flexShrink:0 }}>
                            {r.n[0]}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:'12px', color:'rgba(255,255,255,.85)', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.n}</div>
                            <div style={{ fontSize:'10px', color:'rgba(255,255,255,.3)' }}>{r.m}</div>
                          </div>
                          <div style={{ fontSize:'12px', fontWeight:700, color: r.ok ? '#34D399' : '#F87171', flexShrink:0 }}>
                            {r.v} XAF
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Floating badges */}
                <motion.div className="floatB"
                  initial={{ opacity:0, scale:.85 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:.9 }}
                  style={{ position:'absolute', bottom:'-20px', left:'-28px', background:'rgba(10,20,40,.9)', border:'1px solid rgba(16,185,129,.25)', borderRadius:'16px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px', backdropFilter:'blur(12px)', boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'rgba(16,185,129,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <IconCircleCheck size={18} style={{ color:'#34D399' }} />
                  </div>
                  <div>
                    <div style={{ fontSize:'12px', fontWeight:700, color:'#F1F5F9' }}>Quittance générée</div>
                    <div style={{ fontSize:'11px', color:'rgba(241,245,249,.4)' }}>Orange Money · 92 925 XAF</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity:0, scale:.85 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:1.05 }}
                  style={{ position:'absolute', top:'-16px', right:'-16px', background:'rgba(10,20,40,.9)', border:'1px solid rgba(59,130,246,.25)', borderRadius:'14px', padding:'10px 14px', display:'flex', alignItems:'center', gap:'7px', backdropFilter:'blur(12px)' }}>
                  <IconShieldCheck size={15} style={{ color:'#60A5FA' }} />
                  <span style={{ fontSize:'12px', fontWeight:700, color:'#93C5FD' }}>CNI vérifiée</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Scroll cue */}
          <motion.div animate={{ y:[0,8,0] }} transition={{ repeat:Infinity, duration:2.2 }}
            style={{ position:'absolute', bottom:'32px', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
            <span style={{ fontSize:'11px', color:'rgba(255,255,255,.25)', letterSpacing:'.4px' }}>DÉFILER</span>
            <IconChevronDown size={15} style={{ color:'rgba(255,255,255,.2)' }} />
          </motion.div>
        </section>

        {/* ── STATS ──────────────────────────────────────────────── */}
        <section style={{ background:'rgba(37,99,235,.07)', borderTop:'1px solid rgba(59,130,246,.12)', borderBottom:'1px solid rgba(59,130,246,.12)' }}>
          <div style={{ maxWidth:'900px', margin:'0 auto', padding:'28px 24px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0' }}>
              {[
                { val:'1 200+', lbl:'Bailleurs actifs',  ico:<IconUsers size={17}/> },
                { val:'500+',   lbl:'Logements gérés',   ico:<IconHome2 size={17}/> },
                { val:'15 min', lbl:'Gestion / mois',    ico:<IconRefresh size={17}/> },
                { val:'4.8/5',  lbl:'Satisfaction',      ico:<IconStar size={17}/> },
              ].map((s,i) => (
                <Reveal key={s.val} delay={i*.08}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'0 20px', borderRight: i < 3 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
                    <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'rgba(37,99,235,.18)', display:'flex', alignItems:'center', justifyContent:'center', color:'#60A5FA', flexShrink:0 }}>
                      {s.ico}
                    </div>
                    <div>
                      <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'22px', color:'#F1F5F9', lineHeight:1.1 }}>{s.val}</div>
                      <div style={{ fontSize:'12px', color:'rgba(241,245,249,.4)', marginTop:'2px' }}>{s.lbl}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────────────────── */}
        <section id="fonctionnalités" style={{ padding:'96px 24px' }}>
          <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
            <Reveal className="text-center" style={{ textAlign:'center', marginBottom:'64px' }}>
              <div style={{ width:'40px', height:'3px', borderRadius:'2px', background:'linear-gradient(90deg,#2563EB,#10B981)', margin:'0 auto 16px' }} />
              <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'.12em', color:'#60A5FA', textTransform:'uppercase', marginBottom:'12px' }}>Pourquoi LocCam</p>
              <h2 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontSize:'clamp(1.9rem,3.5vw,2.9rem)', fontWeight:800, lineHeight:1.1, letterSpacing:'-.3px', marginBottom:'16px' }}>
                Tout ce qu&apos;un bailleur<br/>
                <span className="grad-text">camerounais a besoin.</span>
              </h2>
              <p style={{ fontSize:'16px', color:'rgba(241,245,249,.5)', maxWidth:'480px', margin:'0 auto', lineHeight:1.65 }}>
                LocCam centralise les tâches répétitives de la gestion locative. Concentrez-vous sur ce qui compte.
              </p>
            </Reveal>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'16px' }}>
              {FEATURES.map((f,i) => (
                <Reveal key={f.title} delay={i*.07}>
                  <div className="glass-card feature-card" style={{ borderRadius:'20px', padding:'28px', height:'100%' }}>
                    <div className="feature-icon-wrap" style={{ width:'48px', height:'48px', borderRadius:'14px', background:f.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'18px' }}>
                      <span style={{ color:f.color }}>{f.icon}</span>
                    </div>
                    <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:700, fontSize:'17px', color:'#F1F5F9', marginBottom:'10px' }}>{f.title}</h3>
                    <p style={{ fontSize:'14px', color:'rgba(241,245,249,.5)', lineHeight:1.65 }}>{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── MOBILE MONEY ───────────────────────────────────────── */}
        <section style={{ padding:'96px 24px', background:'rgba(16,185,129,.03)', borderTop:'1px solid rgba(16,185,129,.07)', borderBottom:'1px solid rgba(16,185,129,.07)' }}>
          <div style={{ maxWidth:'1100px', margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'64px', alignItems:'center' }}>

            <Reveal>
              <div style={{ width:'40px', height:'3px', borderRadius:'2px', background:'linear-gradient(90deg,#10B981,#34D399)', marginBottom:'16px' }} />
              <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'.12em', color:'#34D399', textTransform:'uppercase', marginBottom:'12px' }}>Paiements</p>
              <h2 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontSize:'clamp(1.8rem,3.2vw,2.6rem)', fontWeight:800, lineHeight:1.1, letterSpacing:'-.3px', marginBottom:'18px' }}>
                Encaissez via<br/>
                <span className="grad-text-green">Mobile Money.</span>
              </h2>
              <p style={{ fontSize:'16px', color:'rgba(241,245,249,.5)', lineHeight:1.65, maxWidth:'420px', marginBottom:'32px' }}>
                Le locataire paie en 30 secondes depuis son téléphone. Vous recevez une notification immédiate et la quittance est générée automatiquement.
              </p>

              <div style={{ display:'flex', gap:'10px', marginBottom:'32px', flexWrap:'wrap' }}>
                {[
                  { src:'/orange-money.jpg', label:'Orange Money', borderColor:'rgba(255,102,0,.3)', bg:'rgba(255,102,0,.08)', color:'#FF8C42' },
                  { src:'/mtn-money.jpg', label:'MTN Mobile Money', borderColor:'rgba(255,204,0,.25)', bg:'rgba(255,204,0,.07)', color:'#FCD34D' },
                  { label:'Cash', borderColor:'rgba(255,255,255,.1)', bg:'rgba(255,255,255,.04)', color:'rgba(241,245,249,.55)', icon:<IconCreditCard size={15}/> },
                ].map(b => (
                  <div key={b.label} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 16px', borderRadius:'14px', background:b.bg, border:`1.5px solid ${b.borderColor}`, fontSize:'13px', fontWeight:700, color:b.color }}>
                    {'src' in b && b.src
                      ? <img src={b.src} alt={b.label} style={{ height:'22px', width:'auto', objectFit:'contain', borderRadius:'4px' }} />
                      : b.icon}
                    {b.label}
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {[
                  { ico:<IconDeviceMobile size={14}/>, t:'Paiement en 30 secondes', c:'#34D399' },
                  { ico:<IconFileText size={14}/>, t:'Quittance PDF instantanée', c:'#60A5FA' },
                  { ico:<IconBell size={14}/>, t:'Notification immédiate', c:'#F59E0B' },
                  { ico:<IconClipboardList size={14}/>, t:'Historique complet', c:'#C084FC' },
                ].map(item => (
                  <div key={item.t} style={{ display:'flex', alignItems:'center', gap:'9px', padding:'11px 14px', borderRadius:'12px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.06)' }}>
                    <span style={{ color:item.c }}>{item.ico}</span>
                    <span style={{ fontSize:'12px', fontWeight:500, color:'rgba(241,245,249,.8)' }}>{item.t}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div style={{ background:'rgba(4,34,28,.6)', border:'1px solid rgba(16,185,129,.2)', borderRadius:'24px', padding:'28px', boxShadow:'0 0 50px rgba(16,185,129,.12)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
                  <div>
                    <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'.1em', color:'rgba(255,255,255,.35)', textTransform:'uppercase', marginBottom:'6px' }}>Prochain paiement</div>
                    <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'2rem', color:'#34D399', lineHeight:1 }}>92 925 XAF</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,.35)', marginBottom:'4px' }}>Échéance</div>
                    <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:700, fontSize:'15px', color:'#FBBF24' }}>31 mai 2026</div>
                  </div>
                </div>
                {[
                  { l:'Loyer mensuel', v:'85 000 XAF' },
                  { l:'Eau (12.5 m³)', v:'3 125 XAF' },
                  { l:'Électricité (48 kWh)', v:'4 800 XAF' },
                ].map(r => (
                  <div key={r.l} style={{ display:'flex', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                    <span style={{ fontSize:'14px', color:'rgba(255,255,255,.5)' }}>{r.l}</span>
                    <span style={{ fontSize:'14px', fontWeight:600, color:'#F1F5F9' }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', padding:'14px 0 20px' }}>
                  <span style={{ fontWeight:700, color:'#F1F5F9' }}>Total</span>
                  <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'1.25rem', color:'#34D399' }}>92 925 XAF</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <button style={{ padding:'13px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#FF6600,#E55A00)', color:'white', fontWeight:700, fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', boxShadow:'0 4px 14px rgba(255,102,0,.3)' }}>
                    <img src="/orange-money.jpg" alt="" style={{ height:'18px', width:'auto', borderRadius:'3px' }} />
                    Orange
                  </button>
                  <button style={{ padding:'13px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#FFCC00,#E6B800)', color:'#1C1C1E', fontWeight:700, fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', boxShadow:'0 4px 14px rgba(255,204,0,.25)' }}>
                    <img src="/mtn-money.jpg" alt="" style={{ height:'18px', width:'auto', borderRadius:'3px' }} />
                    MTN
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── TÉMOIGNAGES ───────────────────────────────────────── */}
        <section id="témoignages" style={{ padding:'96px 24px' }}>
          <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
            <Reveal style={{ textAlign:'center', marginBottom:'60px' }}>
              <div style={{ width:'40px', height:'3px', borderRadius:'2px', background:'linear-gradient(90deg,#2563EB,#10B981)', margin:'0 auto 16px' }} />
              <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'.12em', color:'#60A5FA', textTransform:'uppercase', marginBottom:'12px' }}>Ils nous font confiance</p>
              <h2 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontSize:'clamp(1.9rem,3.5vw,2.9rem)', fontWeight:800, letterSpacing:'-.3px' }}>
                Plus de 1 200 bailleurs<br/>
                <span className="grad-text">nous recommandent.</span>
              </h2>
            </Reveal>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'16px' }}>
              {TEMOIGNAGES.map((t,i) => (
                <Reveal key={t.name} delay={i*.1}>
                  <div className="glass-card" style={{ borderRadius:'20px', padding:'28px', height:'100%', display:'flex', flexDirection:'column' }}>
                    <div style={{ display:'flex', gap:'3px', marginBottom:'16px' }}>
                      {Array(t.stars).fill(0).map((_,j) => <IconStar key={j} size={14} style={{ color:'#FCD34D' }} fill="#FCD34D" />)}
                    </div>
                    <p style={{ fontSize:'14px', lineHeight:1.7, color:'rgba(241,245,249,.6)', fontStyle:'italic', flex:1, marginBottom:'20px' }}>
                      &ldquo;{t.txt}&rdquo;
                    </p>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:`${t.col}20`, border:`1px solid ${t.col}35`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'14px', color:t.col, flexShrink:0 }}>
                        {t.av}
                      </div>
                      <div>
                        <div style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:700, fontSize:'14px', color:'#F1F5F9' }}>{t.name}</div>
                        <div style={{ fontSize:'12px', color:'rgba(241,245,249,.38)' }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── TARIFS ─────────────────────────────────────────────── */}
        <section id="tarifs" style={{ padding:'96px 24px', background:'rgba(255,255,255,.015)', borderTop:'1px solid rgba(255,255,255,.04)' }}>
          <div style={{ maxWidth:'960px', margin:'0 auto' }}>
            <Reveal style={{ textAlign:'center', marginBottom:'60px' }}>
              <div style={{ width:'40px', height:'3px', borderRadius:'2px', background:'linear-gradient(90deg,#2563EB,#10B981)', margin:'0 auto 16px' }} />
              <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'.12em', color:'#60A5FA', textTransform:'uppercase', marginBottom:'12px' }}>Tarifs</p>
              <h2 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontSize:'clamp(1.9rem,3.5vw,2.9rem)', fontWeight:800, letterSpacing:'-.3px', marginBottom:'10px' }}>
                Un prix simple, <span className="grad-text">sans surprise.</span>
              </h2>
              <p style={{ fontSize:'15px', color:'rgba(241,245,249,.4)' }}>Sans engagement · Essai 30 jours · Résiliable à tout moment</p>
            </Reveal>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
              {PLANS.map((p,i) => (
                <Reveal key={p.label} delay={i*.1}>
                  <div className={p.popular ? 'plan-popular' : 'glass-card'} style={{ borderRadius:'20px', padding:'28px 24px', height:'100%', display:'flex', flexDirection:'column', position:'relative', border: p.popular ? undefined : '1px solid rgba(255,255,255,.07)' }}>
                    {p.popular && (
                      <div style={{ position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)', padding:'4px 14px', borderRadius:'100px', background:'linear-gradient(135deg,#2563EB,#7C3AED)', fontSize:'11px', fontWeight:700, color:'white', whiteSpace:'nowrap' }}>
                        Plus populaire
                      </div>
                    )}
                    <div style={{ marginBottom:'20px' }}>
                      <div style={{ fontSize:'13px', fontWeight:700, color: p.popular ? '#93C5FD' : 'rgba(241,245,249,.45)', marginBottom:'8px' }}>{p.label}</div>
                      <div style={{ display:'flex', alignItems:'baseline', gap:'4px' }}>
                        <span style={{ fontSize:'12px', color: p.popular ? 'rgba(241,245,249,.45)' : 'rgba(241,245,249,.3)' }}>XAF</span>
                        <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'2.2rem', color: p.popular ? '#60A5FA' : '#F1F5F9', lineHeight:1 }}>{p.price}</span>
                        <span style={{ fontSize:'13px', color:'rgba(241,245,249,.3)' }}>/mois</span>
                      </div>
                    </div>
                    <div style={{ flex:1, marginBottom:'24px' }}>
                      {p.features.map(f => (
                        <div key={f} style={{ display:'flex', alignItems:'center', gap:'9px', marginBottom:'10px' }}>
                          <div style={{ width:'18px', height:'18px', borderRadius:'50%', background: p.popular ? 'rgba(37,99,235,.2)' : 'rgba(16,185,129,.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <IconCheck size={10} style={{ color: p.popular ? '#60A5FA' : '#34D399' }} />
                          </div>
                          <span style={{ fontSize:'13px', color: p.popular ? 'rgba(241,245,249,.75)' : 'rgba(241,245,249,.5)' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/register"
                          className={p.popular ? 'btn-cta' : 'btn-outline'}
                          style={{ display:'block', textAlign:'center', padding:'12px', borderRadius:'12px', fontSize:'13px', fontWeight:700, color: p.popular ? 'white' : 'rgba(241,245,249,.65)', textDecoration:'none', background: p.popular ? undefined : 'transparent' }}>
                      Commencer gratuitement
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
            <p style={{ textAlign:'center', fontSize:'12px', color:'rgba(241,245,249,.2)', marginTop:'20px' }}>
              *Essai 30 jours sans CB. Sans engagement. Résiliable à tout moment.
            </p>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section id="faq" style={{ padding:'96px 24px' }}>
          <div style={{ maxWidth:'680px', margin:'0 auto' }}>
            <Reveal style={{ textAlign:'center', marginBottom:'48px' }}>
              <div style={{ width:'40px', height:'3px', borderRadius:'2px', background:'linear-gradient(90deg,#2563EB,#10B981)', margin:'0 auto 16px' }} />
              <p style={{ fontSize:'12px', fontWeight:700, letterSpacing:'.12em', color:'#60A5FA', textTransform:'uppercase', marginBottom:'12px' }}>FAQ</p>
              <h2 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontSize:'clamp(1.8rem,3vw,2.5rem)', fontWeight:800, letterSpacing:'-.3px' }}>
                Questions fréquentes
              </h2>
            </Reveal>
            {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </section>

        {/* ── CTA FINAL ──────────────────────────────────────────── */}
        <section style={{ padding:'96px 24px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 60% at 50% 50%,rgba(37,99,235,.12) 0%,transparent 65%)', pointerEvents:'none' }} />
          <Reveal style={{ maxWidth:'640px', margin:'0 auto', textAlign:'center', position:'relative' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'7px 16px', borderRadius:'100px', background:'rgba(37,99,235,.12)', border:'1px solid rgba(59,130,246,.2)', fontSize:'12px', fontWeight:600, color:'#93C5FD', marginBottom:'28px' }}>
              <IconLock size={13} />
              Aucune carte bancaire requise
            </div>
            <h2 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, lineHeight:1.1, letterSpacing:'-.4px', marginBottom:'18px' }}>
              Prêt à simplifier votre<br/>
              <span className="grad-text">gestion locative ?</span>
            </h2>
            <p style={{ fontSize:'16px', color:'rgba(241,245,249,.5)', lineHeight:1.65, maxWidth:'420px', margin:'0 auto 36px' }}>
              Rejoignez 1 200+ bailleurs camerounais qui font confiance à LocCam. Commencez gratuitement.
            </p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/register" className="btn-cta"
                    style={{ display:'flex', alignItems:'center', gap:'9px', padding:'15px 32px', borderRadius:'14px', fontWeight:700, fontSize:'15px', color:'white', textDecoration:'none' }}>
                <IconRocket size={17} />
                Créer mon compte gratuitement
              </Link>
              <Link href="/login" className="btn-outline"
                    style={{ display:'flex', alignItems:'center', gap:'7px', padding:'15px 24px', borderRadius:'14px', fontWeight:600, fontSize:'14px', color:'rgba(241,245,249,.65)', textDecoration:'none', background:'transparent' }}>
                Se connecter <IconChevronRight size={15} />
              </Link>
            </div>
          </Reveal>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────── */}
        <footer style={{ borderTop:'1px solid rgba(255,255,255,.05)', padding:'60px 24px 32px' }}>
          <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'40px', marginBottom:'48px' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                  <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'linear-gradient(135deg,#2563EB,#1D4ED8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <IconBuilding size={16} color="white" />
                  </div>
                  <span style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'17px', color:'#F1F5F9' }}>LocCam</span>
                </div>
                <p style={{ fontSize:'13px', color:'rgba(241,245,249,.35)', lineHeight:1.65, maxWidth:'240px', marginBottom:'20px' }}>
                  La gestion locative camerounaise simplifiée. Contrats, paiements Mobile Money, messagerie.
                </p>
                <div style={{ display:'flex', gap:'10px' }}>
                  {[<IconPhone size={14}/>, <IconMail size={14}/>, <IconMapPin size={14}/>].map((ic,i) => (
                    <div key={i} style={{ width:'32px', height:'32px', borderRadius:'9px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(241,245,249,.3)', cursor:'pointer' }}>
                      {ic}
                    </div>
                  ))}
                </div>
              </div>
              {[
                { title:'Produit', links:['Fonctionnalités','Tarifs','Témoignages','Nouveautés'] },
                { title:'Ressources', links:['Documentation','Guide démarrage','Blog','FAQ'] },
                { title:'Contact', links:['+237 699 000 000','contact@loccam.cm','Douala, Cameroun'] },
              ].map(col => (
                <div key={col.title}>
                  <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(241,245,249,.28)', marginBottom:'16px' }}>{col.title}</div>
                  {col.links.map(l => (
                    <a key={l} href="#"
                       style={{ display:'block', fontSize:'13px', color:'rgba(241,245,249,.4)', marginBottom:'10px', textDecoration:'none', transition:'color .15s' }}
                       onMouseEnter={e=>(e.currentTarget.style.color='rgba(241,245,249,.8)')}
                       onMouseLeave={e=>(e.currentTarget.style.color='rgba(241,245,249,.4)')}>
                      {l}
                    </a>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'24px', borderTop:'1px solid rgba(255,255,255,.05)', flexWrap:'wrap', gap:'12px' }}>
              <p style={{ fontSize:'12px', color:'rgba(241,245,249,.2)' }}>© 2026 LocCam · Tous droits réservés · Made in Cameroon</p>
              <div style={{ display:'flex', gap:'20px' }}>
                {['CGU','Confidentialité','Cookies'].map(l => (
                  <a key={l} href="#" style={{ fontSize:'12px', color:'rgba(241,245,249,.2)', textDecoration:'none' }}>{l}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>

        {/* ── VIDEO MODAL ────────────────────────────────────────── */}
        <AnimatePresence>
          {video && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', background:'rgba(0,0,0,.82)', backdropFilter:'blur(10px)', cursor:'pointer' }}
              onClick={()=>setVideo(false)}>
              <motion.div initial={{ scale:.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
                          exit={{ scale:.9, opacity:0 }} transition={{ duration:.22 }}
                          style={{ background:'rgba(10,20,40,.95)', border:'1px solid rgba(59,130,246,.25)', borderRadius:'24px', padding:'40px', maxWidth:'400px', width:'100%', textAlign:'center', cursor:'default' }}
                          onClick={e=>e.stopPropagation()}>
                <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'rgba(37,99,235,.15)', border:'1px solid rgba(37,99,235,.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <IconPlayerPlay size={26} style={{ color:'#60A5FA' }} />
                </div>
                <h3 style={{ fontFamily:'Cabinet Grotesk,sans-serif', fontWeight:800, fontSize:'20px', color:'#F1F5F9', marginBottom:'10px' }}>Démo bientôt disponible</h3>
                <p style={{ fontSize:'14px', color:'rgba(241,245,249,.45)', marginBottom:'24px', lineHeight:1.6 }}>La vidéo de présentation sera disponible prochainement. En attendant, essayez gratuitement !</p>
                <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
                  <button onClick={()=>setVideo(false)} className="btn-outline"
                          style={{ padding:'10px 20px', borderRadius:'12px', fontSize:'13px', fontWeight:600, color:'rgba(241,245,249,.6)', background:'transparent', cursor:'pointer' }}>
                    Fermer
                  </button>
                  <Link href="/register" className="btn-cta"
                        style={{ padding:'10px 20px', borderRadius:'12px', fontSize:'13px', fontWeight:700, color:'white', textDecoration:'none', display:'flex', alignItems:'center', gap:'6px' }}>
                    <IconRocket size={13} /> Essayer gratuitement
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  )
}
