'use client'

import { ShieldCheck, Globe, MessageCircle, AtSign, Share2 } from 'lucide-react'
import type { ViewKey } from '@/lib/views'

const COLUMNS: {
  title: string
  links: { label: string; view: ViewKey; anchor?: string }[]
}[] = [
  {
    title: 'Ürünler',
    links: [
      { label: 'Araç Sigortası', view: 'quote' },
      { label: 'DASK', view: 'quote' },
      { label: 'Sağlık Sigortası', view: 'quote' },
      { label: 'Konut Sigortası', view: 'quote' },
    ],
  },
  {
    title: 'Kurumsal',
    links: [
      { label: 'Hakkımızda', view: 'about' },
      { label: 'İletişim', view: 'about', anchor: 'iletisim' },
      { label: 'Ana Sayfa', view: 'home' },
      { label: 'Teklif Al', view: 'quote' },
    ],
  },
  {
    title: 'Destek',
    links: [
      { label: 'Hasar İhbarı', view: 'about', anchor: 'iletisim' },
      { label: 'Sıkça Sorulanlar', view: 'home', anchor: 'urunler' },
      { label: 'Poliçe Yenileme', view: 'quote' },
      { label: 'Canlı Destek', view: 'about', anchor: 'iletisim' },
    ],
  },
]

const SOCIAL = [Globe, MessageCircle, AtSign, Share2]

export function Footer({
  onNavigate,
}: {
  onNavigate: (view: ViewKey, anchor?: string) => void
}) {
  return (
    <footer className="border-t border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-5 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </span>
              <span className="text-lg font-extrabold tracking-tighter">
                <span className="text-primary">Fırat Ece</span>{' '}
                <span className="text-foreground">Sigorta</span>
              </span>
            </div>
            <p className="max-w-xs text-pretty leading-relaxed text-neutral-400">
              Türkiye&apos;nin bağımsız sigorta brokerliği. 20+ şirketi
              karşılaştırır, size en uygun güvenceyi buluruz.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL.map((Icon, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label="Sosyal medya"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <h4 className="text-sm font-bold uppercase tracking-wide text-foreground">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={() => onNavigate(link.view, link.anchor)}
                      className="text-sm text-neutral-400 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Fırat Ece Sigorta. Tüm hakları
            saklıdır.{' '}
            <a
              href="/admin"
              className="text-neutral-900 transition-colors duration-300 hover:text-neutral-600 select-none"
              tabIndex={-1}
              aria-hidden="true"
            >
              ·
            </a>
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-neutral-500 transition-colors hover:text-neutral-300">
              Gizlilik Politikası
            </span>
            <span className="text-sm text-neutral-500 transition-colors hover:text-neutral-300">
              KVKK
            </span>
            <span className="text-sm text-neutral-500 transition-colors hover:text-neutral-300">
              Çerezler
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
