interface ReportAnalysisInput {
  studentName: string;
  projectTitle: string;
  completionPercentage: number;
  completedTasks: string;
  difficulties: string;
  nextTasks: string;
  reportDate?: Date | string;
}

/**
 * Gera uma análise pedagógica e sugestão de comentário para o professor orientador
 * utilizando Gemini (se GEMINI_API_KEY estiver configurada), OpenAI (se OPENAI_API_KEY estiver configurada)
 * ou um motor heurístico pedagógico de alta qualidade caso nenhuma chave esteja configurada.
 */
export async function generateReportAiAnalysis(input: ReportAnalysisInput): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  const prompt = `És um assistente pedagógico especializado no acompanhamento de Provas de Aptidão Profissional (PAP) do 12º ano do Ensino Profissional em Portugal.
Analisa o seguinte relatório quinzenal submetido pelo aluno e gera uma análise estruturada para o Professor Orientador:

DADOS DO ALUNO E PROJETO:
- Aluno: ${input.studentName}
- Projeto: ${input.projectTitle}
- Percentagem de Execução declarada: ${input.completionPercentage}%
- Tarefas Realizadas:
${input.completedTasks}
- Dificuldades Sentidas:
${input.difficulties}
- Próximas Tarefas Previstas:
${input.nextTasks}

INSTRUÇÕES DE RESPOSTA:
Elabora a resposta em Português de Portugal com a seguinte estrutura em Markdown:
### 📊 Análise do Progresso
(Avalia se as tarefas realizadas são compatíveis com a percentagem de ${input.completionPercentage}% indicada, o ritmo de trabalho e a coerência entre o planeado e o realizado)

### ⚠️ Dificuldades & Diagnóstico
(Identifica as principais barreiras técnicas, metodológicas ou de gestão de tempo indicadas pelo aluno e os riscos para o sucesso da PAP)

### 💬 Sugestão de Feedback para o Aluno
(Redige uma mensagem construtiva, motivadora e orientadora que o professor possa enviar diretamente ao aluno, elogiando o esforço e apontando correções)

### 🎯 Perguntas para a Próxima Reunião de Orientação
(3 a 4 perguntas diretas e técnicas para o professor colocar ao aluno na próxima orientação)

Sê rigoroso, construtivo e pedagógico.`;

  // 1. Tentar Gemini se a chave existir
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && typeof text === "string" && text.trim().length > 0) {
          return text.trim();
        }
      } else {
        console.warn("Gemini API error status:", response.status, await response.text());
      }
    } catch (err) {
      console.warn("Erro ao contactar Gemini API, a recorrer ao fallback inteligente:", err);
    }
  }

  // 2. Tentar OpenAI se a chave existir
  if (openAiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "És um assistente pedagógico especializado no acompanhamento de Provas de Aptidão Profissional (PAP) em Portugal.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && typeof text === "string" && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (err) {
      console.warn("Erro ao contactar OpenAI API, a recorrer ao fallback:", err);
    }
  }

  // 3. Fallback inteligente estruturado e pedagógico
  return generateHeuristicFeedback(input);
}

function generateHeuristicFeedback(input: ReportAnalysisInput): string {
  const { studentName, completionPercentage, completedTasks, difficulties, nextTasks } = input;

  const diffLower = difficulties.toLowerCase();
  const hasNoDifficulties =
    diffLower.includes("nenhum") ||
    diffLower.includes("sem dificuldade") ||
    diffLower.includes("tudo bem") ||
    diffLower.trim().length < 5;

  let progressEval = "";
  if (completionPercentage < 25) {
    progressEval = `O aluno declara ${completionPercentage}% de execução. O projeto encontra-se em fase inicial. É essencial verificar se a calendarização inicial está a ser cumprida e se a pesquisa prévia e arquitetura da solução estão consolidadas.`;
  } else if (completionPercentage < 60) {
    progressEval = `O aluno reporta ${completionPercentage}% de avanço, correspondendo à fase central de desenvolvimento e implementação. O volume de tarefas realizadas demonstra atividade regular, mas exige atenção na consolidação dos módulos essenciais da PAP.`;
  } else if (completionPercentage < 85) {
    progressEval = `Com ${completionPercentage}% de execução concluída, o projeto aproxima-se da fase de testes e finalização. É fundamental começar a articular o desenvolvimento prático com a redação formal do relatório escrito de PAP.`;
  } else {
    progressEval = `O aluno reporta um avanço substancial de ${completionPercentage}%. Encontra-se na reta final, sendo prioridade os testes de validação, preparação da demonstração prática e revisão da memória descritiva.`;
  }

  const tasksSummary =
    completedTasks.trim().length > 0
      ? `As tarefas concluídas reportadas ("${completedTasks.slice(0, 80)}...") evidenciam cumprimento das metas propostas.`
      : "Recomenda-se detalhar melhor as tarefas executadas no próximo relatório.";

  let diffDiagnosis = "";
  if (hasNoDifficulties) {
    diffDiagnosis = `O aluno não referiu dificuldades significativas nesta quinzena. Recomenda-se aferir se o trabalho desenvolvido decorreu de facto sem entraves técnicos ou se há tópicos complexos a serem adiados.`;
  } else if (
    diffLower.includes("tempo") ||
    diffLower.includes("prazo") ||
    diffLower.includes("atraso")
  ) {
    diffDiagnosis = `Foram identificados constrangimentos na gestão do tempo e prazos. Recomenda-se ajudar o aluno a priorizar as funcionalidades estritamente necessárias (MVP - Produto Mínimo Viável) antes de passar a funcionalidades secundárias.`;
  } else if (
    diffLower.includes("código") ||
    diffLower.includes("bug") ||
    diffLower.includes("erro") ||
    diffLower.includes("base de dados") ||
    diffLower.includes("api")
  ) {
    diffDiagnosis = `O aluno assinala desafios de implementação técnica ("${difficulties.slice(0, 100)}..."). É oportuno analisar o código ou a arquitetura em conjunto na próxima sessão para desbloquear o problema.`;
  } else {
    diffDiagnosis = `O aluno identificou os seguintes constrangimentos: "${difficulties}". É conveniente clarificar estas questões na sessão de orientação para evitar bloqueios nas próximas fases.`;
  }

  return `### 📊 Análise do Progresso
${progressEval} ${tasksSummary}

### ⚠️ Dificuldades & Diagnóstico
${diffDiagnosis}

### 💬 Sugestão de Feedback para o Aluno
"Olá ${studentName.split(" ")[0]}, bom trabalho no cumprimento do plano desta quinzena. Continua focado na execução das próximas tarefas planeadas: ${nextTasks.slice(0, 80)}... Na próxima reunião de orientação vamos rever em detalhe o progresso e analisar as dificuldades que sentiste. Força!"

### 🎯 Perguntas para a Próxima Reunião de Orientação
1. Consegues demonstrar na prática o que foi implementado nas tarefas concluídas desta quinzena?
2. Que estratégia ou solução estás a considerar para ultrapassar as dificuldades reportadas?
3. Como está o ponto de situação da escrita do relatório escrito da PAP face ao trabalho prático já concluído?
4. Quais são os bloqueios que prevês para a execução das próximas tarefas planeadas?`;
}

export interface StudentChatInput {
  studentName: string;
  teacherName: string;
  projectTitle: string;
  projectDescription?: string | null;
  teacherGuidelines?: string | null;
  projectRoadmap?: string | null;
  latestReport?: {
    completionPercentage: number;
    completedTasks: string;
    difficulties: string;
    nextTasks: string;
  } | null;
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
}

export async function generateStudentChatReply(
  input: StudentChatInput
): Promise<{ reply: string; provider: "openai" | "fallback" }> {
  const openAiKey = process.env.OPENAI_API_KEY;
  const openAiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const latestReportText = input.latestReport
    ? `- Progresso atual: ${input.latestReport.completionPercentage}%
- Tarefas realizadas recentemente: ${input.latestReport.completedTasks}
- Dificuldades reportadas: ${input.latestReport.difficulties}
- Próximas tarefas planeadas: ${input.latestReport.nextTasks}`
    : "O aluno ainda não submeteu relatórios quinzenais.";

  const systemPrompt = `És o Assistente Virtual de PAP (Prova de Aptidão Profissional) do Professor Orientador ${input.teacherName}.
Estás a conversar com o aluno ${input.studentName}, cujo projeto de PAP se intitula "${input.projectTitle}".
${input.projectDescription ? `Descrição do projeto: ${input.projectDescription}` : ""}

A tua missão é ajudar o aluno a avançar no seu projeto, tirar dúvidas técnicas ou metodológicas e traçar passos práticos, SEMPRE alinhado com as ideias, metodologia e caminhos definidos pelo Professor Orientador.

[METODOLOGIA E DIRETRIZES GERAIS DO PROFESSOR ORIENTADOR (${input.teacherName})]:
${
  input.teacherGuidelines?.trim()
    ? input.teacherGuidelines.trim()
    : "Priorizar um MVP funcional, manter entregas quinzenais consistentes, documentar cada funcionalidade à medida que é desenvolvida e testar antes de avançar."
}

[IDEIAS E CAMINHO TRAÇADO PARA ESTE PROJETO ESPECÍFICO]:
${
  input.projectRoadmap?.trim()
    ? input.projectRoadmap.trim()
    : "Ainda não foi registado um roteiro específico pelo orientador. Ajuda o aluno a decompor as tarefas de forma lógica e incremental."
}

[PONTO DE SITUAÇÃO ATUAL DO ALUNO]:
${latestReportText}

REGRAS DE CONDUTA:
1. Responde sempre em Português de Portugal, com tom pedagógico, motivador, claro e objetivo.
2. Sempre que o aluno pedir próximos passos, planos ou ajuda para tarefas, baseia-te diretamente nas diretrizes e no caminho traçado pelo professor orientador acima.
3. Decompõe sugestões complexas em tarefas pequenas e acionáveis (ex: Passo 1, Passo 2, Passo 3).
4. Não faças o trabalho todo pelo aluno se ele pedir o projeto completo pronto; orienta-o, explica conceitos, dá exemplos curtos e ajuda-o a pensar.
5. Relembra o aluno de validar decisões estruturais importantes na próxima reunião de orientação com o professor ${input.teacherName}.`;

  if (openAiKey) {
    try {
      const messages = [
        { role: "system", content: systemPrompt },
        ...input.history.slice(-12).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: input.userMessage },
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: openAiModel,
          messages,
          temperature: 0.7,
          max_tokens: 900,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && typeof text === "string" && text.trim().length > 0) {
          return { reply: text.trim(), provider: "openai" };
        }
      } else {
        console.warn("OpenAI API error:", response.status, await response.text());
      }
    } catch (err) {
      console.warn("Erro ao contactar OpenAI API:", err);
    }
  }

  // Fallback estruturado caso a OPENAI_API_KEY ainda não esteja configurada
  const firstName = input.studentName.split(" ")[0];
  const roadmapSection = input.projectRoadmap?.trim()
    ? `\n\n🧭 **Caminho traçado pelo teu orientador (${input.teacherName}):**\n${input.projectRoadmap.trim()}`
    : "";
  const guidelinesSection = input.teacherGuidelines?.trim()
    ? `\n\n📌 **Metodologia do orientador:**\n${input.teacherGuidelines.trim()}`
    : "";

  const fallbackReply = `Olá ${firstName}! Recebi a tua questão sobre **"${input.projectTitle}"**.${roadmapSection}${guidelinesSection}

💡 **Sugestão de próximos passos:**
1. Revê o último objetivo definido para a tua quinzena atual (${input.latestReport ? `estás nos ${input.latestReport.completionPercentage}%` : "arranque do projeto"}).
2. Divide a tarefa que queres resolver agora em blocos pequenos de 1 a 2 horas (ex: primeiro estrutura/dados, depois lógica, depois testes).
3. Se tiveres algum bloqueio técnico, regista-o no teu próximo relatório ou abre um pedido de suporte para o professor ${input.teacherName}.

*(Nota técnica: Para ativar respostas completas em tempo real com o **ChatGPT**, é necessário configurar a variável de ambiente \`OPENAI_API_KEY\` na Vercel/servidor.)*`;

  return { reply: fallbackReply, provider: "fallback" };
}
