import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
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
        if (!credentials) return null

        const adminUsername = process.env.ADMIN_USERNAME
        const adminPassword = process.env.ADMIN_PASSWORD

        if (!adminUsername || !adminPassword) {
          console.error("ADMIN_USERNAME ou ADMIN_PASSWORD não configurados")
          return null
        }

        if (
          credentials.username === adminUsername &&
          credentials.password === adminPassword
        ) {
          return {
            id: "pastor-dennis",
            name: "Pastor Dennis",
            username: adminUsername,
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
})

export { handler as GET, handler as POST }


