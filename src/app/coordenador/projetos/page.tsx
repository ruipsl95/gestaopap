import { prisma } from "@/lib/db";
import { ProjectManagement } from "@/components/coordinator/project-management";

export default async function ProjectsPage() {
  const [projects, students, teachers] = await Promise.all([
    prisma.project.findMany({
      include: {
        student: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } },
        reports: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: {
        role: "STUDENT",
        project: null,
      },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { role: "TEACHER" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de Projetos</h1>
        <p className="text-slate-400 mt-1">Atribuir projetos e orientadores</p>
      </div>
      <ProjectManagement
        projects={JSON.parse(JSON.stringify(projects))}
        availableStudents={students}
        teachers={teachers}
      />
    </div>
  );
}
