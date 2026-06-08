import ProtectedLayout from '../../components/ProtectedLayout';

export default function SystemSettings({ setup, admin }) {
  return (
    <ProtectedLayout
      title="Settings / System"
      titleTh="ตั้งค่าระบบ"
      titleEn="System Settings"
      description="หน้าตั้งค่าระบบแบบ minimal สำหรับ route coverage"
      descriptionTh="ตรวจโหมดระบบ ความปลอดภัย การตั้งค่า session และค่าเริ่มต้นของระบบ"
      descriptionEn="Check system mode, safety settings, session configuration, and defaults"
      admin={admin}
      mode={setup?.mode || 'mock'}
      featureStatus="protected"
    >
      <h2>System Settings</h2>
      <ul className="checklist">
        <li>Current mode: {setup?.mode || 'mock'}</li>
        <li>Write actions: disabled / dry-run policy</li>
        <li>Secrets: never exposed to frontend</li>
      </ul>
      <div className="notice">สถานะ: mock/demo ready</div>
    </ProtectedLayout>
  );
}

export async function getServerSideProps(context) {
  const { requirePageSession } = require('../../lib/apiAuth');
  return requirePageSession(context);
}
