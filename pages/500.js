export default function Custom500() {
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
        <p style={{ color: '#b91c1c', fontWeight: 700 }}>500</p>
        <h1>ระบบขัดข้องชั่วคราว</h1>
        <p>ลองกลับไปหน้าแรก หรือเปิดระบบใหม่อีกครั้ง</p>
        <a href="/" style={{ color: '#0f766e', fontWeight: 700 }}>กลับหน้าแรก</a>
      </section>
    </main>
  );
}
