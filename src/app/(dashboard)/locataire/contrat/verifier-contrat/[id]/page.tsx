'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import {
  IconShieldCheck, IconShieldX, IconLoader2,
  IconFileText, IconHome2, IconUser, IconCalendar,
} from '@tabler/icons-react'

export default function VerifierContratPage() {
  const { id }          = useParams()
  const searchParams    = useSearchParams()
  const hash            = searchParams.get('h')
  const [data, setData] = useState<any>(null)
  const [status, setStatus] = useState<'loading'|'valid'|'invalid'|'error'>('loading')

  useEffect(() => {
    verifier()
  }, [])

  const verifier = async () => {
    try {
      const res = await api.get(`/contrats/${id}/verifier/?h=${hash}`)
      setData(res.data)
      setStatus(res.data.valide ? 'valid' : 'invalid')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: '#F0FDF4', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-2xl font-bold">
            <span style={{ color: '#059669' }}>Loc</span>
            <span style={{ color: '#0F172A' }}>Cam</span>
          </span>
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Vérification de contrat</p>
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>

          {status === 'loading' && (
            <div className="flex flex-col items-center py-8 gap-3">
              <IconLoader2 size={32} style={{ color: '#059669', animation: 'spin 1s linear infinite' }} />
              <p className="text-sm" style={{ color: '#64748B' }}>Vérification en cours...</p>
            </div>
          )}

          {status === 'valid' && data && (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                     style={{ background: '#ECFDF5' }}>
                  <IconShieldCheck size={32} style={{ color: '#059669' }} />
                </div>
                <h1 className="text-lg font-bold" style={{ color: '#059669' }}>Contrat authentique</h1>
                <p className="text-xs text-center mt-1" style={{ color: '#64748B' }}>
                  Ce document est valide et n'a pas été modifié.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { ico: <IconFileText size={15}/>, lbl: 'Référence',  val: `LC-${String(id).padStart(6,'0')}` },
                  { ico: <IconHome2 size={15}/>,    lbl: 'Logement',   val: data.bien },
                  { ico: <IconUser size={15}/>,     lbl: 'Bailleur',   val: data.bailleur },
                  { ico: <IconUser size={15}/>,     lbl: 'Locataire',  val: data.locataire },
                  { ico: <IconCalendar size={15}/>, lbl: 'Signé le',   val: data.date_signature ?? '—' },
                ].map(r => (
                  <div key={r.lbl} className="flex items-center gap-3 p-3 rounded-xl"
                       style={{ background: '#F8FAFC' }}>
                    <div style={{ color: '#059669', flexShrink: 0 }}>{r.ico}</div>
                    <span className="text-xs" style={{ color: '#94A3B8', flexShrink: 0, width: '70px' }}>{r.lbl}</span>
                    <span className="text-sm font-semibold truncate" style={{ color: '#0F172A' }}>{r.val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                <p className="text-xs text-center" style={{ color: '#059669' }}>
                  ✓ Empreinte vérifiée · Signé via LocCam
                </p>
              </div>
            </>
          )}

          {(status === 'invalid' || status === 'error') && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                   style={{ background: '#FEF2F2' }}>
                <IconShieldX size={32} style={{ color: '#EF4444' }} />
              </div>
              <h1 className="text-lg font-bold" style={{ color: '#EF4444' }}>
                {status === 'invalid' ? 'Document invalide' : 'Contrat introuvable'}
              </h1>
              <p className="text-xs text-center mt-2" style={{ color: '#64748B' }}>
                {status === 'invalid'
                  ? "Ce document a été modifié ou le hash ne correspond pas."
                  : "Ce contrat n'existe pas ou le lien est incorrect."}
              </p>
            </div>
          )}
        </div>

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )
}