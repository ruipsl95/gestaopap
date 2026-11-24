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
