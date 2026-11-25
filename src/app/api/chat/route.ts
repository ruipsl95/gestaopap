import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateStudentChatReply } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json(
        { error: "A mensagem não pode estar vazia." },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: { studentId: session.user.id },
      include: {
        student: { select: { name: true } },
        teacher: { select: { name: true, aiGuidelines: true } },
        reports: {
          orderBy: { periodStart: "desc" },
          take: 1,
          select: {
            completionPercentage: true,
            completedTasks: true,
            difficulties: true,
            nextTasks: true,
          },
        },
        chatMessages: {
          orderBy: { createdAt: "asc" },
          take: 20,
          select: {
            role: true,
            content: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Ainda não tens um projeto atribuído." },
        { status: 404 }
      );
    }

    // Guardar a mensagem do aluno
    const userMsg = await prisma.chatMessage.create({
      data: {
        role: "user",
        content: message,
        projectId: project.id,
      },
    });

    // Gerar resposta via ChatGPT (OpenAI) com as diretrizes do orientador
    const { reply, provider } = await generateStudentChatReply({
      studentName: project.student.name,
      teacherName: project.teacher.name,
      projectTitle: project.title,
      projectDescription: project.description,
      teacherGuidelines: project.teacher.aiGuidelines,
      projectRoadmap: project.aiRoadmap,
      latestReport: project.reports[0] ?? null,
      history: project.chatMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      userMessage: message,
    });

    // Guardar resposta do assistente
    const assistantMsg = await prisma.chatMessage.create({
      data: {
        role: "assistant",
        content: reply,
        projectId: project.id,
      },
    });

    return NextResponse.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      provider,
    });
  } catch (error) {
    console.error("Erro no chatbot:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao processar a tua mensagem." },
      { status: 500 }
    );
  }
}
