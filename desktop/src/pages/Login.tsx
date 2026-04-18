import { FormEvent, useState } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

type Props = { onSuccess: () => void };

export function LoginPage({ onSuccess }: Props) {
  const [email, setEmail] = useState('admin@tnma.gov.gh');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const setToken = useAuthStore((s) => s.setToken);

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.accessToken as string;
      setToken(token);
      (window as any).secureStore?.setToken?.(token);
      onSuccess();
    } catch {
      setError('Login failed');
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 360, margin: '2rem auto', display: 'grid', gap: 8 }}>
      <h2>Tano North Municipal Assembly</h2>
      <p>Revenue Billing Login</p>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
