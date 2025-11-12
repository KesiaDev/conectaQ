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
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function CadastroPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dataNascimentoDisplay, setDataNascimentoDisplay] = useState("")
  const [telefoneDisplay, setTelefoneDisplay] = useState("")
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
      culto_dia: "",
      data_visita: "",
    },
  })

  const jaBatizado = watch("ja_batizado")
  const cultoDia = watch("culto_dia")

  useEffect(() => {
    if (cultoDia) {
      setValue("data_visita", cultoDia)
    }
  }, [cultoDia, setValue])

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) {
      return numbers ? `(${numbers}` : ""
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setTelefoneDisplay(formatted)
    const numbers = formatted.replace(/\D/g, "")
    setValue("telefone", numbers)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value)
    setDataNascimentoDisplay(formatted)
    
    if (formatted.length === 10) {
      const [day, month, year] = formatted.split("/")
      if (day && month && year && year.length === 4) {
        const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
        setValue("data_nascimento", isoDate)
      }
    } else {
      setValue("data_nascimento", "")
    }
  }

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
    <div className="bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-xl lg:max-w-3xl">
        <Card className="shadow-lg border-2">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/images/logos/Logo_Claro_ConectaQ.svg"
                alt="ConectaQ"
                width={200}
                height={80}
                className="w-40 h-auto sm:w-52"
              />
            </div>
            <CardTitle className="text-2xl font-semibold text-primary sm:text-3xl">
              Cadastro de Visitante
            </CardTitle>
            <CardDescription className="text-sm text-foreground/80 sm:text-base">
              Preencha os dados abaixo para fazer seu cadastro
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome_completo" className="text-sm font-medium text-foreground/80">Nome Completo *</Label>
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
                  <Label htmlFor="data_nascimento" className="text-sm font-medium text-foreground/80">Data de Nascimento *</Label>
                  <Input
                    id="data_nascimento"
                    type="text"
                    value={dataNascimentoDisplay}
                    onChange={handleDateChange}
                    placeholder="dd/mm/aaaa"
                    maxLength={10}
                    inputMode="numeric"
                  />
                  {errors.data_nascimento && (
                    <p className="text-sm text-destructive">{errors.data_nascimento.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-sm font-medium text-foreground/80">Telefone *</Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={telefoneDisplay}
                    onChange={handlePhoneChange}
                    placeholder="(54) 99999-9999"
                    maxLength={15}
                    inputMode="numeric"
                  />
                  {errors.telefone && (
                    <p className="text-sm text-destructive">{errors.telefone.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-foreground/80">Já é batizado nas águas? *</Label>
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="denominacao" className="text-sm font-medium text-foreground/80">
                    {jaBatizado === "sim" ? "Qual denominação?" : "Denominação (opcional)"}
                  </Label>
                  <Input
                    id="denominacao"
                    {...register("denominacao")}
                    placeholder=""
                  />
                </div>

                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <Label htmlFor="culto_dia" className="text-sm font-medium text-foreground/80">Dia da visita do culto *</Label>
                  <Input
                    id="culto_dia"
                    type="date"
                    {...register("culto_dia")}
                  />
                  {errors.culto_dia && (
                    <p className="text-sm text-destructive">{errors.culto_dia.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-md border border-primary/20 bg-muted/50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent_lgpd"
                    checked={watch("consent_lgpd")}
                    onCheckedChange={(checked) => setValue("consent_lgpd", checked === true)}
                  />
                  <Label
                    htmlFor="consent_lgpd"
                    className="cursor-pointer text-xs leading-relaxed text-foreground/80 sm:text-sm"
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

