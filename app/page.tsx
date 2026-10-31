import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import GenerosidadeCard from '@/components/GenerosidadeCard'

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

      {/* Cards de Visitante e Generosidade */}
      <div className="w-full flex justify-center mt-2">
        <div className="w-full max-w-lg sm:max-w-2xl space-y-4">
          <div className="space-y-3">
            <p className="text-center text-xl font-semibold text-primary">ConectaQ</p>

            <Card className="w-full rounded-2xl border-0 shadow-md">
              <CardHeader className="space-y-2 p-4 pb-3 sm:p-6 sm:pb-3">
                <CardTitle className="text-base font-semibold text-foreground sm:text-lg">
                  Área do Visitante
                </CardTitle>

                <CardDescription className="text-sm leading-relaxed text-foreground/70 sm:text-base">
                  Está visitando nossa igreja pela primeira vez? Queremos conhecer você!
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <Link href="/cadastro" className="block">
                  <Button
                    className="w-full rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
                    size="lg"
                  >
                    FAZER MEU CADASTRO
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <GenerosidadeCard />
        </div>
      </div>
    </div>
  )
}
