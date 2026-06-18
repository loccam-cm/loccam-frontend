'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { IconHome2, IconArrowLeft, IconFileSearch } from '@tabler/icons-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: 'linear-gradient(135deg,#F0FDF4 0%,#F1F5F9 100%)', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <div className="w-full max-w-md text-center">

        {/* Logo */}
        <div className="mb-8">
          <span className="text-3xl font-bold">
            <span style={{ color: '#059669' }}>Loc</span>
            <span style={{ color: '#0F172A' }}>Cam</span>
          </span>
        </div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
               style={{ background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', border: '2px solid #A7F3D0' }}>
            <IconFileSearch size={44} style={{ color: '#059669' }} />
          </div>

          <div className="text-8xl font-black mb-2"
               style={{ background: 'linear-gradient(135deg,#059669,#064E3B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            404
          </div>

          <h1 className="text-xl font-bold mb-2" style={{ color: '#0F172A' }}>
            Page introuvable
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#64748B', maxWidth: '300px', margin: '0 auto' }}>
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center">

          <Link href="/"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#059669,#047857)', boxShadow: '0 4px 14px rgba(5,150,105,.3)', textDecoration: 'none' }}>
            <IconHome2 size={16} />
            Accueil
          </Link>

          <button onClick={() => window.history.back()}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
                  style={{ background: '#fff', border: '1.5px solid #E2E8F0', color: '#64748B' }}>
            <IconArrowLeft size={16} />
            Retour
          </button>
        </motion.div>

      </div>
    </div>
  )
}