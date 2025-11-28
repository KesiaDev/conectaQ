import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const revalidate = 0

const ITEMS_PER_PAGE = 50

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const batismoFilter = searchParams.get("batismo") || "todos"
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam) : ITEMS_PER_PAGE

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (search.trim()) {
      where.OR = [
        { nome_completo: { contains: search, mode: "insensitive" } },
        { telefone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (batismoFilter !== "todos") {
      if (batismoFilter === "sim") {
        where.ja_batizado = "sim"
      } else if (batismoFilter === "nao") {
        where.AND = [
          {
            OR: [
              { ja_batizado: "nao" },
              { ja_batizado: null },
            ],
          },
        ]
        if (where.OR) {
          where.AND.push({ OR: where.OR })
          delete where.OR
        }
      }
    }

    // Filtro de data por createdAt
    if (startDateParam || endDateParam) {
      const dateFilter: any = {}
      
      if (startDateParam) {
        const startDate = new Date(startDateParam)
        // Garantir que está no início do dia (00:00:00)
        startDate.setUTCHours(0, 0, 0, 0)
        dateFilter.gte = startDate
      }
      
      if (endDateParam) {
        const endDate = new Date(endDateParam)
        // Garantir que está no final do dia (23:59:59.999)
        endDate.setUTCHours(23, 59, 59, 999)
        dateFilter.lte = endDate
      }
      
      if (Object.keys(dateFilter).length > 0) {
        where.created_at = dateFilter
      }
    }

    // Buscar total para paginação
    const total = await prisma.people.count({ where })

    // Buscar pessoas com paginação
    const people = await prisma.people.findMany({
      where,
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
      skip,
      take: limit,
    })

    return NextResponse.json(
      {
        data: people,
        pagination: {
          page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    )
  } catch (error: any) {
    console.error("Error fetching people:", error)
    return NextResponse.json(
      { message: error.message || "Erro ao buscar cadastros" },
      { status: 500 }
    )
  }
}


