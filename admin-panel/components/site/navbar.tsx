'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ViewKey } from '@/lib/views'

const LINKS: { label: string; view: ViewKey; anchor?: string }[] = [
  { label: 'Ana Sayfa', view: 'home' },
  { label: 'Kurumsal', view: 'about' },
  { label: 'Ürünlerimiz', view: 'home', anchor: 'urunler' },
  { label: 'İletişim', view: 'about', anchor: 'iletisim' },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
        <ShieldCheck className="h-5 w-5 text-primary" />
      </span>
      <span className="text-lg font-extrabold tracking-tighter">
        <span className="text-primary">Fırat Ece</span>{' '}
        <span className="text-foreground">Sigorta</span>
      </span>
    </div>
  )
}

export function Navbar({
  active,
  onNavigate,
}: {
  active: ViewKey
  onNavigate: (view: ViewKey, anchor?: string) => void
}) {
  const [open, setOpen] = useState(false)

  const go = (view: ViewKey, anchor?: string) => {
    onNavigate(view, anchor)
    setOpen(false)
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => go('home')}
          className="rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Fırat Ece Sigorta ana sayfa"
        >
          <Logo />
        </button>

        {/* Center links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const isActive = active === link.view && !link.anchor
            return (
              <button
                key={link.label}
                type="button"
                onClick={() => go(link.view, link.anchor)}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-neutral-400 hover:text-foreground',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/8 ring-1 ring-white/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {link.label}
              </button>
            )
          })}
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go('quote')}
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:shadow-[0_0_28px_rgba(220,38,38,0.6)] active:scale-[0.97] sm:inline-flex"
          >
            Hemen Teklif Al
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-foreground md:hidden"
            aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/10 bg-black/70 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {LINKS.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => go(link.view, link.anchor)}
                  className="rounded-xl px-4 py-3 text-left text-base font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go('quote')}
                className="mt-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              >
                Hemen Teklif Al
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
