import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { id } = await params;

    const attachment = await prisma.reportAttachment.findUnique({
      where: { id },
      include: {
        report: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!attachment) {
      return new NextResponse("Anexo não encontrado", { status: 404 });
    }

    const isStudentOwner =
      session.user.role === "STUDENT" &&
      attachment.report.project.studentId === session.user.id;

    const isTeacher =
      session.user.role === "TEACHER" &&
      attachment.report.project.teacherId === session.user.id;

    const isCoordinator = session.user.role === "COORDINATOR";

    if (!isStudentOwner && !isTeacher && !isCoordinator) {
      return new NextResponse("Acesso negado a este anexo", { status: 403 });
    }

    // Retornar o ficheiro com os cabeçalhos apropriados
    return new NextResponse(attachment.fileData, {
      status: 200,
      headers: {
        "Content-Type": attachment.fileType || "application/octet-stream",
        "Content-Length": attachment.fileSize.toString(),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          attachment.fileName
        )}`,
      },
    });
  } catch (error) {
    console.error("Erro ao descarregar anexo:", error);
    return new NextResponse("Erro interno ao processar o anexo", {
      status: 500,
    });
  }
}
