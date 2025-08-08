import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#1a202c', padding: '2rem', borderRadius: '12px', boxShadow: '0 8px 15px rgba(0,0,0,0.7)', maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Random Steam Game Picker</h1>
        <img src="/you-got-games-on-yo-phone-dog.png" alt="Random Steam Game Picker" style={{ width: 200, marginBottom: '1.5rem', borderRadius: '12px' }} />
        <Link href="/api/auth/login" style={{ display: 'inline-block', width: '100%', padding: '12px 20px', borderRadius: 8, color: '#fff', backgroundColor: '#171A21' }}>
          Sign in with Steam
        </Link>
      </div>
    </div>
  );
}