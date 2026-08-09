"use client"

import * as React from "react"
import { ShieldCheck, Lock, Mail, Loader2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export function LoginView({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = React.useState("firat.ece@sigortapanel.com")
  const [password, setPassword] = React.useState("••••••••")
  const [loading, setLoading] = React.useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin()
    }, 700)
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4">
      {/* subtle grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-card shadow-lg">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold tracking-tight">
              SigortaPanel Pro
            </h1>
            <p className="text-xs text-muted-foreground">
              Güvenli Yönetim Portalı
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="email">E-posta</FieldLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Parola</FieldLabel>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
              </Field>

              <Button
                type="submit"
                size="lg"
                className="mt-1 w-full"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                ) : (
                  <ArrowRight data-icon="inline-end" />
                )}
                {loading ? "Giriş yapılıyor" : "Giriş Yap"}
              </Button>
            </FieldGroup>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-center">
          <Lock className="size-3 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground text-balance">
            Erişim yalnızca yönetici tarafından tanımlanır. Kayıt bulunmamaktadır.
          </p>
        </div>
      </div>
    </div>
  )
}
