import { useState } from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardUserPosts({ setup, admin }) {
  const [posts] = useState([]);

  return (
    <ProtectedLayout
      title="Dashboard / User Posts"
      titleTh="โพสต์ของผู้ใช้"
      titleEn="User Posts"
      description="ดูโพสต์ผู้ใช้ใน mock/demo mode"
      descriptionTh="ดึงรายการโพสต์ของผู้ใช้ตาม userId เพื่อดูแนวทางเนื้อหาและกิจกรรม"
      descriptionEn="Fetch posts from a user by userId to review content patterns and activity"
      admin={admin}
      mode={setup?.mode || 'mock'}
      empty={posts.length === 0 ? 'ยังไม่มีโพสต์ (empty state)' : ''}
      featureStatus="read-only"
    >
      <h2>User Posts</h2>
      <p>หน้านี้เป็น route placeholder ที่ใช้งานได้จริงและไม่ crash</p>
    </ProtectedLayout>
  );
}

export async function getServerSideProps(context) {
  const { requirePageSession } = require('../../lib/apiAuth');
  return requirePageSession(context);
}
