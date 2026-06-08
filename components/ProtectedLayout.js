import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  getMenuItems, 
  getLabel, 
  getDescription, 
  getStatusBadge,
  LOCALE_KEY, 
  getSavedLocale, 
  saveLocale,
  t as i18n 
} from '../lib/i18n';

/**
 * ProtectedLayout - Main layout for protected dashboard pages
 * Supports bilingual (Thai/English) menu and UI
 */
export default function ProtectedLayout({
  title,
  titleTh,
  titleEn,
  description,
  descriptionTh,
  descriptionEn,
  admin,
  mode = 'mock',
  children,
  error = '',
  loading = false,
  empty = '',
  featureStatus = 'demo',
  // Override locale from parent (optional, for SSR)
  localeProp
}) {
  const [locale, setLocale] = useState('th');
  const [isClient, setIsClient] = useState(false);

  // Initialize locale on mount
  useEffect(() => {
    setIsClient(true);
    const saved = getSavedLocale();
    setLocale(saved);
  }, []);

  // Handle language toggle
  function toggleLocale() {
    const newLocale = locale === 'th' ? 'en' : 'th';
    setLocale(newLocale);
    saveLocale(newLocale);
  }

  // Get menu items for navigation
  const menuNavItems = getMenuItems(true).map(item => ({
    href: item.route,
    icon: item.icon,
    label: locale === 'th' ? item.labelTh : item.labelEn,
    description: locale === 'th' ? item.descriptionTh : item.descriptionEn
  }));

  // Get status badge
  const statusBadge = getStatusBadge(featureStatus, locale);
  
  // Dynamic text based on locale
  const currentTitle = locale === 'th' ? titleTh : titleEn;
  const currentDesc = locale === 'th' ? descriptionTh : descriptionEn;
  
  // Fallback to props if provided
  const displayTitle = currentTitle || title;
  const displayDesc = currentDesc || description;
  
  // Button labels
  const logoutLabel = i18n('logout.button', locale);
  const loadingLabel = i18n('loading', locale);
  const navLabel = i18n('nav.navigation', locale);
  
  // Mode badge text
  const modeBadge = mode === 'mock' 
    ? (locale === 'th' ? 'Demo / Mock' : 'Demo / Mock')
    : (locale === 'th' ? 'Live Read-only' : 'Live Read-only');

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{i18n('app.eyebrow', locale)}</p>
          <h1>{displayTitle}</h1>
          {displayDesc ? <p className="muted">{displayDesc}</p> : null}
        </div>
        <div className="top-actions">
          {/* Language Toggle */}
          <button 
            className="lang-toggle" 
            onClick={toggleLocale}
            title={i18n('lang.switch', locale)}
          >
            {locale === 'th' ? '🇹🇭 TH' : '🇺🇸 EN'}
          </button>
          
          <span className={`badge ${mode === 'mock' ? 'badgeMock' : 'badgeLive'}`}>
            {modeBadge}
          </span>
          {featureStatus && featureStatus !== 'demo' && (
            <span className={`badge ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          )}
          <span className="admin">{admin?.username || 'admin'}</span>
          <button className="ghost" onClick={logout}>{logoutLabel}</button>
        </div>
      </header>

      <section className="panel">
        <h2>{navLabel}</h2>
        <div className="workbench">
          {menuNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="buttonLink">
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      </section>

      {loading ? <div className="notice">{loadingLabel}</div> : null}
      {error ? <div className="alert">{error}</div> : null}
      {empty ? <div className="notice">{empty}</div> : null}

      <section className="panel">
        {children}
      </section>
    </main>
  );
}
