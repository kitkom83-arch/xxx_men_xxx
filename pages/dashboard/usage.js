import { useState } from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardUsage({ setup, admin }) {
  const [usage] = useState(null);

  return (
    <ProtectedLayout
      title="Dashboard / Usage"
      description="Usage monitor ในโหมด demo/mock"
      admin={admin}
      mode={setup?.mode || 'mock'}
      empty={!usage ? 'ยังไม่มีข้อมูล usage (empty state)' : ''}
    >
      <h2>Usage</h2>
      <p>หน้าตรวจ usage พร้อมใช้งาน และไม่เปิดเผยค่า secret</p>
    </ProtectedLayout>
  );
}

export async function getServerSideProps(context) {
  const { requirePageSession } = require('../../lib/apiAuth');
  return requirePageSession(context);
}
