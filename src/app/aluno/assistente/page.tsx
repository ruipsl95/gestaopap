import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { StudentChatbot } from "@/components/student/student-chatbot";

export default async function StudentAssistantPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { studentId: session.user.id },
    include: {
      student: { select: { name: true } },
      teacher: { select: { name: true, aiGuidelines: true } },
      chatMessages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
        },
      },
    },
  });

  if (!project) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">
          Ainda não tens um projeto atribuído. Contacta o coordenador para poderes usar o Assistente IA.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StudentChatbot
        studentName={project.student.name}
        teacherName={project.teacher.name}
        projectTitle={project.title}
        hasTeacherGuidelines={Boolean(project.teacher.aiGuidelines?.trim())}
        hasProjectRoadmap={Boolean(project.aiRoadmap?.trim())}
        initialMessages={project.chatMessages.map((m) => ({
          id: m.id,
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }))}
      />
    </div>
  );
}
