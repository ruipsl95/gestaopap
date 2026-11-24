import { PrismaClient, Role, SupportRequestStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.supportRequest.deleteMany();
  await prisma.biweeklyReport.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create Coordinator
  const coordinator = await prisma.user.create({
    data: {
      name: "Ana Silva",
      email: "coordenador@escola.pt",
      password: hashedPassword,
      role: Role.COORDINATOR,
    },
  });
  console.log(`✅ Coordenador criado: ${coordinator.email}`);

  // Create Teachers
  const teacher1 = await prisma.user.create({
    data: {
      name: "Prof. Carlos Santos",
      email: "professor1@escola.pt",
      password: hashedPassword,
      role: Role.TEACHER,
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      name: "Prof. Maria Oliveira",
      email: "professor2@escola.pt",
      password: hashedPassword,
      role: Role.TEACHER,
    },
  });
  console.log(`✅ 2 Professores criados`);

  // Create Students
  const student1 = await prisma.user.create({
    data: {
      name: "João Ferreira",
      email: "aluno1@escola.pt",
      password: hashedPassword,
      role: Role.STUDENT,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Mariana Costa",
      email: "aluno2@escola.pt",
      password: hashedPassword,
      role: Role.STUDENT,
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Pedro Rodrigues",
      email: "aluno3@escola.pt",
      password: hashedPassword,
      role: Role.STUDENT,
    },
  });

  const student4 = await prisma.user.create({
    data: {
      name: "Sofia Martins",
      email: "aluno4@escola.pt",
      password: hashedPassword,
      role: Role.STUDENT,
    },
  });
  console.log(`✅ 4 Alunos criados`);

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      title: "App de Gestão de Inventário com React Native",
      description:
        "Desenvolvimento de uma aplicação mobile para gestão de inventário de uma pequena empresa.",
      studentId: student1.id,
      teacherId: teacher1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: "Website de E-commerce com Next.js",
      description:
        "Criação de uma plataforma de comércio eletrónico para uma loja de artesanato local.",
      studentId: student2.id,
      teacherId: teacher1.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      title: "Sistema de Domótica com Arduino e IoT",
      description:
        "Implementação de um sistema de automação residencial com sensores e atuadores controlados via app.",
      studentId: student3.id,
      teacherId: teacher2.id,
    },
  });

  const project4 = await prisma.project.create({
    data: {
      title: "Plataforma de Ensino Online com Gamificação",
      description:
        "Desenvolvimento de uma plataforma web educativa com elementos de gamificação para alunos do ensino básico.",
      studentId: student4.id,
      teacherId: teacher2.id,
    },
  });
  console.log(`✅ 4 Projetos criados`);

  // Create some biweekly reports
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  await prisma.biweeklyReport.createMany({
    data: [
      {
        completedTasks:
          "Desenhei os wireframes da aplicação e defini a arquitetura do projeto. Configurei o ambiente de desenvolvimento com React Native e Expo.",
        completionPercentage: 15,
        difficulties:
          "Tive dificuldades na configuração do ambiente. Resolvi seguindo tutoriais oficiais do Expo.",
        nextTasks:
          "Implementar o ecrã de login e o sistema de autenticação. Começar a base de dados com Firebase.",
        periodStart: fourWeeksAgo,
        periodEnd: new Date(fourWeeksAgo.getTime() + 13 * 24 * 60 * 60 * 1000),
        projectId: project1.id,
      },
      {
        completedTasks:
          "Implementei o sistema de autenticação com Firebase Auth. Criei os ecrãs de login e registo. Iniciei o design da base de dados.",
        completionPercentage: 30,
        difficulties:
          "A integração do Firebase com React Native teve alguns bugs. Debugguei com a ajuda da documentação e Stack Overflow.",
        nextTasks:
          "Criar os ecrãs de listagem de produtos e formulário de adição. Implementar CRUD de inventário.",
        periodStart: twoWeeksAgo,
        periodEnd: new Date(twoWeeksAgo.getTime() + 13 * 24 * 60 * 60 * 1000),
        projectId: project1.id,
      },
      {
        completedTasks:
          "Pesquisei frameworks CSS e escolhi Tailwind. Criei o layout base do site. Configurei Next.js com App Router.",
        completionPercentage: 20,
        difficulties:
          "Dificuldade em entender Server Components vs Client Components. Li a documentação do Next.js.",
        nextTasks:
          "Implementar catálogo de produtos. Configurar Stripe para pagamentos.",
        periodStart: twoWeeksAgo,
        periodEnd: new Date(twoWeeksAgo.getTime() + 13 * 24 * 60 * 60 * 1000),
        projectId: project2.id,
      },
      {
        completedTasks:
          "Montei o circuito com Arduino Uno e sensores de temperatura/humidade. Testei a comunicação serial.",
        completionPercentage: 25,
        difficulties:
          "Os sensores DHT11 davam leituras inconsistentes. Substituí por DHT22 que são mais fiáveis.",
        nextTasks:
          "Programar o microcontrolador para enviar dados via WiFi. Criar o dashboard web.",
        periodStart: twoWeeksAgo,
        periodEnd: new Date(twoWeeksAgo.getTime() + 13 * 24 * 60 * 60 * 1000),
        projectId: project3.id,
      },
    ],
  });
  console.log(`✅ Relatórios quinzenais criados`);

  // Create support requests
  await prisma.supportRequest.createMany({
    data: [
      {
        subject: "Dúvida sobre integração com Firebase",
        message:
          "Professor, estou com dificuldades em integrar o Firebase Realtime Database com o React Native. Podemos marcar uma reunião para discutir a melhor abordagem?",
        status: SupportRequestStatus.RESOLVIDO,
        response:
          "Olá João! Podemos reunir amanhã às 14h na sala de informática. Entretanto, recomendo que vejas o tutorial oficial: https://firebase.google.com/docs/database/web/start. Abraço!",
        studentId: student1.id,
        teacherId: teacher1.id,
      },
      {
        subject: "Problema com deploy no Vercel",
        message:
          "Boa tarde, Professor. O meu projeto não está a fazer build corretamente no Vercel. Aparece um erro de tipo no TypeScript. Pode ajudar-me?",
        status: SupportRequestStatus.EM_ANALISE,
        studentId: student2.id,
        teacherId: teacher1.id,
      },
      {
        subject: "Necessito de componentes eletrónicos",
        message:
          "Professora, preciso de um módulo ESP32 e relés para a próxima fase do projeto. É possível requisitar da escola?",
        status: SupportRequestStatus.ABERTO,
        studentId: student3.id,
        teacherId: teacher2.id,
      },
    ],
  });
  console.log(`✅ Pedidos de suporte criados`);

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📧 Credenciais de acesso (password: password123):");
  console.log("   Coordenador: coordenador@escola.pt");
  console.log("   Professor 1: professor1@escola.pt");
  console.log("   Professor 2: professor2@escola.pt");
  console.log("   Aluno 1: aluno1@escola.pt");
  console.log("   Aluno 2: aluno2@escola.pt");
  console.log("   Aluno 3: aluno3@escola.pt");
  console.log("   Aluno 4: aluno4@escola.pt");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
