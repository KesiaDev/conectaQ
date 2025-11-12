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
    <div className="flex items-center justify-center bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4 py-8 sm:py-12">
      <Card className="w-full max-w-sm sm:max-w-lg shadow-lg border-2">
        <CardHeader className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/logos/Logo_Claro_ConectaQ.svg"
              alt="ConectaQ"
              width={200}
              height={80}
              className="w-40 h-auto sm:w-52"
            />
          </div>
          <CardTitle className="text-xl font-semibold text-primary sm:text-2xl">
            QR Code de Cadastro
          </CardTitle>
          <CardDescription className="text-sm text-foreground/80 sm:text-base">
            Escaneie este QR Code para acessar o cadastro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="flex justify-center">
            {qrCodeDataUrl ? (
              <Image
                src={qrCodeDataUrl}
                alt="QR Code"
                width={300}
                height={300}
                className="w-full max-w-[220px] h-auto sm:max-w-xs"
                unoptimized
              />
            ) : (
              <div className="w-full max-w-xs aspect-square bg-gray-200 animate-pulse rounded" />
            )}
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-foreground/70 sm:text-base">
              Aponte a câmera do celular para o QR Code acima
            </p>
            <p className="text-xs text-muted-foreground sm:text-sm break-all">
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
