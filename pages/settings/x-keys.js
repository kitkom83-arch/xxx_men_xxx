import ProtectedLayout from '../../components/ProtectedLayout';

function mask(value) {
  if (!value) return 'not-configured';
  if (value.length <= 4) return '****';
  return `${value.slice(0, 2)}****${value.slice(-2)}`;
}

export default function XKeysSettings({ setup, admin }) {
  const metadata = {
    mode: setup?.mode || 'mock',
    bearerToken: mask(''),
    apiKey: mask(''),
    apiSecret: mask(''),
    clientId: mask(''),
    clientSecret: mask(''),
  };

  return (
    <ProtectedLayout
      title="Settings / X Keys"
      description="แสดงเฉพาะ metadata แบบ masked เท่านั้น"
      admin={admin}
      mode={setup?.mode || 'mock'}
    >
      <h2>X Keys (Masked Metadata)</h2>
      <p>ไม่มีการแสดง token/key แบบเต็มในหน้า HTML</p>
      <ul className="list">
        <li><span>Mode</span><strong>{metadata.mode}</strong></li>
        <li><span>Bearer Token</span><strong>{metadata.bearerToken}</strong></li>
        <li><span>API Key</span><strong>{metadata.apiKey}</strong></li>
        <li><span>API Secret</span><strong>{metadata.apiSecret}</strong></li>
        <li><span>Client ID</span><strong>{metadata.clientId}</strong></li>
        <li><span>Client Secret</span><strong>{metadata.clientSecret}</strong></li>
      </ul>
      <div className="notice">Test connection: mock mode only</div>
      <button>Test Connection (Mock)</button>
    </ProtectedLayout>
  );
}

export async function getServerSideProps(context) {
  const { requirePageSession } = require('../../lib/apiAuth');
  return requirePageSession(context);
}
