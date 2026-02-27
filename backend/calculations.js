/**
 * RTRWH Calculation Engine
 * Based on CGWB (Central Ground Water Board) guidelines for
 * Rooftop Rainwater Harvesting and Artificial Recharge
 */

const ROOF_RUNOFF_COEFFICIENT = 0.85; // Standard for concrete/tiled roofs
const FIRST_FLUSH_MM = 2.5; // First 2.5mm discarded for cleaning
const LITERS_PER_CUM = 1000;

/**
 * Calculate annual rainwater harvesting potential
 * Formula from CGWB: Volume = Roof Area × Rainfall × Runoff Coefficient
 */
function calculateHarvestingPotential(roofAreaSqm, annualRainfallMm) {
  const effectiveRainfall = annualRainfallMm - (FIRST_FLUSH_MM * 52); // Weekly first flush
  const effectiveRainfallCapped = Math.max(effectiveRainfall, annualRainfallMm * 0.8);
  const volumeLiters = roofAreaSqm * (effectiveRainfallCapped / 1000) * ROOF_RUNOFF_COEFFICIENT * LITERS_PER_CUM;
  return Math.round(volumeLiters);
}

/**
 * Calculate daily water demand based on number of dwellers
 * Per capita water demand: 135 liters/day (urban), 55 liters/day (rural) as per IS:1172
 */
function calculateWaterDemand(numDwellers, isUrban = true) {
  const perCapitaLpd = isUrban ? 135 : 55;
  return {
    dailyDemandLiters: numDwellers * perCapitaLpd,
    annualDemandLiters: numDwellers * perCapitaLpd * 365,
    perCapitaLpd
  };
}

/**
 * Calculate runoff from the roof
 * Q = C × I × A where C = runoff coefficient, I = rainfall intensity, A = area
 */
function calculateRunoff(roofAreaSqm, rainfallMm) {
  const runoffLiters = roofAreaSqm * (rainfallMm / 1000) * ROOF_RUNOFF_COEFFICIENT * LITERS_PER_CUM;
  return Math.round(runoffLiters);
}

/**
 * Calculate number of days water supply from harvested rainwater
 */
function calculateSupplyDays(harvestedLiters, dailyDemandLiters) {
  if (dailyDemandLiters === 0) return 365;
  return Math.round(harvestedLiters / dailyDemandLiters);
}

/**
 * Feasibility assessment
 */
function assessFeasibility(roofAreaSqm, rainfallMm, openSpaceSqm, gwDepthM) {
  const score = calculateFeasibilityScore(roofAreaSqm, rainfallMm, openSpaceSqm, gwDepthM);

  let feasibility;
  if (score >= 80) feasibility = 'Highly Feasible';
  else if (score >= 60) feasibility = 'Feasible';
  else if (score >= 40) feasibility = 'Moderately Feasible';
  else feasibility = 'Low Feasibility - Consider alternatives';

  const reasons = [];
  if (roofAreaSqm < 20) reasons.push('Roof area is very small (< 20 sq.m)');
  if (rainfallMm < 400) reasons.push('Low annual rainfall (< 400mm)');
  if (openSpaceSqm < 1) reasons.push('Insufficient open space for recharge structure');
  if (gwDepthM < 2) reasons.push('Groundwater level is very shallow');
  if (roofAreaSqm >= 50) reasons.push('Good roof area for harvesting');
  if (rainfallMm >= 800) reasons.push('Adequate rainfall for effective harvesting');
  if (openSpaceSqm >= 5) reasons.push('Sufficient open space for recharge structures');

  return { feasibility, score, reasons };
}

function calculateFeasibilityScore(roofAreaSqm, rainfallMm, openSpaceSqm, gwDepthM) {
  let score = 0;
  // Roof area score (max 30)
  if (roofAreaSqm >= 100) score += 30;
  else if (roofAreaSqm >= 50) score += 25;
  else if (roofAreaSqm >= 20) score += 15;
  else score += 5;

  // Rainfall score (max 30)
  if (rainfallMm >= 1500) score += 30;
  else if (rainfallMm >= 1000) score += 25;
  else if (rainfallMm >= 600) score += 20;
  else if (rainfallMm >= 400) score += 10;
  else score += 5;

  // Open space score (max 20)
  if (openSpaceSqm >= 20) score += 20;
  else if (openSpaceSqm >= 10) score += 15;
  else if (openSpaceSqm >= 5) score += 10;
  else if (openSpaceSqm >= 1) score += 5;

  // GW depth score (max 20) - deeper = more need for recharge
  if (gwDepthM >= 15) score += 20;
  else if (gwDepthM >= 10) score += 15;
  else if (gwDepthM >= 5) score += 10;
  else score += 5;

  return score;
}

/**
 * Recommend recharge structures based on CGWB guidelines
 */
function recommendStructures(roofAreaSqm, openSpaceSqm, gwDepthM, aquiferType, rechargeStructures) {
  const recommendations = [];

  for (const [key, structure] of Object.entries(rechargeStructures)) {
    if (openSpaceSqm < structure.min_open_space_sqm) continue;

    let suitabilityScore = 0;
    const aquiferMatch = structure.aquifer_suitability.some(
      a => a === 'All' || (aquiferType && aquiferType.toLowerCase().includes(a.toLowerCase()))
    );
    if (aquiferMatch) suitabilityScore += 40;

    // Size matching
    if (key === 'recharge_pit' && roofAreaSqm < 100) suitabilityScore += 30;
    if (key === 'recharge_trench' && roofAreaSqm >= 100 && roofAreaSqm < 300) suitabilityScore += 30;
    if (key === 'recharge_shaft' && gwDepthM > 8) suitabilityScore += 30;
    if (key === 'percolation_tank' && roofAreaSqm > 500) suitabilityScore += 30;
    if (key === 'rainwater_storage_tank') suitabilityScore += 20;

    if (suitabilityScore > 20) {
      recommendations.push({
        type: key,
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        suitabilityScore,
        ...structure
      });
    }
  }

  return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

/**
 * Calculate dimensions of recharge structures based on CGWB formulas
 */
function calculateStructureDimensions(runoffLiters, gwDepthM, soilType) {
  const runoffCum = runoffLiters / LITERS_PER_CUM;

  // Percolation rate based on soil type (m/day)
  const percolationRates = {
    'alluvial': 0.5,
    'sandy': 0.8,
    'laterite': 0.3,
    'red soil': 0.25,
    'black cotton': 0.15,
    'mountain': 0.35,
    'desert': 0.6,
    'default': 0.3
  };

  const soilKey = Object.keys(percolationRates).find(
    k => soilType && soilType.toLowerCase().includes(k)
  ) || 'default';
  const percolationRate = percolationRates[soilKey];

  // Recharge Pit: V = Q / (n * P * T)
  // Where Q = runoff volume, n = porosity (0.4 for filter media), P = percolation rate, T = retention time
  const pitPorosity = 0.4;
  const retentionDays = 3; // days to empty
  const pitVolumeCum = runoffCum / (pitPorosity * percolationRate * retentionDays * 30);
  const pitDepth = Math.min(Math.max(1.5, gwDepthM * 0.3), 3);
  const pitArea = pitVolumeCum / pitDepth;
  const pitSide = Math.sqrt(pitArea);

  // Recharge Trench
  const trenchWidth = 0.6; // m standard
  const trenchDepth = Math.min(Math.max(1.0, gwDepthM * 0.25), 2);
  const trenchLength = pitVolumeCum / (trenchWidth * trenchDepth);

  // Recharge Shaft
  const shaftDiameter = 0.3; // m
  const shaftDepth = Math.min(gwDepthM * 0.6, 15);
  const shaftArea = Math.PI * (shaftDiameter / 2) ** 2;
  const shaftCapacityCum = shaftArea * shaftDepth;
  const numShafts = Math.max(1, Math.ceil(runoffCum / (shaftCapacityCum * 100)));

  // Storage Tank
  const monthlyRunoffLiters = runoffLiters / 12;
  const tankSizeLiters = Math.round(monthlyRunoffLiters * 2);

  return {
    recharge_pit: {
      width_m: Math.round(pitSide * 10) / 10,
      length_m: Math.round(pitSide * 10) / 10,
      depth_m: Math.round(pitDepth * 10) / 10,
      volume_cum: Math.round(pitVolumeCum * 10) / 10,
      filter_media: 'Bottom: Boulders (40cm), Middle: Gravel (30cm), Top: Coarse Sand (20cm)'
    },
    recharge_trench: {
      width_m: trenchWidth,
      length_m: Math.round(trenchLength * 10) / 10,
      depth_m: Math.round(trenchDepth * 10) / 10,
      volume_cum: Math.round(trenchWidth * trenchLength * trenchDepth * 10) / 10,
      filter_media: 'Bottom: Gravel, Top: Coarse Sand, wrapped in geotextile'
    },
    recharge_shaft: {
      diameter_m: shaftDiameter,
      depth_m: Math.round(shaftDepth * 10) / 10,
      number_of_shafts: numShafts,
      filter_media: 'Slotted PVC pipe with gravel pack'
    },
    storage_tank: {
      capacity_liters: Math.round(tankSizeLiters / 100) * 100,
      type: tankSizeLiters > 5000 ? 'Underground RCC/Ferrocement' : 'Above-ground PVC/FRP'
    }
  };
}

/**
 * Cost estimation based on CGWB guidelines and current market rates
 */
function calculateCosts(dimensions, costData) {
  const mat = costData.construction_materials;
  const costs = {};

  // Recharge Pit cost
  const pitVol = dimensions.recharge_pit.volume_cum || 1;
  costs.recharge_pit = {
    excavation: Math.round(pitVol * mat.excavation_per_cum_inr),
    boulders: Math.round(pitVol * 0.4 * mat.boulders_per_cum_inr),
    gravel: Math.round(pitVol * 0.3 * mat.gravel_per_cum_inr),
    sand: Math.round(pitVol * 0.2 * mat.coarse_sand_per_cum_inr),
    pipe: Math.round(3 * mat.pvc_pipe_per_m_inr),
    filter: mat.mesh_filter_inr,
    first_flush: mat.first_flush_device_inr,
    labor: Math.round(2 * mat.labor_per_day_inr),
    total: 0
  };
  costs.recharge_pit.total = Object.values(costs.recharge_pit).reduce((a, b) => a + b, 0);

  // Recharge Trench cost
  const trenchVol = dimensions.recharge_trench.volume_cum || 1;
  costs.recharge_trench = {
    excavation: Math.round(trenchVol * mat.excavation_per_cum_inr),
    gravel: Math.round(trenchVol * 0.5 * mat.gravel_per_cum_inr),
    sand: Math.round(trenchVol * 0.3 * mat.coarse_sand_per_cum_inr),
    pipe: Math.round(dimensions.recharge_trench.length_m * mat.pvc_pipe_per_m_inr),
    filter: mat.mesh_filter_inr * 2,
    first_flush: mat.first_flush_device_inr,
    labor: Math.round(3 * mat.labor_per_day_inr),
    total: 0
  };
  costs.recharge_trench.total = Object.values(costs.recharge_trench).reduce((a, b) => a + b, 0);

  // Recharge Shaft cost
  costs.recharge_shaft = {
    drilling: Math.round(dimensions.recharge_shaft.depth_m * 800 * dimensions.recharge_shaft.number_of_shafts),
    pipe: Math.round(dimensions.recharge_shaft.depth_m * mat.pvc_pipe_per_m_inr * dimensions.recharge_shaft.number_of_shafts),
    gravel_pack: Math.round(dimensions.recharge_shaft.depth_m * 200 * dimensions.recharge_shaft.number_of_shafts),
    filter: mat.mesh_filter_inr,
    first_flush: mat.first_flush_device_inr,
    labor: Math.round(2 * mat.labor_per_day_inr * dimensions.recharge_shaft.number_of_shafts),
    total: 0
  };
  costs.recharge_shaft.total = Object.values(costs.recharge_shaft).reduce((a, b) => a + b, 0);

  // Storage Tank cost
  const tankCapacity = dimensions.storage_tank.capacity_liters || 1000;
  costs.storage_tank = {
    tank: Math.round((tankCapacity / 1000) * mat.storage_tank_per_1000l_inr),
    pipe: Math.round(5 * mat.pvc_pipe_per_m_inr),
    filter: mat.mesh_filter_inr,
    first_flush: mat.first_flush_device_inr,
    labor: Math.round(2 * mat.labor_per_day_inr),
    total: 0
  };
  costs.storage_tank.total = Object.values(costs.storage_tank).reduce((a, b) => a + b, 0);

  return costs;
}

/**
 * Cost-benefit analysis over years
 */
function calculateCostBenefit(totalCost, annualHarvestLiters, costData, years = 20) {
  const waterValue = costData.water_value;
  const annualSavingMunicipal = (annualHarvestLiters / 1000) * waterValue.municipal_water_per_kl_inr;
  const annualSavingTanker = (annualHarvestLiters / 1000) * waterValue.tanker_water_per_kl_inr;
  const annualGWValue = (annualHarvestLiters / 1000) * waterValue.groundwater_value_per_kl_inr;
  const maintenancePerYear = totalCost * 0.02;

  const yearlyAnalysis = [];
  let cumulativeSaving = 0;
  let paybackYear = null;

  for (let y = 1; y <= years; y++) {
    const netSaving = annualSavingTanker - maintenancePerYear;
    cumulativeSaving += netSaving;
    if (!paybackYear && cumulativeSaving >= totalCost) paybackYear = y;
    yearlyAnalysis.push({
      year: y,
      annualSaving: Math.round(netSaving),
      cumulativeSaving: Math.round(cumulativeSaving),
      roi: Math.round(((cumulativeSaving - totalCost) / totalCost) * 100)
    });
  }

  return {
    annualSavingMunicipal: Math.round(annualSavingMunicipal),
    annualSavingTanker: Math.round(annualSavingTanker),
    annualGWValue: Math.round(annualGWValue),
    maintenancePerYear: Math.round(maintenancePerYear),
    paybackYears: paybackYear || '>20',
    totalSaving20Years: Math.round(cumulativeSaving),
    yearlyAnalysis
  };
}

module.exports = {
  calculateHarvestingPotential,
  calculateWaterDemand,
  calculateRunoff,
  calculateSupplyDays,
  assessFeasibility,
  recommendStructures,
  calculateStructureDimensions,
  calculateCosts,
  calculateCostBenefit,
  ROOF_RUNOFF_COEFFICIENT
};
