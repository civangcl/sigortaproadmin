'use client'

import { motion } from 'motion/react'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/motion'
import type { ViewKey } from '@/lib/views'

export function HeroSection({
  onNavigate,
}: {
  onNavigate: (view: ViewKey, anchor?: string) => void
}) {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 pb-24 pt-40 text-center sm:px-6 lg:pt-48">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-4xl flex-col items-center gap-8"
      >
        <motion.span
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-neutral-300 backdrop-blur-2xl"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          20+ anlaşmalı şirket, tek ekranda karşılaştırma
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="text-balance text-5xl font-extrabold leading-[1.05] tracking-tighter text-foreground sm:text-6xl lg:text-7xl"
        >
          Aradığınız Güvence,{' '}
          <span className="text-primary">En Uygun Fiyatla</span> Yanınızda.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="max-w-2xl text-pretty text-lg leading-relaxed text-neutral-400"
        >
          Araç, konut, sağlık ve DASK poliçelerinizi saniyeler içinde
          karşılaştırın. Fırat Ece Sigorta ile en doğru teminatı en avantajlı
          fiyata, uzman danışmanlık eşliğinde seçin.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center gap-4 sm:flex-row"
        >
          <button
            type="button"
            onClick={() => onNavigate('quote')}
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-[0_0_28px_rgba(220,38,38,0.45)] transition-all hover:shadow-[0_0_40px_rgba(220,38,38,0.65)] active:scale-[0.97]"
          >
            Hemen Teklif Al
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('home', 'urunler')}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-foreground backdrop-blur-2xl transition-colors hover:bg-white/10"
          >
            <ShieldCheck className="h-5 w-5 text-primary" />
            Ürünleri Keşfet
          </button>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-sm text-neutral-500"
        >
          Kredi kartı gerekmez • 2 dakikada sonuç • %100 ücretsiz danışmanlık
        </motion.p>
      </motion.div>
    </section>
  )
}
