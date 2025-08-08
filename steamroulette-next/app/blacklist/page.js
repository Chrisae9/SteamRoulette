'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BlacklistPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/blacklist');
    if (res.status === 401) {
      window.location.href = '/api/auth/login';
      return;
    }
    const data = await res.json();
    setGames(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (appid) => {
    await fetch('/api/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appid }),
    });
    setGames((prev) => prev.filter((g) => g.appid !== appid));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
        <Link href="/random" style={{ backgroundColor: '#3182ce', color: '#fff', padding: '8px 14px', borderRadius: 8 }}>Return</Link>
        <Link href="/api/auth/logout" style={{ backgroundColor: '#4a5568', color: '#fff', padding: '8px 14px', borderRadius: 8 }}>Logout</Link>
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>Blacklisted Games</h1>
      <input placeholder="Search for a game..." onChange={(e) => {
        const input = e.target.value.toLowerCase();
        document.querySelectorAll('.game-card').forEach((el) => {
          const title = el.querySelector('.game-title').textContent.toLowerCase();
          el.style.display = title.includes(input) ? '' : 'none';
        });
      }} style={{ padding: 10, marginBottom: 20, width: '100%', borderRadius: 8, border: '1px solid #4a5568', backgroundColor: '#2d3748', color: '#fff' }} />

      {loading && <div>Loading...</div>}
      {!loading && (
        <div>
          {games.map((game) => (
            <div className="game-card" key={game.appid} style={{ backgroundColor: '#1a202c', padding: 10, marginBottom: 15, borderRadius: 8, display: 'flex', alignItems: 'center', position: 'relative' }}>
              <img src={game.image_url} alt={game.name} style={{ maxWidth: 60, marginRight: 10, borderRadius: 8 }} />
              <h3 className="game-title" style={{ fontSize: '1rem', margin: 0, flex: 1 }}>{game.name}</h3>
              <button onClick={() => remove(game.appid)} style={{ background: 'transparent', color: '#e53e3e', cursor: 'pointer', fontSize: '1.25rem', width: 24, height: 24, border: 'none' }}>&times;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}