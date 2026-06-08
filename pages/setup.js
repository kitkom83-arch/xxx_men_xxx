import { useState } from 'react';

const emptyCredentials = {
  bearerToken: '',
  apiKey: '',
  apiSecret: '',
  clientId: '',
  clientSecret: '',
};

export default function Setup() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('mock');
  const [credentials, setCredentials] = useState(emptyCredentials);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function updateCredential(key, value) {
    setCredentials((current) => ({ ...current, [key]: value }));
  }

  async function finish() {
    setError('');
    const response = await fetch('/api/setup/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, mode, credentials }),
    });
    const json = await response.json();
    if (!json.ok) {
      setError(json.error);
      return;
    }
    setDone(true);
  }

  return (
    <main className="authShell">
      <section className="setupPanel">
        <p className="eyebrow">First-run Setup</p>
        <h1>ตั้งค่า X API Marketing Control Center</h1>
        <div className="steps">
          {[1, 2, 3, 4].map((item) => (
            <span key={item} className={step === item ? 'activeStep' : ''}>{item}</span>
          ))}
        </div>

        {done ? (
          <div>
            <h2>ตั้งค่าเสร็จแล้ว</h2>
            <p className="muted">ระบบพร้อมใช้งานในโหมด {mode}. กรุณาเข้าสู่ระบบผู้ดูแล</p>
            <a className="buttonLink" href="/login">ไปหน้า login</a>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="formStack">
                <h2>1. สร้าง admin</h2>
                <label>
                  Username
                  <input value={username} onChange={(event) => setUsername(event.target.value)} />
                </label>
                <label>
                  Password
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                </label>
                <button onClick={() => setStep(2)}>ถัดไป</button>
              </div>
            )}

            {step === 2 && (
              <div className="formStack">
                <h2>2. เลือกโหมด</h2>
                <label className="radioRow">
                  <input type="radio" checked={mode === 'mock'} onChange={() => setMode('mock')} />
                  Demo / Mock mode
                </label>
                <label className="radioRow">
                  <input type="radio" checked={mode === 'live-readonly'} onChange={() => setMode('live-readonly')} />
                  Live read-only mode
                </label>
                <p className="muted">ทุก write action ยังเป็น dry-run แม้อยู่ใน live-readonly mode</p>
                <button onClick={() => setStep(3)}>ถัดไป</button>
              </div>
            )}

            {step === 3 && (
              <div className="formStack">
                <h2>3. Credential vault</h2>
                <p className="muted">ไม่จำเป็นต้องใส่ key จริงตอนนี้ ถ้าใส่ ระบบจะ encrypt และไม่ส่งกลับ frontend</p>
                {Object.keys(credentials).map((key) => (
                  <label key={key}>
                    {key}
                    <input
                      type="password"
                      value={credentials[key]}
                      onChange={(event) => updateCredential(key, event.target.value)}
                      placeholder="optional"
                    />
                  </label>
                ))}
                <button onClick={() => setStep(4)}>ถัดไป</button>
              </div>
            )}

            {step === 4 && (
              <div className="formStack">
                <h2>4. ตรวจสอบก่อนเปิดใช้</h2>
                <ul className="checklist">
                  <li>Frontend จะไม่เห็น secret จริง</li>
                  <li>Demo mode เป็นค่าเริ่มต้น</li>
                  <li>Composer เป็น dry-run เท่านั้น</li>
                  <li>ไม่มี DM, follow, unfollow หรือ browser automation</li>
                </ul>
                {error && <div className="alert">{error}</div>}
                <button onClick={finish}>บันทึก setup</button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export async function getServerSideProps() {
  const { getSetupStatus } = require('../lib/store');
  const status = await getSetupStatus();
  if (status.setupComplete) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: {} };
}
