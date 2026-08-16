/**
 * Accurate Income Tax Computation & Regime Optimizer Engine
 * Compliant with AY 2026-27 & AY 2025-26 statutory provisions (Section 115BAC).
 */

export function calculateIncomeTax(formState = {}) {
  const {
    assessmentYear = 'AY_2026_27',
    incomeDetails = {},
    deductions = {},
    taxPaid = {},
    selectedRegime = null,
  } = formState;

  // 1. Gross Incomes Breakdown
  const salaryGross = Number(incomeDetails.salaryGross || 0);
  const salaryAllowancesExempt = Number(incomeDetails.salaryAllowancesExempt || 0);
  const salaryProfTax = Number(incomeDetails.salaryProfTax || 0);

  // House Property
  const hpGrossRent = Number(incomeDetails.hpGrossRent || 0);
  const hpMunicipalTax = Number(incomeDetails.hpMunicipalTax || 0);
  const hpNetAnnualValue = Math.max(0, hpGrossRent - hpMunicipalTax);
  const hpStandardDeduction24a = hpNetAnnualValue * 0.3;
  const hpHomeLoanInterest = Number(incomeDetails.hpHomeLoanInterest || 0);
  // Cap home loan interest at ₹2,00,000 for self-occupied/loss set-off
  const hpInterestCapped = Math.min(200000, hpHomeLoanInterest);
  const hpIncome = hpNetAnnualValue - hpStandardDeduction24a - hpInterestCapped;

  // Business & Profession
  const businessProfit = Number(incomeDetails.businessProfit || 0);
  const professionProfit = Number(incomeDetails.professionProfit || 0);
  const totalBusinessIncome = businessProfit + professionProfit;

  // Capital Gains
  const stcg = Number(incomeDetails.stcg || 0);
  const ltcg = Number(incomeDetails.ltcg || 0);
  const vdaCryptoGain = Number(incomeDetails.vdaCryptoGain || 0);
  const totalCapitalGains = stcg + ltcg + vdaCryptoGain;

  // Other Sources
  const savingsInterest = Number(incomeDetails.savingsInterest || 0);
  const fdInterest = Number(incomeDetails.fdInterest || 0);
  const dividendIncome = Number(incomeDetails.dividendIncome || 0);
  const otherIncomeAmt = Number(incomeDetails.otherIncomeAmt || 0);
  const totalOtherSources = savingsInterest + fdInterest + dividendIncome + otherIncomeAmt;

  // 2. Compute OLD REGIME
  const stdDedOld = salaryGross > 0 ? 50000 : 0;
  const salaryNetOld = Math.max(0, salaryGross - salaryAllowancesExempt - salaryProfTax - stdDedOld);
  const grossTotalIncomeOld = salaryNetOld + hpIncome + totalBusinessIncome + totalCapitalGains + totalOtherSources;

  // Old Regime Deductions
  const sec80C = Math.min(150000, Number(deductions.sec80C || 0));
  const sec80D = Math.min(100000, Number(deductions.sec80D || 0));
  const sec80CCD1B = Math.min(50000, Number(deductions.sec80CCD1B || 0));
  const sec80TTA = Math.min(10000, Number(deductions.sec80TTA || savingsInterest));
  const sec80G = Number(deductions.sec80G || 0);
  const totalDeductionsOld = sec80C + sec80D + sec80CCD1B + sec80TTA + sec80G;

  const taxableIncomeOld = Math.max(0, grossTotalIncomeOld - totalDeductionsOld);

  // Old Slabs: 0-2.5L: Nil, 2.5-5L: 5%, 5-10L: 20%, >10L: 30%
  let baseTaxOld = 0;
  if (taxableIncomeOld > 1000000) {
    baseTaxOld = 112500 + (taxableIncomeOld - 1000000) * 0.3;
  } else if (taxableIncomeOld > 500000) {
    baseTaxOld = 12500 + (taxableIncomeOld - 500000) * 0.2;
  } else if (taxableIncomeOld > 250000) {
    baseTaxOld = (taxableIncomeOld - 250000) * 0.05;
  }

  // Rebate u/s 87A (Old: Up to 5 Lakhs taxable income, max 12,500)
  let rebate87AOld = 0;
  if (taxableIncomeOld <= 500000) {
    rebate87AOld = Math.min(baseTaxOld, 12500);
  }
  const taxAfterRebateOld = Math.max(0, baseTaxOld - rebate87AOld);
  const cessOld = taxAfterRebateOld * 0.04;
  const totalTaxLiabilityOld = Math.round(taxAfterRebateOld + cessOld);

  // 3. Compute NEW REGIME (Section 115BAC)
  const stdDedNew = salaryGross > 0 ? 75000 : 0;
  const salaryNetNew = Math.max(0, salaryGross - stdDedNew);
  // Under new regime, loss from house property cannot be set off against salary
  const hpIncomeNew = hpIncome < 0 ? 0 : hpIncome;
  const grossTotalIncomeNew = salaryNetNew + hpIncomeNew + totalBusinessIncome + totalCapitalGains + totalOtherSources;

  // New regime only allows standard deduction (no 80C/80D/80TTA)
  const totalDeductionsNew = stdDedNew;
  const taxableIncomeNew = Math.max(0, grossTotalIncomeNew);

  // New Slabs: 0-3L: Nil, 3-7L: 5%, 7-10L: 10%, 10-12L: 15%, 12-15L: 20%, >15L: 30%
  let baseTaxNew = 0;
  if (taxableIncomeNew > 1500000) {
    baseTaxNew = 140000 + (taxableIncomeNew - 1500000) * 0.3;
  } else if (taxableIncomeNew > 1200000) {
    baseTaxNew = 80000 + (taxableIncomeNew - 1200000) * 0.2;
  } else if (taxableIncomeNew > 1000000) {
    baseTaxNew = 50000 + (taxableIncomeNew - 1000000) * 0.15;
  } else if (taxableIncomeNew > 700000) {
    baseTaxNew = 20000 + (taxableIncomeNew - 700000) * 0.1;
  } else if (taxableIncomeNew > 300000) {
    baseTaxNew = (taxableIncomeNew - 300000) * 0.05;
  }

  // Rebate u/s 87A (New: Up to 7 Lakhs taxable income, max 25,000 -> Nil Tax)
  let rebate87ANew = 0;
  if (taxableIncomeNew <= 700000) {
    rebate87ANew = Math.min(baseTaxNew, 25000);
  }
  const taxAfterRebateNew = Math.max(0, baseTaxNew - rebate87ANew);
  const cessNew = taxAfterRebateNew * 0.04;
  const totalTaxLiabilityNew = Math.round(taxAfterRebateNew + cessNew);

  // 4. Recommendation & Optimization
  const recommendedRegime = totalTaxLiabilityNew <= totalTaxLiabilityOld ? 'new' : 'old';
  const activeRegime = selectedRegime || recommendedRegime;
  const activeTaxLiability = activeRegime === 'new' ? totalTaxLiabilityNew : totalTaxLiabilityOld;
  const activeTaxableIncome = activeRegime === 'new' ? taxableIncomeNew : taxableIncomeOld;
  const activeGrossIncome = activeRegime === 'new' ? grossTotalIncomeNew : grossTotalIncomeOld;
  const activeDeductions = activeRegime === 'new' ? totalDeductionsNew : totalDeductionsOld;
  const taxSavings = Math.abs(totalTaxLiabilityOld - totalTaxLiabilityNew);

  // 5. TDS, TCS, Advance Tax reconciliation
  const tdsSalary = Number(taxPaid.tdsSalary || 0);
  const tdsOther = Number(taxPaid.tdsOther || 0);
  const tcs = Number(taxPaid.tcs || 0);
  const advanceTax = Number(taxPaid.advanceTax || 0);
  const selfAssessmentTax = Number(taxPaid.selfAssessmentTax || 0);

  const totalTaxesPaid = tdsSalary + tdsOther + tcs + advanceTax + selfAssessmentTax;
  const netPayableOrRefund = activeTaxLiability - totalTaxesPaid;
  const isRefund = netPayableOrRefund < 0;
  const finalAmount = Math.abs(netPayableOrRefund);

  return {
    grossTotalIncome: activeGrossIncome,
    totalDeductions: activeDeductions,
    taxableIncome: activeTaxableIncome,
    totalTaxLiability: activeTaxLiability,
    totalTaxesPaid,
    netPayableOrRefund,
    isRefund,
    finalAmount,
    recommendedRegime,
    activeRegime,
    taxSavings,

    oldRegime: {
      grossIncome: grossTotalIncomeOld,
      totalDeductions: totalDeductionsOld,
      taxableIncome: taxableIncomeOld,
      baseTax: baseTaxOld,
      rebate87A: rebate87AOld,
      cess: cessOld,
      totalTaxLiability: totalTaxLiabilityOld,
    },
    newRegime: {
      grossIncome: grossTotalIncomeNew,
      totalDeductions: totalDeductionsNew,
      taxableIncome: taxableIncomeNew,
      baseTax: baseTaxNew,
      rebate87A: rebate87ANew,
      cess: cessNew,
      totalTaxLiability: totalTaxLiabilityNew,
    },
  };
}

export function computeOldRegimeTax(taxableIncome) {
  let baseTax = 0;
  if (taxableIncome > 1000000) {
    baseTax = 112500 + (taxableIncome - 1000000) * 0.3;
  } else if (taxableIncome > 500000) {
    baseTax = 12500 + (taxableIncome - 500000) * 0.2;
  } else if (taxableIncome > 250000) {
    baseTax = (taxableIncome - 250000) * 0.05;
  }

  let rebate = 0;
  if (taxableIncome <= 500000) {
    rebate = Math.min(baseTax, 12500);
  }
  const taxAfterRebate = Math.max(0, baseTax - rebate);
  const cess = taxAfterRebate * 0.04;
  return {
    baseTax,
    rebate,
    cess,
    totalTax: Math.round(taxAfterRebate + cess),
  };
}

export function computeNewRegimeTax(taxableIncome) {
  let baseTax = 0;
  if (taxableIncome > 1500000) {
    baseTax = 140000 + (taxableIncome - 1500000) * 0.3;
  } else if (taxableIncome > 1200000) {
    baseTax = 80000 + (taxableIncome - 1200000) * 0.2;
  } else if (taxableIncome > 1000000) {
    baseTax = 50000 + (taxableIncome - 1000000) * 0.15;
  } else if (taxableIncome > 700000) {
    baseTax = 20000 + (taxableIncome - 700000) * 0.1;
  } else if (taxableIncome > 300000) {
    baseTax = (taxableIncome - 300000) * 0.05;
  }

  let rebate = 0;
  if (taxableIncome <= 700000) {
    rebate = Math.min(baseTax, 25000);
  }
  const taxAfterRebate = Math.max(0, baseTax - rebate);
  const cess = taxAfterRebate * 0.04;
  return {
    baseTax,
    rebate,
    cess,
    totalTax: Math.round(taxAfterRebate + cess),
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateIncomeTax,
    computeOldRegimeTax,
    computeNewRegimeTax,
  };
}

