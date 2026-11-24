"use client";

import { useState, useTransition } from "react";
import { createUser, updateUser, deleteUser } from "@/lib/actions";
import { Plus, Trash2, Pencil, Loader2, UserPlus, UserCheck, GraduationCap, BookOpen, X } from "lucide-react";

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
  const [editingUser, setEditingUser] = useState<User | null>(null);
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

  const handleUpdate = (formData: FormData) => {
    if (!editingUser) return;
    startTransition(async () => {
      await updateUser(editingUser.id, formData);
      setEditingUser(null);
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
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingUser(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Utilizador
        </button>
      </div>

      {/* Edit Form Modal/Panel */}
      {editingUser && (
        <form
          action={handleUpdate}
          className="bg-slate-900 border-2 border-blue-500/50 rounded-xl p-5 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold flex items-center gap-2 text-blue-400">
              <Pencil className="h-5 w-5" />
              Editar Utilizador: {editingUser.name}
            </h3>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nome Completo
              </label>
              <input
                name="name"
                defaultValue={editingUser.name}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email de Acesso
              </label>
              <input
                name="email"
                type="email"
                defaultValue={editingUser.email}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500"
                placeholder="email@escola.pt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nova Password (opcional)
              </label>
              <input
                name="password"
                type="password"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500"
                placeholder="Deixar em branco para manter a atual"
              />
              <p className="text-xs text-slate-500 mt-1">
                Só preencha se pretender alterar a palavra-passe do utilizador.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Perfil de Acesso
              </label>
              <select
                name="role"
                defaultValue={editingUser.role}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-blue-500"
              >
                <option value="STUDENT">Aluno</option>
                <option value="TEACHER">Professor Orientador</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
              Guardar Alterações
            </button>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-lg text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Create form */}
      {showForm && (
        <form
          action={handleCreate}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold flex items-center gap-2 text-white">
              <UserPlus className="h-5 w-5 text-blue-500" />
              Criar Novo Utilizador
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

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
          <div className="flex gap-3 pt-2">
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
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingUser(user);
                    setShowForm(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors"
                  title="Editar utilizador"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={deletingId === user.id}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Eliminar utilizador"
                >
                  {deletingId === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
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
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingUser(user);
                    setShowForm(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="p-2 rounded-lg hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-colors"
                  title="Editar utilizador"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={deletingId === user.id}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Eliminar utilizador"
                >
                  {deletingId === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
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
