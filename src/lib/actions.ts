"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { generateReportAiAnalysis } from "@/lib/ai";

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

  const report = await prisma.biweeklyReport.upsert({
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

  // Process attachments
  const files = formData.getAll("files");
  for (const item of files) {
    if (item && typeof item === "object" && "arrayBuffer" in item) {
      const file = item as File;
      if (file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await prisma.reportAttachment.create({
          data: {
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            fileSize: file.size,
            fileData: buffer,
            reportId: report.id,
          },
        });
      }
    }
  }

  revalidatePath("/aluno");
  revalidatePath("/aluno/relatorio");
  revalidatePath("/aluno/historico");
  revalidatePath("/orientador");
}

export async function deleteReportAttachment(attachmentId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const attachment = await prisma.reportAttachment.findUnique({
    where: { id: attachmentId },
    include: {
      report: {
        include: { project: true },
      },
    },
  });

  if (!attachment) throw new Error("Anexo não encontrado");

  const isStudentOwner =
    session.user.role === "STUDENT" &&
    attachment.report.project.studentId === session.user.id;
  const isTeacher =
    session.user.role === "TEACHER" &&
    attachment.report.project.teacherId === session.user.id;
  const isCoordinator = session.user.role === "COORDINATOR";

  if (!isStudentOwner && !isTeacher && !isCoordinator) {
    throw new Error("Sem permissão para apagar este anexo");
  }

  await prisma.reportAttachment.delete({
    where: { id: attachmentId },
  });

  revalidatePath("/aluno");
  revalidatePath("/aluno/relatorio");
  revalidatePath("/aluno/historico");
  revalidatePath("/orientador");
  return { success: true };
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

export async function generateReportAiCommentary(reportId: string) {
  const session = await auth();
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "COORDINATOR")) {
    throw new Error("Unauthorized");
  }

  const report = await prisma.biweeklyReport.findUnique({
    where: { id: reportId },
    include: {
      project: {
        include: {
          student: true,
          teacher: true,
        },
      },
    },
  });

  if (!report) {
    throw new Error("Relatório não encontrado");
  }

  // Se for professor, validar se é o orientador do projeto
  if (session.user.role === "TEACHER" && report.project.teacherId !== session.user.id) {
    throw new Error("Não tem permissão para aceder a este relatório");
  }

  const aiCommentary = await generateReportAiAnalysis({
    studentName: report.project.student.name,
    projectTitle: report.project.title,
    completionPercentage: report.completionPercentage,
    completedTasks: report.completedTasks,
    difficulties: report.difficulties,
    nextTasks: report.nextTasks,
    reportDate: report.reportDate,
  });

  const updated = await prisma.biweeklyReport.update({
    where: { id: reportId },
    data: { aiCommentary },
  });

  revalidatePath(`/orientador/aluno/${report.project.studentId}`);
  revalidatePath("/orientador");

  return { success: true, aiCommentary: updated.aiCommentary };
}

export async function saveTeacherReportFeedback(reportId: string, feedback: string) {
  const session = await auth();
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "COORDINATOR")) {
    throw new Error("Unauthorized");
  }

  const report = await prisma.biweeklyReport.findUnique({
    where: { id: reportId },
    include: { project: true },
  });

  if (!report) {
    throw new Error("Relatório não encontrado");
  }

  if (session.user.role === "TEACHER" && report.project.teacherId !== session.user.id) {
    throw new Error("Não tem permissão para editar este feedback");
  }

  await prisma.biweeklyReport.update({
    where: { id: reportId },
    data: { teacherFeedback: feedback.trim() },
  });

  revalidatePath(`/orientador/aluno/${report.project.studentId}`);
  revalidatePath("/orientador");
  revalidatePath("/aluno");
  revalidatePath("/aluno/historico");

  return { success: true };
}

export async function requestReportDeletion(reportId: string, reason?: string) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const report = await prisma.biweeklyReport.findUnique({
    where: { id: reportId },
    include: { project: true },
  });

  if (!report || report.project.studentId !== session.user.id) {
    throw new Error("Relatório não encontrado ou sem permissão");
  }

  await prisma.biweeklyReport.update({
    where: { id: reportId },
    data: {
      deletionRequested: true,
      deletionReason: reason?.trim() || null,
      deletionRequestedAt: new Date(),
    },
  });

  revalidatePath("/aluno");
  revalidatePath("/aluno/historico");
  revalidatePath("/aluno/relatorio");
  revalidatePath("/orientador");
  revalidatePath(`/orientador/aluno/${session.user.id}`);

  return { success: true };
}

export async function cancelReportDeletionRequest(reportId: string) {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const report = await prisma.biweeklyReport.findUnique({
    where: { id: reportId },
    include: { project: true },
  });

  if (!report || report.project.studentId !== session.user.id) {
    throw new Error("Relatório não encontrado ou sem permissão");
  }

  await prisma.biweeklyReport.update({
    where: { id: reportId },
    data: {
      deletionRequested: false,
      deletionReason: null,
      deletionRequestedAt: null,
    },
  });

  revalidatePath("/aluno");
  revalidatePath("/aluno/historico");
  revalidatePath("/aluno/relatorio");
  revalidatePath("/orientador");
  revalidatePath(`/orientador/aluno/${session.user.id}`);

  return { success: true };
}

export async function respondToReportDeletion(reportId: string, approve: boolean) {
  const session = await auth();
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "COORDINATOR")) {
    throw new Error("Unauthorized");
  }

  const report = await prisma.biweeklyReport.findUnique({
    where: { id: reportId },
    include: { project: true },
  });

  if (!report) {
    throw new Error("Relatório não encontrado");
  }

  if (session.user.role === "TEACHER" && report.project.teacherId !== session.user.id) {
    throw new Error("Sem permissão para gerir este relatório");
  }

  if (approve) {
    await prisma.biweeklyReport.delete({
      where: { id: reportId },
    });
  } else {
    await prisma.biweeklyReport.update({
      where: { id: reportId },
      data: {
        deletionRequested: false,
        deletionReason: null,
        deletionRequestedAt: null,
      },
    });
  }

  revalidatePath("/orientador");
  revalidatePath(`/orientador/aluno/${report.project.studentId}`);
  revalidatePath("/aluno");
  revalidatePath("/aluno/historico");
  revalidatePath("/aluno/relatorio");

  return { success: true, deleted: approve };
}

export async function updateTeacherAiGuidelines(guidelines: string) {
  const session = await auth();
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "COORDINATOR")) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { aiGuidelines: guidelines.trim() || null },
  });

  revalidatePath("/orientador");
  revalidatePath("/aluno/assistente");

  return { success: true };
}

export async function updateProjectAiRoadmap(projectId: string, roadmap: string) {
  const session = await auth();
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "COORDINATOR")) {
    throw new Error("Unauthorized");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Projeto não encontrado");
  }

  if (session.user.role === "TEACHER" && project.teacherId !== session.user.id) {
    throw new Error("Sem permissão para editar este projeto");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { aiRoadmap: roadmap.trim() || null },
  });

  revalidatePath(`/orientador/aluno/${project.studentId}`);
  revalidatePath("/orientador");
  revalidatePath("/aluno/assistente");

  return { success: true };
}

export async function clearStudentChatHistory() {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT") {
    throw new Error("Unauthorized");
  }

  const project = await prisma.project.findFirst({
    where: { studentId: session.user.id },
  });

  if (!project) {
    throw new Error("Projeto não encontrado");
  }

  await prisma.chatMessage.deleteMany({
    where: { projectId: project.id },
  });

  revalidatePath("/aluno/assistente");
  return { success: true };
}
