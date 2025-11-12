"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Instagram, MessageCircle } from "lucide-react"
import Image from "next/image"

function SucessoContent() {
  const searchParams = useSearchParams()
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    setId(searchParams.get("id"))
  }, [searchParams])

  const instagramUrl = "https://www.instagram.com/quadrangularcaxiasdosul?igsh=MXMzb3ZzejRhcnl3cw=="
  const whatsappUrl = "https://wa.me/54996691891?text=Olá!%20Acabei%20de%20me%20cadastrar%20na%20igreja"

  const handleInstagramClick = () => {
    // Track event
    if (id) {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_id: id,
          tipo: "clique_ig",
        }),
      }).catch(console.error)
    }
    window.open(instagramUrl, "_blank")
  }

  const handleWhatsAppClick = () => {
    // Track event
    if (id) {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_id: id,
          tipo: "join_whatsapp",
        }),
      }).catch(console.error)
    }
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4 py-8 sm:py-12">
      <Card className="w-full max-w-sm sm:max-w-lg shadow-lg border-2">
        <CardHeader className="text-center space-y-4 sm:space-y-6">
          <div className="flex justify-center">
            <Image
              src="/images/logos/Logo_Claro_ConectaQ.svg"
              alt="ConectaQ"
              width={200}
              height={80}
              className="w-36 h-auto sm:w-48"
            />
          </div>
          <div className="mx-auto mb-2 sm:mb-4 w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold text-primary sm:text-3xl">
            Cadastro Realizado!
          </CardTitle>
          <CardDescription className="text-sm text-foreground/80 sm:text-base">
            Seu cadastro foi realizado com sucesso. Obrigado!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-4 sm:px-6">
          <p className="text-center text-sm text-foreground/70 sm:text-base">
            Siga-nos nas redes sociais para ficar por dentro de todos os nossos eventos e atividades.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={handleInstagramClick}
              className="w-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all"
              variant="outline"
              size="lg"
            >
              <Instagram className="mr-2 h-5 w-5" />
              Seguir no Instagram
            </Button>
            
            <Button
              onClick={handleWhatsAppClick}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Entrar no WhatsApp
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground sm:text-sm">
            Que Deus te abençoe!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SucessoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Carregando...</div>}>
      <SucessoContent />
    </Suspense>
  )
}
