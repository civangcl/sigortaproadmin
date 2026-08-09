import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Fırat Ece Sigorta — Aradığınız Güvence, En Uygun Fiyatla',
  description:
    'Fırat Ece Sigorta ile araç, konut, sağlık ve DASK sigortalarında 20+ anlaşmalı şirket arasından en uygun teklifi saniyeler içinde alın. 7/24 hasar desteği.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className={`dark ${inter.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
