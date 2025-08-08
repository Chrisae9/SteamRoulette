'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RandomPage() {
  const [minPlaytime, setMinPlaytime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState(null);
  const [error, setError] = useState('');

  const fetchRandom = async (mp) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/random?min_playtime=${mp}`);
      if (res.status === 401) {
        window.location.href = '/api/auth/login';
        return;
      }
      const data = await res.json();
      setGame(data);
    } catch (e) {
      setError('Failed to fetch random game');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandom(minPlaytime);
  }, []);

  const handleRandomize = async (e) => {
    e.preventDefault();
    fetchRandom(minPlaytime);
  };

  const handleBlacklist = async () => {
    if (!game) return;
    await fetch(`/api/blacklist/add/${game.appid}`, { method: 'POST' });
    fetchRandom(minPlaytime);
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>Your Random Steam Game</h1>
      {loading && <div style={{ textAlign: 'center' }}>Loading...</div>}
      {error && <div style={{ textAlign: 'center', color: 'salmon' }}>{error}</div>}
      {game && (
        <div style={{ backgroundColor: '#2d3748', padding: '1.5rem', borderRadius: 12, textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>{game.name}</h2>
          <img src={game.image_url} alt={game.name} style={{ display: 'block', margin: '0 auto 1rem', borderRadius: 8 }} />
          <p className="text-lg mb-4">Total Playtime: <span style={{ fontWeight: 'bold' }}>{game.playtime_hours < 1 ? `${Math.round(game.playtime_hours * 60)} minutes` : `${game.playtime_hours.toFixed(1)} hours`}</span></p>
          <form onSubmit={handleRandomize} style={{ marginTop: '1rem', textAlign: 'left' }}>
            <label htmlFor="min_playtime" style={{ display: 'block', marginBottom: 6 }}>Minimum Playtime:</label>
            <input type="range" id="min_playtime" min={0} max={1200} value={minPlaytime} onChange={(e) => setMinPlaytime(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
            <div style={{ color: '#cbd5e0', fontSize: 14, marginTop: 4 }}>
              {minPlaytime < 60 ? `${minPlaytime} minutes` : `${(minPlaytime / 60).toFixed(1)} hours`}
            </div>
            <button type="submit" style={{ marginTop: 12, backgroundColor: '#3b82f6', color: '#fff', padding: '8px 12px', borderRadius: 8, width: '100%' }}>Randomize</button>
          </form>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={handleBlacklist} style={{ backgroundColor: '#e53e3e', color: '#fff', padding: '8px 12px', borderRadius: 8, flex: 1 }}>Blacklist</button>
        <Link href="/blacklist" style={{ backgroundColor: '#3182ce', color: '#fff', padding: '8px 12px', borderRadius: 8, textAlign: 'center', flex: 1 }}>Manage</Link>
        <Link href="/api/auth/logout" style={{ backgroundColor: '#4a5568', color: '#fff', padding: '8px 12px', borderRadius: 8, textAlign: 'center', flex: 1 }}>Logout</Link>
      </div>
    </div>
  );
}