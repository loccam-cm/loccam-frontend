'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import api from '@/lib/api'
import {
  IconCircleCheck, IconLoader2,
  IconReceipt, IconHome2, IconAlertCircle,
  IconDownload,
} from '@tabler/icons-react'

interface PaiementData {
  paiement_id: number
  statut: string
  confirme: boolean
  montant: number
}

function PaiementSuccesContent() {
  const searchParams = useSearchParams()
  const paiementId   = searchParams.get('paiement_id')
  const [statut, setStatut]           = useState<'loading' | 'succes' | 'attente' | 'erreur'>('loading')
  const [paiement, setPaiement]       = useState<PaiementData | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (paiementId) verifier()
  }, [paiementId])

  const verifier = async () => {
    setStatut('loading')
    try {
      const res = await api.get(`/paiements/${paiementId}/verifier/`)
      if (res.data.confirme) {
        setPaiement(res.data)
        setStatut('succes')
      } else {
        setStatut('attente')
      }
    } catch {
      setStatut('erreur')
    }
  }

  const telechargerQuittance = async () => {
    if (!paiementId) return
    setDownloading(true)
    try {
      const res = await api.get(`/paiements/${paiementId}/quittance/`, {
        responseType: 'blob',
      })
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `Quittance_${paiementId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Quittance téléchargée !')
    } catch {
      toast.error('Erreur lors du téléchargement.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background:'#F0FDF4', fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>
      <div className="w-full max-w-sm">

        {statut === 'loading' && (
          <div className="text-center py-16">
            <IconLoader2 size={40} style={{ color:'#059669', animation:'spin 1s linear infinite', margin:'0 auto 16px' }}/>
            <p className="text-sm font-medium" style={{ color:'#64748B' }}>Vérification du paiement...</p>
          </div>
        )}

        {statut === 'succes' && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            className="bg-white rounded-3xl p-8 text-center"
            style={{ boxShadow:'0 20px 60px rgba(5,150,105,.15)', border:'1px solid #D1FAE5' }}>
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
              transition={{ type:'spring', delay:.1 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background:'linear-gradient(135deg,#059669,#10B981)', boxShadow:'0 8px 30px rgba(5,150,105,.4)' }}>
              <IconCircleCheck size={48} color="white" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2" style={{ color:'#0F172A' }}>Paiement confirmé !</h1>
            {paiement && (
              <p className="text-sm mb-1" style={{ color:'#64748B' }}>
                {(paiement.montant ?? 0).toLocaleString('fr-FR')} XAF
              </p>
            )}
            <p className="text-xs mb-6" style={{ color:'#94A3B8' }}>
              Votre quittance a été générée. Un email de confirmation vous a été envoyé.
            </p>
            <div className="space-y-3">
              <button
                onClick={telechargerQuittance}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-opacity"
                style={{ background:'linear-gradient(135deg,#059669,#047857)', opacity: downloading ? 0.7 : 1 }}>
                {downloading
                  ? <><IconLoader2 size={17} style={{ animation:'spin 1s linear infinite' }}/>Téléchargement...</>
                  : <><IconDownload size={17} />Télécharger la quittance</>
                }
              </button>
              <Link href="/locataire"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
                    style={{ background:'#F0FDF4', border:'1.5px solid #A7F3D0', color:'#059669', textDecoration:'none' }}>
                <IconHome2 size={17}/>Retour au tableau de bord
              </Link>
            </div>
          </motion.div>
        )}

        {statut === 'attente' && (
          <div className="bg-white rounded-3xl p-8 text-center" style={{ border:'1px solid #FDE68A' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                 style={{ background:'#FFFBEB' }}>
              <IconLoader2 size={36} style={{ color:'#D97706', animation:'spin 1s linear infinite' }}/>
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color:'#0F172A' }}>Paiement en attente</h2>
            <p className="text-sm mb-4" style={{ color:'#64748B' }}>
              Votre paiement est en cours de traitement.
            </p>
            <button onClick={verifier}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white mb-3"
              style={{ background:'#D97706' }}>
              Vérifier à nouveau
            </button>
            <Link href="/locataire" className="block text-sm text-center py-2"
                  style={{ color:'#94A3B8', textDecoration:'none' }}>
              Retour au tableau de bord
            </Link>
          </div>
        )}

        {statut === 'erreur' && (
          <div className="bg-white rounded-3xl p-8 text-center" style={{ border:'1px solid #FECACA' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                 style={{ background:'#FEF2F2' }}>
              <IconAlertCircle size={36} style={{ color:'#DC2626' }}/>
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color:'#0F172A' }}>Erreur de vérification</h2>
            <p className="text-sm mb-4" style={{ color:'#64748B' }}>
              Impossible de vérifier le statut de votre paiement.
            </p>
            <button onClick={verifier}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white mb-3"
              style={{ background:'#DC2626' }}>
              Réessayer
            </button>
            <Link href="/locataire/paiement" className="block text-sm text-center py-2"
                  style={{ color:'#94A3B8', textDecoration:'none' }}>
              Retour au paiement
            </Link>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default function PaiementSuccesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
           style={{ background:'#F0FDF4' }}>
        <IconLoader2 size={40} style={{ color:'#059669', animation:'spin 1s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <PaiementSuccesContent />
    </Suspense>
  )
}
