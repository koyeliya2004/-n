const calc = require('./calculations');

describe('RTRWH Calculations', () => {
  test('calculateHarvestingPotential returns reasonable value', () => {
    // 100 sq.m roof, 1000mm rainfall
    const result = calc.calculateHarvestingPotential(100, 1000);
    expect(result).toBeGreaterThan(50000);
    expect(result).toBeLessThan(100000);
  });

  test('calculateWaterDemand urban vs rural', () => {
    const urban = calc.calculateWaterDemand(4, true);
    const rural = calc.calculateWaterDemand(4, false);
    expect(urban.dailyDemandLiters).toBe(540);
    expect(rural.dailyDemandLiters).toBe(220);
    expect(urban.annualDemandLiters).toBe(540 * 365);
  });

  test('calculateRunoff is positive', () => {
    const result = calc.calculateRunoff(100, 1000);
    expect(result).toBeGreaterThan(0);
  });

  test('assessFeasibility returns valid structure', () => {
    const result = calc.assessFeasibility(100, 1000, 10, 10);
    expect(result.feasibility).toBeDefined();
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.reasons).toBeInstanceOf(Array);
  });

  test('assessFeasibility low values', () => {
    const result = calc.assessFeasibility(10, 200, 0.5, 1);
    expect(result.score).toBeLessThan(50);
  });

  test('calculateStructureDimensions returns all structures', () => {
    const dims = calc.calculateStructureDimensions(50000, 10, 'Red soil');
    expect(dims.recharge_pit).toBeDefined();
    expect(dims.recharge_trench).toBeDefined();
    expect(dims.recharge_shaft).toBeDefined();
    expect(dims.storage_tank).toBeDefined();
    expect(dims.recharge_pit.depth_m).toBeGreaterThan(0);
  });

  test('calculateCosts returns totals', () => {
    const dims = calc.calculateStructureDimensions(50000, 10, 'Alluvial soil');
    const costData = {
      construction_materials: {
        boulders_per_cum_inr: 800,
        gravel_per_cum_inr: 1200,
        coarse_sand_per_cum_inr: 1500,
        pvc_pipe_per_m_inr: 150,
        cement_per_bag_inr: 380,
        bricks_per_1000_inr: 7000,
        mesh_filter_inr: 500,
        first_flush_device_inr: 1500,
        storage_tank_per_1000l_inr: 8000,
        labor_per_day_inr: 600,
        excavation_per_cum_inr: 350
      }
    };
    const costs = calc.calculateCosts(dims, costData);
    expect(costs.recharge_pit.total).toBeGreaterThan(0);
    expect(costs.recharge_trench.total).toBeGreaterThan(0);
    expect(costs.recharge_shaft.total).toBeGreaterThan(0);
  });

  test('calculateCostBenefit returns payback info', () => {
    const costData = {
      water_value: {
        municipal_water_per_kl_inr: 30,
        tanker_water_per_kl_inr: 250,
        groundwater_value_per_kl_inr: 15
      }
    };
    const result = calc.calculateCostBenefit(15000, 80000, costData);
    expect(result.annualSavingTanker).toBeGreaterThan(0);
    expect(result.yearlyAnalysis).toHaveLength(20);
    expect(result.paybackYears).toBeDefined();
  });

  test('recommendStructures returns sorted results', () => {
    const structures = {
      recharge_pit: {
        min_open_space_sqm: 2,
        aquifer_suitability: ['Alluvium', 'Laterite'],
        description: 'test', suitable_for: 'test',
        typical_depth_m: '1 to 2', typical_dimensions: '1m x 1m',
        cost_range_inr: '5000-15000'
      },
      recharge_shaft: {
        min_open_space_sqm: 1,
        aquifer_suitability: ['Granite/Gneiss', 'Basalt'],
        description: 'test', suitable_for: 'test',
        typical_depth_m: '3 to 15', typical_dimensions: '0.3m dia',
        cost_range_inr: '15000-50000'
      }
    };
    const result = calc.recommendStructures(80, 10, 12, 'Granite/Gneiss', structures);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].suitabilityScore).toBeGreaterThan(0);
  });
});
