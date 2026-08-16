/**
 * Income Tax Return (ITR) Filing — Central Configuration Matrix
 *
 * Configurable master data for Assessment Years, Taxpayer Types,
 * Official ITR Forms (ITR-1 to ITR-7) Eligibility Engine,
 * AY 2026-27 & AY 2025-26 Tax Slabs (New vs Old Regime),
 * Chapter VI-A Deductions, Dynamic Document Matrix, and Platform Fee Structure.
 */

/* ========================= A) Base Service Information ========================= */

export const ITR_SERVICE_INFO = {
  title: 'Income Tax Return Filing',
  shortDescription: 'Annual income tax return filing for individuals and businesses.',
  serviceFee: 3000, // Platform assisted-filing / CA review fee
  governmentFee: 0, // Nil statutory fee for timely e-filing
  processingTime: '2–3 Working Days',
  included: [
    'Complete ITR Preparation & CA Computation Sheet',
    'Old Regime vs New Regime Tax Optimization & Max Refund Advisory',
    'Official e-Filing on Income Tax Portal & Instant ITR-V Acknowledgment',
    'Form 26AS, AIS (Annual Information Statement) & TIS Reconciliation',
    'Capital Gains, Salary, Business, House Property & Crypto Processing',
    'Aadhaar OTP E-Verification & Post-Filing Compliance Support',
  ],
  complianceDisclaimer:
    'The information and computation generated through this application are based on the details furnished by the taxpayer and the statutory rules configured for the selected Assessment Year. Final ITR form selection, tax calculation and portal submission are reviewed by tax professionals before filing. ITR forms are annexure-less; uploaded documents are used solely for computation and reconciliation.',
};

export const ITR_DISCLAIMER_TEXT = ITR_SERVICE_INFO.complianceDisclaimer;

/* ========================= B) Assessment Years ========================= */

export const ASSESSMENT_YEARS = [
  {
    id: 'AY_2026_27',
    label: 'AY 2026–27 (Financial Year 2025–26)',
    financialYear: 'FY 2025–26',
    isCurrent: true,
    standardDeductionNew: 75000,
    standardDeductionOld: 50000,
    rebate87ALimitNew: 700000, // Up to 7.75 Lakhs taxable income tax-free under New Regime with standard deduction
    rebate87ALimitOld: 500000,
  },
  {
    id: 'AY_2025_26',
    label: 'AY 2025–26 (Financial Year 2024–25)',
    financialYear: 'FY 2024–25',
    isCurrent: false,
    standardDeductionNew: 75000,
    standardDeductionOld: 50000,
    rebate87ALimitNew: 700000,
    rebate87ALimitOld: 500000,
  },
  {
    id: 'AY_2024_25',
    label: 'AY 2024–25 (Financial Year 2023–24 - Updated/Belated)',
    financialYear: 'FY 2023–24',
    isCurrent: false,
    standardDeductionNew: 50000,
    standardDeductionOld: 50000,
    rebate87ALimitNew: 700000,
    rebate87ALimitOld: 500000,
  },
];

/* ========================= C) 8 Taxpayer Types ========================= */

export const TAXPAYER_TYPES = [
  { id: 'individual', label: 'Individual (Salaried, Professional, Freelancer, Trader)', icon: '👤' },
  { id: 'huf', label: 'Hindu Undivided Family (HUF)', icon: '👨‍👩‍👧‍👦' },
  { id: 'partnership', label: 'Partnership Firm', icon: '🤝' },
  { id: 'llp', label: 'Limited Liability Partnership (LLP)', icon: '⚖️' },
  { id: 'company', label: 'Company (Private Ltd / Public Ltd / OPC)', icon: '🏢' },
  { id: 'trust', label: 'Trust / Charitable Institution', icon: '🛡️' },
  { id: 'society_aop', label: 'Society / AOP / BOI', icon: '📜' },
  { id: 'other', label: 'Other Taxpayer Entity', icon: '🏷️' },
];

/* ========================= D) Residential Status ========================= */

export const RESIDENTIAL_STATUSES = [
  { id: 'resident', label: 'Resident & Ordinarily Resident (ROR)', desc: 'Global income taxable in India' },
  { id: 'rnor', label: 'Resident but Not Ordinarily Resident (RNOR)', desc: 'Foreign income exempt unless derived from business in India' },
  { id: 'nri', label: 'Non-Resident Indian (NRI / Foreign Citizen)', desc: 'Only income accrued/received in India is taxable' },
];

/* ========================= E) 7 Official ITR Forms Specification ========================= */

export const ITR_FORMS_INFO = {
  'ITR-1': {
    code: 'ITR-1',
    name: 'Sahaj',
    target: 'Resident Individuals',
    maxIncome: 5000000, // ₹50 Lakhs
    desc: 'For Resident Individuals having Income from Salary, One House Property, Other Sources (Interest, Dividend) and Agricultural income up to ₹5,000, with total income up to ₹50 Lakhs.',
  },
  'ITR-2': {
    code: 'ITR-2',
    name: 'ITR-2',
    target: 'Individuals & HUFs (No Business Income)',
    maxIncome: null,
    desc: 'For Individuals and HUFs not having income from profits and gains of business or profession (Capital Gains, Multiple Properties, Foreign Assets/Income, or Income > ₹50 Lakhs).',
  },
  'ITR-3': {
    code: 'ITR-3',
    name: 'ITR-3',
    target: 'Individuals & HUFs with Business / Profession',
    maxIncome: null,
    desc: 'For Individuals and HUFs having income from profits and gains of business or profession (Proprietorships, Professionals, Freelancers with regular books of accounts, Partners in firms).',
  },
  'ITR-4': {
    code: 'ITR-4',
    name: 'Sugam',
    target: 'Presumptive Business & Profession',
    maxIncome: 20000000, // ₹2 Crore (or ₹3 Cr for digital transactions)
    desc: 'For Resident Individuals, HUFs and Firms (other than LLP) having total income up to ₹50 Lakhs and having income from business and profession computed on presumptive basis (Sec 44AD, 44ADA, 44AE).',
  },
  'ITR-5': {
    code: 'ITR-5',
    name: 'ITR-5',
    target: 'Partnership Firms, LLPs, AOPs, BOIs',
    maxIncome: null,
    desc: 'For Partnership Firms, LLPs, Association of Persons (AOP), Body of Individuals (BOI), Artificial Juridical Person (AJP), Cooperative Societies, etc.',
  },
  'ITR-6': {
    code: 'ITR-6',
    name: 'ITR-6',
    target: 'Companies (Pvt Ltd, Public Ltd)',
    maxIncome: null,
    desc: 'For Companies other than companies claiming exemption under Section 11 (Charitable/religious purposes).',
  },
  'ITR-7': {
    code: 'ITR-7',
    name: 'ITR-7',
    target: 'Trusts, Political Parties, Institutions',
    maxIncome: null,
    desc: 'For persons including companies required to furnish return under sections 139(4A), 139(4B), 139(4C), or 139(4D) (Trusts, Educational/Medical Institutions, Political Parties).',
  },
};

/* ========================= F) Intelligent ITR Form Recommendation Engine ========================= */

export function recommendITRForm(taxpayerData = {}) {
  const {
    taxpayerType = 'individual',
    residentialStatus = 'resident',
    totalIncome = 0,
    incomeSources = {},
    hasBusinessIncome = false,
    isPresumptiveBusiness = false,
    hasCapitalGains = false,
    hasMultipleProperties = false,
    hasForeignIncomeOrAssets = false,
    isCompanyDirector = false,
    holdsUnlistedShares = false,
    agriculturalIncome = 0,
  } = taxpayerData;

  // 1. Non-Individual Entity Direct Mappings
  if (taxpayerType === 'company') {
    return {
      recommendedForm: 'ITR-6',
      confidence: 'High',
      reason: 'Mandatory ITR-6 for corporate entities incorporated under the Companies Act.',
    };
  }

  if (taxpayerType === 'partnership' || taxpayerType === 'llp' || taxpayerType === 'society_aop') {
    return {
      recommendedForm: 'ITR-5',
      confidence: 'High',
      reason: 'Applicable for Partnership Firms, LLPs, AOPs and BOIs.',
    };
  }

  if (taxpayerType === 'trust') {
    return {
      recommendedForm: 'ITR-7',
      confidence: 'High',
      reason: 'Applicable for Charitable/Religious Trusts and Section 11 exempt institutions.',
    };
  }

  // 2. Individual / HUF Recommendation Rules
  const hasAgriExceeding5k = Number(agriculturalIncome || 0) > 5000;
  const isIncomeOver50L = Number(totalIncome || 0) > 5000000;

  if (hasBusinessIncome) {
    if (
      isPresumptiveBusiness &&
      !hasCapitalGains &&
      !hasMultipleProperties &&
      !hasForeignIncomeOrAssets &&
      !isCompanyDirector &&
      !holdsUnlistedShares &&
      !isIncomeOver50L &&
      !hasAgriExceeding5k &&
      residentialStatus === 'resident'
    ) {
      return {
        recommendedForm: 'ITR-4',
        confidence: 'High',
        reason: 'Presumptive business/profession u/s 44AD/44ADA with income <= ₹50 Lakhs.',
      };
    }
    return {
      recommendedForm: 'ITR-3',
      confidence: 'High',
      reason: 'Income from business/profession with books of accounts, or capital gains / director status.',
    };
  }

  // No business income: Check if eligible for ITR-1 vs ITR-2
  if (
    hasCapitalGains ||
    hasMultipleProperties ||
    hasForeignIncomeOrAssets ||
    isCompanyDirector ||
    holdsUnlistedShares ||
    isIncomeOver50L ||
    hasAgriExceeding5k ||
    residentialStatus !== 'resident'
  ) {
    let specificTriggers = [];
    if (hasCapitalGains) specificTriggers.push('Capital Gains from shares/property/crypto');
    if (hasMultipleProperties) specificTriggers.push('Multiple house properties');
    if (hasForeignIncomeOrAssets) specificTriggers.push('Foreign income or foreign assets');
    if (isIncomeOver50L) specificTriggers.push('Total income exceeds ₹50 Lakhs');
    if (residentialStatus !== 'resident') specificTriggers.push('Non-Resident / RNOR status');
    if (hasAgriExceeding5k) specificTriggers.push('Agricultural income > ₹5,000');

    return {
      recommendedForm: 'ITR-2',
      confidence: 'High',
      reason: `ITR-2 required due to: ${specificTriggers.join(', ')}.`,
    };
  }

  return {
    recommendedForm: 'ITR-1',
    confidence: 'High',
    reason: 'Resident Individual with salary, 1 house property, other interest/dividend income <= ₹50 Lakhs.',
  };
}

/* ========================= G) Dynamic Document Matrix ========================= */

export function getRequiredITRDocuments(taxpayerData = {}) {
  const docs = [
    {
      id: 'pan_card',
      label: 'PAN Card Copy',
      category: 'Identity Proof',
      required: true,
      hint: 'Required for tax identity verification and portal e-filing linking',
    },
    {
      id: 'form_26as',
      label: 'Form 26AS Tax Credit Statement',
      category: 'Tax Reconciliation',
      required: false,
      hint: 'Reconciles TDS, TCS and advance tax credited by deductors in Income Tax TRACES',
    },
    {
      id: 'ais_tis',
      label: 'Annual Information Statement (AIS / TIS)',
      category: 'Tax Reconciliation',
      required: false,
      hint: 'Comprehensive statement of all high-value transactions, dividends, and securities',
    },
    {
      id: 'bank_statement',
      label: 'Bank Account Statements (All active savings/current accounts)',
      category: 'Bank & Interest',
      required: true,
      hint: 'To compute savings interest, verify refund bank account and dividend credits',
    },
  ];

  const sources = taxpayerData.incomeSources || {};

  if (sources.salary) {
    docs.push({
      id: 'form_16',
      label: 'Form 16 (Part A & Part B from Employer)',
      category: 'Salary Income',
      required: true,
      hint: 'Contains salary breakup, allowances, standard deduction and employer TDS deduction details',
    });
    docs.push({
      id: 'salary_slips',
      label: 'Monthly Salary Slips (Optional / If multiple employers)',
      category: 'Salary Income',
      required: false,
      hint: 'Useful if Form 16 does not reflect recent allowance exemptions or HRA claims',
    });
  }

  if (sources.houseProperty) {
    docs.push({
      id: 'home_loan_cert',
      label: 'Home Loan Provisional / Final Interest Certificate',
      category: 'House Property',
      required: false,
      hint: 'Breakup of Principal (u/s 80C) and Interest on Housing Loan (u/s 24b up to ₹2 Lakhs)',
    });
    docs.push({
      id: 'rent_agreement',
      label: 'Rental Agreement / Tenant Details',
      category: 'House Property',
      required: false,
      hint: 'If property is let-out, for calculation of gross annual rent and municipal tax deductions',
    });
  }

  if (sources.capitalGains) {
    docs.push({
      id: 'capital_gain_statement',
      label: 'Capital Gains Tax Statement (From Zerodha, Groww, CAMS, KFintech, etc.)',
      category: 'Capital Gains',
      required: true,
      hint: 'Consolidated STCG & LTCG realized profit/loss statement for equity, mutual funds or F&O',
    });
  }

  if (sources.business || sources.profession) {
    docs.push({
      id: 'business_pl_bs',
      label: 'Profit & Loss Statement & Balance Sheet (Or Turnover Summary)',
      category: 'Business / Profession',
      required: !taxpayerData.isPresumptiveBusiness,
      hint: 'Financial statements or gross turnover receipts for business computation',
    });
    docs.push({
      id: 'gst_returns',
      label: 'GSTR-3B / GSTR-1 Annual Summary (If GST Registered)',
      category: 'Business / Profession',
      required: false,
      hint: 'Reconciles reported business turnover in ITR with GST Portal data',
    });
  }

  if (taxpayerData.hasDeductions) {
    docs.push({
      id: 'deduction_proofs',
      label: 'Chapter VI-A Investment Receipts (LIC, PPF, Health Insurance, Tuition Fees)',
      category: 'Deductions',
      required: false,
      hint: 'Tax saving receipts under Section 80C, 80D, 80G (applicable if opting for Old Tax Regime)',
    });
  }

  return docs;
}

/* ========================= H) Fee Calculation ========================= */

export function calculateITRFees() {
  return {
    governmentFee: 0, // ₹0 Free on official portal
    serviceFee: 3000, // ₹3,000 Platform Assisted-Filing & CA Computation Fee
    totalPayable: 3000,
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ITR_SERVICE_INFO,
    ITR_DISCLAIMER_TEXT,
    ASSESSMENT_YEARS,
    TAXPAYER_TYPES,
    RESIDENTIAL_STATUSES,
    ITR_FORMS_INFO,
    recommendITRForm,
    getRequiredITRDocuments,
    calculateITRFees,
  };
}

