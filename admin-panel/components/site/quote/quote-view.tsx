'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { fadeUp, scaleIn, staggerContainer } from '@/lib/motion'
import { FloatingInput } from './floating-input'
import type { ViewKey } from '@/lib/views'
import { submitQuote } from '@/app/actions/quote'

type Status = 'idle' | 'loading' | 'success'

const TRUST = ['256-bit SSL şifreleme', 'KVKK uyumlu', 'Kart bilgisi istenmez']

export function QuoteView({
  onNavigate,
}: {
  onNavigate: (view: ViewKey) => void
}) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [insuranceType, setInsuranceType] = useState<string>('arac')
  
  const [form, setForm] = useState({
    ad: '',
    dogum: '',
    telefon: '',
    tc: '',
    email: '',
    sehir: '',
    plaka: '',
    belge: '',
    adres: '',
  })

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setError(null)
    
    try {
      const result = await submitQuote({ ...form, insuranceType })
      
      if (!result.success) {
        setError(result.error ?? 'Bir hata oluştu.')
        setStatus('idle')
        return
      }
      
      setStatus('success')
    } catch {
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.')
      setStatus('idle')
    }
  }

  const resetForm = () => {
    setStatus('idle')
    setForm({
      ad: '', dogum: '', telefon: '', tc: '', email: '', sehir: '', plaka: '', belge: '', adres: ''
    })
  }

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 py-32 sm:px-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-xl flex-col items-center gap-8"
      >
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center gap-4 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-neutral-300 backdrop-blur-2xl">
            <Lock className="h-4 w-4 text-primary" />
            Güvenli Teklif Motoru
          </span>
          <h1 className="text-balance text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
            Saniyeler içinde <span className="text-primary">teklifiniz</span>{' '}
            hazır
          </h1>
          <p className="max-w-md text-pretty leading-relaxed text-neutral-400">
            Bilgilerinizi girin, 20+ anlaşmalı şirket arasından size özel en
            uygun poliçeyi bulalım.
          </p>
        </motion.div>

        <motion.div
          variants={scaleIn}
          className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl sm:p-10"
        >
          <div className="pointer-events-none absolute inset-x-0 -top-1/2 h-80 bg-[radial-gradient(50%_60%_at_50%_50%,rgba(220,38,38,0.16),transparent_70%)]" />

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex flex-col items-center gap-6 py-8 text-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
                  <CheckCircle2 className="h-9 w-9 text-primary" />
                </span>
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-extrabold tracking-tighter text-foreground">
                    Teklifiniz hazırlanıyor!
                  </h2>
                  <p className="max-w-sm text-pretty leading-relaxed text-neutral-400">
                    {form.ad ? `${form.ad}, ` : ''}uzman danışmanlarımız size en
                    uygun teklifleri en kısa sürede{' '}
                    {form.telefon
                      ? `${form.telefon} numarasından iletecek.`
                      : 'telefonunuzdan ulaşacak.'}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-white/10"
                  >
                    Yeni Teklif
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('home')}
                    className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                  >
                    Ana Sayfaya Dön
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="relative flex flex-col gap-5"
              >
                {/* Sigorta Türü Seçimi */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {[
                    { id: 'arac', label: 'Araç (Kasko/Trafik)' },
                    { id: 'dask', label: 'DASK' },
                    { id: 'konut', label: 'Konut' },
                    { id: 'saglik', label: 'Sağlık' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setInsuranceType(t.id)}
                      className={`flex-1 min-w-[100px] rounded-lg py-2.5 px-3 text-sm font-medium transition-all ${
                        insuranceType === t.id 
                        ? 'bg-primary text-primary-foreground border-transparent' 
                        : 'bg-white/5 text-neutral-400 border-white/10 border hover:bg-white/10'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FloatingInput
                    id="ad"
                    label="Ad Soyad"
                    value={form.ad}
                    onChange={update('ad')}
                    autoComplete="name"
                    required
                  />
                  <FloatingInput
                    id="tc"
                    label="TC Kimlik No"
                    value={form.tc}
                    onChange={update('tc')}
                    autoComplete="off"
                    required
                  />
                  
                  <FloatingInput
                    id="telefon"
                    label="Telefon"
                    type="tel"
                    value={form.telefon}
                    onChange={update('telefon')}
                    autoComplete="tel"
                    required
                  />
                  <FloatingInput
                    id="email"
                    label="E-posta"
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    autoComplete="email"
                    required
                  />

                  <FloatingInput
                    id="dogum"
                    label="Doğum Tarihi"
                    type="date"
                    value={form.dogum}
                    onChange={update('dogum')}
                    required
                  />
                  <FloatingInput
                    id="sehir"
                    label="Şehir"
                    value={form.sehir}
                    onChange={update('sehir')}
                    required
                  />
                </div>

                {insuranceType === 'arac' && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FloatingInput
                      id="plaka"
                      label="Plaka"
                      value={form.plaka}
                      onChange={update('plaka')}
                      autoComplete="off"
                      required
                    />
                    <FloatingInput
                      id="belge"
                      label="Belge / Tescil Numarası"
                      value={form.belge}
                      onChange={update('belge')}
                      autoComplete="off"
                      required
                    />
                  </div>
                )}

                {(insuranceType === 'dask' || insuranceType === 'konut') && (
                  <FloatingInput
                    id="adres"
                    label="Açık Adres (İlçe, Mahalle, Sokak vb.)"
                    value={form.adres}
                    onChange={update('adres')}
                    autoComplete="off"
                    required
                  />
                )}

                {error && (
                  <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-[0_0_28px_rgba(220,38,38,0.45)] transition-all hover:shadow-[0_0_40px_rgba(220,38,38,0.65)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-90"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Teklifler alınıyor...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      Teklifimi Getir
                    </>
                  )}
                </button>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  {TRUST.map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1.5 text-xs text-neutral-500"
                    >
                      <Lock className="h-3 w-3 text-primary" />
                      {item}
                    </span>
                  ))}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  )
}
