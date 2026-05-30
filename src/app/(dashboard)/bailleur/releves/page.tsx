'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import {
  IconDroplet, IconBolt, IconPlus, IconChevronLeft,
  IconBuilding, IconCalendar, IconCheck, IconLoader2,
  IconAlertCircle, IconCalculator,
} from '@tabler/icons-react'

interface Bien {
  id: number
  titre: string
  adresse: string
  statut: string
}

interface IndexConsommation {
  id: number
  bien: { id: number; titre: string }
  mois: number
  annee: number
  index_eau: string
  index_elec: string
  consommation_eau: string
  consommation_elec: string
  date_saisie: string
}

interface CalcResult {
  consommation_eau: number
  consommation_elec: number
  tarif_eau: number
  tarif_elec: number
  montant_eau: number
  montant_elec: number
  total_charges: number
}

const MOIS_FR = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const now = new Date()

export default function RelevesPage() {
  const { user } = useAuth()
  const [biens, setBiens]         = useState<Bien[]>([])
  const [releves, setReleves]     = useState<IndexConsommation[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null)
  const [calcLoading, setCalcLoading] = useState(false)

  const [form, setForm] = useState({
    bien: '',
    mois: now.getMonth() + 1,
    annee: now.getFullYear(),
    index_eau: '',
    index_elec: '',
    consommation_eau: '',
    consommation_elec: '',
  })

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [biensRes, relevesRes] = await Promise.all([
        api.get('/biens/'),
        api.get('/index/'),
      ])
      setBiens(biensRes.data.results ?? biensRes.data)
      setReleves(relevesRes.data.results ?? relevesRes.data)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  // ── Calcul automatique des charges ──────────────────────
  const calculerCharges = async () => {
    if (!form.bien || !form.mois || !form.annee) return
    setCalcLoading(true)
    try {
      const res = await api.get(
        `/index/${form.bien}/calcul/?mois=${form.mois}&annee=${form.annee}`
      )
      setCalcResult(res.data)
    } catch {
      toast.error('Aucun relevé trouvé pour ce mois ou tarifs non configurés.')
      setCalcResult(null)
    } finally {
      setCalcLoading(false)
    }
  }

  // ── Sauvegarder le relevé ─────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.bien) { toast.error('Sélectionnez un bien'); return }
    setSaving(true)
    try {
      await api.post('/index/', {
        bien              : parseInt(form.bien),
        mois              : form.mois,
        annee             : form.annee,
        index_eau         : parseFloat(form.index_eau)  || 0,
        index_elec        : parseFloat(form.index_elec) || 0,
        consommation_eau  : parseFloat(form.consommation_eau)  || 0,
        consommation_elec : parseFloat(form.consommation_elec) || 0,
      })
      toast.success('Relevé enregistré !')
      setShowForm(false)
      setCalcResult(null)
      setForm({ bien: '', mois: now.getMonth() + 1, annee: now.getFullYear(), index_eau: '', index_elec: '', consommation_eau: '', consommation_elec: '' })
      load()
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } }
      const msg = e.response?.data ? Object.values(e.response.data).flat()[0] : 'Erreur enregistrement.'
      toast.error(String(msg))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '0 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/bailleur" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>
              <IconChevronLeft size={16} />
              Retour
            </Link>
            <div style={{ width: '1px', height: '18px', background: '#E2E8F0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconDroplet size={16} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Relevés eau & électricité</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Saisie mensuelle des index</div>
              </div>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 18px', borderRadius: '10px', background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: 'white', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14,165,233,0.35)' }}>
            <IconPlus size={14} />
            Nouveau relevé
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>

        {/* Formulaire */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Nouveau relevé mensuel</div>
                <button onClick={() => { setShowForm(false); setCalcResult(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '18px' }}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>

                  {/* Bien */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>
                      Bien <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <IconBuilding size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <select value={form.bien} onChange={e => set('bien', e.target.value)} required
                        style={{ width: '100%', height: '40px', paddingLeft: '30px', paddingRight: '12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '13px', color: form.bien ? '#0F172A' : '#94A3B8', outline: 'none', appearance: 'none', background: 'white' }}>
                        <option value="" disabled>Sélectionnez un bien…</option>
                        {biens.map(b => <option key={b.id} value={b.id}>{b.titre}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Mois */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>Mois</label>
                    <select value={form.mois} onChange={e => set('mois', parseInt(e.target.value))}
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '13px', color: '#0F172A', outline: 'none', appearance: 'none', background: 'white' }}>
                      {MOIS_FR.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                    </select>
                  </div>

                  {/* Année */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>Année</label>
                    <input type="number" value={form.annee} onChange={e => set('annee', parseInt(e.target.value))}
                      min={2020} max={2100}
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '13px', color: '#0F172A', outline: 'none' }} />
                  </div>
                </div>

                {/* Index */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {[
                    { k: 'index_eau',  ico: <IconDroplet size={13}/>, label: 'Index eau (m³)',   col: '#0EA5E9', unit: 'm³' },
                    { k: 'index_elec', ico: <IconBolt size={13}/>,    label: 'Index élec (kWh)', col: '#F59E0B', unit: 'kWh' },
                    { k: 'consommation_eau',  ico: <IconDroplet size={13}/>, label: 'Conso eau (m³)',  col: '#0EA5E9', unit: 'm³' },
                    { k: 'consommation_elec', ico: <IconBolt size={13}/>,    label: 'Conso élec (kWh)', col: '#F59E0B', unit: 'kWh' },
                  ].map(f => (
                    <div key={f.k}>
                     <label style={{ fontSize: '12px', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                         <span style={{ color: f.col }}>{f.ico}</span> {f.label}
                      </label>
                      <input type="number" step="0.001" min="0"
                        value={form[f.k as keyof typeof form]}
                        onChange={e => set(f.k, e.target.value)}
                        placeholder="0.000"
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '13px', color: '#0F172A', outline: 'none' }} />
                    </div>
                  ))}
                </div>

                {/* Boutons */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" onClick={calculerCharges} disabled={!form.bien || calcLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', background: '#F0F9FF', border: '1.5px solid #BAE6FD', color: '#0284C7', fontWeight: 600, fontSize: '13px', cursor: 'pointer', opacity: !form.bien ? 0.5 : 1 }}>
                    {calcLoading ? <IconLoader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <IconCalculator size={14} />}
                    Calculer les charges
                  </button>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => { setShowForm(false); setCalcResult(null) }}
                      style={{ padding: '9px 18px', borderRadius: '10px', background: '#F1F5F9', border: 'none', color: '#64748B', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                      Annuler
                    </button>
                    <button type="submit" disabled={saving}
                      style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 22px', borderRadius: '10px', background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: 'white', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                      {saving ? <IconLoader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <IconCheck size={14} />}
                      Enregistrer
                    </button>
                  </div>
                </div>
              </form>

              {/* Résultat calcul */}
              <AnimatePresence>
                {calcResult && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg,rgba(14,165,233,0.06),rgba(245,158,11,0.06))', border: '1px solid #BAE6FD' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284C7', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconCalculator size={13} /> Estimation des charges
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                      {[
                        { l: 'Eau', v: calcResult.montant_eau, ico: <IconDroplet size={14}/>, c: '#0EA5E9', bg: '#F0F9FF', conso: `${calcResult.consommation_eau} m³ × ${calcResult.tarif_eau} XAF` },
                        { l: 'Électricité', v: calcResult.montant_elec, ico: <IconBolt size={14}/>, c: '#F59E0B', bg: '#FFFBEB', conso: `${calcResult.consommation_elec} kWh × ${calcResult.tarif_elec} XAF` },
                        { l: 'Total charges', v: calcResult.total_charges, ico: <IconCalculator size={14}/>, c: '#059669', bg: '#F0FDF4', conso: 'Eau + Électricité' },
                      ].map(item => (
                        <div key={item.l} style={{ background: item.bg, borderRadius: '10px', padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <span style={{ color: item.c }}>{item.ico}</span>
                            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{item.l}</span>
                          </div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: item.c, lineHeight: 1 }}>{item.v.toLocaleString('fr-FR')} XAF</div>
                          <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '3px' }}>{item.conso}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des relevés */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <IconLoader2 size={32} style={{ color: '#0EA5E9', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : releves.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <IconDroplet size={24} style={{ color: '#0EA5E9' }} />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Aucun relevé enregistré</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>Commencez par saisir les index mensuels de vos biens.</div>
            <button onClick={() => setShowForm(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: 'white', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}>
              <IconPlus size={14} /> Premier relevé
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '14px' }}>
            {releves.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '3px' }}>{r.bien.titre}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748B' }}>
                      <IconCalendar size={12} />
                      {MOIS_FR[r.mois]} {r.annee}
                    </div>
                  </div>
                  <div style={{ padding: '3px 10px', borderRadius: '100px', background: '#F0F9FF', fontSize: '11px', fontWeight: 700, color: '#0284C7', border: '1px solid #BAE6FD' }}>
                    Relevé
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ background: '#F0F9FF', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <IconDroplet size={12} style={{ color: '#0EA5E9' }} />
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748B' }}>EAU</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0EA5E9' }}>{parseFloat(r.consommation_eau).toFixed(1)} m³</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>Index : {parseFloat(r.index_eau).toFixed(1)}</div>
                  </div>
                  <div style={{ background: '#FFFBEB', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <IconBolt size={12} style={{ color: '#F59E0B' }} />
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748B' }}>ÉLECTRICITÉ</span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#F59E0B' }}>{parseFloat(r.consommation_elec).toFixed(1)} kWh</div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>Index : {parseFloat(r.index_elec).toFixed(1)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
