/**
 * i18n - Internationalization for X API Marketing Control Center
 * Supports Thai (TH) and English (EN)
 * 
 * Usage:
 *   import { getLabel, getDescription, getMenuItems, t } from '../lib/i18n';
 *   const label = getLabel('/dashboard', locale);
 */

// Menu definitions with bilingual labels and descriptions
const menuItems = [
  {
    route: '/dashboard',
    icon: '📊',
    labelTh: 'แดชบอร์ด',
    labelEn: 'Dashboard',
    descriptionTh: 'ดูสถานะระบบ โหมดการทำงาน การใช้งาน API และความปลอดภัยโดยรวม',
    descriptionEn: 'View system status, operation mode, API usage, and overall safety state',
    featureStatus: 'demo',
    safetyNote: ''
  },
  {
    route: '/dashboard/search',
    icon: '🔍',
    labelTh: 'ค้นหาโพสต์',
    labelEn: 'Search Posts',
    descriptionTh: 'ค้นหาโพสต์ล่าสุดจาก keyword ในโหมด mock หรือ X API read-only',
    descriptionEn: 'Search recent posts by keyword using mock mode or read-only X API mode',
    featureStatus: 'read-only',
    safetyNote: 'ไม่ทำ write action - เฉพาะอ่านข้อมูล'
  },
  {
    route: '/dashboard/users',
    icon: '👤',
    labelTh: 'ผู้ใช้',
    labelEn: 'Users',
    descriptionTh: 'ค้นหาข้อมูลบัญชีจาก username และดูข้อมูลพื้นฐานของผู้ใช้',
    descriptionEn: 'Look up accounts by username and view basic public user information',
    featureStatus: 'read-only',
    safetyNote: 'เฉพาะดูข้อมูลสาธารณะ'
  },
  {
    route: '/dashboard/user-posts',
    icon: '📝',
    labelTh: 'โพสต์ของผู้ใช้',
    labelEn: 'User Posts',
    descriptionTh: 'ดึงรายการโพสต์ของผู้ใช้ตาม userId เพื่อดูแนวทางเนื้อหาและกิจกรรม',
    descriptionEn: 'Fetch posts from a user by userId to review content patterns and activity',
    featureStatus: 'read-only',
    safetyNote: ''
  },
  {
    route: '/dashboard/trends',
    icon: '📈',
    labelTh: 'เทรนด์',
    labelEn: 'Trends',
    descriptionTh: 'ดูหัวข้อที่กำลังเป็นกระแสตามพื้นที่หรือข้อมูล mock',
    descriptionEn: 'View trending topics by location or mock trend data',
    featureStatus: 'read-only',
    safetyNote: ''
  },
  {
    route: '/dashboard/composer',
    icon: '✍️',
    labelTh: 'ตัวช่วยร่างโพสต์',
    labelEn: 'Composer',
    descriptionTh: 'เขียน ตรวจตัวอักษร พรีวิว และทดสอบโพสต์แบบ dry-run โดยไม่โพสต์จริง',
    descriptionEn: 'Draft, count characters, preview, and dry-run posts without publishing anything',
    featureStatus: 'dry-run',
    safetyNote: 'ห้ามโพสต์จริง - dry-run เท่านั้น'
  },
  {
    route: '/dashboard/rate-limits',
    icon: '⏱️',
    labelTh: 'ขีดจำกัด API',
    labelEn: 'Rate Limits',
    descriptionTh: 'ตรวจจำนวน request ที่ใช้ได้ เหลือเท่าไร และเวลาที่ rate limit จะรีเซ็ต',
    descriptionEn: 'Monitor request limits, remaining quota, and reset time from rate-limit data',
    featureStatus: 'read-only',
    safetyNote: ''
  },
  {
    route: '/dashboard/usage',
    icon: '📊',
    labelTh: 'การใช้งาน',
    labelEn: 'Usage',
    descriptionTh: 'ดูภาพรวมการใช้งาน API และข้อมูล usage monitor ในระบบ',
    descriptionEn: 'View API usage summary and usage monitoring information',
    featureStatus: 'read-only',
    safetyNote: ''
  },
  {
    route: '/settings/x-keys',
    icon: '🔑',
    labelTh: 'คีย์ X API',
    labelEn: 'X API Keys',
    descriptionTh: 'ตั้งค่าและทดสอบ X API key/token โดยระบบจะแสดงเฉพาะข้อมูลแบบปิดบัง',
    descriptionEn: 'Configure and test X API keys/tokens while showing masked metadata only',
    featureStatus: 'protected',
    safetyNote: 'ไม่แสดง secret แบบเต็ม - แสดงเฉพาะ masked'
  },
  {
    route: '/settings/system',
    icon: '⚙️',
    labelTh: 'ตั้งค่าระบบ',
    labelEn: 'System Settings',
    descriptionTh: 'ตรวจโหมดระบบ ความปลอดภัย การตั้งค่า session และค่าเริ่มต้นของระบบ',
    descriptionEn: 'Check system mode, safety settings, session configuration, and defaults',
    featureStatus: 'protected',
    safetyNote: ''
  },
  {
    route: '/login',
    icon: '🔐',
    labelTh: 'เข้าสู่ระบบ',
    labelEn: 'Login',
    descriptionTh: 'เข้าสู่ระบบผู้ดูแลเพื่อใช้งานแดชบอร์ดและการตั้งค่า',
    descriptionEn: 'Sign in as an admin to access the dashboard and settings',
    featureStatus: 'auth',
    safetyNote: ''
  },
  {
    route: '/setup',
    icon: '🚀',
    labelTh: 'ตั้งค่าครั้งแรก',
    labelEn: 'First Setup',
    descriptionTh: 'ตั้งค่าผู้ดูแลระบบและโหมดเริ่มต้นของระบบ',
    descriptionEn: 'Configure the admin account and initial system mode',
    featureStatus: 'setup',
    safetyNote: 'ควรตั้งค่าครั้งเดียวตอนเริ่ม'
  },
  {
    route: '/dashboard/help',
    icon: '❓',
    labelTh: 'คู่มือฟีเจอร์',
    labelEn: 'Feature Guide',
    descriptionTh: 'ดูคำอธิบายและวิธีใช้งานแต่ละฟีเจอร์ของระบบ',
    descriptionEn: 'View explanation and usage instructions for each system feature',
    featureStatus: 'help',
    safetyNote: ''
  }
];

// Public pages outside dashboard
const publicPages = [
  {
    route: '/login',
    labelTh: 'เข้าสู่ระบบ',
    labelEn: 'Login'
  },
  {
    route: '/setup',
    labelTh: 'ตั้งค่าครั้งแรก',
    labelEn: 'First Setup'
  }
];

// Feature status badges
const statusBadges = {
  'demo': { labelTh: 'Demo Mode', labelEn: 'Demo Mode', className: 'badgeMock' },
  'read-only': { labelTh: 'Read-only', labelEn: 'Read-only', className: 'badgeMock' },
  'dry-run': { labelTh: 'Dry-run only', labelEn: 'Dry-run only', className: 'badgeMock' },
  'protected': { labelTh: 'Protected', labelEn: 'Protected', className: 'badgeLive' },
  'auth': { labelTh: 'Auth', labelEn: 'Auth', className: 'badgeLive' },
  'setup': { labelTh: 'Setup', labelEn: 'Setup', className: 'badgeLive' },
  'help': { labelTh: 'Help', labelEn: 'Help', className: 'badgeMock' }
};

// Get menu item by route
function getMenuItem(route) {
  return menuItems.find(item => item.route === route) || null;
}

// Get label by route and locale (default: 'en')
function getLabel(route, locale = 'en') {
  const item = getMenuItem(route);
  if (!item) return route;
  return locale === 'th' ? item.labelTh : item.labelEn;
}

// Get description by route and locale
function getDescription(route, locale = 'en') {
  const item = getMenuItem(route);
  if (!item) return '';
  return locale === 'th' ? item.descriptionTh : item.descriptionEn;
}

// Get icon by route
function getIcon(route) {
  const item = getMenuItem(route);
  return item?.icon || '📄';
}

// Get feature status by route
function getFeatureStatus(route) {
  const item = getMenuItem(route);
  return item?.featureStatus || 'demo';
}

// Get safety note by route
function getSafetyNote(route, locale = 'en') {
  const item = getMenuItem(route);
  if (!item?.safetyNote) return '';
  return item.safetyNote;
}

// Get status badge info
function getStatusBadge(status, locale = 'en') {
  const badge = statusBadges[status] || statusBadges['demo'];
  return {
    label: locale === 'th' ? badge.labelTh : badge.labelEn,
    className: badge.className
  };
}

// Get all menu items for navigation (excluding public pages like /login and /setup)
function getMenuItems(excludePublic = true) {
  if (excludePublic) {
    return menuItems.filter(item => 
      !['/login', '/setup'].includes(item.route)
    );
  }
  return menuItems;
}

// Translation function
function t(key, locale = 'en') {
  const translations = {
    'app.title': { th: 'X API Marketing Control Center', en: 'X API Marketing Control Center' },
    'app.eyebrow': { th: 'X API Marketing Control Center', en: 'X API Marketing Control Center' },
    'logout.button': { th: 'ออกจากระบบ', en: 'Logout' },
    'loading': { th: 'กำลังโหลด...', en: 'Loading...' },
    'empty': { th: 'ไม่มีข้อมูล', en: 'No data' },
    'error': { th: 'เกิดข้อผิดพลาด', en: 'Error' },
    'nav.navigation': { th: 'เมนูนำทาง', en: 'Navigation' },
    'nav.features': { th: 'ฟีเจอร์', en: 'Features' },
    
    // Feature Guide
    'help.title': { th: 'คู่มือฟีเจอร์', en: 'Feature Guide' },
    'help.description': { th: 'คำอธิบายและวิธีใช้งานแต่ละฟีเจอร์', en: 'Explanation and usage instructions for each feature' },
    
    // Status
    'status.demo': { th: 'Demo Mode', en: 'Demo Mode' },
    'status.readonly': { th: 'Read-only', en: 'Read-only' },
    'status.dryrun': { th: 'Dry-run only', en: 'Dry-run only' },
    'status.protected': { th: 'Protected', en: 'Protected' },
    
    // Language
    'lang.switch': { th: 'ภาษา', en: 'Language' },
    'lang.th': { th: 'ไทย', en: 'Thai' },
    'lang.en': { th: 'English', en: 'English' }
  };
  
  const trans = translations[key];
  if (!trans) return key;
  return locale === 'th' ? trans.th : trans.en;
}

// Get all routes (for validation)
function getAllRoutes() {
  return menuItems.map(item => item.route);
}

// Locale storage key
const LOCALE_KEY = 'xmc_locale';

// Get saved locale from localStorage (default: 'th')
function getSavedLocale() {
  if (typeof window === 'undefined') return 'th';
  const saved = localStorage.getItem(LOCALE_KEY);
  return saved || 'th';
}

// Save locale to localStorage
function saveLocale(locale) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCALE_KEY, locale);
}

// Valid locales
const VALID_LOCALES = ['th', 'en'];

module.exports = {
  menuItems,
  publicPages,
  statusBadges,
  getMenuItem,
  getLabel,
  getDescription,
  getIcon,
  getFeatureStatus,
  getSafetyNote,
  getStatusBadge,
  getMenuItems,
  getAllRoutes,
  t,
  LOCALE_KEY,
  getSavedLocale,
  saveLocale,
  VALID_LOCALES
};
