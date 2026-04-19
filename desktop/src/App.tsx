import { useState } from 'react';
import { DashboardPage } from './pages/Dashboard';
import { LoginPage } from './pages/Login';
import { RatepayersPage } from './pages/Ratepayers';
import { BillingPage } from './pages/Billing';
import { PaymentsPage } from './pages/Payments';
import { ReportsPage } from './pages/Reports';
import { UsersPage } from './pages/Users';
import { SettingsPage } from './pages/Settings';

const pages = ['dashboard', 'ratepayers', 'billing', 'payments', 'reports', 'users', 'settings'] as const;
type Page = (typeof pages)[number];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState<Page>('dashboard');

  if (!loggedIn) {
    return <LoginPage onSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h2>Tano North Municipal Assembly - Revenue Platform</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {pages.map((p) => (
          <button key={p} onClick={() => setPage(p)}>{p}</button>
        ))}
      </div>
      <hr />
      {page === 'dashboard' && <DashboardPage />}
      {page === 'ratepayers' && <RatepayersPage />}
      {page === 'billing' && <BillingPage />}
      {page === 'payments' && <PaymentsPage />}
      {page === 'reports' && <ReportsPage />}
      {page === 'users' && <UsersPage />}
      {page === 'settings' && <SettingsPage />}
    </div>
  );
}
