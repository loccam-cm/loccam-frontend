import { Suspense } from 'react'
import RegisterLeftPanel from './components/LeftPanel'
import RegisterForm from './components/RegisterForm'

export default function RegisterPage() {
  return (
    <>
      <div className="rg-root">
        <RegisterLeftPanel />
        <Suspense fallback={<div style={{ width:'40%', background:'#fff' }}/>}>
          <RegisterForm />
        </Suspense>
      </div>

      <style>{`
        .rg-root {
          min-height: 100vh; display: flex;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ══ PANNEAU GAUCHE ══ */
        .rg-left { flex: 1; position: relative; overflow: hidden; }
        .rg-left-bg {
          position: absolute; inset: 0;
          background: linear-gradient(160deg,#0A1628 0%,#0F2438 40%,#0D1F38 70%,#091422 100%);
        }
        .rg-left-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px);
          background-size: 26px 26px;
        }
        .rg-orb { position: absolute; border-radius: 50%; filter: blur(64px); }
        .rg-orb-1 { top: -5%; right: -5%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(37,99,235,0.22), transparent 70%); }
        .rg-orb-2 { bottom: -8%; left: -8%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%); }
        .rg-left-inner { position: relative; z-index: 1; padding: 40px 52px; height: 100%; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; }

        /* Logo */
        .rg-mkt-logo { display: flex; align-items: center; gap: 10px; }
        .rg-mkt-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#2563EB,#1D4ED8); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(37,99,235,0.45); }
        .rg-mkt-logo-text { font-weight: 800; font-size: 19px; color: white; letter-spacing: -0.3px; }

        .rg-mkt-title { font-weight: 800; font-size: clamp(1.5rem, 2.4vw, 2rem); color: white; line-height: 1.15; letter-spacing: -0.3px; margin-bottom: 10px; }
        .rg-mkt-sub { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; max-width: 460px; }
        .rg-mkt-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.28); }

        /* Avantages */
        .rg-advantages { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .rg-advantage-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; padding: 14px 12px; text-align: center; transition: all 0.2s; }
        .rg-advantage-card:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.15); }
        .rg-advantage-ico { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
        .rg-advantage-title { font-size: 12px; font-weight: 700; color: white; margin-bottom: 4px; line-height: 1.3; }
        .rg-advantage-sub { font-size: 11px; color: rgba(255,255,255,0.38); }

        /* Features */
        .rg-features { display: flex; flex-direction: column; }
        .rg-feature-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .rg-feature-ico { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rg-feature-title { font-size: 13px; font-weight: 700; color: white; margin-bottom: 2px; }
        .rg-feature-desc { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.5; }

        /* Témoignage */
        .rg-temo { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; padding: 18px; }
        .rg-temo-stars { display: flex; gap: 3px; margin-bottom: 10px; }
        .rg-temo-txt { font-size: 13px; font-style: italic; color: rgba(255,255,255,0.62); line-height: 1.65; margin-bottom: 14px; }
        .rg-temo-author { display: flex; align-items: center; gap: 10px; }
        .rg-temo-av { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.16); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: white; flex-shrink: 0; }
        .rg-temo-name { font-size: 13px; font-weight: 700; color: white; }
        .rg-temo-role { font-size: 11px; color: rgba(255,255,255,0.38); }

        /* Stats */
        .rg-stats { display: grid; grid-template-columns: repeat(4,1fr); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px; }
        .rg-stat { text-align: center; }
        .rg-stat-val { font-weight: 800; font-size: 1rem; color: white; line-height: 1; margin-bottom: 4px; }
        .rg-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.35); }
        .rg-legal { font-size: 11px; color: rgba(255,255,255,0.2); line-height: 1.6; }

        /* ══ PANNEAU DROIT ══ */
        .rg-right { width: 40%; flex-shrink: 0; background: white; display: flex; flex-direction: column; box-shadow: -8px 0 40px rgba(0,0,0,0.18); overflow-y: auto; }
        .rg-form-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 28px; border-bottom: 1px solid #E2E8F0; flex-shrink: 0; }
        .rg-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; }
        .rg-logo-icon { width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg,#1A3C5E,#2563EB); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(37,99,235,0.35); }
        .rg-logo-name { font-weight: 800; font-size: 14px; color: #0F172A; line-height: 1.1; }
        .rg-logo-sub { font-size: 10px; color: #94A3B8; }
        .rg-header-actions { display: flex; gap: 7px; }
        .rg-header-btn { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 8px; border: 1px solid #E2E8F0; font-size: 11px; color: #64748B; text-decoration: none; transition: all 0.15s; }
        .rg-header-btn:hover { background: #F1F5F9; color: #0F172A; }

        .rg-form-body { flex: 1; padding: 24px 28px 16px; overflow-y: auto; }
        .rg-title { font-weight: 800; font-size: 1.2rem; color: #0F172A; margin-bottom: 5px; letter-spacing: -0.3px; }
        .rg-subtitle { font-size: 13px; color: #64748B; margin-bottom: 18px; }
        .rg-link { color: #1A3C5E; font-weight: 700; text-decoration: none; }
        .rg-link:hover { text-decoration: underline; }

        /* CTA locataire */
        .rg-locataire-cta { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 12px 14px; border-radius: 12px; background: #F8FAFC; border: 1.5px solid #E2E8F0; cursor: pointer; text-align: left; margin-bottom: 18px; transition: border-color 0.2s; }
        .rg-locataire-left { display: flex; align-items: center; gap: 10px; }
        .rg-locataire-icon { width: 32px; height: 32px; border-radius: 9px; background: #F1F5F9; border: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rg-locataire-title { font-size: 13px; font-weight: 700; color: #0F172A; margin-bottom: 2px; }
        .rg-locataire-sub { font-size: 11px; color: #94A3B8; }

        /* Form */
        .rg-form { display: flex; flex-direction: column; gap: 13px; }
        .rg-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .rg-field { display: flex; flex-direction: column; gap: 5px; }
        .rg-label { font-size: 12px; font-weight: 700; color: #0F172A; }
        .rg-optional { font-weight: 400; color: #94A3B8; }
        .rg-req { color: #EF4444; }
        .rg-hint { font-size: 11px; color: #94A3B8; }

        .rg-input-wrap { position: relative; display: flex; align-items: center; border: 1.5px solid #E2E8F0; border-radius: 10px; background: white; transition: border-color 0.2s; overflow: hidden; }
        .rg-input-icon { position: absolute; left: 10px; flex-shrink: 0; transition: color 0.2s; }
        .rg-input { width: 100%; height: 38px; padding: 0 10px 0 30px; border: none; outline: none; background: transparent; font-size: 13px; color: #0F172A; font-family: inherit; }
        .rg-input::placeholder { color: #CBD5E1; }
        .rg-select { appearance: none; cursor: pointer; }

        .rg-phone-row { display: flex; gap: 8px; }
        .rg-phone-prefix { height: 38px; padding: 0 11px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 700; color: #0F172A; background: #F8FAFC; display: flex; align-items: center; gap: 6px; white-space: nowrap; flex-shrink: 0; }

        /* Strength */
        .rg-strength { display: flex; align-items: center; gap: 8px; margin-top: 4px; overflow: hidden; }
        .rg-strength-bars { display: flex; gap: 4px; flex: 1; }
        .rg-strength-bar { flex: 1; height: 3px; border-radius: 2px; }
        .rg-strength-label { font-size: 11px; font-weight: 600; white-space: nowrap; }

        /* CGU */
        .rg-cgu { display: flex; align-items: flex-start; gap: 9px; cursor: pointer; font-size: 12px; color: #64748B; line-height: 1.5; }
        .rg-checkbox { width: 15px; height: 15px; margin-top: 1px; flex-shrink: 0; accent-color: #1A3C5E; }

        /* Submit */
        .rg-submit { height: 44px; border-radius: 12px; background: linear-gradient(135deg,#1A3C5E,#2563EB); color: white; border: none; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 700; box-shadow: 0 5px 18px rgba(37,99,235,0.4); }
        .rg-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .rg-submit-content { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .rg-spinner { width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .rg-form-footer { padding: 12px 28px; border-top: 1px solid #E2E8F0; display: flex; gap: 18px; justify-content: center; flex-shrink: 0; }
        .rg-footer-link { font-size: 12px; color: #94A3B8; text-decoration: none; transition: color 0.15s; }
        .rg-footer-link:hover { color: #0F172A; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) { .rg-right { width: 45%; } }
        @media (max-width: 900px) { .rg-left { display: none; } .rg-right { width: 100%; box-shadow: none; } }
        @media (max-width: 480px) { .rg-form-body { padding: 20px 18px 14px; } .rg-form-header { padding: 13px 18px; } .rg-row-2 { grid-template-columns: 1fr; } }
      `}</style>
    </>
  )
}
