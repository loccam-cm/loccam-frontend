'use client'

import { motion } from 'framer-motion'

interface Props { pct: number; color: string }

export function ProgressBar({ pct, color }: Props) {
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#D1FAE5' }}>
      <motion.div className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        style={{ background: color }} />
    </div>
  )
}
