"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registrationSchema, type RegistrationFormData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function CadastroPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      ja_batizado: undefined,
      consent_lgpd: false,
    },
  })

  const jaBatizado = watch("ja_batizado")

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/sucesso?id=${result.id}`)
      } else {
        const error = await response.json()
        alert(`Erro ao cadastrar: ${error.message || "Erro desconhecido"}`)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Erro ao cadastrar. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-2">
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
            <CardTitle className="text-2xl text-primary">Cadastro de Visitante</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para fazer seu cadastro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  {...register("nome_completo")}
                  placeholder="Digite seu nome completo"
                />
                {errors.nome_completo && (
                  <p className="text-sm text-destructive">{errors.nome_completo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  {...register("data_nascimento")}
                />
                {errors.data_nascimento && (
                  <p className="text-sm text-destructive">{errors.data_nascimento.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  type="tel"
                  {...register("telefone")}
                  placeholder="(54) 99999-9999"
                />
                {errors.telefone && (
                  <p className="text-sm text-destructive">{errors.telefone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Já é batizado nas águas? *</Label>
                <Select
                  value={jaBatizado}
                  onValueChange={(value) => setValue("ja_batizado", value as "sim" | "nao")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
                {errors.ja_batizado && (
                  <p className="text-sm text-destructive">{errors.ja_batizado.message}</p>
                )}
              </div>

              {jaBatizado === "sim" && (
                <div className="space-y-2">
                  <Label htmlFor="denominacao">Qual denominação?</Label>
                  <Input
                    id="denominacao"
                    {...register("denominacao")}
                    placeholder="Ex: Assembleia de Deus, Batista, etc."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="culto_dia">Dia da visita do culto</Label>
                <Select
                  onValueChange={(value) => setValue("culto_dia", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domingo-19h">Domingo 19h</SelectItem>
                    <SelectItem value="quarta-20h">Quarta 20h</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_visita">Data da Visita *</Label>
                <Input
                  id="data_visita"
                  type="date"
                  {...register("data_visita")}
                />
                {errors.data_visita && (
                  <p className="text-sm text-destructive">{errors.data_visita.message}</p>
                )}
              </div>

              <div className="space-y-4 p-4 bg-muted/50 rounded-md border border-primary/20">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent_lgpd"
                    checked={watch("consent_lgpd")}
                    onCheckedChange={(checked) => setValue("consent_lgpd", checked === true)}
                  />
                  <Label
                    htmlFor="consent_lgpd"
                    className="text-sm font-normal leading-relaxed cursor-pointer"
                  >
                    Autorizo o tratamento dos meus dados para fins de acolhimento, comunicação de eventos e atividades da CASA – Igreja do Evangelho Quadrangular Caxias do Sul, conforme a Lei 13.709/2018. Posso revogar a qualquer tempo. *
                  </Label>
                </div>
                {errors.consent_lgpd && (
                  <p className="text-sm text-destructive">{errors.consent_lgpd.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Finalizar Cadastro"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

