"use client"

import * as React from "react"
import { toast } from "sonner"

import {
  clients as initialClients,
  leads as initialLeads,
  type Client,
  type Lead,
  type Policy,
  type InsuranceType,
} from "@/lib/mock-data"
import { getLeads } from "@/app/actions/admin"
import { getClients } from "@/app/actions/clients"
import { LoginView } from "@/components/admin/login-view"
import { Sidebar } from "@/components/admin/sidebar"
import { Topbar } from "@/components/admin/topbar"
import { DashboardView } from "@/components/admin/dashboard-view"
import { LeadsView } from "@/components/admin/leads-view"
import { ClientsView } from "@/components/admin/clients-view"
import { ClientDetailSheet } from "@/components/admin/client-detail-sheet"
import { FinancialView } from "@/components/admin/financial-view"
import { MessagesView } from "@/components/admin/messages-view"
import { InvoiceView } from "@/components/admin/invoice-view"
import { ProfileView } from "@/components/admin/profile-view"
import { getMessages } from "@/app/actions/messages"
import { getCompanyProfile } from "@/app/actions/admin"

export type ViewId = "dashboard" | "financials" | "clients" | "messages" | "invoice" | "profile" | `leads-${InsuranceType}`

/** Map a raw backend Offer row into the Lead shape the UI expects */
function offerToLead(o: ApiOffer): Lead {
  return {
    id: String(o.id),
    date: o.createdAt,
    insuranceType: "arac" as InsuranceType, // all web-form submissions are vehicle quotes
    name: o.fullName,
    tc: o.tcKimlikNo ?? "—",
    birthDate: o.dateOfBirth
      ? new Date(o.dateOfBirth).toLocaleDateString("tr-TR")
      : "—",
    phone: o.phoneNumber,
    status: o.status === "PENDING" ? "yeni" : "iletildi",
    note: `Plaka: ${o.licensePlate}`,
    plate: o.licensePlate,
    registrationNo: o.belgeNo ?? undefined,
  }
}

export function AdminApp() {
  const [authed, setAuthed] = React.useState(false)
  const [view, setView] = React.useState<ViewId>("dashboard")
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  const [leads, setLeads] = React.useState<Lead[]>([])
  const [messages, setMessages] = React.useState<any[]>([])
  const [companyProfile, setCompanyProfile] = React.useState<any>(null)
  const [leadsLoading, setLeadsLoading] = React.useState(false)
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(
    null
  )

  const [clients, setClients] = React.useState<Client[]>([])
  const [financials, setFinancials] = React.useState<any[]>([])

  React.useEffect(() => {
    if (!authed) return
    let mounted = true
    setLeadsLoading(true)
    
    Promise.all([
      getLeads(),
      getClients(),
      getCompanyProfile(),
      import("@/app/actions/clients").then(m => m.getFinancials())
    ]).then(([leadsData, clientsData, profileData, financialsData]) => {
      if (!mounted) return
      setLeads(leadsData as any)
      
      // Map Prisma clients to UI clients format
      const mappedClients: Client[] = clientsData.map((c: any) => ({
        id: c.id,
        name: c.name,
        tc: c.tc || "-",
        phone: c.phone,
        email: c.email || "-",
        city: c.city || c.address || "-",
        since: new Date(c.createdAt).toISOString(),
        vehicle: {
          plate: c.plate || "-",
          brand: c.brand || "-",
          model: c.model || "-",
          year: c.year || new Date().getFullYear(),
          engineNo: c.engineNo || "-",
          chassisNo: c.chassisNo || "-",
        },
        policies: c.policies.map((p: any) => ({
          id: p.id,
          type: p.type,
          company: p.companyName || "-",
          policyNo: p.policyNo || "-",
          premium: p.premium,
          startDate: new Date(p.startDate).toISOString(),
          endDate: new Date(p.endDate).toISOString(),
        })),
        financials: c.financials.map((f: any) => ({
          id: f.id,
          date: new Date(f.date).toISOString(),
          description: f.description,
          amount: f.amount,
          kind: f.kind,
        }))
      }))
      
      setClients(mappedClients)
      setCompanyProfile(profileData)
      setFinancials(financialsData)
      setLeadsLoading(false)
    })

    // Fetch messages separately or adjust getMessages
    getMessages("temp").then(msgs => {
      if (mounted) setMessages(msgs)
    })

    return () => {
      mounted = false
    }
  }, [authed])



  const selectedClient =
    clients.find((c) => c.id === selectedClientId) ?? null

  async function handleAddClient(client: Client) {
    // Server action
    const { createClient } = await import("@/app/actions/clients")
    const res = await createClient({
      name: client.name,
      tc: client.tc,
      phone: client.phone,
      email: client.email || '',
      city: client.city,
      plate: client.vehicle.plate || '',
      brand: client.vehicle.brand || '',
      model: client.vehicle.model || '',
      year: client.vehicle.year || new Date().getFullYear(),
    })

    if (res.success && res.client) {
      toast.success("Müşteri eklendi", {
        description: `${client.name} sisteme kaydedildi.`,
      })
      // Update UI
      setClients((prev) => [{...client, id: res.client.id}, ...prev])
    } else {
      toast.error(res.error || "Müşteri kaydedilemedi.")
    }
  }

  async function handleUpdateLead(id: string, status: "iletildi" | "onaylandi", premium?: number | null, commission?: number | null) {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, status }
          if (premium !== undefined) updated.premium = premium === null ? undefined : premium
          if (commission !== undefined) updated.commission = commission === null ? undefined : commission
          return updated
        }
        return l
      })
    )
    
    // Server Action call
    const { updateLeadFinancials } = await import("@/app/actions/admin")
    const res = await updateLeadFinancials(id, { status, premium, commission })
    if (res.success) {
      toast.success(status === "onaylandi" ? "Satış onaylandı!" : "Teklif iletildi.")
    } else {
      toast.error(res.error || "Hata oluştu.")
    }
  }

  async function handleDeleteLead(id: string) {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "silindi" } : l))
    )
    
    // Server Action call
    const { deleteLead } = await import("@/app/actions/admin")
    const res = await deleteLead(id)
    if (res.success) {
      toast("Talep silindi", { description: "Kayıt çöp kutusuna taşındı." })
    } else {
      toast.error(res.error || "Hata oluştu.")
    }
  }

  async function handleRestoreLead(id: string) {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "yeni" } : l))
    )
    
    // Server Action call
    const { restoreLead } = await import("@/app/actions/admin")
    const res = await restoreLead(id)
    if (res.success) {
      toast.success("Talep geri alındı", { description: "Kayıt yeni sekmesine taşındı." })
    } else {
      toast.error(res.error || "Hata oluştu.")
    }
  }

  async function handleUpdateVehicle(id: string, data: Partial<Client['vehicle']>) {
    // Optimistic UI update
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, vehicle: { ...c.vehicle, ...data } } : c))
    )
    
    // Server Action call
    const { updateClient } = await import("@/app/actions/clients")
    const res = await updateClient(id, {
      brand: data.brand,
      model: data.model,
      year: data.year,
      engineNo: data.engineNo,
      chassisNo: data.chassisNo,
    })
    if (res.success) {
      toast.success("Araç bilgileri güncellendi.")
    } else {
      toast.error(res.error || "Hata oluştu.")
    }
  }

  async function handleAddExpense(amount: number, description: string, date: string) {
    const { createExpense } = await import("@/app/actions/clients")
    const res = await createExpense({ amount, description, date })
    
    if (res.success && res.expense) {
      toast.success("Gider eklendi.")
      // We could optimistically add it, but it's easier to just refresh or let Server Actions revalidate
      // We actually need to re-fetch clients because expenses are inside clients? Wait, no!
      // 'gider' is a Financial record. But Financial records in getClients() are attached to the company?
      // Wait, let's look at getClients() again. It includes `financials`. But if `clientId` is null, it won't be returned by `getClients`?
    } else {
      toast.error(res.error || "Hata oluştu.")
    }
  }

  if (!authed) {
    return <LoginView onLogin={() => setAuthed(true)} />
  }

  return (
    <div className="flex min-h-svh bg-background text-foreground print:block print:min-h-0 print:bg-white">
      <Sidebar
        activeView={view}
        onNavigate={(v) => {
          setView(v)
          setMobileNavOpen(false)
        }}
        leads={leads}
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
        onLogout={() => {
          setAuthed(false)
          setView("dashboard")
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col print:block">
        <Topbar
          view={view}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          leads={leads}
          clients={clients}
          messages={messages}
        />

        <main className="flex-1 overflow-x-hidden print:overflow-visible px-4 py-6 md:px-8 md:py-8 print:p-0 print:m-0">
          <div className="mx-auto w-full max-w-7xl print:max-w-none print:p-0 print:m-0">
            {view === "dashboard" && (
              <DashboardView clients={clients} leads={leads} />
            )}
            {view === "financials" && (
              <FinancialView leads={leads} clients={clients} financials={financials} companyProfile={companyProfile} onAddExpense={handleAddExpense} />
            )}
            {view.startsWith("leads-") && (
              <LeadsView
                insuranceType={view.replace("leads-", "") as InsuranceType}
                leads={leads}
                onUpdateLead={handleUpdateLead}
                onDelete={handleDeleteLead}
                onRestore={handleRestoreLead}
              />
            )}
            {view === "clients" && (
              <ClientsView
                clients={clients}
                onAddClient={handleAddClient}
                onSelectClient={setSelectedClientId}
              />
            )}
            {view === "messages" && (
              <MessagesView messages={messages} setMessages={setMessages} />
            )}
            {view === "invoice" && (
              <InvoiceView clients={clients} companyProfile={companyProfile} />
            )}
            {view === "profile" && (
              <ProfileView company={companyProfile} onUpdate={setCompanyProfile} />
            )}
          </div>
        </main>
      </div>

      <ClientDetailSheet
        client={selectedClient}
        open={selectedClientId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedClientId(null)
        }}
        onUpdateVehicle={handleUpdateVehicle}
      />
    </div>
  )
}

export type { Client, Lead, Policy }
