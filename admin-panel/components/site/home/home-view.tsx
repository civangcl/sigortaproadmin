'use client'

import { motion } from 'motion/react'
import { BadgeCheck, Clock, HandCoins, Headset } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/motion'
import type { ViewKey } from '@/lib/views'
import { HeroSection } from './hero-section'
import { StatsSection } from './stats-section'
import { PartnersSection } from './partners-section'
import { ServicesSection } from './services-section'

const WHY = [
  {
    icon: HandCoins,
    title: 'En Uygun Fiyat Garantisi',
    text: '20+ şirketi tek ekranda karşılaştırır, cebinize en uygun poliçeyi buluruz.',
  },
  {
    icon: Clock,
    title: 'Dakikalar İçinde Poliçe',
    text: 'Dijital altyapımız sayesinde teklif alın, onaylayın ve anında poliçenize kavuşun.',
  },
  {
    icon: Headset,
    title: '7/24 Hasar Desteği',
    text: 'Bir sorun yaşadığınızda uzman ekibimiz gece gündüz yanınızda, süreci biz yönetiriz.',
  },
  {
    icon: BadgeCheck,
    title: 'Bağımsız & Tarafsız',
    text: 'Belirli bir şirkete bağlı değiliz; yalnızca sizin çıkarınızı gözeterek tavsiye veririz.',
  },
]

function WhySection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex max-w-3xl flex-col gap-4"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Neden Fırat Ece Sigorta?
          </span>
          <h2 className="text-balance text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
            Güvenceyi kolay, hızlı ve şeffaf hale getiriyoruz
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {WHY.map((item) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-2xl"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/25">
                  <Icon className="h-6 w-6 text-primary" />
                </span>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-400">
                  {item.text}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

function ClosingCta({
  onNavigate,
}: {
  onNavigate: (view: ViewKey) => void
}) {
  return (
    <section className="px-4 pb-28 pt-8 sm:px-6 lg:px-8">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-6 py-20 text-center backdrop-blur-2xl"
      >
        <div className="pointer-events-none absolute inset-x-0 -top-1/2 h-[30rem] bg-[radial-gradient(50%_60%_at_50%_50%,rgba(220,38,38,0.22),transparent_70%)]" />
        <h2 className="relative max-w-3xl text-balance text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
          Güvenceniz bir tık uzağınızda
        </h2>
        <p className="relative max-w-xl text-pretty text-lg leading-relaxed text-neutral-400">
          Hemen ücretsiz teklif alın, uzman danışmanlarımız size en uygun
          poliçeyi bulsun.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('quote')}
          className="relative inline-flex items-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-[0_0_28px_rgba(220,38,38,0.45)] transition-all hover:shadow-[0_0_40px_rgba(220,38,38,0.65)] active:scale-[0.97]"
        >
          Ücretsiz Teklif Al
        </button>
      </motion.div>
    </section>
  )
}

export function HomeView({
  onNavigate,
}: {
  onNavigate: (view: ViewKey, anchor?: string) => void
}) {
  return (
    <div className="flex flex-col">
      <HeroSection onNavigate={onNavigate} />
      <StatsSection />
      <PartnersSection />
      <ServicesSection onNavigate={onNavigate} />
      <WhySection />
      <ClosingCta onNavigate={onNavigate} />
    </div>
  )
}
