"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import Image from "next/image"

export default function QRPage() {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  useEffect(() => {
    const generateQR = async () => {
      if (!baseUrl) return
      try {
        const qrcode = await import("qrcode")
        const url = `${baseUrl}/`
        const dataUrl = await qrcode.default.toDataURL(url, {
          width: 300,
          margin: 2,
        })
        setQrCodeDataUrl(dataUrl)
      } catch (error) {
        console.error("Error generating QR code:", error)
      }
    }

    generateQR()
  }, [baseUrl])

  const downloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement("a")
      link.download = "qr-code-casa.png"
      link.href = qrCodeDataUrl
      link.click()
    }
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/logos/Logo_Claro_ConectaQ.svg"
              alt="ConectaQ"
              width={200}
              height={80}
              className="w-auto h-auto"
            />
          </div>
          <CardTitle className="text-2xl text-primary">QR Code de Cadastro</CardTitle>
          <CardDescription>
            Escaneie este QR Code para acessar o cadastro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {qrCodeDataUrl ? (
              <Image
                src={qrCodeDataUrl}
                alt="QR Code"
                width={300}
                height={300}
                className="w-full max-w-xs h-auto"
                unoptimized
              />
            ) : (
              <div className="w-full max-w-xs aspect-square bg-gray-200 animate-pulse rounded" />
            )}
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-foreground/70">
              Aponte a câmera do celular para o QR Code acima
            </p>
            <p className="text-xs text-muted-foreground">
              URL: {baseUrl}
            </p>
          </div>

          <Button onClick={downloadQR} className="w-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Baixar QR Code
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
