'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, Lock, LogIn, ShieldCheck } from 'lucide-react';

/**
 * Props for the LoginForm component.
 * @interface LoginFormProps
 * @property {string} next - The destination URL to redirect the user to upon successful authentication.
 */
type LoginFormProps = { next: string };

/**
 * LoginForm Component
 * Renders the login interface for the BDU (Banco de Dados Único).
 * Handles input change state, password visibility toggling, client-side error display,
 * form submission, loading state, rate-limiting (HTTP 429), and service unavailability (HTTP 503).
 *
 * @component
 * @param {LoginFormProps} props - Component properties.
 */
export default function LoginForm({ next }: LoginFormProps) {
  /**
   * The username typed by the user.
   * @type {string}
   */
  const [username, setUsername] = useState('');

  /**
   * The password typed by the user.
   * @type {string}
   */
  const [password, setPassword] = useState('');

  /**
   * Boolean flag to toggle password visibility.
   * When true, password text is visible; when false, it is masked.
   * @type {boolean}
   */
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Error message to be displayed on failed authentication or network issues.
   * Null if there are no active errors.
   * @type {string | null}
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * Loading state indicating whether a login request is pending.
   * Used to disable inputs and show a spinner.
   * @type {boolean}
   */
  const [loading, setLoading] = useState(false);

  /**
   * Submits the credentials to the authentication API endpoint `/api/auth/login`.
   * Sets appropriate error messages based on HTTP status codes (e.g., 429 for rate limit, 503 for lack of setup, 401/other for invalid credentials).
   * Performs full page navigation on success.
   *
   * @async
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   * @returns {Promise<void>}
   */
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
        // Performs full page navigation to let the reverse proxy re-evaluate the session with the new cookie.
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
    /* Semantic form element with disabled browser-default validation */
    <form className="login-card" onSubmit={handleSubmit} noValidate>
      {/* Brand logo container */}
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

      {/* Access indicator badge */}
      <span className="eyebrow text-meta-blue login-eyebrow">
        <ShieldCheck size={14} aria-hidden="true" />
        Acesso restrito
      </span>
      <h1 className="login-title">Entrar no BDU</h1>
      <p className="login-subtitle">
        Esta área é restrita. Informe suas credenciais para continuar.
      </p>

      {/* Conditionally render error alerts if an error message exists */}
      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}

      {/* Username input field */}
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

      {/* Password input field with toggle visibility button */}
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
          {/* Toggle visibility button. Tab index -1 to keep visual focus flow intuitive */}
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

      {/* Submit button with dynamic loading indicator and text */}
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

      {/* Footer disclaimer */}
      <p className="login-foot">
        <Lock size={13} aria-hidden="true" />
        Conexão protegida — suas credenciais não são compartilhadas.
      </p>
    </form>
  );
}
