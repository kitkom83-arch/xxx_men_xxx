import { useState } from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardUsers({ setup, admin }) {
  const [users] = useState([]);

  return (
    <ProtectedLayout
      title="Dashboard / Users"
      titleTh="ผู้ใช้"
      titleEn="Users"
      description="รายการผู้ใช้จาก mock data"
      descriptionTh="ค้นหาข้อมูลบัญชีจาก username และดูข้อมูลพื้นฐานของผู้ใช้"
      descriptionEn="Look up accounts by username and view basic public user information"
      admin={admin}
      mode={setup?.mode || 'mock'}
      empty={users.length === 0 ? 'ยังไม่มีข้อมูลผู้ใช้ (empty state)' : ''}
      featureStatus="read-only"
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
