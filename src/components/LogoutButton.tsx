'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';

/** Botão de logout no estilo das ações do header. Limpa a sessão e volta ao /login. */
export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Mesmo se falhar, mandamos o usuário para o login.
    } finally {
      window.location.assign('/login');
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      title="Sair"
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
    >
      <LogOut size={16} aria-hidden="true" />
      <span className="hidden sm:inline">Sair</span>
    </button>
  );
}
