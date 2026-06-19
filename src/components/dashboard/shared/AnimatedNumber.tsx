'use client'

import { useState, useEffect, useRef } from 'react'

interface Props { value: number; duration?: number }

export function AnimatedNumber({ value, duration = 1000 }: Props) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef   = useRef<number>(0)

  useEffect(() => {
    startRef.current = null
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(ease * value))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return <>{display.toLocaleString('fr-FR')}</>
}
