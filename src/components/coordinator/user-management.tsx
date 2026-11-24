"use client";

import { useState, useTransition } from "react";
import { createUser, deleteUser } from "@/lib/actions";
import { Plus, Trash2, Loader2, UserPlus, GraduationCap, BookOpen } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  project?: { id: string; title: string } | null;
  orientandos?: { id: string }[];
}

interface UserManagementProps {
  users: User[];
}

export function UserManagement({ users }: UserManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const teachers = users.filter((u) => u.role === "TEACHER");
  const students = users.filter((u) => u.role === "STUDENT");

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      await createUser(formData);
      setShowForm(false);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem a certeza que pretende eliminar este utilizador?")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteUser(id);
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Create button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Novo Utilizador
      </button>

      {/* Create form */}
      {showForm && (
        <form
          action={handleCreate}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
        >
          <h3 className="font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-500" />
            Criar Novo Utilizador
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nome
              </label>
              <input
                name="name"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500"
                placeholder="email@escola.pt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Perfil
              </label>
              <select
                name="role"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500"
              >
                <option value="STUDENT">Aluno</option>
                <option value="TEACHER">Professor Orientador</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar Utilizador
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Teachers List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-500" />
          <h2 className="font-semibold">Professores Orientadores ({teachers.length})</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {teachers.map((user) => (
            <div
              key={user.id}
              className="p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user.orientandos?.length ?? 0} orientando(s)
                </p>
              </div>
              <button
                onClick={() => handleDelete(user.id)}
                disabled={deletingId === user.id}
                className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                title="Eliminar"
              >
                {deletingId === user.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
          {teachers.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-sm">
              Nenhum professor registado.
            </div>
          )}
        </div>
      </div>

      {/* Students List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-500" />
          <h2 className="font-semibold">Alunos ({students.length})</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {students.map((user) => (
            <div
              key={user.id}
              className="p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
                {user.project ? (
                  <p className="text-xs text-blue-400 mt-0.5">
                    📋 {user.project.title}
                  </p>
                ) : (
                  <p className="text-xs text-amber-400 mt-0.5">
                    ⚠️ Sem projeto atribuído
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(user.id)}
                disabled={deletingId === user.id}
                className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                title="Eliminar"
              >
                {deletingId === user.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
          {students.length === 0 && (
            <div className="p-6 text-center text-slate-500 text-sm">
              Nenhum aluno registado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
