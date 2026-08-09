'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'motion/react'
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  Target,
} from 'lucide-react'
import { fadeUp, scaleIn, staggerContainer } from '@/lib/motion'
import { FloatingInput } from '../quote/floating-input'

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: 'Adres',
    value: 'Bağdat Caddesi No:214, Kadıköy / İstanbul, Türkiye',
  },
  { icon: Phone, label: 'Telefon', value: '+90 216 555 0 214' },
  { icon: Mail, label: 'E-posta', value: 'info@firatecesigorta.com' },
  { icon: Clock, label: 'Çalışma Saatleri', value: 'Hafta içi 09:00 – 18:30' },
]

const VALUES = [
  'Bağımsız ve tarafsız danışmanlık',
  'Şeffaf fiyatlandırma, gizli maliyet yok',
  'Hasar anında uçtan uca süreç yönetimi',
  'Müşteri memnuniyeti odaklı hizmet',
]

import { submitMessage } from '@/app/actions/messages'

function ContactForm() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ ad: '', email: '', mesaj: '' })

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await submitMessage(form)
    
    setLoading(false)
    if (result.success) {
      setSent(true)
      setTimeout(() => {
        setSent(false)
        setForm({ ad: '', email: '', mesaj: '' })
      }, 2600)
    } else {
      alert(result.error)
    }
  }

  return (
    <motion.div
      variants={scaleIn}
      className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl sm:p-10"
    >
      <h3 className="text-2xl font-extrabold tracking-tighter text-foreground">
        Bize yazın
      </h3>
      <p className="mt-2 leading-relaxed text-neutral-400">
        Sorularınız için formu doldurun, en kısa sürede size dönüş yapalım.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <FloatingInput
          id="c-ad"
          label="Ad Soyad"
          value={form.ad}
          onChange={update('ad')}
          autoComplete="name"
          required
        />
        <FloatingInput
          id="c-email"
          label="E-posta"
          type="email"
          value={form.email}
          onChange={update('email')}
          autoComplete="email"
          required
        />
        <div className="relative">
          <textarea
            id="c-mesaj"
            value={form.mesaj}
            onChange={(e) => update('mesaj')(e.target.value)}
            required
            rows={4}
            placeholder="Mesajınız"
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-base text-foreground outline-none transition-all placeholder:text-neutral-500 focus:border-primary/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-[0_0_24px_rgba(220,38,38,0.4)] transition-all hover:shadow-[0_0_36px_rgba(220,38,38,0.6)] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
        >
          <Send className="h-5 w-5" />
          {loading ? 'Gönderiliyor...' : sent ? 'Mesajınız Gönderildi!' : 'Mesajı Gönder'}
        </button>
      </form>
    </motion.div>
  )
}

export function AboutView() {
  return (
    <section
      id="iletisim"
      className="scroll-mt-24 px-4 py-32 sm:px-6 lg:px-8"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16"
      >
        {/* Left: mission + address */}
        <motion.div variants={fadeUp} className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Kurumsal
            </span>
            <h1 className="text-balance text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
              Güvencenizi önemseyen bir sigorta ortağı
            </h1>
            <p className="text-pretty text-lg leading-relaxed text-neutral-400">
              Fırat Ece Sigorta olarak 2009&apos;dan bu yana Türkiye&apos;nin
              dört bir yanındaki bireyler ve işletmeler için doğru güvenceyi
              buluyoruz. Bağımsız bir brokerlik olarak yalnızca sizin
              çıkarınızı gözetir, 20&apos;den fazla şirketin ürünlerini tarafsız
              bir şekilde karşılaştırırız.
            </p>
          </div>

          <div className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/25">
              <Target className="h-6 w-6 text-primary" />
            </span>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Misyonumuz
              </h3>
              <p className="leading-relaxed text-neutral-400">
                Herkesin anlaşılır, uygun fiyatlı ve güvenilir sigortaya
                erişmesini sağlamak; güvenceyi karmaşık olmaktan çıkarıp
                sadeleştirmek.
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {VALUES.map((value) => (
              <li
                key={value}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-300"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {value}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CONTACT_INFO.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/25">
                    <Icon className="h-5 w-5 text-primary" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      {item.label}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {item.value}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Right: contact form */}
        <ContactForm />
      </motion.div>
    </section>
  )
}
