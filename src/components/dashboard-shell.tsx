"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  HelpCircle,
  History,
  MessageSquare,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Bot,
} from "lucide-react";
import type { Role } from "@prisma/client";

interface DashboardShellProps {
  user: {
    name: string;
    email: string;
    role: Role;
  };
  role: Role;
  children: React.ReactNode;
}

const navItems: Record<Role, { href: string; label: string; icon: React.ElementType }[]> = {
  COORDINATOR: [
    { href: "/coordenador", label: "Dashboard", icon: LayoutDashboard },
    { href: "/coordenador/utilizadores", label: "Utilizadores", icon: Users },
    { href: "/coordenador/projetos", label: "Projetos", icon: BookOpen },
  ],
  TEACHER: [
    { href: "/orientador", label: "Orientandos", icon: Users },
    { href: "/orientador/suporte", label: "Suporte", icon: MessageSquare },
  ],
  STUDENT: [
    { href: "/aluno", label: "Progresso", icon: LayoutDashboard },
    { href: "/aluno/relatorio", label: "Relatório", icon: ClipboardCheck },
    { href: "/aluno/assistente", label: "Assistente IA", icon: Bot },
    { href: "/aluno/suporte", label: "Suporte", icon: HelpCircle },
    { href: "/aluno/historico", label: "Histórico", icon: History },
  ],
};

const roleLabels: Record<Role, string> = {
  COORDINATOR: "Coordenador",
  TEACHER: "Professor Orientador",
  STUDENT: "Aluno",
};

const roleColors: Record<Role, string> = {
  COORDINATOR: "bg-purple-500/10 text-purple-400",
  TEACHER: "bg-emerald-500/10 text-emerald-400",
  STUDENT: "bg-blue-500/10 text-blue-400",
};

export function DashboardShell({ user, role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = navItems[role];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-500" />
              <span className="font-bold hidden sm:inline">PAP</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[role]}`}>
              {roleLabels[role]}
            </span>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              title="Terminar sessão"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex px-4 gap-1 -mb-px">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== navItems[role][0].href && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-white hover:border-slate-600"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-slate-900 border-r border-slate-800 w-64 h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
            <nav className="space-y-1">
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== navItems[role][0].href && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 px-4 py-6 md:px-6 max-w-5xl mx-auto w-full pb-20 md:pb-6">
        {children}
      </main>

      {/* Bottom Navigation Bar (mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 safe-area-pb">
        <div className="flex justify-around py-2">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== navItems[role][0].href && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-blue-400" : ""}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
