import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession, safeNextPath } from '@/lib/auth';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Acesso restrito ao BDU — Meta Consultoria.',
};

// A sessão depende de cookies → renderização dinâmica.
export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>; // Next 16: searchParams é Promise
}) {
  const { next } = await searchParams;
  const target = safeNextPath(next);

  // Já autenticado? Não faz sentido mostrar o login.
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (await verifySession(token)) {
    redirect(target);
  }

  return (
    <div className="login-shell">
      <LoginForm next={target} />
    </div>
  );
}
