"use client"

import { ThemeProvider } from "next-themes"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {children}
      </div>
    </ThemeProvider>
  )
}
