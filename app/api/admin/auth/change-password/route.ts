import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, currentPassword, newPassword } = body ?? {}

    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "A nova senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const user = await prisma.adminUser.findUnique({ where: { username } })

    if (!user) {
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 })
    }

    const matches = await bcrypt.compare(currentPassword, user.password_hash)
    if (!matches) {
      return NextResponse.json({ message: "Senha atual incorreta" }, { status: 401 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { password_hash: passwordHash },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("change-password error", error)
    return NextResponse.json({ message: "Erro ao atualizar senha" }, { status: 500 })
  }
}
