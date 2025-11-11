import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4 py-12">
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full shadow-lg border-2">
          <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/logos/Logo_Claro_ConectaQ.svg"
              alt="ConectaQ - Conexão Quadrangular"
              width={280}
              height={120}
              priority
              className="w-auto h-auto"
            />
          </div>
          <CardDescription className="text-base text-foreground/80">
            CASA - Igreja do Evangelho Quadrangular
            <br />
            Caxias do Sul
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-center text-foreground/70 leading-relaxed">
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

