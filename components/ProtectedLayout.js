import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/search', label: 'Search' },
  { href: '/dashboard/users', label: 'Users' },
  { href: '/dashboard/user-posts', label: 'User Posts' },
  { href: '/dashboard/trends', label: 'Trends' },
  { href: '/dashboard/composer', label: 'Composer (Dry-run)' },
  { href: '/dashboard/rate-limits', label: 'Rate Limits' },
  { href: '/dashboard/usage', label: 'Usage' },
  { href: '/settings/x-keys', label: 'X Keys' },
  { href: '/settings/system', label: 'System' },
];

export default function ProtectedLayout({
  title,
  description,
  admin,
  mode = 'mock',
  children,
  error = '',
  loading = false,
  empty = '',
}) {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">X API Marketing Control Center</p>
          <h1>{title}</h1>
          {description ? <p className="muted">{description}</p> : null}
        </div>
        <div className="top-actions">
          <span className={`badge ${mode === 'mock' ? 'badgeMock' : 'badgeLive'}`}>
            {mode === 'mock' ? 'Demo / Mock' : 'Live Read-only'}
          </span>
          <span className="admin">{admin?.username || 'admin'}</span>
          <button className="ghost" onClick={logout}>ออกจากระบบ</button>
        </div>
      </header>

      <section className="panel">
        <h2>Navigation</h2>
        <div className="workbench">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="buttonLink">
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      {loading ? <div className="notice">กำลังโหลดข้อมูล...</div> : null}
      {error ? <div className="alert">{error}</div> : null}
      {empty ? <div className="notice">{empty}</div> : null}

      <section className="panel">
        {children}
      </section>
    </main>
  );
}
