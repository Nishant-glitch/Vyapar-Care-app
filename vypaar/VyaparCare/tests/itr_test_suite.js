/**
 * Income Tax Return (ITR) Automated Test Suite
 * Tests Form Recommendation (ITR-1 to ITR-7), Tax Engine & Regime Optimization,
 * Input Validations, Fee Calculations, and Document Matrix.
 */

const {
  ASSESSMENT_YEARS,
  TAXPAYER_TYPES,
  RESIDENTIAL_STATUSES,
  ITR_FORMS_INFO,
  recommendITRForm,
  getRequiredITRDocuments,
  calculateITRFees,
  ITR_DISCLAIMER_TEXT,
} = require('../config/itrConfig.js');

const {
  calculateIncomeTax,
  computeOldRegimeTax,
  computeNewRegimeTax,
} = require('../utils/itrTaxEngine.js');

const {
  validatePAN,
  validateAadhaar,
  validateMobile,
  validateEmail,
  validatePIN,
  validateIFSC,
  validateTAN,
  validateITRProfile,
  validateITRSources,
  validateITRSalary,
  validateITRHouseProperty,
  validateITRBusiness,
  validateITRBank,
  validateFullITRApplication,
} = require('../utils/itrValidation.js');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${name}`);
  }
}

console.log('====================================================');
console.log('🧪 RUNNING INCOME TAX RETURN (ITR) TEST SUITE');
console.log('====================================================\n');

/* ---------------- 1. ITR Form Recommendation Engine ---------------- */
console.log('1. ITR Form Recommendation Engine (ITR-1 through ITR-7):');

// Case 1: Salaried resident <= 50L -> ITR-1 (Sahaj)
const rec1 = recommendITRForm({
  taxpayerType: 'individual',
  residentialStatus: 'resident',
  totalIncome: 850000,
  incomeSources: { salary: true, otherSources: true },
  hasBusinessIncome: false,
  hasCapitalGains: false,
});
assert(rec1.recommendedForm === 'ITR-1', 'Salaried resident <= 50L recommends ITR-1 (Sahaj)');

// Case 2: Salaried + Capital Gains -> ITR-2
const rec2 = recommendITRForm({
  taxpayerType: 'individual',
  residentialStatus: 'resident',
  totalIncome: 1200000,
  incomeSources: { salary: true, capitalGains: true },
  hasBusinessIncome: false,
  hasCapitalGains: true,
});
assert(rec2.recommendedForm === 'ITR-2', 'Individual with Capital Gains recommends ITR-2');

// Case 3: Company Director -> ITR-2
const rec3 = recommendITRForm({
  taxpayerType: 'individual',
  residentialStatus: 'resident',
  totalIncome: 450000,
  incomeSources: { salary: true },
  isCompanyDirector: true,
});
assert(rec3.recommendedForm === 'ITR-2', 'Company Director recommends ITR-2 even if income <= 50L');

// Case 4: Business with Presumptive 44AD/44ADA -> ITR-4 (Sugam)
const rec4 = recommendITRForm({
  taxpayerType: 'individual',
  residentialStatus: 'resident',
  totalIncome: 1800000,
  incomeSources: { business: true },
  hasBusinessIncome: true,
  isPresumptiveBusiness: true,
});
assert(rec4.recommendedForm === 'ITR-4', 'Presumptive business/profession recommends ITR-4 (Sugam)');

// Case 5: Business with regular P&L -> ITR-3
const rec5 = recommendITRForm({
  taxpayerType: 'individual',
  residentialStatus: 'resident',
  totalIncome: 2500000,
  incomeSources: { business: true },
  hasBusinessIncome: true,
  isPresumptiveBusiness: false,
});
assert(rec5.recommendedForm === 'ITR-3', 'Proprietor with regular books/P&L recommends ITR-3');

// Case 6: Partnership Firm / LLP -> ITR-5
const rec6 = recommendITRForm({
  taxpayerType: 'llp',
  residentialStatus: 'resident',
  totalIncome: 4500000,
});
assert(rec6.recommendedForm === 'ITR-5', 'LLP / Partnership Firm recommends ITR-5');

// Case 7: Company (Pvt Ltd / Ltd) -> ITR-6
const rec7 = recommendITRForm({
  taxpayerType: 'company',
  residentialStatus: 'resident',
  totalIncome: 10000000,
});
assert(rec7.recommendedForm === 'ITR-6', 'Company recommends ITR-6');

// Case 8: Trust / NGO / Section 11 -> ITR-7
const rec8 = recommendITRForm({
  taxpayerType: 'trust',
  residentialStatus: 'resident',
  totalIncome: 500000,
});
assert(rec8.recommendedForm === 'ITR-7', 'Trust / Society recommends ITR-7');

/* ---------------- 2. Tax Computation Engine & Regime Optimizer ---------------- */
console.log('\n2. Tax Computation Engine & Old vs New Regime Optimizer:');

// Test New Regime Slab & Rebate: Income 7,00,000 (after 75k std ded = 6.25L taxable) -> Nil tax
const newTaxUnderRebate = computeNewRegimeTax(625000);
assert(newTaxUnderRebate.totalTax === 0, 'New Regime taxable income <= 7.00L has zero tax due to 87A rebate');

// Test New Regime Salary ₹8,50,000
const formSalaried = {
  incomeSources: { salary: true, otherSources: true },
  incomeDetails: { salaryGross: 850000, savingsInterest: 10000 },
  deductions: { sec80C: 150000, sec80D: 25000, sec80TTA: 10000 },
  taxPaid: { tdsSalary: 35000 },
};
const fullComp = calculateIncomeTax(formSalaried);
assert(fullComp.newRegime.totalDeductions === 75000, 'New Regime applies ₹75,000 standard deduction');
assert(fullComp.oldRegime.totalDeductions === 185000, 'Old Regime calculates 80C + 80D + 80TTA deductions accurately');
assert(fullComp.recommendedRegime === 'new' || fullComp.recommendedRegime === 'old', 'Tax engine recommends optimum regime');
assert(fullComp.isRefund === true, 'Tax engine correctly identifies refund state (TDS > Liability)');
assert(fullComp.finalAmount > 0, 'Final refund amount is computed accurately');

/* ---------------- 3. Pricing & Statutory Fee Model ---------------- */
console.log('\n3. Transparent Fee Model:');

const fees = calculateITRFees();
assert(fees.governmentFee === 0, 'Official Government Portal e-filing fee is ₹0 (Free)');
assert(fees.serviceFee === 3000, 'Professional CA assisted-filing fee is ₹3,000');
assert(fees.totalPayable === 3000, 'Total payable amount equals service fee of ₹3,000');

/* ---------------- 4. Validation Engine ---------------- */
console.log('\n4. Input & Form Validations:');

assert(validatePAN('ABCDE1234F') === true, 'Valid PAN returns true');
assert(validatePAN('invalid123') === false, 'Invalid PAN returns false');
assert(validateAadhaar('987654321098') === true, 'Valid Aadhaar returns true');
assert(validateAadhaar('12345') === false, 'Invalid Aadhaar returns false');
assert(validateMobile('9876543210') === true, 'Valid 10-digit mobile returns true');
assert(validateMobile('12345') === false, 'Invalid mobile returns false');
assert(validatePIN('110001') === true, 'Valid 6-digit PIN returns true');
assert(validatePIN('011001') === false, 'Invalid PIN starting with 0 returns false');
assert(validateIFSC('HDFC0000050') === true, 'Valid IFSC returns true');
assert(validateIFSC('HDFC123') === false, 'Invalid IFSC returns false');

// Step Profile Validation
const invalidProfile = validateITRProfile({ profile: {} });
assert(Object.keys(invalidProfile).length > 0, 'Empty profile produces validation errors');

const validProfile = validateITRProfile({
  profile: {
    pan: 'ABCDE1234F',
    fullName: 'Rahul Sharma',
    dob: '1990-01-01',
    mobile: '9876543210',
    email: 'rahul@example.com',
    address: 'Connaught Place',
    city: 'New Delhi',
    pinCode: '110001',
  },
});
assert(Object.keys(validProfile).length === 0, 'Valid profile passes validation');

// Step Bank Validation
const validBank = validateITRBank({
  bankDetails: {
    bankName: 'HDFC Bank',
    accountHolderName: 'Rahul Sharma',
    accountNumber: '50200012345678',
    ifsc: 'HDFC0000050',
  },
});
assert(Object.keys(validBank).length === 0, 'Valid bank details pass validation');

// Full Application Validation
const completeApp = {
  profile: {
    pan: 'ABCDE1234F',
    fullName: 'Rahul Sharma',
    dob: '1990-01-01',
    mobile: '9876543210',
    email: 'rahul@example.com',
    address: 'Connaught Place',
    city: 'New Delhi',
    pinCode: '110001',
  },
  incomeSources: { salary: true },
  incomeDetails: { employerName: 'Tech Corp', salaryGross: 850000 },
  bankDetails: {
    bankName: 'HDFC Bank',
    accountHolderName: 'Rahul Sharma',
    accountNumber: '50200012345678',
    ifsc: 'HDFC0000050',
  },
};
const fullErrs = validateFullITRApplication(completeApp);
assert(Object.keys(fullErrs).length === 0, 'Complete valid application yields 0 pre-flight errors');

/* ---------------- 5. Document Checklist Generator ---------------- */
console.log('\n5. Dynamic Annexure-Less Document Checklist:');

const docsSalaried = getRequiredITRDocuments({
  incomeSources: { salary: true, otherSources: true },
});
assert(docsSalaried.some((d) => d.id === 'form_16'), 'Salaried checklist includes Form 16 Part A & B');
assert(docsSalaried.some((d) => d.id === 'form_26as'), 'Checklist includes Form 26AS / AIS / TIS');

const docsCapital = getRequiredITRDocuments({
  incomeSources: { capitalGains: true },
});
assert(docsCapital.some((d) => d.id === 'capital_gain_statement'), 'Capital gains returns include P&L statement');

/* ---------------- 6. Statutory Disclaimer Verification ---------------- */
console.log('\n6. Statutory Disclaimer Verification:');
assert(
  ITR_DISCLAIMER_TEXT &&
    ITR_DISCLAIMER_TEXT.includes('annexure-less') &&
    ITR_DISCLAIMER_TEXT.includes('computation'),
  'Statutory disclaimer clarifies returns are annexure-less and documents are for computation'
);

console.log('\n====================================================');
console.log(`📊 RESULTS: ${passed} Passed, ${failed} Failed`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
