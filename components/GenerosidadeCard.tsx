"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PIX_KEY = "62955505028762"
const FEEDBACK_DURATION_MS = 3000

async function copyToClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Navegadores embutidos (ex: Instagram) podem bloquear a API; segue para o fallback
    }
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, text.length)

  try {
    return document.execCommand("copy")
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

export default function GenerosidadeCard() {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle")
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const handleCopy = async () => {
    const copied = await copyToClipboard(PIX_KEY)
    setStatus(copied ? "copied" : "error")

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setStatus("idle"), FEEDBACK_DURATION_MS)
  }

  return (
    <Card className="w-full rounded-2xl border-0 shadow-md">
      <CardHeader className="space-y-2 p-4 pb-3 sm:p-6 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
          <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
          Generosidade
        </CardTitle>

        <CardDescription className="text-sm leading-relaxed text-foreground/70 sm:text-base">
          Dízimos e ofertas. Sua contribuição faz parte desta missão.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 p-4 pt-0 sm:p-6 sm:pt-0">
        <Button
          type="button"
          onClick={handleCopy}
          className="w-full rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
          size="lg"
        >
          {status === "copied" && <Check className="mr-2 h-4 w-4" />}
          {status === "copied" ? "CHAVE PIX COPIADA!" : "CONTRIBUIR VIA PIX"}
        </Button>

        <p className="text-center text-xs text-muted-foreground sm:text-sm">
          Chave Pix: <span className="select-all break-all">{PIX_KEY}</span>
        </p>

        <p role="status" className="text-center text-sm text-foreground/70 empty:hidden">
          {status === "copied" && "Chave Pix copiada com sucesso!"}
          {status === "error" && "Não foi possível copiar. Selecione a chave acima e copie manualmente."}
        </p>
      </CardContent>
    </Card>
  )
}
