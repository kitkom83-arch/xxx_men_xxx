import { useState } from 'react';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardComposer({ setup, admin }) {
  const [draft, setDraft] = useState('โพสต์ตัวอย่างสำหรับ dry-run เท่านั้น');
  const [message, setMessage] = useState('');

  function onDryRun() {
    setMessage('บันทึกแบบ dry-run สำเร็จ (ไม่มีการโพสต์จริง)');
  }

  return (
    <ProtectedLayout
      title="Dashboard / Composer"
      titleTh="ตัวช่วยร่างโพสต์"
      titleEn="Composer"
      description="Composer หน้านี้บังคับ dry-run only"
      descriptionTh="เขียน ตรวจตัวอักษร พรีวิว และทดสอบโพสต์แบบ dry-run โดยไม่โพสต์จริง"
      descriptionEn="Draft, count characters, preview, and dry-run posts without publishing anything"
      admin={admin}
      mode={setup?.mode || 'mock'}
      featureStatus="dry-run"
    >
      <h2>Composer (Dry-run only)</h2>
      <p className="warning">ห้าม post จริง: ปุ่มนี้ทำได้เฉพาะ dry-run</p>
      <label>
        Draft
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
      </label>
      <div className="composerMeta">
        <span>{draft.length} characters</span>
        <strong>dry_run_only</strong>
      </div>
      <button onClick={onDryRun}>Run Dry-run</button>
      <button disabled>Post จริง (Disabled)</button>
      {message ? <div className="notice">{message}</div> : null}
    </ProtectedLayout>
  );
}

export async function getServerSideProps(context) {
  const { requirePageSession } = require('../../lib/apiAuth');
  return requirePageSession(context);
}
