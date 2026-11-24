# 🎓 Gestão PAP

Plataforma Web responsiva e **PWA (Progressive Web App)** desenvolvida em **Next.js 15 (App Router)** com **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **PostgreSQL** e **NextAuth.js v5 (Auth.js)**, concebida para a gestão e acompanhamento das Provas de Aptidão Profissional (PAP) do 12.º ano.

---

## 🚀 Funcionalidades Principais

### 1. Perfis de Utilizador & RBAC (Role-Based Access Control)
- **Coordenador (`COORDINATOR`):**
  - Dashboard analítico com visão global dos projetos, percentagem média e alertas de atraso (<25%).
  - Gestão CRUD completa de contas de Alunos e Professores Orientadores.
  - Atribuição de projetos a Alunos e Professores Orientadores.
- **Professor Orientador (`TEACHER`):**
  - Lista exclusiva dos seus orientandos com indicação do progresso atual.
  - Página de detalhe de cada aluno com gráfico de evolução temporal (Recharts) e histórico detalhado dos relatórios quinzenais.
  - Gestão de Pedidos de Suporte com alteração de estado (`ABERTO`, `EM ANÁLISE`, `RESOLVIDO`) e resposta direta ao aluno.
- **Aluno (`STUDENT`):**
  - **Questionário Quinzenal (Check-in a cada 15 dias):**
    - Tarefas realizadas desde a última orientação.
    - Slider interativo de percentagem de conclusão (`0%` a `100%`) com feedback visual por cores.
    - Dificuldades sentidas e soluções adotadas.
    - Tarefas comprometidas para a quinzena seguinte.
  - **Pedido de Suporte:** Envio de dúvidas ou pedidos de reunião urgente fora do ciclo quinzenal com histórico e feedback das respostas do orientador.
  - **O Meu Progresso:** Visualização gráfica da evolução percentual e histórico de relatórios.

### 2. Mobile-First & PWA
- Configurado com `manifest.json`, Service Worker (`public/sw.js`) e ícones em todas as resoluções (72x72 a 512x512).
- Suporte para instalação no ecrã inicial em Android e iOS.
- **Bottom Navigation Bar** fixa em smartphones para navegação intuitiva com o polegar.
- Prevenção de zoom indesejado no iOS (`maximumScale: 1`, input font-size 16px).
- Página de fallback offline (`/offline`).

### 3. Automação e Vercel Cron Job
- `vercel.json` configurado para executar `/api/cron/reminder` nos dias **1 e 16 de cada mês às 09:00 UTC**.
- Rota protegida por Bearer token (`CRON_SECRET`) que identifica alunos com relatórios pendentes no ciclo quinzenal atual.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Components & Server Actions) |
| **Linguagem** | TypeScript 5 |
| **Estilização** | Tailwind CSS + Design System Dark/Modern |
| **Base de Dados** | PostgreSQL (compatível com Supabase / Vercel Postgres / Neon) |
| **ORM** | Prisma ORM 6 |
| **Autenticação** | NextAuth.js v5 (JWT Session Strategy + Edge-safe Middleware) |
| **Gráficos** | Recharts (Área com gradientes e tooltips customizados) |
| **Ícones** | Lucide React |

---

## 📦 Estrutura de Ficheiros

```
GestãoPAP/
├── prisma/
│   ├── schema.prisma        # Modelos User, Project, BiweeklyReport, SupportRequest
│   └── seed.ts              # População de dados de teste para todos os perfis
├── public/
│   ├── icons/               # Ícones PWA (72x72 a 512x512)
│   ├── manifest.json        # Web App Manifest PWA
│   └── sw.js                # Service Worker para cache & offline
├── src/
│   ├── app/
│   │   ├── (auth)/login/    # Autenticação Credentials
│   │   ├── aluno/           # Rotas do Aluno (/relatorio, /suporte, /historico)
│   │   ├── coordenador/     # Rotas do Coordenador (/utilizadores, /projetos)
│   │   ├── orientador/      # Rotas do Orientador (/aluno/[id], /suporte)
│   │   ├── api/
│   │   │   ├── auth/        # Handlers NextAuth
│   │   │   └── cron/        # Rota de Cron Job /api/cron/reminder
│   │   ├── globals.css      # Variáveis de cor e Tailwind
│   │   ├── layout.tsx       # Root Layout PWA
│   │   └── page.tsx         # Landing page pública
│   ├── components/
│   │   ├── coordinator/     # Componentes de gestão de utilizadores e projetos
│   │   ├── student/         # Formulário quinzenal e pedido de suporte
│   │   ├── teacher/         # Gestão de suporte e respostas
│   │   ├── dashboard-shell.tsx # Shell responsiva com Bottom Nav mobile
│   │   └── progress-chart.tsx  # Gráficos Recharts
│   ├── lib/
│   │   ├── actions.ts       # Server Actions tipadas
│   │   ├── auth.config.ts   # Configuração de auth edge-safe para middleware
│   │   ├── auth.ts          # Instância completa do NextAuth com Prisma & Bcrypt
│   │   ├── db.ts            # Singleton Prisma Client
│   │   └── utils.ts         # Cálculo de quinzenas e formatação de datas
│   └── middleware.ts        # RBAC Middleware para proteção de rotas
├── vercel.json              # Configuração dos Crons da Vercel
└── package.json
```

---

## 🔑 Credenciais de Demonstração (Seed)

Todas as contas foram configuradas com a password: `password123`

| Perfil | Email | Descrição |
|---|---|---|
| **Coordenador** | `coordenador@escola.pt` | Acesso total à gestão de utilizadores, projetos e dashboard |
| **Professor 1** | `professor1@escola.pt` | Orientador de João Ferreira e Mariana Costa |
| **Professor 2** | `professor2@escola.pt` | Orientador de Pedro Rodrigues e Sofia Martins |
| **Aluno 1** | `aluno1@escola.pt` | Projeto: App de Gestão de Inventário com React Native |
| **Aluno 2** | `aluno2@escola.pt` | Projeto: Website de E-commerce com Next.js |
| **Aluno 3** | `aluno3@escola.pt` | Projeto: Sistema de Domótica com Arduino e IoT |
| **Aluno 4** | `aluno4@escola.pt` | Projeto: Plataforma de Ensino Online com Gamificação |

---

## ⚙️ Configuração e Execução Local

### 1. Clonar e Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um ficheiro `.env` baseado no `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/gestao_pap?schema=public"
AUTH_SECRET="chave-secreta-aleatoria-base64"
AUTH_URL="http://localhost:3000"
CRON_SECRET="segredo-para-o-cron-job"
```

### 3. Migrar e Popular a Base de Dados
```bash
npx prisma db push
npm run seed
```

### 4. Executar em Desenvolvimento
```bash
npm run dev
```
Acesse em: `http://localhost:3000`

### 5. Compilar para Produção
```bash
npm run build
npm run start
```

---

## ☁️ Deploy na Vercel

1. Faça push do repositório para o GitHub/GitLab.
2. No dashboard da Vercel, importe o repositório.
3. Configure uma base de dados **Vercel Postgres**, **Supabase** ou **Neon** e adicione a variável `DATABASE_URL`.
4. Adicione as variáveis de ambiente:
   - `AUTH_SECRET` (gerado via `openssl rand -base64 32`)
   - `AUTH_URL` (URL do projeto na Vercel)
   - `CRON_SECRET` (segredo para o cron job)
5. A Vercel detetará automaticamente o ficheiro `vercel.json` e configurará o cron quinzenal.
