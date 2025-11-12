import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DeveloperFooter from '@/components/DeveloperFooter'
import SessionWrapper from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CASA QR Platform',
  description: 'Sistema de cadastro via QR Code - CASA - Igreja do Evangelho Quadrangular Caxias do Sul',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SessionWrapper>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
            <DeveloperFooter />
          </div>
        </SessionWrapper>
      </body>
    </html>
  )
}

