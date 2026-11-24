import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "coordenador@escola.pt";
  const password = searchParams.get("password") || "password123";

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.trim().toLowerCase(),
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found in database",
        emailSearched: email,
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    return NextResponse.json({
      success: true,
      userFound: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      passwordMatches,
      envCheck: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        authUrl: process.env.AUTH_URL || "(not set - auto detected)",
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
