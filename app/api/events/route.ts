import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { person_id, tipo, payload } = body

    if (!tipo) {
      return NextResponse.json(
        { message: "Tipo de evento é obrigatório" },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        person_id: person_id || null,
        tipo,
        payload: payload ? JSON.stringify(payload) : null,
      },
    })

    return NextResponse.json({ id: event.id, success: true }, { status: 201 })
  } catch (error: any) {
    console.error("Event tracking error:", error)
    return NextResponse.json(
      { message: error.message || "Erro ao registrar evento" },
      { status: 500 }
    )
  }
}

