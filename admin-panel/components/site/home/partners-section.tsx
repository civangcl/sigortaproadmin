'use client'

import { motion } from 'motion/react'
import { fadeIn } from '@/lib/motion'

const PARTNERS = [
  'Türkiye Sigorta',
  'Neova',
  'Sompo',
  'Quick',
  'Anadolu',
  'Allianz',
  'AXA',
  'HDI',
  'Ray',
  'Doğa',
]

export function PartnersSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10"
      >
        <p className="text-center text-sm font-medium uppercase tracking-widest text-neutral-500">
          Türkiye&apos;nin lider sigorta şirketleriyle çalışıyoruz
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {PARTNERS.map((name) => (
            <span
              key={name}
              className="text-lg font-bold tracking-tight text-neutral-600 grayscale transition-all duration-300 hover:text-neutral-300"
            >
              {name}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
