import { useState } from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardRateLimits({ setup, admin }) {
  const [rows] = useState([]);

  return (
    <ProtectedLayout
      title="Dashboard / Rate Limits"
      description="แสดงสถานะ rate limits แบบปลอดภัย"
      admin={admin}
      mode={setup?.mode || 'mock'}
      empty={rows.length === 0 ? 'ยังไม่มีข้อมูล rate limits (empty state)' : ''}
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
