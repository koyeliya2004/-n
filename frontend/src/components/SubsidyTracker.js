import React, { useState, useEffect } from 'react';
import translations from '../i18n/translations';
import { fetchSubsidies } from '../utils/api';

export default function SubsidyTracker({ lang, state }) {
  const t = (translations[lang] || translations.en).subsidies;
  const [subsidies, setSubsidies] = useState([]);

  useEffect(() => {
    if (state) {
      fetchSubsidies(state).then(setSubsidies).catch(() => {});
    }
  }, [state]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📋 {t.title}</h2>
      <p style={styles.desc}>{t.description}</p>

      {subsidies.length > 0 ? (
        <div style={styles.grid}>
          {subsidies.map((s, i) => (
            <div key={i} style={{...styles.card, borderLeft: s.level === 'Central' ? '4px solid #1a73e8' : '4px solid #2e7d32'}}>
              <div style={styles.level}>{s.level === 'Central' ? `🏛️ ${t.central}` : `🏢 ${t.state}`}</div>
              <h3 style={styles.name}>{s.name}</h3>
              <p style={styles.description}>{s.description}</p>
              {s.subsidy_percentage && <p style={styles.subsidy}>💰 {s.subsidy_percentage}</p>}
              {s.max_amount_inr && <p style={styles.amount}>Max Amount: ₹{s.max_amount_inr.toLocaleString()}</p>}
              {s.link && (
                <a href={s.link} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  Learn More →
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.empty}>
          <p>Select a state in the assessment form to see available subsidies and policies.</p>
          <div style={styles.generalInfo}>
            <h4>General Central Government Schemes:</h4>
            <ul style={styles.list}>
              <li>CGWB provides technical guidance and subsidies for artificial recharge structures</li>
              <li>Up to 50% subsidy for SC/ST households, 25% for others</li>
              <li>Maximum assistance up to ₹50,000 per household</li>
              <li>Atal Bhujal Yojana - World Bank funded groundwater management scheme</li>
              <li>Jal Shakti Abhiyan - Focused on water conservation</li>
              <li>MGNREGA - Funds available for water conservation structures</li>
            </ul>
          </div>
        </div>
      )}

      {/* General Policy Info */}
      <div style={styles.policySection}>
        <h3>🏛️ National Policy on Rainwater Harvesting</h3>
        <div style={styles.policyGrid}>
          <div style={styles.policyCard}>
            <h4>Mandatory RWH States</h4>
            <p>Tamil Nadu, Karnataka, Maharashtra, Rajasthan, Gujarat, Haryana, Delhi, and other states have made RWH mandatory for certain building sizes.</p>
          </div>
          <div style={styles.policyCard}>
            <h4>Tax Benefits</h4>
            <p>Many municipalities offer property tax rebates of 5-10% for buildings with functional RWH systems.</p>
          </div>
          <div style={styles.policyCard}>
            <h4>Building Approvals</h4>
            <p>Several states require RWH provision in building plan approval. Non-compliance may lead to water supply disconnection.</p>
          </div>
          <div style={styles.policyCard}>
            <h4>CGWB Support</h4>
            <p>Central Ground Water Board provides free technical guidance, design support, and awareness programs for RWH implementation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: '20px auto', padding: 10 },
  title: { color: '#1a73e8', textAlign: 'center', marginBottom: 8 },
  desc: { textAlign: 'center', color: '#666', marginBottom: 24 },
  grid: { display: 'grid', gap: 16, marginBottom: 24 },
  card: { background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  level: { fontSize: 13, color: '#666', marginBottom: 6, fontWeight: 600 },
  name: { color: '#333', marginBottom: 8 },
  description: { fontSize: 14, color: '#555', marginBottom: 8 },
  subsidy: { fontSize: 15, fontWeight: 600, color: '#2e7d32', marginBottom: 4 },
  amount: { fontSize: 14, color: '#f57f17', marginBottom: 8 },
  link: { color: '#1a73e8', textDecoration: 'none', fontWeight: 600 },
  empty: { textAlign: 'center', color: '#666', padding: 20 },
  generalInfo: { textAlign: 'left', marginTop: 16, background: '#f8f9fa', padding: 16, borderRadius: 8 },
  list: { paddingLeft: 20, lineHeight: 2 },
  policySection: { marginTop: 24, background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  policyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 },
  policyCard: { background: '#f8f9fa', padding: 16, borderRadius: 8 }
};
