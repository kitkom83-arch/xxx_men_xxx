import { useState } from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardSearch({ setup, admin }) {
  const [loading] = useState(false);
  const [error] = useState('');
  const [items] = useState([]);

  return (
    <ProtectedLayout
      title="Dashboard / Search"
      titleTh="ค้นหาโพสต์"
      titleEn="Search Posts"
      description="ค้นหาแบบ mock/demo เพื่อทดสอบ route และ navigation"
      descriptionTh="ค้นหาโพสต์ล่าสุดจาก keyword ในโหมด mock หรือ X API read-only"
      descriptionEn="Search recent posts by keyword using mock mode or read-only X API mode"
      admin={admin}
      mode={setup?.mode || 'mock'}
      loading={loading}
      error={error}
      empty={items.length === 0 ? 'ยังไม่มีผลลัพธ์ (empty state)' : ''}
      featureStatus="read-only"
    >
      <h2>Search</h2>
      <p>หน้า search พร้อมใช้งานในโหมดปลอดภัย</p>
    </ProtectedLayout>
  );
}

export async function getServerSideProps(context) {
  const { requirePageSession } = require('../../lib/apiAuth');
  return requirePageSession(context);
}
