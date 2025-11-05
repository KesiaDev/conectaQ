"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Download, RefreshCw } from "lucide-react"
import Image from "next/image"

interface Person {
  id: string
  nome_completo: string
  telefone: string
  email: string | null
  data_nascimento: string | null
  created_at: string
  canal_origem: string | null
  visits: Array<{
    data_visita: string
    culto_id: string | null
    status: string
  }>
}

export default function AdminPage() {
  const [people, setPeople] = useState<Person[]>([])
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const fetchPeople = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/people")
      if (response.ok) {
        const data = await response.json()
        setPeople(data)
        setFilteredPeople(data)
      }
    } catch (error) {
      console.error("Error fetching people:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPeople()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPeople(people)
      return
    }

    const filtered = people.filter((person) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        person.nome_completo.toLowerCase().includes(searchLower) ||
        person.telefone.includes(searchTerm) ||
        (person.email && person.email.toLowerCase().includes(searchLower))
      )
    })
    setFilteredPeople(filtered)
  }, [searchTerm, people])

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Nome Completo",
      "Telefone",
      "Email",
      "Data Nascimento",
      "Data Cadastro",
      "Canal Origem",
      "Última Visita",
      "Status",
    ]

    const rows = filteredPeople.map((person) => {
      const lastVisit = person.visits?.[0]
      return [
        person.id,
        person.nome_completo,
        person.telefone,
        person.email || "",
        person.data_nascimento || "",
        new Date(person.created_at).toLocaleDateString("pt-BR"),
        person.canal_origem || "",
        lastVisit ? new Date(lastVisit.data_visita).toLocaleDateString("pt-BR") : "",
        lastVisit?.status || "",
      ]
    })

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `cadastros_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-lg border-2">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src="/images/logos/Logo_Claro_ConectaQ.svg"
                  alt="ConectaQ"
                  width={180}
                  height={70}
                  className="w-auto h-auto"
                />
                <div>
                  <CardTitle className="text-3xl text-primary">Painel Administrativo</CardTitle>
                  <CardDescription>
                    Gerencie os cadastros de visitantes
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchPeople} variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
                <Button onClick={exportToCSV} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Buscar por nome, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Telefone</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Data Cadastro</th>
                      <th className="text-left p-2">Última Visita</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPeople.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-muted-foreground">
                          Nenhum cadastro encontrado
                        </td>
                      </tr>
                    ) : (
                      filteredPeople.map((person) => {
                        const lastVisit = person.visits?.[0]
                        return (
                          <tr key={person.id} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="p-2">{person.nome_completo}</td>
                            <td className="p-2">{person.telefone}</td>
                            <td className="p-2">{person.email || "-"}</td>
                            <td className="p-2">
                              {new Date(person.created_at).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="p-2">
                              {lastVisit
                                ? new Date(lastVisit.data_visita).toLocaleDateString("pt-BR")
                                : "-"}
                            </td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  lastVisit?.status === "integrado"
                                    ? "bg-accent/20 text-primary"
                                    : lastVisit?.status === "em_acompanhamento"
                                    ? "bg-secondary/30 text-secondary-foreground"
                                    : "bg-primary/10 text-primary"
                                }`}
                              >
                                {lastVisit?.status || "novo"}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground">
              Total: {filteredPeople.length} cadastro(s)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

