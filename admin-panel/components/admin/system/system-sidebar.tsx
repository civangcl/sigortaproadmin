import * as React from "react"
import { Building2, LayoutDashboard, Settings, Users, Globe, CreditCard, Activity, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SystemSidebarProps {
  activeView: string
  onNavigate: (view: string) => void
}

export function SystemSidebar({ activeView, onNavigate }: SystemSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Genel Bakış", icon: LayoutDashboard },
    { id: "companies", label: "Acenteler", icon: Building2 },
    { id: "onboard", label: "Yeni Acente", icon: PlusCircle },
    { id: "users", label: "Kullanıcılar", icon: Users },
    { id: "websites", label: "Websiteleri", icon: Globe },
    { id: "billing", label: "Abonelikler", icon: CreditCard },
    { id: "activity", label: "Sistem Aktivitesi", icon: Activity },
    { id: "settings", label: "Ayarlar", icon: Settings },
  ]

  return (
    <aside className="hidden w-64 flex-col bg-slate-950 text-slate-300 md:flex">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-white tracking-tight">
          <div className="size-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground">SP</div>
          SigortaPro <span className="text-primary font-normal">SaaS</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="space-y-1 px-3">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Platform Yönetimi</p>
          {menuItems.map((item) => {
            const isActive = activeView === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
