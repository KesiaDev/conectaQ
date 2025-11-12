import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateSchema = z.object({
  nome_completo: z.string().min(3).optional(),
  telefone: z.string().min(8).optional(),
  email: z.string().email().nullable().optional(),
  ja_batizado: z.enum(["sim", "nao"]).nullable().optional(),
  denominacao: z.string().nullable().optional(),
  canal_origem: z.string().nullable().optional(),
  data_nascimento: z.string().nullable().optional(),
  visit: z
    .object({
      status: z.enum(["novo", "em_acompanhamento", "integrado"]).optional(),
      data_visita: z.string().nullable().optional(),
    })
    .optional(),
})

type RouteParams = {
  params: {
    id: string
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json()
    const data = updateSchema.parse(body)

    const personId = params.id

    const dataNascimento = data.data_nascimento ? new Date(data.data_nascimento) : undefined
    const dataVisita = data.visit?.data_visita ? new Date(data.visit.data_visita) : undefined

    const updated = await prisma.$transaction(async (tx) => {
      await tx.people.update({
        where: { id: personId },
        data: {
          nome_completo: data.nome_completo,
          telefone: data.telefone,
          email: data.email ?? undefined,
          ja_batizado: data.ja_batizado ?? undefined,
          denominacao: data.denominacao ?? undefined,
          canal_origem: data.canal_origem ?? undefined,
          data_nascimento: dataNascimento,
        },
      })

      if (data.visit) {
        const lastVisit = await tx.visit.findFirst({
          where: { person_id: personId },
          orderBy: { data_visita: "desc" },
        })

        if (lastVisit) {
          await tx.visit.update({
            where: { id: lastVisit.id },
            data: {
              status: data.visit.status,
              data_visita: dataVisita ?? lastVisit.data_visita,
            },
          })
        } else {
          await tx.visit.create({
            data: {
              person_id: personId,
              status: data.visit.status ?? "novo",
              data_visita: dataVisita ?? new Date(),
            },
          })
        }
      }

      return tx.people.findUnique({
        where: { id: personId },
        include: {
          visits: {
            orderBy: { data_visita: "desc" },
            take: 1,
          },
        },
      })
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Error updating person:", error)
    const message = error instanceof z.ZodError ? "Dados inválidos" : "Erro ao atualizar cadastro"
    const status = error instanceof z.ZodError ? 400 : 500
    return NextResponse.json({ message }, { status })
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await prisma.people.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting person:", error)
    return NextResponse.json({ message: "Erro ao remover cadastro" }, { status: 500 })
  }
}
