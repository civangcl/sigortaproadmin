'use client'

import { motion } from 'motion/react'
import { fadeUp, staggerContainer } from '@/lib/motion'

const STATS = [
  { value: '50.000+', label: 'Aktif Poliçe' },
  { value: '%99.4', label: 'Müşteri Memnuniyeti' },
  { value: '20+', label: 'Anlaşmalı Şirket' },
  { value: '7/24', label: 'Hasar Desteği' },
]

export function StatsSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6"
      >
        {STATS.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="flex flex-col items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center backdrop-blur-2xl"
          >
            <span className="text-4xl font-extrabold tracking-tighter text-foreground lg:text-5xl">
              {stat.value}
            </span>
            <span className="text-sm font-medium text-neutral-400">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
