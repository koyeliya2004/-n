const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const cgwbData = require('../data/cgwb_data.json');
const calc = require('../calculations');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';

// GET /api/states - List all states and districts
router.get('/states', (req, res) => {
  const states = {};
  for (const [state, data] of Object.entries(cgwbData.states)) {
    states[state] = {
      districts: Object.keys(data.districts),
      avg_rainfall_mm: data.avg_rainfall_mm,
      principal_aquifer: data.principal_aquifer
    };
  }
  res.json(states);
});

// GET /api/district-data/:state/:district - Get district-level data
router.get('/district-data/:state/:district', (req, res) => {
  const { state, district } = req.params;
  const stateData = cgwbData.states[state];
  if (!stateData) return res.status(404).json({ error: 'State not found' });

  const districtData = stateData.districts[district];
  if (!districtData) {
    return res.json({
      rainfall_mm: stateData.avg_rainfall_mm,
      gw_depth_m: stateData.avg_groundwater_depth_m,
      aquifer: stateData.principal_aquifer,
      recharge_rate: stateData.recharge_rate_mm_per_year,
      soil_type: stateData.soil_type,
      source: 'state_average'
    });
  }

  res.json({
    ...districtData,
    soil_type: stateData.soil_type,
    source: 'district_data'
  });
});

// GET /api/weather/:lat/:lon - Get current and forecast weather from OpenWeather
router.get('/weather/:lat/:lon', async (req, res) => {
  const { lat, lon } = req.params;
  if (!OPENWEATHER_API_KEY) {
    return res.status(503).json({ error: 'Weather API key not configured' });
  }
  try {
    const weatherBaseUrl = 'https://api.openweathermap.org/data/2.5';
    const params = `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${encodeURIComponent(OPENWEATHER_API_KEY)}&units=metric`;
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${weatherBaseUrl}/weather?${params}`),
      fetch(`${weatherBaseUrl}/forecast?${params}`)
    ]);

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    if (current.cod && current.cod !== 200) {
      return res.status(502).json({ error: 'Weather API error', details: current.message });
    }

    // Calculate predicted harvest for next 5 days
    let totalRainMm = 0;
    const dailyForecast = [];

    if (forecast.list) {
      const dayMap = {};
      for (const entry of forecast.list) {
        const date = entry.dt_txt.split(' ')[0];
        if (!dayMap[date]) dayMap[date] = { rain: 0, temp: 0, count: 0 };
        dayMap[date].rain += (entry.rain && entry.rain['3h']) || 0;
        dayMap[date].temp += entry.main.temp;
        dayMap[date].count++;
      }

      for (const [date, data] of Object.entries(dayMap)) {
        totalRainMm += data.rain;
        dailyForecast.push({
          date,
          rain_mm: Math.round(data.rain * 10) / 10,
          avg_temp_c: Math.round((data.temp / data.count) * 10) / 10
        });
      }
    }

    res.json({
      current: {
        temp: current.main && current.main.temp,
        humidity: current.main && current.main.humidity,
        description: current.weather && current.weather[0] && current.weather[0].description,
        rain_1h_mm: current.rain && current.rain['1h'] || 0,
        city: current.name
      },
      forecast: dailyForecast.slice(0, 7),
      predicted_rain_mm: Math.round(totalRainMm * 10) / 10
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather data', details: err.message });
  }
});

// POST /api/assess - Main assessment endpoint
router.post('/assess', (req, res) => {
  const {
    name,
    state,
    district,
    lat,
    lon,
    numDwellers,
    roofAreaSqm,
    openSpaceSqm,
    isUrban
  } = req.body;

  // Validation
  if (!state || !roofAreaSqm || roofAreaSqm <= 0) {
    return res.status(400).json({ error: 'State and valid roof area are required' });
  }

  const stateData = cgwbData.states[state];
  if (!stateData) return res.status(404).json({ error: 'State not found in database' });

  const districtData = stateData.districts[district] || {};
  const rainfallMm = districtData.rainfall_mm || stateData.avg_rainfall_mm;
  const gwDepthM = districtData.gw_depth_m || stateData.avg_groundwater_depth_m;
  const aquifer = districtData.aquifer || stateData.principal_aquifer;
  const rechargeRate = districtData.recharge_rate || stateData.recharge_rate_mm_per_year;
  const soilType = stateData.soil_type;
  const dwellers = numDwellers || 4;
  const openSpace = openSpaceSqm || 5;

  // Calculations
  const harvestPotential = calc.calculateHarvestingPotential(roofAreaSqm, rainfallMm);
  const waterDemand = calc.calculateWaterDemand(dwellers, isUrban !== false);
  const annualRunoff = calc.calculateRunoff(roofAreaSqm, rainfallMm);
  const supplyDays = calc.calculateSupplyDays(harvestPotential, waterDemand.dailyDemandLiters);
  const feasibility = calc.assessFeasibility(roofAreaSqm, rainfallMm, openSpace, gwDepthM);

  const structures = calc.recommendStructures(
    roofAreaSqm, openSpace, gwDepthM, aquifer,
    cgwbData.recharge_structures
  );

  const dimensions = calc.calculateStructureDimensions(annualRunoff, gwDepthM, soilType);
  const costs = calc.calculateCosts(dimensions, cgwbData.cost_data);

  // Find cheapest recommended structure
  const cheapestCost = structures.length > 0
    ? costs[structures[0].type] ? costs[structures[0].type].total : 10000
    : 10000;

  const costBenefit = calc.calculateCostBenefit(
    cheapestCost, harvestPotential, cgwbData.cost_data
  );

  // Subsidy info
  const subsidyInfo = [];
  if (cgwbData.subsidies.central_government) {
    subsidyInfo.push(cgwbData.subsidies.central_government);
  }
  if (cgwbData.subsidies.states[state]) {
    subsidyInfo.push(cgwbData.subsidies.states[state]);
  }

  res.json({
    user: { name: name || 'User', state, district, lat, lon, numDwellers: dwellers, roofAreaSqm, openSpaceSqm: openSpace },
    location_data: {
      annual_rainfall_mm: rainfallMm,
      groundwater_depth_m: gwDepthM,
      principal_aquifer: aquifer,
      recharge_rate_mm_per_year: rechargeRate,
      soil_type: soilType
    },
    feasibility,
    harvesting: {
      annual_potential_liters: harvestPotential,
      annual_runoff_liters: annualRunoff,
      daily_harvest_liters: Math.round(harvestPotential / 365),
      supply_days_per_year: Math.min(supplyDays, 365),
      percentage_demand_met: Math.min(Math.round((harvestPotential / waterDemand.annualDemandLiters) * 100), 100)
    },
    water_demand: waterDemand,
    recommended_structures: structures,
    structure_dimensions: dimensions,
    cost_estimation: costs,
    cost_benefit: costBenefit,
    subsidies: subsidyInfo
  });
});

// GET /api/subsidies/:state - Get subsidy information
router.get('/subsidies/:state', (req, res) => {
  const { state } = req.params;
  const result = [];
  if (cgwbData.subsidies.central_government) {
    result.push({ level: 'Central', ...cgwbData.subsidies.central_government });
  }
  if (cgwbData.subsidies.states[state]) {
    result.push({ level: 'State', ...cgwbData.subsidies.states[state] });
  }
  res.json(result);
});

// Community & Gamification endpoints

// In-memory store for demo (in production, use a database)
const communityData = {
  users: [],
  totalRechargeLiters: 0
};

// POST /api/community/register - Register water recharge
router.post('/community/register', (req, res) => {
  const { userName, location, rechargeLiters } = req.body;
  if (!userName || !rechargeLiters) {
    return res.status(400).json({ error: 'userName and rechargeLiters required' });
  }

  const existing = communityData.users.find(u => u.userName === userName);
  if (existing) {
    existing.rechargeLiters += rechargeLiters;
    existing.waterCredits += Math.round(rechargeLiters / 10);
  } else {
    communityData.users.push({
      userName,
      location: location || 'Unknown',
      rechargeLiters,
      waterCredits: Math.round(rechargeLiters / 10),
      joinedAt: new Date().toISOString()
    });
  }
  communityData.totalRechargeLiters += rechargeLiters;

  res.json({ success: true, totalCommunityRecharge: communityData.totalRechargeLiters });
});

// GET /api/community/leaderboard - Get water credit leaderboard
router.get('/community/leaderboard', (req, res) => {
  const sorted = [...communityData.users].sort((a, b) => b.waterCredits - a.waterCredits);
  const olympicPoolLiters = 2500000;
  res.json({
    leaderboard: sorted.slice(0, 50),
    totalUsers: communityData.users.length,
    totalRechargeLiters: communityData.totalRechargeLiters,
    olympicPoolsEquivalent: Math.round((communityData.totalRechargeLiters / olympicPoolLiters) * 100) / 100
  });
});

// GET /api/community/impact - Get community impact stats
router.get('/community/impact', (req, res) => {
  const olympicPoolLiters = 2500000;
  res.json({
    totalUsers: communityData.users.length,
    totalRechargeLiters: communityData.totalRechargeLiters,
    olympicPoolsEquivalent: Math.round((communityData.totalRechargeLiters / olympicPoolLiters) * 100) / 100,
    averagePerUser: communityData.users.length > 0
      ? Math.round(communityData.totalRechargeLiters / communityData.users.length)
      : 0
  });
});

// GET /api/structures - Get all recharge structure types
router.get('/structures', (req, res) => {
  res.json(cgwbData.recharge_structures);
});

module.exports = router;
