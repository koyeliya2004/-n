import { jsPDF } from 'jspdf';

export function generateBlueprintPDF(results, t) {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  const addTitle = (text) => {
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(text, margin, y);
    y += 10;
  };

  const addSubtitle = (text) => {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(text, margin, y);
    y += 7;
  };

  const addText = (text) => {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 2;
  };

  const addLine = () => {
    doc.setDrawColor(0, 120, 200);
    doc.line(margin, y, 190, y);
    y += 5;
  };

  const checkPage = () => {
    if (y > 270) { doc.addPage(); y = margin; }
  };

  // Header
  doc.setFillColor(26, 115, 232);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('JalSanchay - Rainwater Harvesting Blueprint', margin, 15);
  doc.setFontSize(10);
  doc.text('Rooftop Rainwater Harvesting & Artificial Recharge Assessment Report', margin, 25);
  doc.setTextColor(0, 0, 0);
  y = 45;

  // User Info
  addTitle('Assessment Summary');
  addLine();
  addText(`Name: ${results.user.name}`);
  addText(`Location: ${results.user.district}, ${results.user.state}`);
  addText(`Number of Dwellers: ${results.user.numDwellers}`);
  addText(`Roof Area: ${results.user.roofAreaSqm} sq.m`);
  addText(`Open Space: ${results.user.openSpaceSqm} sq.m`);
  y += 5;

  // Feasibility
  addSubtitle('Feasibility Assessment');
  addText(`Result: ${results.feasibility.feasibility} (Score: ${results.feasibility.score}/100)`);
  results.feasibility.reasons.forEach(r => addText(`  • ${r}`));
  y += 5;
  checkPage();

  // Location Data
  addSubtitle('Location & Groundwater Data');
  addText(`Annual Rainfall: ${results.location_data.annual_rainfall_mm} mm`);
  addText(`Groundwater Depth: ${results.location_data.groundwater_depth_m} m`);
  addText(`Principal Aquifer: ${results.location_data.principal_aquifer}`);
  addText(`Soil Type: ${results.location_data.soil_type}`);
  addText(`Recharge Rate: ${results.location_data.recharge_rate_mm_per_year} mm/year`);
  y += 5;
  checkPage();

  // Harvesting Potential
  addSubtitle('Harvesting Potential');
  addText(`Annual Potential: ${results.harvesting.annual_potential_liters.toLocaleString()} liters`);
  addText(`Daily Harvest: ${results.harvesting.daily_harvest_liters.toLocaleString()} liters`);
  addText(`Annual Runoff: ${results.harvesting.annual_runoff_liters.toLocaleString()} liters`);
  addText(`Supply Days/Year: ${results.harvesting.supply_days_per_year}`);
  addText(`% Annual Demand Met: ${results.harvesting.percentage_demand_met}%`);
  y += 5;
  checkPage();

  // Recommended Structures
  addSubtitle('Recommended Recharge Structures');
  results.recommended_structures.forEach(s => {
    addText(`${s.name}: ${s.description}`);
    addText(`  Suitable for: ${s.suitable_for}`);
    addText(`  Cost Range: ₹${s.cost_range_inr}`);
    checkPage();
  });
  y += 5;
  checkPage();

  // Dimensions
  addSubtitle('Structure Dimensions');
  const dims = results.structure_dimensions;
  addText(`Recharge Pit: ${dims.recharge_pit.width_m}m × ${dims.recharge_pit.length_m}m × ${dims.recharge_pit.depth_m}m`);
  addText(`  Filter Media: ${dims.recharge_pit.filter_media}`);
  addText(`Recharge Trench: ${dims.recharge_trench.width_m}m × ${dims.recharge_trench.length_m}m × ${dims.recharge_trench.depth_m}m`);
  addText(`Recharge Shaft: ${dims.recharge_shaft.diameter_m}m dia × ${dims.recharge_shaft.depth_m}m deep × ${dims.recharge_shaft.number_of_shafts} shafts`);
  addText(`Storage Tank: ${dims.storage_tank.capacity_liters.toLocaleString()} liters (${dims.storage_tank.type})`);
  y += 5;
  checkPage();

  // Cost Estimation (Bill of Materials)
  addSubtitle('Bill of Materials & Cost Estimation');
  const costs = results.cost_estimation;
  for (const [structType, items] of Object.entries(costs)) {
    addText(`${structType.replace(/_/g, ' ').toUpperCase()}: Total ₹${items.total.toLocaleString()}`);
    for (const [item, cost] of Object.entries(items)) {
      if (item !== 'total') addText(`  ${item}: ₹${cost.toLocaleString()}`);
    }
    checkPage();
  }
  y += 5;

  // Cost-Benefit Analysis
  checkPage();
  addSubtitle('Cost-Benefit Analysis');
  addText(`Payback Period: ${results.cost_benefit.paybackYears} years`);
  addText(`Annual Saving (Tanker water): ₹${results.cost_benefit.annualSavingTanker.toLocaleString()}`);
  addText(`Annual Saving (Municipal water): ₹${results.cost_benefit.annualSavingMunicipal.toLocaleString()}`);
  addText(`Total 20-Year Saving: ₹${results.cost_benefit.totalSaving20Years.toLocaleString()}`);
  addText(`Annual Maintenance: ₹${results.cost_benefit.maintenancePerYear.toLocaleString()}`);

  // Subsidies
  if (results.subsidies && results.subsidies.length > 0) {
    checkPage();
    y += 5;
    addSubtitle('Available Subsidies & Incentives');
    results.subsidies.forEach(s => {
      addText(`${s.name}: ${s.description}`);
      if (s.subsidy_percentage) addText(`  Subsidy: ${s.subsidy_percentage}`);
      if (s.link) addText(`  More info: ${s.link}`);
      checkPage();
    });
  }

  // Footer
  doc.addPage();
  y = margin;
  addTitle('Notes & Disclaimer');
  addText('This report is generated based on CGWB (Central Ground Water Board) published data and standard engineering calculations.');
  addText('Actual dimensions and costs may vary based on local conditions, contractor rates, and site-specific factors.');
  addText('Please consult a local hydrogeologist or water engineer for detailed design.');
  addText(`Report generated on: ${new Date().toLocaleDateString()}`);
  addText('Source: Central Ground Water Board (CGWB), Ministry of Jal Shakti, Government of India');

  doc.save(`JalSanchay_Blueprint_${results.user.name || 'Report'}.pdf`);
}
