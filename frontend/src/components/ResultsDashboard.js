import React from 'react';
import translations from '../i18n/translations';
import { generateBlueprintPDF } from '../utils/pdfGenerator';

export default function ResultsDashboard({ results, lang }) {
  const t = (translations[lang] || translations.en).results;
  const u = (translations[lang] || translations.en).units;
  const wt = (translations[lang] || translations.en).weather;

  if (!results) return null;

  const { feasibility, location_data, harvesting, water_demand, recommended_structures,
    structure_dimensions, cost_estimation, cost_benefit, subsidies, weather } = results;

  const feasibilityColor = feasibility.score >= 80 ? '#1b8a2d' :
    feasibility.score >= 60 ? '#2e7d32' : feasibility.score >= 40 ? '#f57f17' : '#c62828';

  // Calculate predicted harvest from weather forecast
  let predictedHarvest = null;
  if (weather && weather.predicted_rain_mm > 0 && results.user) {
    predictedHarvest = Math.round(results.user.roofAreaSqm * (weather.predicted_rain_mm / 1000) * 0.85 * 1000);
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t.title}</h2>

      {/* Feasibility */}
      <div style={{...styles.card, borderLeft: `4px solid ${feasibilityColor}`}}>
        <h3 style={styles.cardTitle}>{t.feasibility}</h3>
        <div style={{...styles.scoreBox, background: feasibilityColor}}>
          <span style={styles.scoreText}>{feasibility.feasibility}</span>
          <span style={styles.scoreNum}>{feasibility.score}/100</span>
        </div>
        <ul style={styles.list}>
          {feasibility.reasons.map((r, i) => <li key={i} style={styles.listItem}>{r}</li>)}
        </ul>
      </div>

      {/* Location Data */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{t.locationData}</h3>
        <div style={styles.grid}>
          <DataItem label={t.rainfall} value={`${location_data.annual_rainfall_mm} ${u.mm}`} icon="🌧️" />
          <DataItem label={t.gwDepth} value={`${location_data.groundwater_depth_m} ${u.meters}`} icon="💧" />
          <DataItem label={t.aquifer} value={location_data.principal_aquifer} icon="🪨" />
          <DataItem label={t.soilType} value={location_data.soil_type} icon="🏔️" />
          <DataItem label={t.rechargeRate} value={`${location_data.recharge_rate_mm_per_year} ${u.mm}/yr`} icon="♻️" />
        </div>
      </div>

      {/* Weather Forecast */}
      {weather && (
        <div style={{...styles.card, background: '#e3f2fd'}}>
          <h3 style={styles.cardTitle}>{wt.forecast}</h3>
          {weather.current && (
            <p style={styles.weatherCurrent}>
              📍 {weather.current.city}: {weather.current.temp}°C, {weather.current.description}, 💧 Humidity: {weather.current.humidity}%
            </p>
          )}
          {predictedHarvest && (
            <div style={styles.predictBox}>
              <span style={styles.predictText}>
                🔮 {wt.predictedHarvest} <strong>{predictedHarvest.toLocaleString()} {wt.liters}</strong>
              </span>
            </div>
          )}
          {weather.forecast && weather.forecast.length > 0 && (
            <div style={styles.forecastGrid}>
              {weather.forecast.slice(0, 5).map((day, i) => (
                <div key={i} style={styles.forecastDay}>
                  <div style={styles.forecastDate}>{day.date}</div>
                  <div>🌧️ {day.rain_mm} mm</div>
                  <div>🌡️ {day.avg_temp_c}°C</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Harvesting Potential */}
      <div style={{...styles.card, background: '#e8f5e9'}}>
        <h3 style={styles.cardTitle}>{t.harvesting}</h3>
        <div style={styles.grid}>
          <DataItem label={t.annualPotential} value={`${harvesting.annual_potential_liters.toLocaleString()} ${u.liters}`} icon="🏠" big />
          <DataItem label={t.dailyHarvest} value={`${harvesting.daily_harvest_liters.toLocaleString()} ${u.lpd}`} icon="💦" />
          <DataItem label={t.runoff} value={`${harvesting.annual_runoff_liters.toLocaleString()} ${u.liters}`} icon="🌊" />
          <DataItem label={t.supplyDays} value={`${harvesting.supply_days_per_year} ${u.days}`} icon="📅" />
          <DataItem label={t.demandMet} value={`${harvesting.percentage_demand_met}%`} icon="✅" />
        </div>
        <div style={styles.demandBar}>
          <div style={{...styles.demandFill, width: `${Math.min(harvesting.percentage_demand_met, 100)}%`}} />
        </div>
        <p style={styles.demandText}>
          Water demand: {water_demand.dailyDemandLiters} {u.lpd} ({water_demand.perCapitaLpd} per capita)
        </p>
      </div>

      {/* Recommended Structures */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{t.structures}</h3>
        {recommended_structures.map((s, i) => (
          <div key={i} style={styles.structureCard}>
            <h4 style={styles.structureName}>{s.name}</h4>
            <p>{s.description}</p>
            <p><strong>Suitable for:</strong> {s.suitable_for}</p>
            <p><strong>Typical Dimensions:</strong> {s.typical_dimensions}</p>
            <p><strong>Cost Range:</strong> ₹{s.cost_range_inr}</p>
          </div>
        ))}
      </div>

      {/* Structure Dimensions */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{t.dimensions}</h3>
        <div style={styles.dimsGrid}>
          <DimensionBox title="Recharge Pit"
            details={[
              `${structure_dimensions.recharge_pit.width_m}m × ${structure_dimensions.recharge_pit.length_m}m × ${structure_dimensions.recharge_pit.depth_m}m`,
              `Volume: ${structure_dimensions.recharge_pit.volume_cum} m³`,
              structure_dimensions.recharge_pit.filter_media
            ]} color="#1565c0" />
          <DimensionBox title="Recharge Trench"
            details={[
              `${structure_dimensions.recharge_trench.width_m}m × ${structure_dimensions.recharge_trench.length_m}m × ${structure_dimensions.recharge_trench.depth_m}m`,
              `Volume: ${structure_dimensions.recharge_trench.volume_cum} m³`,
              structure_dimensions.recharge_trench.filter_media
            ]} color="#2e7d32" />
          <DimensionBox title="Recharge Shaft"
            details={[
              `Diameter: ${structure_dimensions.recharge_shaft.diameter_m}m`,
              `Depth: ${structure_dimensions.recharge_shaft.depth_m}m`,
              `Number: ${structure_dimensions.recharge_shaft.number_of_shafts}`,
              structure_dimensions.recharge_shaft.filter_media
            ]} color="#6a1b9a" />
          <DimensionBox title="Storage Tank"
            details={[
              `Capacity: ${structure_dimensions.storage_tank.capacity_liters.toLocaleString()} liters`,
              `Type: ${structure_dimensions.storage_tank.type}`
            ]} color="#e65100" />
        </div>
      </div>

      {/* Cost Estimation */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{t.costs}</h3>
        {Object.entries(cost_estimation).map(([key, items]) => (
          <div key={key} style={styles.costBlock}>
            <h4 style={styles.costTitle}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
            <table style={styles.costTable}>
              <tbody>
                {Object.entries(items).filter(([k]) => k !== 'total').map(([item, cost]) => (
                  <tr key={item}>
                    <td style={styles.costItem}>{item.replace(/_/g, ' ')}</td>
                    <td style={styles.costValue}>₹{cost.toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={styles.costTotalRow}>
                  <td style={styles.costItem}><strong>Total</strong></td>
                  <td style={styles.costValue}><strong>₹{items.total.toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Cost-Benefit Analysis */}
      <div style={{...styles.card, background: '#fff3e0'}}>
        <h3 style={styles.cardTitle}>{t.costBenefit}</h3>
        <div style={styles.grid}>
          <DataItem label={t.payback} value={`${cost_benefit.paybackYears} ${u.years}`} icon="⏱️" big />
          <DataItem label={t.annualSaving} value={`${u.inr}${cost_benefit.annualSavingTanker.toLocaleString()}`} icon="💰" />
          <DataItem label={t.totalSaving} value={`${u.inr}${cost_benefit.totalSaving20Years.toLocaleString()}`} icon="📈" />
        </div>
      </div>

      {/* Subsidies */}
      {subsidies && subsidies.length > 0 && (
        <div style={{...styles.card, background: '#e8eaf6'}}>
          <h3 style={styles.cardTitle}>📋 Available Subsidies & Incentives</h3>
          {subsidies.map((s, i) => (
            <div key={i} style={styles.subsidyCard}>
              <h4>{s.name}</h4>
              <p>{s.description}</p>
              {s.subsidy_percentage && <p><strong>Subsidy:</strong> {s.subsidy_percentage}</p>}
              {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" style={styles.link}>More Info →</a>}
            </div>
          ))}
        </div>
      )}

      {/* Download PDF */}
      <button onClick={() => generateBlueprintPDF(results, t)}
        style={styles.pdfButton}>
        📄 {t.downloadPdf}
      </button>
    </div>
  );
}

function DataItem({ label, value, icon, big }) {
  return (
    <div style={{...styles.dataItem, ...(big ? styles.dataBig : {})}}>
      <span style={styles.dataIcon}>{icon}</span>
      <div>
        <div style={styles.dataLabel}>{label}</div>
        <div style={big ? styles.dataValueBig : styles.dataValue}>{value}</div>
      </div>
    </div>
  );
}

function DimensionBox({ title, details, color }) {
  return (
    <div style={{...styles.dimBox, borderTop: `3px solid ${color}`}}>
      <h4 style={{color, marginBottom: 8}}>{title}</h4>
      {details.map((d, i) => <p key={i} style={styles.dimDetail}>{d}</p>)}
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: '20px auto', padding: 10 },
  title: { color: '#1a73e8', textAlign: 'center', marginBottom: 24 },
  card: { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle: { color: '#333', marginBottom: 16, fontSize: 18 },
  grid: { display: 'flex', flexWrap: 'wrap', gap: 12 },
  scoreBox: { display: 'inline-flex', alignItems: 'center', gap: 12, padding: '8px 20px', borderRadius: 8, color: '#fff', marginBottom: 12 },
  scoreText: { fontSize: 16, fontWeight: 700 },
  scoreNum: { fontSize: 14 },
  list: { paddingLeft: 20 },
  listItem: { marginBottom: 4, color: '#555' },
  dataItem: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 160, padding: '8px 12px', background: '#f8f9fa', borderRadius: 8 },
  dataBig: { minWidth: 220, background: '#e8f5e9' },
  dataIcon: { fontSize: 24 },
  dataLabel: { fontSize: 12, color: '#666' },
  dataValue: { fontSize: 14, fontWeight: 600 },
  dataValueBig: { fontSize: 18, fontWeight: 700, color: '#1b8a2d' },
  demandBar: { height: 8, background: '#e0e0e0', borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  demandFill: { height: '100%', background: '#2e7d32', borderRadius: 4, transition: 'width 0.5s' },
  demandText: { fontSize: 13, color: '#666', marginTop: 6 },
  structureCard: { background: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 12 },
  structureName: { color: '#1565c0', marginBottom: 6 },
  dimsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 },
  dimBox: { background: '#f8f9fa', padding: 16, borderRadius: 8 },
  dimDetail: { fontSize: 13, marginBottom: 4, color: '#555' },
  costBlock: { marginBottom: 16 },
  costTitle: { color: '#1565c0', marginBottom: 8, textTransform: 'capitalize' },
  costTable: { width: '100%', borderCollapse: 'collapse' },
  costItem: { padding: '4px 8px', borderBottom: '1px solid #eee', textTransform: 'capitalize', fontSize: 13 },
  costValue: { padding: '4px 8px', borderBottom: '1px solid #eee', textAlign: 'right', fontSize: 13 },
  costTotalRow: { background: '#f0f7ff' },
  subsidyCard: { background: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 12 },
  link: { color: '#1a73e8', textDecoration: 'none', fontWeight: 600 },
  pdfButton: { display: 'block', margin: '20px auto', padding: '14px 32px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  weatherCurrent: { fontSize: 14, marginBottom: 8 },
  predictBox: { background: '#bbdefb', padding: 12, borderRadius: 8, marginBottom: 12, textAlign: 'center' },
  predictText: { fontSize: 16 },
  forecastGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  forecastDay: { background: '#fff', padding: 10, borderRadius: 8, minWidth: 100, textAlign: 'center', fontSize: 12 },
  forecastDate: { fontWeight: 700, marginBottom: 4 }
};
