'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Utilisateur } from '@/types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<Utilisateur | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: '#F1F5F9' }}>
        <div className="text-sm" style={{ color: '#8A9BB0' }}>Chargement...</div>
      </div>
    )
  }

  return <>{children}</>
}