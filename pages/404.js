export default function Custom404() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'Arial, sans-serif',
      background: '#f8fafc',
      color: '#0f172a'
    }}>
      <section style={{
        width: 'min(560px, 92vw)',
        padding: '32px',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        background: '#ffffff'
      }}>
        <p style={{ color: '#0f766e', fontWeight: 700 }}>404</p>
        <h1>ไม่พบหน้านี้</h1>
        <p>กลับไปที่หน้าแรกเพื่อใช้งานระบบ X API Marketing Control Center</p>
        <a href="/" style={{ color: '#0f766e', fontWeight: 700 }}>กลับหน้าแรก</a>
      </section>
    </main>
  );
}
