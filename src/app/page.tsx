import Link from "next/link";
import { GraduationCap, ClipboardCheck, Users, BarChart3, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold">PAP</span>
          </div>
          {session?.user ? (
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Gestão PAP
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Sistema de acompanhamento das Provas de Aptidão Profissional (PAP) do 12.º
            ano. Monitorize o progresso dos projetos, submeta relatórios
            quinzenais e comunique com o professor orientador.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <ClipboardCheck className="h-10 w-10 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Relatórios Quinzenais</h3>
              <p className="text-sm text-slate-400">
                Submissão fácil de check-ins a cada 15 dias com slider de progresso
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <Users className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Orientação</h3>
              <p className="text-sm text-slate-400">
                Comunicação direta entre alunos e professores orientadores
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <BarChart3 className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Dashboard</h3>
              <p className="text-sm text-slate-400">
                Visão geral do progresso de todos os projetos em tempo real
              </p>
            </div>
          </div>

          {session?.user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors"
            >
              Aceder ao Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors"
            >
              Aceder à Plataforma
            </Link>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        <p>© 2026 Gestão PAP — Sistema de Acompanhamento de Provas de Aptidão Profissional</p>
      </footer>
    </div>
  );
}
