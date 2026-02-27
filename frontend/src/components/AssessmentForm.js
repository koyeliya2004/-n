import React, { useState, useEffect, useCallback } from 'react';
import translations from '../i18n/translations';
import { fetchStates, submitAssessment, fetchWeather } from '../utils/api';
import LocationMap from './LocationMap';

export default function AssessmentForm({ onResults, lang }) {
  const t = translations[lang] || translations.en;
  const [states, setStates] = useState({});
  const [form, setForm] = useState({
    name: '',
    state: '',
    district: '',
    lat: 20.5937,
    lon: 78.9629,
    numDwellers: 4,
    roofAreaSqm: 100,
    openSpaceSqm: 10,
    isUrban: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStates().then(setStates).catch(() => setError('Could not load state data'));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleMapClick = useCallback((lat, lon) => {
    setForm(prev => ({ ...prev, lat, lon }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const results = await submitAssessment(form);
      // Fetch weather data if lat/lon available
      let weather = null;
      try {
        weather = await fetchWeather(form.lat, form.lon);
      } catch { /* weather is optional */ }
      onResults({ ...results, weather });
    } catch (err) {
      setError(err.message || 'Assessment failed. Please try again.');
    }
    setLoading(false);
  };

  const districts = form.state && states[form.state] ? states[form.state].districts : [];

  return (
    <div className="assessment-form" style={styles.container}>
      <h2 style={styles.title}>{t.form.title}</h2>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>{t.form.name}</label>
            <input name="name" value={form.name} onChange={handleChange}
              style={styles.input} placeholder={t.form.name} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>{t.form.dwellers}</label>
            <input name="numDwellers" type="number" min="1" value={form.numDwellers}
              onChange={handleChange} style={styles.input} />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>{t.form.state}</label>
            <select name="state" value={form.state} onChange={handleChange} style={styles.input}>
              <option value="">{t.form.state}</option>
              {Object.keys(states).sort().map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>{t.form.district}</label>
            <select name="district" value={form.district} onChange={handleChange} style={styles.input}>
              <option value="">{t.form.district}</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>{t.form.roofArea}</label>
            <input name="roofAreaSqm" type="number" min="1" value={form.roofAreaSqm}
              onChange={handleChange} style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>{t.form.openSpace}</label>
            <input name="openSpaceSqm" type="number" min="0" value={form.openSpaceSqm}
              onChange={handleChange} style={styles.input} />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.checkLabel}>
            <input name="isUrban" type="checkbox" checked={form.isUrban}
              onChange={handleChange} style={styles.checkbox} />
            {t.form.isUrban}
          </label>
        </div>

        <div style={styles.mapSection}>
          <label style={styles.label}>{t.form.pickOnMap}</label>
          <LocationMap lat={form.lat} lon={form.lon} onMapClick={handleMapClick} />
          <div style={styles.coords}>
            Lat: {form.lat.toFixed(4)}, Lon: {form.lon.toFixed(4)}
          </div>
        </div>

        <button type="submit" disabled={loading || !form.state}
          style={{...styles.button, opacity: (loading || !form.state) ? 0.6 : 1}}>
          {loading ? '⏳ Analyzing...' : t.form.submit}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: 800, margin: '20px auto', padding: 20, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  title: { color: '#1a73e8', marginBottom: 20, textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  field: { flex: 1, minWidth: 200 },
  label: { display: 'block', marginBottom: 4, fontWeight: 600, color: '#333', fontSize: 14 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 14, outline: 'none' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600 },
  checkbox: { width: 18, height: 18 },
  button: { padding: '14px 24px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 10 },
  error: { background: '#fde8e8', color: '#c00', padding: 12, borderRadius: 8, marginBottom: 10 },
  mapSection: { marginTop: 10 },
  coords: { textAlign: 'center', color: '#666', fontSize: 13, marginTop: 4 }
};
