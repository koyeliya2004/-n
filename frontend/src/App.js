import React, { useState } from 'react';
import AssessmentForm from './components/AssessmentForm';
import ResultsDashboard from './components/ResultsDashboard';
import CommunityDashboard from './components/CommunityDashboard';
import Marketplace from './components/Marketplace';
import SubsidyTracker from './components/SubsidyTracker';
import translations from './i18n/translations';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'mr', label: 'मराठी' }
];

export default function App() {
  const [lang, setLang] = useState('en');
  const [page, setPage] = useState('home');
  const [results, setResults] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const t = translations[lang] || translations.en;

  const handleResults = (data) => {
    setResults(data);
    setSelectedState(data.user.state);
    setPage('results');
  };

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo} onClick={() => setPage('home')}>
            <span style={styles.logoIcon}>💧</span>
            <div>
              <h1 style={styles.appName}>{t.appName}</h1>
              <p style={styles.tagline}>{t.tagline}</p>
            </div>
          </div>
          <div style={styles.langSelect}>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                style={{...styles.langBtn, ...(lang === l.code ? styles.langActive : {})}}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={styles.nav}>
        {[
          { key: 'home', icon: '🏠' },
          { key: 'assess', icon: '📋' },
          { key: 'results', icon: '📊' },
          { key: 'community', icon: '👥' },
          { key: 'marketplace', icon: '🏪' },
          { key: 'subsidies', icon: '📜' }
        ].map(item => (
          <button key={item.key} onClick={() => setPage(item.key)}
            style={{...styles.navBtn, ...(page === item.key ? styles.navActive : {})}}>
            {item.icon} {t.nav[item.key]}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        {page === 'home' && (
          <div style={styles.hero}>
            <h2 style={styles.heroTitle}>{t.appName}</h2>
            <p style={styles.heroSubtitle}>{t.subtitle}</p>
            <div style={styles.heroCards}>
              <FeatureCard icon="🌧️" title="Feasibility Check" desc="Assess if rooftop rainwater harvesting is feasible at your location based on CGWB data" />
              <FeatureCard icon="🔬" title="Scientific Analysis" desc="GIS-based analysis using real rainfall, aquifer, and groundwater data from CGWB" />
              <FeatureCard icon="📐" title="Structure Design" desc="Get recommended dimensions for recharge pits, trenches, and shafts" />
              <FeatureCard icon="💰" title="Cost-Benefit" desc="Complete cost estimation with payback period and 20-year savings analysis" />
              <FeatureCard icon="🌍" title="Weather Integration" desc="Real-time weather data and predictive harvest using OpenWeather API" />
              <FeatureCard icon="🏆" title="Community Impact" desc="Water Credit leaderboard, community impact tracking, and neighborhood competition" />
              <FeatureCard icon="📄" title="DIY Blueprint" desc="Download personalized PDF with bill of materials and local pricing" />
              <FeatureCard icon="📋" title="Subsidy Tracker" desc="Track government subsidies, rebates, and tax incentives for your area" />
            </div>
            <button onClick={() => setPage('assess')} style={styles.ctaBtn}>
              🚀 Start Assessment
            </button>

            {/* About Section */}
            <div style={styles.aboutSection}>
              <h3 style={styles.aboutTitle}>About This Application</h3>
              <p style={styles.aboutText}>
                Groundwater replenishment is a critical factor for the augmentation and sustainability of water resources in India.
                There is significant potential in both rural and urban areas for harvesting rainwater from individual rooftops.
                The Central Ground Water Board (CGWB) has published several scientific manuals and reports on rooftop rainwater harvesting (RTRWH) potential.
              </p>
              <p style={styles.aboutText}>
                This application enables users to easily estimate the feasibility of rooftop rainwater harvesting (RTRWH) and artificial recharge at their locations.
                By entering simple details such as name, location, number of dwellers, roof area, and available open space,
                the system generates personalized outputs using algorithmic models based on CGWB data.
              </p>
              <div style={styles.techGrid}>
                <div style={styles.techCard}>
                  <h4>🛰️ Computer Vision Ready</h4>
                  <p>Pin location on map for area assessment. Future: auto roof detection via satellite imagery.</p>
                </div>
                <div style={styles.techCard}>
                  <h4>🌦️ Hyper-Local Weather</h4>
                  <p>OpenWeather API integration for real-time and predictive rainfall analytics.</p>
                </div>
                <div style={styles.techCard}>
                  <h4>🗺️ Geological Data</h4>
                  <p>CGWB data for aquifer types, groundwater depth, and recharge rates across India.</p>
                </div>
                <div style={styles.techCard}>
                  <h4>🎮 Gamification</h4>
                  <p>Water Credit leaderboard and community impact tracking to encourage participation.</p>
                </div>
                <div style={styles.techCard}>
                  <h4>📱 AR Ready</h4>
                  <p>Future: AR visualization to show where recharge structures fit in your yard.</p>
                </div>
                <div style={styles.techCard}>
                  <h4>🌐 Multi-Language</h4>
                  <p>Available in English, Hindi, Tamil, Telugu, Bengali, and Marathi.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {page === 'assess' && (
          <AssessmentForm onResults={handleResults} lang={lang} />
        )}

        {page === 'results' && (
          results ? <ResultsDashboard results={results} lang={lang} />
            : <div style={styles.noResults}>
                <p>No assessment results yet. Please complete an assessment first.</p>
                <button onClick={() => setPage('assess')} style={styles.ctaBtn}>Go to Assessment</button>
              </div>
        )}

        {page === 'community' && (
          <CommunityDashboard lang={lang} userName={results ? results.user.name : ''} />
        )}

        {page === 'marketplace' && (
          <Marketplace lang={lang} />
        )}

        {page === 'subsidies' && (
          <SubsidyTracker lang={lang} state={selectedState} />
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>JalSanchay © 2024 | Data Source: Central Ground Water Board (CGWB), Ministry of Jal Shakti, Govt. of India</p>
        <p>Weather data powered by OpenWeather API | Designed for public participation in groundwater conservation</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={styles.featureCard}>
      <div style={styles.featureIcon}>{icon}</div>
      <h4 style={styles.featureTitle}>{title}</h4>
      <p style={styles.featureDesc}>{desc}</p>
    </div>
  );
}

const styles = {
  app: { minHeight: '100vh', background: '#f0f4f8' },
  header: { background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', padding: '16px 20px', color: '#fff' },
  headerInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  logo: { display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' },
  logoIcon: { fontSize: 36 },
  appName: { fontSize: 24, fontWeight: 700, margin: 0 },
  tagline: { fontSize: 12, opacity: 0.9, margin: 0 },
  langSelect: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  langBtn: { padding: '6px 12px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 12 },
  langActive: { background: '#fff', color: '#1a73e8', fontWeight: 700 },
  nav: { background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'center', gap: 4, padding: '8px 12px', flexWrap: 'wrap' },
  navBtn: { padding: '8px 16px', border: 'none', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 14, color: '#333', fontWeight: 500 },
  navActive: { background: '#e3f2fd', color: '#1a73e8', fontWeight: 700 },
  main: { maxWidth: 1200, margin: '0 auto', padding: '20px 16px', minHeight: 'calc(100vh - 200px)' },
  hero: { textAlign: 'center', padding: '40px 0' },
  heroTitle: { fontSize: 36, color: '#1a73e8', marginBottom: 8 },
  heroSubtitle: { fontSize: 18, color: '#555', marginBottom: 32 },
  heroCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 },
  featureCard: { background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' },
  featureIcon: { fontSize: 36, marginBottom: 8 },
  featureTitle: { color: '#333', marginBottom: 6 },
  featureDesc: { fontSize: 13, color: '#666', lineHeight: 1.5 },
  ctaBtn: { padding: '16px 40px', background: 'linear-gradient(135deg, #1a73e8, #0d47a1)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(26,115,232,0.3)' },
  noResults: { textAlign: 'center', padding: 40 },
  aboutSection: { marginTop: 40, textAlign: 'left', maxWidth: 800, margin: '40px auto 0' },
  aboutTitle: { color: '#1a73e8', marginBottom: 12 },
  aboutText: { color: '#555', lineHeight: 1.8, marginBottom: 12 },
  techGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 20 },
  techCard: { background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  footer: { background: '#1a237e', color: '#fff', textAlign: 'center', padding: '16px 20px', fontSize: 12, opacity: 0.9 }
};
