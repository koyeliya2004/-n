import React, { useState, useEffect } from 'react';
import translations from '../i18n/translations';
import { fetchLeaderboard, fetchImpact, registerRecharge } from '../utils/api';

export default function CommunityDashboard({ lang, userName }) {
  const t = (translations[lang] || translations.en).community;
  const [impact, setImpact] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [rechargeInput, setRechargeInput] = useState('');
  const [message, setMessage] = useState('');

  const loadData = () => {
    fetchImpact().then(setImpact).catch(() => {});
    fetchLeaderboard().then(setLeaderboard).catch(() => {});
  };

  useEffect(() => { loadData(); }, []);

  const handleRegister = async () => {
    const liters = Number(rechargeInput);
    if (!liters || liters <= 0) return;
    try {
      await registerRecharge(userName || 'Anonymous', '', liters);
      setRechargeInput('');
      setMessage('✅ Recharge registered successfully!');
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('❌ Failed to register');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t.title}</h2>

      {/* Impact Stats */}
      {impact && (
        <div style={styles.impactGrid}>
          <div style={{...styles.statCard, background: '#e3f2fd'}}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statValue}>{impact.totalUsers}</div>
            <div style={styles.statLabel}>Total Users</div>
          </div>
          <div style={{...styles.statCard, background: '#e8f5e9'}}>
            <div style={styles.statIcon}>💧</div>
            <div style={styles.statValue}>{(impact.totalRechargeLiters || 0).toLocaleString()} L</div>
            <div style={styles.statLabel}>{t.totalRecharge}</div>
          </div>
          <div style={{...styles.statCard, background: '#fff3e0'}}>
            <div style={styles.statIcon}>🏊</div>
            <div style={styles.statValue}>{impact.olympicPoolsEquivalent}</div>
            <div style={styles.statLabel}>{t.olympicPools}</div>
          </div>
          <div style={{...styles.statCard, background: '#fce4ec'}}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statValue}>{(impact.averagePerUser || 0).toLocaleString()} L</div>
            <div style={styles.statLabel}>Avg per User</div>
          </div>
        </div>
      )}

      {/* Impact message */}
      {impact && impact.olympicPoolsEquivalent > 0 && (
        <div style={styles.impactMsg}>
          🌊 {t.neighbors} <strong>{impact.olympicPoolsEquivalent}</strong> {t.pools}!
        </div>
      )}

      {/* Register Recharge */}
      <div style={styles.registerCard}>
        <h3>{t.registerRecharge}</h3>
        <div style={styles.registerRow}>
          <input type="number" placeholder="Liters recharged" value={rechargeInput}
            onChange={e => setRechargeInput(e.target.value)} style={styles.input} />
          <button onClick={handleRegister} style={styles.button}>Register</button>
        </div>
        {message && <p style={styles.message}>{message}</p>}
      </div>

      {/* Leaderboard */}
      {leaderboard && leaderboard.leaderboard.length > 0 && (
        <div style={styles.leaderCard}>
          <h3>🏆 {t.leaderboard}</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Water Credits</th>
                <th style={styles.th}>Liters Recharged</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.leaderboard.map((u, i) => (
                <tr key={i} style={i < 3 ? styles.topRow : {}}>
                  <td style={styles.td}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                  <td style={styles.td}>{u.userName}</td>
                  <td style={styles.td}>{u.waterCredits}</td>
                  <td style={styles.td}>{u.rechargeLiters.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: '20px auto', padding: 10 },
  title: { color: '#1a73e8', textAlign: 'center', marginBottom: 24 },
  impactGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 },
  statCard: { padding: 20, borderRadius: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: 700, color: '#333' },
  statLabel: { fontSize: 13, color: '#666', marginTop: 4 },
  impactMsg: { background: '#e8f5e9', padding: 16, borderRadius: 8, textAlign: 'center', fontSize: 16, marginBottom: 20 },
  registerCard: { background: '#fff', padding: 20, borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  registerRow: { display: 'flex', gap: 12, marginTop: 12 },
  input: { flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 14 },
  button: { padding: '10px 24px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
  message: { marginTop: 8, fontSize: 14 },
  leaderCard: { background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 12 },
  th: { padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontSize: 13, color: '#666' },
  td: { padding: '8px 12px', borderBottom: '1px solid #f0f0f0', fontSize: 14 },
  topRow: { background: '#fffde7' }
};
