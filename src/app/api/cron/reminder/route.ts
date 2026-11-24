import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentPeriod } from "@/lib/utils";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { start, end } = getCurrentPeriod();

    // Get all projects with their reports for the current period
    const projects = await prisma.project.findMany({
      include: {
        student: { select: { id: true, name: true, email: true } },
        teacher: { select: { id: true, name: true, email: true } },
        reports: {
          where: {
            periodStart: {
              gte: start,
              lte: end,
            },
          },
        },
      },
    });

    // Find students who haven't submitted
    const pendingStudents = projects.filter((p) => p.reports.length === 0);

    // In production, you'd send emails here
    // For now, just log and return the data
    const reminders = pendingStudents.map((p) => ({
      student: p.student.name,
      studentEmail: p.student.email,
      teacher: p.teacher.name,
      teacherEmail: p.teacher.email,
      project: p.title,
    }));

    console.log(`📧 ${reminders.length} aluno(s) ainda não preencheram o relatório quinzenal.`);

    return NextResponse.json({
      message: `${reminders.length} reminders pending`,
      period: { start, end },
      pendingStudents: reminders,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
