'use client'

import { motion } from 'motion/react'
import { ArrowUpRight, Car, HeartPulse, Home, Building2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/motion'
import type { ViewKey } from '@/lib/views'

type Service = {
  icon: LucideIcon
  title: string
  description: string
  features: string[]
}

const SERVICES: Service[] = [
  {
    icon: Car,
    title: 'Araç Sigortası',
    description:
      'Trafik ve kasko poliçelerinizde 20+ şirketin tekliflerini karşılaştırın, aracınıza en uygun teminatı seçin.',
    features: ['Kasko & Trafik', 'Cam ve mini onarım', 'İkame araç desteği'],
  },
  {
    icon: Building2,
    title: 'DASK',
    description:
      'Zorunlu deprem sigortanızı dakikalar içinde yenileyin. Evinizi ve ailenizi güvence altına alın.',
    features: ['Zorunlu deprem teminatı', 'Anında poliçe', 'Otomatik yenileme'],
  },
  {
    icon: HeartPulse,
    title: 'Sağlık Sigortası',
    description:
      'Özel sağlık ve tamamlayıcı sağlık poliçeleriyle anlaşmalı hastanelerde ayrıcalıklı hizmet alın.',
    features: ['Tamamlayıcı sağlık', 'Yatarak & ayakta tedavi', 'Geniş hastane ağı'],
  },
  {
    icon: Home,
    title: 'Konut Sigortası',
    description:
      'Yangın, hırsızlık ve doğal afetlere karşı eviniz ve eşyalarınız için kapsamlı koruma paketleri.',
    features: ['Eşya & bina teminatı', 'Hırsızlık koruması', 'Cam kırılması'],
  },
]

function ServiceCard({
  service,
  onNavigate,
}: {
  service: Service
  onNavigate: (view: ViewKey) => void
}) {
  const Icon = service.icon
  return (
    <motion.div variants={fadeUp}>
      <motion.article
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="group flex h-full flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl transition-colors hover:border-primary/30"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/25 transition-colors group-hover:bg-primary/20">
          <Icon className="h-7 w-7 text-primary" />
        </span>

        <div className="flex flex-col gap-3">
          <h3 className="text-2xl font-extrabold tracking-tighter text-foreground">
            {service.title}
          </h3>
          <p className="text-pretty leading-relaxed text-neutral-400">
            {service.description}
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {service.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-neutral-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onNavigate('quote')}
          className="mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-foreground transition-all group-hover:border-primary/40 group-hover:bg-primary/10"
        >
          Teklif Al
          <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </motion.article>
    </motion.div>
  )
}

export function ServicesSection({
  onNavigate,
}: {
  onNavigate: (view: ViewKey) => void
}) {
  return (
    <section id="urunler" className="scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Ürünlerimiz
          </span>
          <h2 className="max-w-3xl text-balance text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
            Hayatınızın her alanına özel güvence
          </h2>
          <p className="max-w-2xl text-pretty text-lg leading-relaxed text-neutral-400">
            İhtiyacınız olan tüm sigorta ürünlerini tek çatı altında topladık.
            Uzman ekibimiz size en uygun teminatı bulmak için yanınızda.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.title}
              service={service}
              onNavigate={onNavigate}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
