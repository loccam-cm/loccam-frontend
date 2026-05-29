'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { IconChevronDown } from '@tabler/icons-react'

const FAQS = [
  {
    q: "Y a-t-il un engagement de durée pour utiliser LocCam ?",
    a: "Non, aucun engagement. Vous pouvez vous inscrire et résilier à tout moment sans frais ni contrainte. L'essai gratuit de 30 jours ne nécessite aucune carte bancaire.",
  },
  {
    q: "LocCam fonctionne avec Orange Money et MTN Mobile Money ?",
    a: "Absolument. LocCam est intégré nativement avec Orange Money Cameroun et MTN Mobile Money. Le locataire reçoit un lien de paiement et règle en 30 secondes depuis son téléphone. La quittance est générée automatiquement.",
  },
  {
    q: "Comment LocCam m'avertit si un locataire ne paie pas ?",
    a: "LocCam envoie des rappels automatiques J-3 et J-7 avant l'échéance. En cas d'impayé, des relances sont envoyées à J+7, J+15 et J+30 avec suivi en temps réel depuis votre tableau de bord.",
  },
  {
    q: "Les contrats générés sont-ils légalement valides ?",
    a: "Oui. Tous les contrats et quittances générés par LocCam sont conformes au droit camerounais en vigueur. Ils sont reconnus par les administrations et peuvent être utilisés pour toutes démarches officielles.",
  },
  {
    q: "Puis-je gérer des biens dans plusieurs villes ?",
    a: "Oui. Un seul compte vous permet de gérer des biens répartis dans toutes les villes du Cameroun : Douala, Yaoundé, Bafoussam, Limbé — tout est centralisé dans un seul tableau de bord.",
  },
]

function FAQItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}>
      <motion.div layout
        className="faq-item"
        onClick={() => setOpen(!open)}>
        <div className="faq-question">
          <span>{q}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="faq-chevron">
            <IconChevronDown size={16} />
          </motion.div>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}>
              <p className="faq-answer">{a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default function LandingFAQ() {
  return (
    <section className="faq-section" id="faq">
      <div className="faq-inner">

        {/* Header */}
        <div className="faq-header">
          <div className="section-bar-center" />
          <p className="faq-label">FAQ</p>
          <h2 className="faq-title">
            Trouvez les réponses<br />
            à vos questions
          </h2>
        </div>

        {/* Items */}
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <FAQItem key={f.q} q={f.q} a={f.a} delay={i * 0.07} />
          ))}
        </div>
      </div>

      <style>{`
        .faq-section {
          background: white; padding: 96px 24px;
          border-top: 1px solid #E2E8F0;
        }
        .faq-inner { max-width: 720px; margin: 0 auto; }
        .faq-header { text-align: center; margin-bottom: 48px; }
        .section-bar-center {
          width: 40px; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg,#2563EB,#10B981);
          margin: 0 auto 14px;
        }
        .faq-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          color: #2563EB; text-transform: uppercase; margin-bottom: 12px;
        }
        .faq-title {
          font-family: var(--font-display, sans-serif);
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          font-weight: 800; line-height: 1.1; letter-spacing: -0.3px;
          color: #0F172A;
        }

        .faq-list { display: flex; flex-direction: column; gap: 10px; }
        .faq-item {
          background: #F8FAFC; border: 1px solid #E2E8F0;
          border-radius: 16px; padding: 0; cursor: pointer;
          overflow: hidden; transition: border-color 0.2s;
        }
        .faq-item:hover { border-color: #CBD5E1; }
        .faq-question {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 18px 20px;
        }
        .faq-question span {
          font-size: 15px; font-weight: 600; color: #0F172A; flex: 1;
        }
        .faq-chevron { color: #94A3B8; flex-shrink: 0; }
        .faq-answer {
          padding: 0 20px 18px;
          font-size: 14px; line-height: 1.7; color: #64748B;
        }

        @media (max-width: 480px) {
          .faq-section { padding: 60px 20px; }
          .faq-question span { font-size: 14px; }
        }
      `}</style>
    </section>
  )
}
