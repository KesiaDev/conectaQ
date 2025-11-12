"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [mode, setMode] = useState<"login" | "change">("login")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changeFeedback, setChangeFeedback] = useState<string | null>(null)

  const authError = searchParams.get("error")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl: "/admin",
    })

    setIsSubmitting(false)

    if (result?.ok) {
      router.push("/admin")
    } else {
      setErrorMessage("Usuário ou senha inválidos. Tente novamente.")
    }
  }

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setChangeFeedback(null)

    if (newPassword !== confirmPassword) {
      setIsSubmitting(false)
      setErrorMessage("As senhas novas não conferem.")
      return
    }

    try {
      const response = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          currentPassword,
          newPassword,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.message || "Erro ao atualizar senha")
      }

      setChangeFeedback("Senha atualizada com sucesso! Use a nova senha para entrar.")
      setMode("login")
      setPassword("")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Erro ao atualizar senha")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Usuário</Label>
        <Input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      {(errorMessage || authError) && (
        <p className="text-sm text-destructive">
          {errorMessage || "Sessão expirada. Faça login novamente."}
        </p>
      )}

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  )

  const renderChangePasswordForm = () => (
    <form onSubmit={handleChangePassword} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username-change">Usuário</Label>
        <Input
          id="username-change"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="current-password">Senha atual</Label>
        <Input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">Nova senha</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          minLength={6}
        />
        <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirmar nova senha</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={6}
        />
      </div>

      {(errorMessage || changeFeedback) && (
        <p className={`text-sm ${errorMessage ? "text-destructive" : "text-green-600"}`}>
          {errorMessage || changeFeedback}
        </p>
      )}

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Atualizando..." : "Atualizar senha"}
      </Button>
    </form>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/images/logos/Logo_Claro_ConectaQ.svg"
              alt="ConectaQ"
              width={200}
              height={80}
              className="w-40 h-auto"
            />
          </div>
          <CardTitle className="text-2xl text-primary">
            {mode === "login" ? "Acesso Administrativo" : "Trocar Senha"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Entre com as credenciais fornecidas para acessar o painel"
              : "Informe usuário, senha atual e nova senha para atualizar suas credenciais"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === "login" ? renderLoginForm() : renderChangePasswordForm()}

          <div className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => {
                  setMode("change")
                  setErrorMessage(null)
                }}
              >
                Trocar senha
              </button>
            ) : (
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => {
                  setMode("login")
                  setErrorMessage(null)
                  setChangeFeedback(null)
                }}
              >
                Voltar ao login
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


