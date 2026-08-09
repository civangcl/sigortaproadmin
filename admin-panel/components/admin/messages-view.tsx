import * as React from "react"
import { Check, Mail, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { updateMessageStatus } from "@/app/actions/messages"

export function MessagesView({
  messages,
  setMessages,
}: {
  messages: any[]
  setMessages: React.Dispatch<React.SetStateAction<any[]>>
}) {
  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "okundu" } : m))
    )
    await updateMessageStatus(id, "okundu")
  }

  const handleDelete = async (id: string) => {
    // Optimistic UI
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "silindi" } : m))
    )
    await updateMessageStatus(id, "silindi")
  }

  const visibleMessages = messages.filter((m) => m.status !== "silindi")

  if (visibleMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="size-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Henüz mesajınız yok
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Web sitenizdeki "Bize Yazın" formundan gönderilen mesajlar burada görünecektir.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Destek Mesajları</h2>
        <p className="text-muted-foreground">
          Sitenizdeki iletişim formundan gelen müşteri mesajlarını görüntüleyin.
        </p>
      </div>

      <div className="grid gap-4">
        {visibleMessages.map((msg) => (
          <Card key={msg.id} className={msg.status === "yeni" ? "border-primary/50" : ""}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{msg.fullName}</CardTitle>
                  {msg.status === "yeni" && (
                    <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                      Yeni
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  <a href={`mailto:${msg.email}`} className="hover:underline hover:text-primary transition-colors">
                    {msg.email}
                  </a>
                  {" • "}
                  {new Intl.DateTimeFormat("tr-TR", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(msg.createdAt))}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {msg.status === "yeni" && (
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => handleMarkAsRead(msg.id)}
                    title="Okundu olarak işaretle"
                  >
                    <Check className="size-4 text-success" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleDelete(msg.id)}
                  title="Sil"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-muted/50 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {msg.message}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
