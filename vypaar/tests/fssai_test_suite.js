/**
 * FSSAI FOOD LICENSE (FOSCOS) AUTOMATED TEST SUITE
 * Comprehensive validation of 27 KoB types, 16 Food Categories, FoSCoS Eligibility Engine,
 * Dynamic Document Matrices, Fee Schedules, and Multi-Step Validations.
 */

const {
  FSSAI_KOB_TYPES,
  FSSAI_FOOD_CATEGORIES,
  FSSAI_CONSTITUTIONS,
  determineFSSAIEligibility,
  getRequiredFSSAIDocuments,
  calculateFSSAIFees,
  FSSAI_DISCLAIMER_TEXT,
} = require('../config/fssaiConfig');

const {
  validatePAN,
  validateMobile,
  validateEmail,
  validatePIN,
  validateCIN,
  validateLLPIN,
  validateIEC,
  validateFSSAILicenseNumber,
  validateFSSAIEligibility,
  validateFSSAIApplicant,
  validateFSSAIBusiness,
  validateFSSAIPremises,
  validateFSSAIProducts,
  validateFSSAISpecific,
  validateFSSAIDocuments,
  validateFullFSSAIApplication,
} = require('../utils/fssaiValidation');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('===============================================================');
console.log('🧪 RUNNING FSSAI FOOD LICENSE TEST SUITE (12 SCENARIOS)');
console.log('===============================================================\n');

// -----------------------------------------------------------------------------
// Scenario 1: Master Configuration (27 KoB, 16 Categories, 10 Constitutions)
// -----------------------------------------------------------------------------
console.log('Scenario 1: Master Configuration (27 KoB, 16 Categories, 10 Constitutions)');
assert(FSSAI_KOB_TYPES.length === 27, 'Exactly 27 Kind of Business (KoB) types configured');
assert(FSSAI_FOOD_CATEGORIES.length === 16, 'Exactly 16 Indian Food Categories configured (01–16)');
assert(FSSAI_CONSTITUTIONS.length === 10, 'Exactly 10 Business Constitutions configured');

// -----------------------------------------------------------------------------
// Scenario 2: FoSCoS Eligibility — Petty Food Business (Turnover <= ₹12 Lakh)
// -----------------------------------------------------------------------------
console.log('\nScenario 2: FoSCoS Eligibility — Petty Food Business (Turnover <= ₹12 Lakh)');
const pettyEligibility = determineFSSAIEligibility({
  kob: 'retailer',
  turnover: 800000,
});
assert(pettyEligibility.licenseType === 'registration', 'Petty retailer gets Basic Registration (Form A)');
assert(pettyEligibility.baseGovtFee === 100, 'Basic Registration annual govt fee is ₹100');

// -----------------------------------------------------------------------------
// Scenario 3: FoSCoS Eligibility — Standard Restaurant / Trader (₹12 Lakh to ₹20 Crore)
// -----------------------------------------------------------------------------
console.log('\nScenario 3: FoSCoS Eligibility — Standard Restaurant / Trader');
const restaurantEligibility = determineFSSAIEligibility({
  kob: 'restaurant',
  turnover: 5000000, // 50 Lakhs
});
assert(restaurantEligibility.licenseType === 'state', 'Restaurant with > ₹12 Lakh turnover gets State License');
assert(restaurantEligibility.baseGovtFee === 2000, 'State license annual govt fee is ₹2,000');

// -----------------------------------------------------------------------------
// Scenario 4: FoSCoS Eligibility — Importer & Exporter (Mandatory Central License)
// -----------------------------------------------------------------------------
console.log('\nScenario 4: FoSCoS Eligibility — Importer & Exporter (Mandatory Central License)');
const importerEligibility = determineFSSAIEligibility({
  kob: 'importer',
  turnover: 500000,
  isImportExport: true,
});
assert(importerEligibility.licenseType === 'central', 'Food Importer mandatory requires Central License');
assert(importerEligibility.baseGovtFee === 7500, 'Central License annual govt fee is ₹7,500');

// -----------------------------------------------------------------------------
// Scenario 5: FoSCoS Eligibility — Large Scale Dairy & Manufacturer Capacity
// -----------------------------------------------------------------------------
console.log('\nScenario 5: FoSCoS Eligibility — Large Scale Dairy & Manufacturer Capacity');
const dairyEligibility = determineFSSAIEligibility({
  kob: 'dairy',
  capacity: 60000, // 60,000 LPD (> 50,000 LPD)
});
assert(dairyEligibility.licenseType === 'central', 'Dairy > 50,000 LPD requires Central License');

const mfgEligibility = determineFSSAIEligibility({
  kob: 'manufacturer',
  capacity: 5000, // 5 MT/day (> 2 MT/day)
});
assert(mfgEligibility.licenseType === 'central', 'Manufacturer > 2 MT/day requires Central License');

// -----------------------------------------------------------------------------
// Scenario 6: Restaurant Dynamic Documents Matrix
// -----------------------------------------------------------------------------
console.log('\nScenario 6: Restaurant Dynamic Documents Matrix');
const docsRestaurant = getRequiredFSSAIDocuments({
  kob: 'restaurant',
  licenseType: 'state',
  constitution: 'proprietorship',
  premisesType: 'rented',
});
assert(
  docsRestaurant.some((d) => d.id === 'applicant_photo' && d.required),
  'Restaurant requires Applicant Photograph'
);
assert(
  docsRestaurant.some((d) => d.id === 'applicant_pan' && d.required),
  'Restaurant requires Applicant PAN'
);
assert(
  docsRestaurant.some((d) => d.id === 'premises_rent_agreement' && d.required),
  'Rented premises requires Rent Agreement'
);
assert(
  docsRestaurant.some((d) => d.id === 'premises_owner_noc' && d.required),
  'Rented premises requires Owner NOC'
);

// -----------------------------------------------------------------------------
// Scenario 7: Manufacturer Dynamic Documents Matrix (Blueprint & Equipment)
// -----------------------------------------------------------------------------
console.log('\nScenario 7: Manufacturer Dynamic Documents Matrix');
const docsMfg = getRequiredFSSAIDocuments({
  kob: 'manufacturer',
  licenseType: 'state',
  constitution: 'pvt_ltd',
  premisesType: 'owned',
});
assert(
  docsMfg.some((d) => d.id === 'blueprint_layout_plan' && d.required),
  'Manufacturer requires Blueprint / Layout Plan'
);
assert(
  docsMfg.some((d) => d.id === 'equipment_machinery_list' && d.required),
  'Manufacturer requires Equipment & Machinery List'
);
assert(
  docsMfg.some((d) => d.id === 'water_test_report' && d.required),
  'Manufacturer requires Potable Water Test Report'
);
assert(
  docsMfg.some((d) => d.id === 'company_coi' && d.required),
  'Private Limited Company requires Certificate of Incorporation'
);

// -----------------------------------------------------------------------------
// Scenario 8: Dairy & Packaged Drinking Water Documents
// -----------------------------------------------------------------------------
console.log('\nScenario 8: Dairy & Packaged Drinking Water Documents');
const docsDairy = getRequiredFSSAIDocuments({ kob: 'dairy', licenseType: 'state' });
assert(
  docsDairy.some((d) => d.id === 'dairy_milk_source_plan' && d.required),
  'Dairy requires Source of Milk / Procurement Plan'
);

const docsWater = getRequiredFSSAIDocuments({ kob: 'water', licenseType: 'state' });
assert(
  docsWater.some((d) => d.id === 'pesticide_residue_report' && d.required),
  'Packaged Drinking Water requires Pesticide Residue Report'
);
assert(
  docsWater.some((d) => d.id === 'bis_license_doc' && d.required),
  'Packaged Drinking Water requires BIS / ISI Certification'
);

// -----------------------------------------------------------------------------
// Scenario 9: Repacker, Relabeller & Transporter Documents
// -----------------------------------------------------------------------------
console.log('\nScenario 9: Repacker, Relabeller & Transporter Documents');
const docsRepacker = getRequiredFSSAIDocuments({ kob: 'repacker', licenseType: 'state' });
assert(
  docsRepacker.some((d) => d.id === 'manufacturer_fssai_license' && d.required),
  'Repacker requires Manufacturer FSSAI License copy'
);
assert(
  docsRepacker.some((d) => d.id === 'manufacturer_noc_undertaking' && d.required),
  'Repacker requires Manufacturer NOC / Undertaking'
);

const docsTransporter = getRequiredFSSAIDocuments({ kob: 'transporter', licenseType: 'state' });
assert(
  docsTransporter.some((d) => d.id === 'vehicle_rc_documents' && d.required),
  'Food Transporter requires Vehicle RC Documents'
);

// -----------------------------------------------------------------------------
// Scenario 10: Fee Calculator Engine (Registration, State, Central & Multi-Year)
// -----------------------------------------------------------------------------
console.log('\nScenario 10: Fee Calculator Engine (Registration, State, Central & Multi-Year)');
const feeReg1 = calculateFSSAIFees({ licenseType: 'registration', validityYears: 1 });
assert(feeReg1.serviceFee === 5000, 'Base service fee is ₹5,000');
assert(feeReg1.totalGovtFee === 100, '1-year Basic Registration govt fee is ₹100');
assert(feeReg1.totalPayable === 5100, 'Total payable for 1-yr Basic Registration is ₹5,100');

const feeState3 = calculateFSSAIFees({ licenseType: 'state', validityYears: 3, kob: 'restaurant' });
assert(feeState3.totalGovtFee === 6000, '3-year State License govt fee is ₹6,000 (2000 * 3)');
assert(feeState3.totalPayable === 11000, 'Total payable for 3-yr State License is ₹11,000 (5000 + 6000)');

const feeCentral1 = calculateFSSAIFees({ licenseType: 'central', validityYears: 1 });
assert(feeCentral1.totalGovtFee === 7500, '1-year Central License govt fee is ₹7,500');
assert(feeCentral1.totalPayable === 12500, 'Total payable for 1-yr Central License is ₹12,500 (5000 + 7500)');

// -----------------------------------------------------------------------------
// Scenario 11: PAN, Mobile, Email, PIN, CIN, LLPIN, IEC & FSSAI Number Regex
// -----------------------------------------------------------------------------
console.log('\nScenario 11: PAN, Mobile, Email, PIN, CIN, LLPIN, IEC & FSSAI Number Regex');
assert(validatePAN('ABCDE1234F'), 'Valid PAN format passes');
assert(!validatePAN('INVALIDPAN'), 'Invalid PAN rejected');
assert(validateMobile('9876543210'), 'Valid 10-digit mobile passes');
assert(!validateMobile('12345'), 'Short mobile rejected');
assert(validateEmail('food@restaurant.com'), 'Valid email passes');
assert(!validateEmail('bademail'), 'Invalid email rejected');
assert(validatePIN('110001'), 'Valid 6-digit PIN code passes');
assert(!validatePIN('110'), 'Invalid short PIN code rejected');
assert(validateCIN('U72200DL2026PTC123456'), 'Valid 21-digit CIN passes');
assert(validateLLPIN('AAB-1234'), 'Valid LLPIN passes');
assert(validateIEC('0512345678'), 'Valid 10-digit IEC Code passes');
assert(!validateIEC('IEC123'), 'Invalid short IEC Code rejected');
assert(validateFSSAILicenseNumber('10022011000123'), 'Valid 14-digit FSSAI license passes');
assert(!validateFSSAILicenseNumber('12345'), 'Invalid short FSSAI license rejected');

// -----------------------------------------------------------------------------
// Scenario 12: Pre-flight Application Validation & Statutory Disclaimer
// -----------------------------------------------------------------------------
console.log('\nScenario 12: Pre-flight Application Validation & Statutory Disclaimer');
const validApplicantState = {
  constitution: 'proprietorship',
  applicantDetails: {
    businessLegalName: 'Royal Sweets',
    applicantName: 'Ramesh Kumar',
    pan: 'ABCDE1234F',
    mobile: '9876543210',
    email: 'ramesh@royalsweets.com',
    address1: 'Shop 1, Main Market',
    city: 'Delhi',
    state: '07',
    pinCode: '110001',
  },
};
assert(
  Object.keys(validateFSSAIApplicant(validApplicantState)).length === 0,
  'Complete valid applicant yields 0 errors'
);

const emptyApplicantState = { constitution: 'proprietorship', applicantDetails: {} };
assert(
  Object.keys(validateFSSAIApplicant(emptyApplicantState)).length > 0,
  'Empty applicant yields validation errors'
);

assert(
  Object.keys(
    validateFSSAIProducts({
      products: [{ productName: 'Gulab Jamun', categoryCode: '16' }],
    })
  ).length === 0,
  'Product with name and category passes product validation'
);

assert(
  FSSAI_DISCLAIMER_TEXT &&
    FSSAI_DISCLAIMER_TEXT.includes('FoSCoS') &&
    FSSAI_DISCLAIMER_TEXT.includes('FSSAI'),
  'Statutory FoSCoS disclaimer text is configured correctly'
);

console.log('\n===============================================================');
console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('===============================================================');

if (failedTests === 0) {
  console.log('🎉 ALL 12 FSSAI TEST SCENARIOS PASSED WITH 100% SUCCESS!\n');
} else {
  process.exit(1);
}
