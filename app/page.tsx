import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

export default function Home() {
  const instagramUrl = "https://www.instagram.com/quadrangularcaxiasdosul?igsh=MXMzb3ZzejRhcnl3cw=="

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4 py-4 sm:py-6 gap-0">
      {/* Seção Instagram */}
      <div className="w-full max-w-lg mx-auto text-center space-y-1 pb-2">
        <div className="space-y-0.5">
          <p className="text-xs sm:text-sm text-muted-foreground">CLIQUE PARA</p>
          <p className="text-base sm:text-lg font-bold text-foreground">Seguir nosso Perfil</p>
        </div>
        
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="relative inline-block">
            <Image
              src="/images/instagram-promo.svg"
              alt="Instagram - @quadrangularcaxiasdosul"
              width={400}
              height={300}
              className="w-full max-w-sm mx-auto h-auto"
              priority
            />
          </div>
        </a>
      </div>

      {/* Card de Cadastro */}
      <div className="w-full max-w-lg sm:max-w-2xl mx-auto -mt-8 sm:-mt-10">
        <Card className="w-full shadow-lg border-2">
          <CardHeader className="text-center space-y-4 sm:space-y-6 pt-4">
            <div className="flex justify-center">
              <Image
                src="/images/logos/Logo_Claro_ConectaQ.svg"
                alt="ConectaQ - Conexão Quadrangular"
                width={280}
                height={120}
                priority
                className="w-44 h-auto sm:w-64"
              />
            </div>
            <CardDescription className="text-sm text-foreground/80 sm:text-base">
              CASA - Igreja do Evangelho Quadrangular
              <br />
              Caxias do Sul
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6">
            <p className="text-center text-sm leading-relaxed text-foreground/70 sm:text-base">
              Ficamos felizes em recebê-lo! Por favor, faça seu cadastro para que possamos conhecê-lo melhor e mantê-lo informado sobre nossos eventos e atividades.
            </p>
            <Link href="/cadastro" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all" size="lg">
                Fazer cadastro
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

