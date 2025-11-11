import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const people = await prisma.people.findMany({
      include: {
        visits: {
          orderBy: {
            data_visita: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json(people)
  } catch (error: any) {
    console.error("Error fetching people:", error)
    return NextResponse.json(
      { message: error.message || "Erro ao buscar cadastros" },
      { status: 500 }
    )
  }
}


