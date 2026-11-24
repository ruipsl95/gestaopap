"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

// ========================================
// COORDINATOR ACTIONS
// ========================================

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "COORDINATOR") {
    throw new Error("Unauthorized");
  }

  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  revalidatePath("/coordenador");
}

export async function updateUser(id: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "COORDINATOR") {
    throw new Error("Unauthorized");
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = formData.get("role") as Role;
  const password = formData.get("password") as string;

  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (role) data.role = role;
  if (password && password.trim().length > 0) {
    data.password = await bcrypt.hash(password.trim(), 10);
  }

  await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath("/coordenador/utilizadores");
  revalidatePath("/coordenador");
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "COORDINATOR") {
    throw new Error("Unauthorized");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/coordenador");
}

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "COORDINATOR") {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const studentId = formData.get("studentId") as string;
  const teacherId = formData.get("teacherId") as string;

  await prisma.project.create({
    data: {
      title,
      description,
      studentId,
      teacherId,
    },
  });

  revalidatePath("/coordenador");
}

export async function updateProject(id: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "COORDINATOR") {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const teacherId = formData.get("teacherId") as string;

  await prisma.project.update({
    where: { id },
    data: { title, description, teacherId },
  });

  revalidatePath("/coordenador");
}

export async function deleteProject(id: string) {
  const session = await auth();
  if (!session || session.user.role !== "COORDINATOR") {
    throw new Error("Unauthorized");
  }

  await prisma.project.delete({ where: { id } });
  revalidatePath("/coordenador");
}

// ========================================
// STUDENT ACTIONS
// ========================================

export async function submitBiweeklyReport(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const project = await prisma.project.findFirst({
    where: { studentId: session.user.id },
  });

  if (!project) throw new Error("No project found");

  const completedTasks = formData.get("completedTasks") as string;
  const completionPercentage = parseInt(
    formData.get("completionPercentage") as string
  );
  const difficulties = formData.get("difficulties") as string;
  const nextTasks = formData.get("nextTasks") as string;
  const rawReportDate = formData.get("reportDate") as string;
  const reportDate = rawReportDate ? new Date(rawReportDate) : new Date();

  // Calculate current period
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  let periodStart: Date;
  let periodEnd: Date;

  if (day < 16) {
    periodStart = new Date(year, month, 1);
    periodEnd = new Date(year, month, 15, 23, 59, 59);
  } else {
    periodStart = new Date(year, month, 16);
    periodEnd = new Date(year, month + 1, 0, 23, 59, 59);
  }

  await prisma.biweeklyReport.upsert({
    where: {
      projectId_periodStart: {
        projectId: project.id,
        periodStart,
      },
    },
    update: {
      completedTasks,
      completionPercentage,
      difficulties,
      nextTasks,
      reportDate,
    },
    create: {
      completedTasks,
      completionPercentage,
      difficulties,
      nextTasks,
      reportDate,
      periodStart,
      periodEnd,
      projectId: project.id,
    },
  });

  revalidatePath("/aluno");
  revalidatePath("/aluno/relatorio");
  revalidatePath("/aluno/historico");
  revalidatePath("/orientador");
}

export async function updateOrientationSchedule(
  projectId: string,
  orientationDateStr: string | null,
  orientationPlace?: string
) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "TEACHER" && session.user.role !== "COORDINATOR")
  ) {
    throw new Error("Unauthorized");
  }

  if (session.user.role === "TEACHER") {
    const project = await prisma.project.findFirst({
      where: { id: projectId, teacherId: session.user.id },
    });
    if (!project) throw new Error("Projeto não encontrado ou não atribuído a si");
  }

  const orientationDate = orientationDateStr
    ? new Date(orientationDateStr)
    : null;

  await prisma.project.update({
    where: { id: projectId },
    data: {
      orientationDate,
      orientationPlace: orientationPlace?.trim() || null,
    },
  });

  revalidatePath("/orientador");
  revalidatePath("/coordenador/projetos");
  revalidatePath("/aluno");
}

export async function createSupportRequest(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const project = await prisma.project.findFirst({
    where: { studentId: session.user.id },
    include: { teacher: true },
  });

  if (!project) throw new Error("No project found");

  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  await prisma.supportRequest.create({
    data: {
      subject,
      message,
      studentId: session.user.id,
      teacherId: project.teacherId,
    },
  });

  revalidatePath("/aluno");
}

// ========================================
// TEACHER ACTIONS
// ========================================

export async function updateSupportRequestStatus(
  id: string,
  status: "ABERTO" | "EM_ANALISE" | "RESOLVIDO",
  response?: string
) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    throw new Error("Unauthorized");
  }

  const data: Record<string, unknown> = { status };
  if (response !== undefined) {
    data.response = response;
  }

  await prisma.supportRequest.update({
    where: { id, teacherId: session.user.id },
    data,
  });

  revalidatePath("/orientador");
}
