'use client'

import { useState } from 'react'
import type { HTMLInputTypeAttribute } from 'react'
import { cn } from '@/lib/utils'

export function FloatingInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: HTMLInputTypeAttribute
  required?: boolean
  autoComplete?: string
}) {
  const [focused, setFocused] = useState(false)
  const floated = focused || value.length > 0 || type === 'date'

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          'peer w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 pb-2.5 pt-6 text-base text-foreground outline-none transition-all',
          'placeholder-transparent focus:border-primary/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20',
          '[color-scheme:dark]',
        )}
        placeholder={label}
      />
      <label
        htmlFor={id}
        className={cn(
          'pointer-events-none absolute left-4 origin-left transition-all duration-200',
          floated
            ? 'top-2 text-xs font-medium text-primary'
            : 'top-1/2 -translate-y-1/2 text-base text-neutral-500',
        )}
      >
        {label}
      </label>
    </div>
  )
}
