'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, Lock, LogIn, ShieldCheck } from 'lucide-react';

type LoginFormProps = { next: string };

export default function LoginForm({ next }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password, next }),
      });

      if (res.ok) {
        const data = (await res.json()) as { redirect?: string };
        // Navegação completa para o proxy reavaliar a sessão com o cookie presente.
        window.location.assign(data.redirect || '/');
        return;
      }

      if (res.status === 429) {
        const data = (await res.json().catch(() => ({}))) as { retryAfter?: number };
        const minutes = data.retryAfter ? Math.ceil(data.retryAfter / 60) : null;
        setError(
          minutes
            ? `Muitas tentativas. Tente novamente em ~${minutes} min.`
            : 'Muitas tentativas. Tente novamente mais tarde.',
        );
      } else if (res.status === 503) {
        setError('Login indisponível: o servidor ainda não foi configurado.');
      } else {
        setError('Usuário ou senha inválidos.');
      }
    } catch {
      setError('Não foi possível conectar. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-card" onSubmit={handleSubmit} noValidate>
      <div className="login-brand">
        <Image
          src="/brand/lockup-light.png"
          alt="Meta Consultoria"
          width={160}
          height={34}
          priority
          style={{ width: 'auto', height: 40 }}
        />
      </div>

      <span className="eyebrow text-meta-blue login-eyebrow">
        <ShieldCheck size={14} aria-hidden="true" />
        Acesso restrito
      </span>
      <h1 className="login-title">Entrar no BDU</h1>
      <p className="login-subtitle">
        Esta área é restrita. Informe suas credenciais para continuar.
      </p>

      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}

      <div className="login-field">
        <label htmlFor="username">Usuário</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          className="login-input"
          placeholder="Seu usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          autoFocus
          required
        />
      </div>

      <div className="login-field">
        <label htmlFor="password">Senha</label>
        <div className="login-password-wrap">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="login-input"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <button
            type="button"
            className="login-password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn--primary login-submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Entrando...
          </>
        ) : (
          <>
            <LogIn size={18} aria-hidden="true" />
            Entrar
          </>
        )}
      </button>

      <p className="login-foot">
        <Lock size={13} aria-hidden="true" />
        Conexão protegida — suas credenciais não são compartilhadas.
      </p>
    </form>
  );
}
