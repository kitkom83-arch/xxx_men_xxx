import { useEffect, useState } from 'react';

function JsonPanel({ title, value }) {
  if (!value) return null;
  return (
    <section className="panel">
      <h2>{title}</h2>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </section>
  );
}

export default function Home({ setup, admin }) {
  const [dashboard, setDashboard] = useState(null);
  const [username, setUsername] = useState('demo_brand');
  const [keyword, setKeyword] = useState('campaign');
  const [userId, setUserId] = useState('mock-user-1');
  const [composerText, setComposerText] = useState('โพสต์ตัวอย่างสำหรับ dry-run เท่านั้น');
  const [credentialMode, setCredentialMode] = useState(setup.mode || 'mock');
  const [credentialForm, setCredentialForm] = useState({
    bearerToken: '',
    apiKey: '',
    apiSecret: '',
    clientId: '',
    clientSecret: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function request(path, options = {}) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(path, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      const json = await response.json();
      if (!json.ok) {
        setError(json.error || 'เกิดข้อผิดพลาด');
      }
      return json;
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อ server ได้');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function refreshDashboard() {
    const json = await request('/api/dashboard');
    if (json?.ok) setDashboard(json.data);
  }

  useEffect(() => {
    refreshDashboard();
  }, []);

  async function runSearch() {
    const json = await request(`/api/x/search?query=${encodeURIComponent(keyword)}`);
    setResult(json);
    await refreshDashboard();
  }

  async function runUserSearch() {
    const json = await request(`/api/x/user?username=${encodeURIComponent(username)}`);
    setResult(json);
    const id = json?.data?.data?.id;
    if (id) setUserId(id);
    await refreshDashboard();
  }

  async function runUserPosts() {
    const json = await request(`/api/x/user-posts?userId=${encodeURIComponent(userId)}`);
    setResult(json);
    await refreshDashboard();
  }

  async function runUsage() {
    const json = await request('/api/x/usage');
    setResult(json);
    await refreshDashboard();
  }

  async function submitDryRun() {
    const json = await request('/api/composer/dry-run', {
      method: 'POST',
      body: JSON.stringify({ text: composerText, dryRun: true }),
    });
    setResult(json);
    await refreshDashboard();
  }

  async function saveCredentialSettings() {
    const json = await request('/api/admin/credentials', {
      method: 'POST',
      body: JSON.stringify({ mode: credentialMode, credentials: credentialForm }),
    });
    setResult(json);
    setCredentialForm({ bearerToken: '', apiKey: '', apiSecret: '', clientId: '', clientSecret: '' });
    await refreshDashboard();
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  const activeSetup = dashboard?.setup || setup;
  const credential = dashboard?.credential || setup.credential;
  const analytics = dashboard?.analytics;
  const composerWarnings = [];
  if (composerText.length > 280) composerWarnings.push('ข้อความยาวกว่า 280 ตัวอักษร');
  if (/(dm|follow|unfollow|like|retweet)/i.test(composerText)) {
    composerWarnings.push('พบคำที่เกี่ยวกับ write action ต้องห้าม ระบบจะเก็บเป็น dry-run เท่านั้น');
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">X API Marketing Control Center</p>
          <h1>ศูนย์ควบคุมการตลาดแบบ read-only + dry-run</h1>
        </div>
        <div className="top-actions">
          <span className={`badge ${activeSetup.mode === 'mock' ? 'badgeMock' : 'badgeLive'}`}>
            {activeSetup.mode === 'mock' ? 'Demo / Mock' : 'Live Read-only'}
          </span>
          <span className="admin">{admin.username}</span>
          <button className="ghost" onClick={logout}>ออกจากระบบ</button>
        </div>
      </header>

      <section className="statusGrid">
        <div className="metric">
          <span>Setup</span>
          <strong>{activeSetup.setupComplete ? 'พร้อมใช้งาน' : 'ยังไม่เสร็จ'}</strong>
        </div>
        <div className="metric">
          <span>Credential Vault</span>
          <strong>{credential.configured ? credential.maskedLabel : 'Demo only'}</strong>
        </div>
        <div className="metric">
          <span>Dry-run Safety</span>
          <strong>บังคับใช้ทุก write action</strong>
        </div>
        <div className="metric">
          <span>Usage Monitor</span>
          <strong>{dashboard?.usage?.[0]?.postsRead ?? 'mock'} reads</strong>
        </div>
      </section>

      {error && <div className="alert">{error}</div>}
      {loading && <div className="notice">กำลังประมวลผล...</div>}

      <section className="workbench">
        <div className="panel">
          <h2>Search Keyword</h2>
          <label>
            Keyword
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </label>
          <button onClick={runSearch}>ค้นหาโพสต์</button>
        </div>

        <div className="panel">
          <h2>Search User</h2>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <button onClick={runUserSearch}>ค้นหาผู้ใช้</button>
        </div>

        <div className="panel">
          <h2>User Posts</h2>
          <label>
            User ID
            <input value={userId} onChange={(event) => setUserId(event.target.value)} />
          </label>
          <button onClick={runUserPosts}>ดูโพสต์ของผู้ใช้</button>
        </div>

        <div className="panel">
          <h2>Usage Monitor</h2>
          <p className="muted">ตรวจ usage ผ่าน backend เท่านั้น ใน demo mode จะใช้ข้อมูลจำลอง</p>
          <button onClick={runUsage}>รีเฟรช usage</button>
        </div>
      </section>

      <section className="panel composer">
        <div>
          <h2>Composer Dry-run</h2>
          <p className="muted">บันทึกร่างและ policy preview เท่านั้น ไม่เรียก POST /2/tweets</p>
        </div>
        <textarea value={composerText} onChange={(event) => setComposerText(event.target.value)} />
        <div className="composerMeta">
          <span>{composerText.length} / 280 characters</span>
          <strong>{composerWarnings.length ? 'needs_review' : 'dry_run_ready'}</strong>
        </div>
        <div className="previewBox">
          <strong>Preview</strong>
          <p>{composerText || 'ยังไม่มีข้อความ'}</p>
          {composerWarnings.map((warning) => (
            <p className="warning" key={warning}>{warning}</p>
          ))}
        </div>
        <button onClick={submitDryRun}>บันทึก dry-run</button>
      </section>

      <section className="panel">
        <div>
          <h2>X Key Settings</h2>
          <p className="muted">ส่งไป backend เพื่อ encrypt เท่านั้น ระบบไม่แสดง secret กลับมาที่ frontend</p>
        </div>
        <label>
          Mode
          <select value={credentialMode} onChange={(event) => setCredentialMode(event.target.value)}>
            <option value="mock">Demo / Mock</option>
            <option value="live-readonly">Live read-only</option>
          </select>
        </label>
        <div className="settingsGrid">
          {Object.keys(credentialForm).map((key) => (
            <label key={key}>
              {key}
              <input
                type="password"
                value={credentialForm[key]}
                onChange={(event) => setCredentialForm((current) => ({ ...current, [key]: event.target.value }))}
                placeholder="optional"
              />
            </label>
          ))}
        </div>
        <button onClick={saveCredentialSettings}>บันทึก settings แบบ encrypted</button>
      </section>

      <section className="dashboardGrid">
        <section className="panel">
          <h2>Analytics</h2>
          <div className="metricRows">
            <span>Searches <strong>{analytics?.searches ?? 0}</strong></span>
            <span>Drafts <strong>{analytics?.drafts ?? 0}</strong></span>
            <span>Top keywords <strong>{analytics?.topKeywords?.length ?? 0}</strong></span>
          </div>
        </section>

        <section className="panel">
          <h2>Rate Limit Monitor</h2>
          <ul className="list">
            {(dashboard?.rateLimits || []).slice(0, 5).map((item) => (
              <li key={item.id || item.endpoint}>
                <span>{item.endpoint}</span>
                <strong>{item.remaining ?? '-'} / {item.limit ?? '-'}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Audit Log</h2>
          <ul className="list">
            {(dashboard?.audit || []).slice(0, 6).map((item) => (
              <li key={item.id}>
                <span>{item.summary}</span>
                <strong>{item.action}</strong>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <JsonPanel title="ผลลัพธ์ล่าสุด" value={result} />
    </main>
  );
}

export async function getServerSideProps(context) {
  const { requirePageSession } = require('../lib/apiAuth');
  return requirePageSession(context);
}
