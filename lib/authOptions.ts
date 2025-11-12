import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.adminUser.findUnique({
          where: { username: credentials.username },
        })

        if (!user) {
          const envUsername = process.env.ADMIN_USERNAME
          const envPassword = process.env.ADMIN_PASSWORD

          if (envUsername && envPassword && credentials.username === envUsername && credentials.password === envPassword) {
            const passwordHash = await bcrypt.hash(envPassword, 10)
            const created = await prisma.adminUser.create({
              data: {
                username: envUsername,
                password_hash: passwordHash,
              },
            })

            return {
              id: created.id,
              name: created.username,
              username: created.username,
            }
          }

          return null
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          name: user.username,
          username: user.username,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
}
