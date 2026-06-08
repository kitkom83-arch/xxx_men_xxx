import { useState } from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardRateLimits({ setup, admin }) {
  const [rows] = useState([]);

  return (
    <ProtectedLayout
      title="Dashboard / Rate Limits"
      titleTh="ขีดจำกัด API"
      titleEn="Rate Limits"
      description="แสดงสถานะ rate limits แบบปลอดภัย"
      descriptionTh="ตรวจจำนวน request ที่ใช้ได้ เหลือเท่าไร และเวลาที่ rate limit จะรีเซ็ต"
      descriptionEn="Monitor request limits, remaining quota, and reset time from rate-limit data"
      admin={admin}
      mode={setup?.mode || 'mock'}
      empty={rows.length === 0 ? 'ยังไม่มีข้อมูล rate limits (empty state)' : ''}
      featureStatus="read-only"
    >
      <h2>Rate Limits</h2>
      <p>รองรับ route แล้ว ไม่เป็น 404 และไม่ทำ real write action</p>
    </ProtectedLayout>
  );
}

export async function getServerSideProps(context) {
  const { requirePageSession } = require('../../lib/apiAuth');
  return requirePageSession(context);
}
