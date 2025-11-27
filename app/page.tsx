import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const instagramUrl =
    "https://www.instagram.com/quadrangularcaxiasdosul?igsh=MXMzb3ZzejRhcnl3cw=="

  return (
    <div className="flex flex-col items-center w-full bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4 py-4 sm:py-6">

      {/* Seção Instagram */}
      <div className="w-full max-w-5xl mx-auto text-center pb-2">

        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="mx-auto flex justify-center">
            <Image
              src="/images/instagram-promo.svg"
              alt="Instagram - @quadrangularcaxiasdosul"
              width={2600}
              height={2600}
              className="
                w-[600px]
                sm:w-[800px]
                md:w-[1000px]
                lg:w-[1200px]
                xl:w-[1400px]
                h-auto
                !max-w-none
                !min-w-[600px]
              "
              priority
            />
          </div>
        </a>

      </div>

      {/* Card de Cadastro */}
      <div className="w-full flex justify-center mt-2">
        <div className="w-full max-w-lg sm:max-w-2xl">
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

              <CardTitle className="text-lg sm:text-xl font-semibold text-primary">
                Cadastro CASA
              </CardTitle>

              <CardDescription className="text-sm text-foreground/80 sm:text-base">
                Igreja do Evangelho Quadrangular • Caxias do Sul
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 px-4 sm:px-6">
              <p className="text-center text-sm leading-relaxed text-foreground/70 sm:text-base">
                Ficamos felizes em recebê-lo! Faça seu cadastro para que possamos conhecê-lo melhor
                e mantê-lo informado sobre nossos eventos e atividades.
              </p>

              <Link href="/cadastro" className="block">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
                  size="lg"
                >
                  Fazer cadastro
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
