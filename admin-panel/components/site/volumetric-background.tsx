'use client'

import { motion } from 'motion/react'

/**
 * Deep-space volumetric backdrop.
 * Subtle, blurred dark-red orbs + a fine grid + top vignette.
 * Purely decorative — fixed behind all content.
 */
export function VolumetricBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* base gradient wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(30,8,10,0.9),transparent_60%)]" />

      {/* drifting red orb — top right */}
      <motion.div
        className="absolute -right-40 -top-40 h-[38rem] w-[38rem] rounded-full bg-primary/20 blur-[140px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />

      {/* drifting red orb — bottom left */}
      <motion.div
        className="absolute -bottom-52 -left-40 h-[34rem] w-[34rem] rounded-full bg-primary/15 blur-[150px]"
        animate={{ x: [0, -30, 0], y: [0, -20, 0], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />

      {/* faint center glow */}
      <motion.div
        className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/8 blur-[160px]"
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />

      {/* fine grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(80%_60%_at_50%_0%,black,transparent)]" />
    </div>
  )
}
