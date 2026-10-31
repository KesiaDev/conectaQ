"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
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
    <Card className="w-full shadow-lg border-2">
      <CardHeader className="text-center space-y-2 pt-6">
        <CardTitle className="text-lg sm:text-xl font-semibold text-primary">
          Generosidade
        </CardTitle>

        <CardDescription className="text-sm text-foreground/80 sm:text-base">
          Dízimos e Ofertas
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 px-4 sm:px-6">
        <p className="text-center text-sm leading-relaxed text-foreground/70 sm:text-base">
          Sua generosidade faz parte desta missão. Agradecemos por contribuir com aquilo que Deus
          tem realizado através da nossa igreja.
        </p>

        <div className="rounded-md border border-primary/20 bg-muted/50 p-4 text-center sm:p-5">
          <p className="text-sm font-medium text-foreground/80">Chave Pix:</p>
          <p className="mt-1 select-all break-all text-lg font-semibold text-primary sm:text-xl">
            {PIX_KEY}
          </p>
        </div>

        <div className="space-y-2">
          <Button
            type="button"
            onClick={handleCopy}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
            size="lg"
          >
            {status === "copied" ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {status === "copied" ? "CHAVE PIX COPIADA!" : "COPIAR CHAVE PIX"}
          </Button>

          <p role="status" className="min-h-5 text-center text-sm text-foreground/70">
            {status === "copied" && "Chave Pix copiada com sucesso!"}
            {status === "error" && "Não foi possível copiar. Selecione a chave acima e copie manualmente."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
