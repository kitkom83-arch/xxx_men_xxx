import { useState } from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardUsers({ setup, admin }) {
  const [users] = useState([]);

  return (
    <ProtectedLayout
      title="Dashboard / Users"
      description="รายการผู้ใช้จาก mock data"
      admin={admin}
      mode={setup?.mode || 'mock'}
      empty={users.length === 0 ? 'ยังไม่มีข้อมูลผู้ใช้ (empty state)' : ''}
    >
      <h2>Users</h2>
      <p>หน้านี้ไม่เปิดเผย secret และไม่ทำ write action</p>
    </ProtectedLayout>
  );
}

export async function getServerSideProps(context) {
  const { requirePageSession } = require('../../lib/apiAuth');
  return requirePageSession(context);
}
