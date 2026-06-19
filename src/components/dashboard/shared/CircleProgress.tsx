'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props { pct: number; size?: number; color?: string }

export function CircleProgress({ pct, size = 60, color = '#059669' }: Props) {
  const stroke = 4, r = (size - stroke * 2) / 2, circ = 2 * Math.PI * r
  const [prog, setProg] = useState(0)
  useEffect(() => { const t = setTimeout(() => setProg(pct), 250); return () => clearTimeout(t) }, [pct])
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#D1FAE5" strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (prog / 100) * circ }}
        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.4 }}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }} />
      <text x={size/2} y={size/2+5} textAnchor="middle" fontSize={size*0.2} fontWeight="700" fill={color}>
        {prog}%
      </text>
    </svg>
  )
}
