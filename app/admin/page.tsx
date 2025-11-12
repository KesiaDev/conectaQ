"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, RefreshCw, Edit, Trash2, FileText, FileSpreadsheet } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession, signOut } from "next-auth/react"

interface Person {
  id: string
  nome_completo: string
  telefone: string
  email: string | null
  data_nascimento: string | null
  ja_batizado: string | null
  denominacao: string | null
  created_at: string
  canal_origem: string | null
  visits: Array<{
    id: string
    data_visita: string
    culto_id: string | null
    status: string
  }>
}

type EditForm = {
  id: string
  nome_completo: string
  telefone: string
  email: string | null
  ja_batizado: "sim" | "nao" | "nao_informado"
  denominacao: string | null
  canal_origem: string | null
  data_visita: string
  status: "novo" | "em_acompanhamento" | "integrado"
  data_nascimento: string | null
}

const statusOptions: Array<{ value: EditForm["status"]; label: string }> = [
  { value: "novo", label: "Novo" },
  { value: "em_acompanhamento", label: "Em acompanhamento" },
  { value: "integrado", label: "Integrado" },
]

type ExportRow = {
  "Nome Completo": string
  Telefone: string
  Batizado: string
  Denominação: string
  "Data Cadastro": string
  "Última Visita": string
  Status: string
}

export default function AdminPage() {
  const { status } = useSession()

  const [people, setPeople] = useState<Person[]>([])
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [batismoFilter, setBatismoFilter] = useState<string>("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const headers = useMemo(
    () => [
      "Nome Completo",
      "Telefone",
      "Batizado",
      "Denominação",
      "Data Cadastro",
      "Última Visita",
      "Status",
    ],
    [],
  )

  const formatDate = (value?: string | null) => {
    if (!value) return "-"
    return new Date(value).toLocaleDateString("pt-BR")
  }

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
    let filtered = people

    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((person) => {
        return (
          person.nome_completo.toLowerCase().includes(searchLower) ||
          person.telefone.includes(searchTerm) ||
          (person.email && person.email.toLowerCase().includes(searchLower))
        )
      })
    }

    if (batismoFilter !== "todos") {
      filtered = filtered.filter((person) => {
        if (batismoFilter === "sim") {
          return person.ja_batizado === "sim"
        } else if (batismoFilter === "nao") {
          return person.ja_batizado === "nao" || !person.ja_batizado
        }
        return true
      })
    }

    setFilteredPeople(filtered)
  }, [searchTerm, batismoFilter, people])

  const extractLastVisit = (person: Person) => person.visits?.[0]

  const openEditModal = (person: Person) => {
    const lastVisit = extractLastVisit(person)
    setEditForm({
      id: person.id,
      nome_completo: person.nome_completo,
      telefone: person.telefone,
      email: person.email,
      ja_batizado:
        person.ja_batizado === "sim"
          ? "sim"
          : person.ja_batizado === "nao"
          ? "nao"
          : "nao_informado",
      denominacao: person.denominacao,
      canal_origem: person.canal_origem,
      data_visita: lastVisit?.data_visita ? lastVisit.data_visita.slice(0, 10) : "",
      status: (lastVisit?.status as EditForm["status"]) || "novo",
      data_nascimento: person.data_nascimento ? person.data_nascimento.slice(0, 10) : null,
    })
    setIsEditOpen(true)
  }

  const closeEditModal = () => {
    setIsEditOpen(false)
    setEditForm(null)
  }

  const handleEditChange = <K extends keyof EditForm>(field: K, value: EditForm[K]) => {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSaveEdit = async () => {
    if (!editForm) return
    setIsSaving(true)
    try {
      const payload = {
        nome_completo: editForm.nome_completo,
        telefone: editForm.telefone,
        email: editForm.email,
        ja_batizado: editForm.ja_batizado === "nao_informado" ? null : editForm.ja_batizado,
        denominacao: editForm.denominacao,
        canal_origem: editForm.canal_origem,
        data_nascimento: editForm.data_nascimento,
        visit: {
          status: editForm.status,
          data_visita: editForm.data_visita || null,
        },
      }

      const response = await fetch(`/api/admin/people/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.message || "Erro ao atualizar cadastro")
      }

      const updated: Person = await response.json()

      setPeople((prev) => prev.map((person) => (person.id === updated.id ? updated : person)))
      closeEditModal()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Erro ao atualizar cadastro")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (person: Person) => {
    const confirmed = window.confirm(`Deseja remover o cadastro de ${person.nome_completo}?`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/people/${person.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.message || "Erro ao remover cadastro")
      }

      setPeople((prev) => prev.filter((item) => item.id !== person.id))
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Erro ao remover cadastro")
    }
  }

  const exportRows = useMemo<ExportRow[]>(() => {
    return filteredPeople.map((person) => {
      const lastVisit = extractLastVisit(person)
      const isBatizado = person.ja_batizado === "sim"
      return {
        "Nome Completo": person.nome_completo,
        Telefone: person.telefone,
        Batizado: isBatizado ? "Sim" : person.ja_batizado === "nao" ? "Não" : "Não informado",
        Denominação: person.denominacao || "",
        "Data Cadastro": formatDate(person.created_at),
        "Última Visita": lastVisit ? formatDate(lastVisit.data_visita) : "",
        Status: lastVisit?.status || "novo",
      }
    })
  }, [filteredPeople])

  const exportToExcel = async () => {
    if (exportRows.length === 0) {
      alert("Não há cadastros para exportar")
      return
    }

    const XLSX = await import("xlsx")
    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cadastros")
    XLSX.writeFile(workbook, `cadastros_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const exportToPDF = async () => {
    if (exportRows.length === 0) {
      alert("Não há cadastros para exportar")
      return
    }

    const { jsPDF } = await import("jspdf")
    const autoTable = (await import("jspdf-autotable")).default

    const doc = new jsPDF()
    autoTable(doc, {
      head: [headers],
      body: exportRows.map((row) => headers.map((header) => row[header as keyof ExportRow] || "")),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [24, 119, 242], textColor: 255 },
    })
    doc.save(`cadastros_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  if (status === "loading") {
    return (
      <div className="bg-gradient-to-br from-background via-secondary/5 to-accent/10 min-h-screen flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Verificando acesso...</span>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-background via-secondary/5 to-accent/10 p-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-lg border-2">
          <CardHeader>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:text-left">
                <Image
                  src="/images/logos/Logo_Claro_ConectaQ.svg"
                  alt="ConectaQ"
                  width={160}
                  height={62}
                  className="w-32 h-auto md:w-44"
                />
                <div>
                  <CardTitle className="text-2xl font-semibold text-primary md:text-3xl">
                    Painel Administrativo
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Gerencie os cadastros de visitantes
                  </CardDescription>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  variant="ghost"
                  size="sm"
                  className="justify-center"
                >
                  Sair
                </Button>
                <Button
                  onClick={fetchPeople}
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                  size="sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
                <Button onClick={exportToExcel} variant="outline" className="border-primary/60" size="sm">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button onClick={exportToPDF} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-[minmax(200px,1fr)_220px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Buscar por nome, telefone ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-primary/20 focus:border-primary"
                  />
                </div>
                <Select value={batismoFilter} onValueChange={setBatismoFilter}>
                  <SelectTrigger className="border-primary/20 focus:border-primary w-full">
                    <SelectValue placeholder="Filtrar por batismo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="sim">Batizados</SelectItem>
                    <SelectItem value="nao">Não Batizados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <>
                <div className="space-y-4 md:hidden">
                  {filteredPeople.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-sm text-muted-foreground">
                      Nenhum cadastro encontrado
                    </div>
                  ) : (
                    filteredPeople.map((person) => {
                      const lastVisit = extractLastVisit(person)
                      const isBatizado = person.ja_batizado === "sim"
                      return (
                        <div key={person.id} className="rounded-lg border bg-background/70 p-4 shadow-sm space-y-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-base font-semibold text-foreground">{person.nome_completo}</span>
                            <span className="text-sm text-muted-foreground">{person.telefone}</span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                            <div>
                              <p className="font-medium text-foreground/80">Batizado</p>
                              <span
                                className={`mt-1 inline-flex rounded px-2 py-1 text-xs font-medium ${
                                  isBatizado
                                    ? "bg-green-100 text-green-800"
                                    : person.ja_batizado === "nao"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {isBatizado ? "Sim" : person.ja_batizado === "nao" ? "Não" : "-"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground/80">Denominação</p>
                              <span className="mt-1 block">{person.denominacao || "-"}</span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground/80">Cadastro</p>
                              <span className="mt-1 block">{formatDate(person.created_at)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground/80">Última visita</p>
                              <span className="mt-1 block">{formatDate(lastVisit?.data_visita ?? null)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${
                                lastVisit?.status === "integrado"
                                  ? "bg-accent/20 text-primary"
                                  : lastVisit?.status === "em_acompanhamento"
                                  ? "bg-secondary/30 text-secondary-foreground"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {lastVisit?.status || "novo"}
                            </span>
                            <div className="flex gap-2">
                              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEditModal(person)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(person)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Nome</th>
                        <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Telefone</th>
                        <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Batizado</th>
                        <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Denominação</th>
                        <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Data Cadastro</th>
                        <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Última Visita</th>
                        <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-semibold text-muted-foreground">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPeople.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center p-8 text-muted-foreground">
                            Nenhum cadastro encontrado
                          </td>
                        </tr>
                      ) : (
                        filteredPeople.map((person) => {
                          const lastVisit = extractLastVisit(person)
                          const isBatizado = person.ja_batizado === "sim"
                          return (
                            <tr key={person.id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-3">{person.nome_completo}</td>
                              <td className="p-3">{person.telefone}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    isBatizado
                                      ? "bg-green-100 text-green-800"
                                      : person.ja_batizado === "nao"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {isBatizado ? "Sim" : person.ja_batizado === "nao" ? "Não" : "-"}
                                </span>
                              </td>
                              <td className="p-3 text-sm">{person.denominacao || "-"}</td>
                              <td className="p-3">{formatDate(person.created_at)}</td>
                              <td className="p-3">{lastVisit ? formatDate(lastVisit.data_visita) : "-"}</td>
                              <td className="p-3">
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
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Button size="icon" variant="outline" onClick={() => openEditModal(person)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="destructive" onClick={() => handleDelete(person)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="mt-6 text-sm text-muted-foreground">
              Total: {filteredPeople.length} cadastro(s)
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Editar cadastro</h2>
              <Button variant="ghost" size="sm" onClick={closeEditModal}>
                Cancelar
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-foreground/80" htmlFor="edit_nome">
                    Nome Completo
                  </label>
                  <Input
                    id="edit_nome"
                    value={editForm.nome_completo}
                    onChange={(event) => handleEditChange("nome_completo", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80" htmlFor="edit_telefone">
                    Telefone
                  </label>
                  <Input
                    id="edit_telefone"
                    value={editForm.telefone}
                    onChange={(event) => handleEditChange("telefone", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80" htmlFor="edit_email">
                    Email
                  </label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editForm.email ?? ""}
                    onChange={(event) => handleEditChange("email", event.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Batizado</label>
                  <Select value={editForm.ja_batizado} onValueChange={(value) => handleEditChange("ja_batizado", value as EditForm["ja_batizado"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nao_informado">Não informado</SelectItem>
                      <SelectItem value="sim">Sim</SelectItem>
                      <SelectItem value="nao">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80" htmlFor="edit_denom">
                    Denominação
                  </label>
                  <Input
                    id="edit_denom"
                    value={editForm.denominacao ?? ""}
                    onChange={(event) => handleEditChange("denominacao", event.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80" htmlFor="edit_canal">
                    Canal de origem
                  </label>
                  <Input
                    id="edit_canal"
                    value={editForm.canal_origem ?? ""}
                    onChange={(event) => handleEditChange("canal_origem", event.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80" htmlFor="edit_data_nascimento">
                    Data de nascimento
                  </label>
                  <Input
                    id="edit_data_nascimento"
                    type="date"
                    value={editForm.data_nascimento ?? ""}
                    onChange={(event) => handleEditChange("data_nascimento", event.target.value || null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80" htmlFor="edit_data_visita">
                    Data da última visita
                  </label>
                  <Input
                    id="edit_data_visita"
                    type="date"
                    value={editForm.data_visita}
                    onChange={(event) => handleEditChange("data_visita", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Status</label>
                  <Select value={editForm.status} onValueChange={(value) => handleEditChange("status", value as EditForm["status"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={closeEditModal} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

