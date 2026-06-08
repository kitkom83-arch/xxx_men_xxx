import { useState } from 'react';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const json = await response.json();
    if (!json.ok) {
      setError(json.error);
      return;
    }
    window.location.href = '/';
  }

  return (
    <main className="authShell">
      <form className="authPanel" onSubmit={submit}>
        <p className="eyebrow">Admin Login</p>
        <h1>X API Marketing Control Center</h1>
        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error && <div className="alert">{error}</div>}
        <button type="submit">เข้าสู่ระบบ</button>
      </form>
    </main>
  );
}

export async function getServerSideProps() {
  const { getSetupStatus } = require('../lib/store');
  const status = await getSetupStatus();
  if (!status.setupComplete) {
    return { redirect: { destination: '/setup', permanent: false } };
  }
  return { props: {} };
}
