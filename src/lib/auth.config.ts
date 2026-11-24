import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "f6c8d7e9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Se já tiver sessão iniciada e for para a página de login, redireciona logo para o dashboard
      if (isLoggedIn && pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      const roleRoutes: Record<string, string> = {
        COORDINATOR: "/coordenador",
        TEACHER: "/orientador",
        STUDENT: "/aluno",
      };

      const isProtected =
        pathname.startsWith("/coordenador") ||
        pathname.startsWith("/orientador") ||
        pathname.startsWith("/aluno");

      if (isProtected) {
        if (!isLoggedIn) return false;

        const userRole = (auth?.user as { role?: string })?.role;
        const allowedPrefix = userRole ? roleRoutes[userRole] : null;

        if (!allowedPrefix || !pathname.startsWith(allowedPrefix)) {
          // Redirect to the correct role dashboard
          return Response.redirect(new URL(allowedPrefix || "/login", nextUrl));
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts with Credentials
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 365 dias (1 ano) - guarda a sessão permanentemente
    updateAge: 24 * 60 * 60, // atualiza e prolonga a validade a cada 24 horas de uso
  },
  jwt: {
    maxAge: 365 * 24 * 60 * 60, // 365 dias
  },
};
