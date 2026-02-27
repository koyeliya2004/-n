import React from 'react';
import translations from '../i18n/translations';

const VENDOR_DATA = [
  { name: 'RainHarvest India Pvt Ltd', city: 'Delhi', services: 'Complete RTRWH installation, Recharge wells', rating: 4.5, phone: '+91-11-XXXXXXX', verified: true },
  { name: 'JalSeva Solutions', city: 'Bengaluru', services: 'Rooftop systems, Underground tanks, Recharge pits', rating: 4.7, phone: '+91-80-XXXXXXX', verified: true },
  { name: 'AquaRecharge Systems', city: 'Mumbai', services: 'Commercial & residential RWH systems', rating: 4.3, phone: '+91-22-XXXXXXX', verified: true },
  { name: 'GreenWater Technologies', city: 'Chennai', services: 'RTRWH design, installation & maintenance', rating: 4.6, phone: '+91-44-XXXXXXX', verified: true },
  { name: 'Bhoomi Jal Engineers', city: 'Hyderabad', services: 'Borewell recharge, Percolation pits', rating: 4.4, phone: '+91-40-XXXXXXX', verified: true },
  { name: 'Varsha Water Solutions', city: 'Pune', services: 'Residential RWH, Trench systems', rating: 4.2, phone: '+91-20-XXXXXXX', verified: true },
  { name: 'Neer Foundation', city: 'Jaipur', services: 'Desert area specialized RWH', rating: 4.8, phone: '+91-141-XXXXXXX', verified: true },
  { name: 'JalDhara Enterprises', city: 'Lucknow', services: 'North India RWH specialists', rating: 4.1, phone: '+91-522-XXXXXXX', verified: true },
  { name: 'Mazhai Water Systems', city: 'Coimbatore', services: 'Farm & industrial RWH', rating: 4.5, phone: '+91-422-XXXXXXX', verified: true },
  { name: 'Paani Resource Center', city: 'Kolkata', services: 'Eastern India RWH solutions', rating: 4.3, phone: '+91-33-XXXXXXX', verified: true }
];

export default function Marketplace({ lang }) {
  const t = (translations[lang] || translations.en).marketplace;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t.title}</h2>
      <p style={styles.desc}>{t.description}</p>

      <div style={styles.grid}>
        {VENDOR_DATA.map((v, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.vendorName}>{v.name}</h3>
              {v.verified && <span style={styles.badge}>✅ Verified</span>}
            </div>
            <p style={styles.city}>📍 {v.city}</p>
            <p style={styles.services}>{v.services}</p>
            <div style={styles.footer}>
              <span style={styles.rating}>⭐ {v.rating}/5</span>
              <span style={styles.phone}>📞 {v.phone}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DIY Section */}
      <div style={styles.diySection}>
        <h3>🔧 {t.diy}</h3>
        <p>After completing your assessment, download a personalized Blueprint PDF that includes:</p>
        <ul style={styles.diyList}>
          <li>📐 Exact dimensions for your recommended structures</li>
          <li>📋 Complete Bill of Materials (BOM) with local price estimates</li>
          <li>🔧 Step-by-step installation guide</li>
          <li>💰 Cost breakdown and payback analysis</li>
          <li>📜 Subsidy information for your state</li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: '20px auto', padding: 10 },
  title: { color: '#1a73e8', textAlign: 'center', marginBottom: 8 },
  desc: { textAlign: 'center', color: '#666', marginBottom: 24 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
  card: { background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  vendorName: { fontSize: 16, color: '#333' },
  badge: { fontSize: 12, color: '#2e7d32', fontWeight: 600 },
  city: { color: '#1a73e8', fontSize: 14, marginBottom: 6 },
  services: { fontSize: 13, color: '#555', marginBottom: 10 },
  footer: { display: 'flex', justifyContent: 'space-between', fontSize: 13 },
  rating: { color: '#f57f17' },
  phone: { color: '#666' },
  diySection: { marginTop: 30, background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  diyList: { paddingLeft: 20, marginTop: 12, lineHeight: 2 }
};
