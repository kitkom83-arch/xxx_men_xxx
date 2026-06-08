import { useState, useEffect } from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';
import { 
  menuItems, 
  getStatusBadge, 
  LOCALE_KEY, 
  getSavedLocale,
  t as i18n 
} from '../../lib/i18n';

/**
 * Feature Guide / Help Page
 * Displays all features with Thai/English descriptions
 */
export default function FeatureGuide({ setup, admin }) {
  const [locale, setLocale] = useState('th');

  // Get locale from localStorage on mount
  useEffect(() => {
    const saved = getSavedLocale();
    setLocale(saved);
  }, []);

  // Filter menu items to show only dashboard features (exclude public pages)
  const features = menuItems.filter(item => 
    item.route.startsWith('/dashboard') || item.route.startsWith('/settings')
  );

  // Helper to get status badge
  function getBadge(status) {
    return getStatusBadge(status, locale);
  }

  // Get translated content
  const pageTitle = i18n('help.title', locale);
  const pageDesc = i18n('help.description', locale);

  return (
    <ProtectedLayout
      title={pageTitle}
      titleTh="คู่มือฟีเจอร์"
      titleEn="Feature Guide"
      description={pageDesc}
      descriptionTh="ดูคำอธิบายและวิธีใช้งานแต่ละฟีเจอร์ของระบบ"
      descriptionEn="View explanation and usage instructions for each system feature"
      admin={admin}
      mode={setup?.mode || 'mock'}
      featureStatus="help"
    >
      <div className="feature-grid">
        {features.map((feature) => (
          <div key={feature.route} className="feature-card">
            <h3>
              <span>{feature.icon}</span>
              <span>{locale === 'th' ? feature.labelTh : feature.labelEn}</span>
            </h3>
            <p className="description">
              {locale === 'th' ? feature.descriptionTh : feature.descriptionEn}
            </p>
            <div className="meta">
              <span className={`badge ${getBadge(feature.featureStatus).className}`}>
                {getBadge(feature.featureStatus).label}
              </span>
              {feature.safetyNote && (
                <span className="badge badgeLive">{feature.safetyNote}</span>
              )}
            </div>
            {feature.safetyNote && (
              <p className="safety-note">
                ⚠️ {feature.safetyNote}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: '2rem' }}>
        <h2>{locale === 'th' ? 'สถานะฟีเจอร์' : 'Feature Status'}</h2>
        <ul className="checklist">
          <li>
            <span className="badge badgeMock">Demo Mode</span>
            <span>{locale === 'th' 
              ? 'ใช้ข้อมูลจำลอง ไม่เรียก X API จริง' 
              : 'Uses mock data, no real X API calls'}</span>
          </li>
          <li>
            <span className="badge badgeMock">Read-only</span>
            <span>{locale === 'th' 
              ? 'เฉพาะการอ่านข้อมูล ไม่ทำ write action' 
              : 'Read-only, no write actions'}</span>
          </li>
          <li>
            <span className="badge badgeMock">Dry-run</span>
            <span>{locale === 'th' 
              ? 'ทดสอบเท่านั้น ไม่โพสต์จริง' 
              : 'Testing only, no real posting'}</span>
          </li>
          <li>
            <span className="badge badgeLive">Protected</span>
            <span>{locale === 'th' 
              ? 'ต้อง login ก่อนเข้าใช้งาน' 
              : 'Requires login to access'}</span>
          </li>
        </ul>
      </div>

      <div className="panel" style={{ marginTop: '2rem' }}>
        <h2>{locale === 'th' ? 'การเปลี่ยนภาษา' : 'Language Switching'}</h2>
        <p className="muted">
          {locale === 'th' 
            ? 'กดปุ่ม TH/EN ที่มุมขวาบนของแต่ละหน้าเพื่อสลับภาษา'
            : 'Click the TH/EN button at the top-right of each page to switch language'}
        </p>
        <p className="muted">
          {locale === 'th' 
            ? 'ภาษาจะถูกจำไว้ใน localStorage (xmc_locale)'
            : 'Language is saved in localStorage (xmc_locale)'}
        </p>
      </div>
    </ProtectedLayout>
  );
}

export async function getServerSideProps(context) {
  const { requirePageSession } = require('../../lib/apiAuth');
  return requirePageSession(context);
}
