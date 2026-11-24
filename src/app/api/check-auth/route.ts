import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "coordenador@escola.pt";
  const password = searchParams.get("password") || "password123";

  const vercelInfo = {
    projectName: process.env.VERCEL_PROJECT_NAME,
    environment: process.env.VERCEL_ENV,
    url: process.env.VERCEL_URL,
    branch: process.env.VERCEL_GIT_COMMIT_REF,
    targetEnv: process.env.VERCEL_TARGET_ENV,
    allEnvCount: Object.keys(process.env).length,
  };

  const availableKeys = Object.keys(process.env).filter(
    (k) =>
      k.includes("POSTGRES") ||
      k.includes("DATABASE") ||
      k.includes("AUTH") ||
      k.includes("VERCEL")
  );

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
        availableKeys,
        vercelInfo,
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
        availableKeys,
        vercelInfo,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        availableKeys,
        vercelInfo,
      },
      { status: 500 }
    );
  }
}
