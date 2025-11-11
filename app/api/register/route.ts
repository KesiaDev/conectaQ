import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { registrationSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registrationSchema.parse(body)

    // Parse dates
    const dataNascimento = validatedData.data_nascimento
      ? new Date(validatedData.data_nascimento)
      : null
    const dataVisita = new Date(validatedData.data_visita)

    // Create person
    const person = await prisma.people.create({
      data: {
        nome_completo: validatedData.nome_completo,
        data_nascimento: dataNascimento,
        telefone: validatedData.telefone,
        ja_batizado: validatedData.ja_batizado,
        denominacao: validatedData.denominacao || null,
        consent_lgpd_at: validatedData.consent_lgpd ? new Date() : null,
        canal_origem: validatedData.culto_dia || "QR",
      },
    })

    // Create visit
    await prisma.visit.create({
      data: {
        person_id: person.id,
        data_visita: dataVisita,
        culto_id: validatedData.culto_dia || null,
        status: "novo",
      },
    })

    // Track event
    await prisma.event.create({
      data: {
        person_id: person.id,
        tipo: "cadastro_completo",
        payload: JSON.stringify({
          ja_batizado: validatedData.ja_batizado,
          denominacao: validatedData.denominacao,
        }),
      },
    })

    return NextResponse.json({ id: person.id, success: true }, { status: 201 })
  } catch (error: any) {
    console.error("Registration error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Dados inválidos", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: error.message || "Erro ao processar cadastro" },
      { status: 500 }
    )
  }
}

