/**
 * MSME / UDYAM REGISTRATION AUTOMATED TEST SUITE
 * Comprehensive validation of 10 Organisation Types, Aadhaar Holder Logic,
 * NIC 2008 Search Engine, 2025 Revised MSME Classification Engine,
 * Transparent ₹2,000 Assisted-Filing Fee Logic, and Pre-flight checks.
 */

const {
  UDYAM_ORGANISATION_TYPES,
  UDYAM_MAJOR_ACTIVITIES,
  NIC_2008_DATABASE,
  searchNICCodes,
  calculateMSMECategory,
  calculateUdyamFees,
  UDYAM_OPTIONAL_DOCUMENTS,
  UDYAM_DISCLAIMER_TEXT,
} = require('../config/udyamConfig.js');

const {
  validateAadhaar,
  validatePAN,
  validateGSTIN,
  validateMobile,
  validateEmail,
  validatePIN,
  validateIFSC,
  validateCIN,
  validateLLPIN,
  validateUdyamAadhaar,
  validateUdyamPAN,
  validateUdyamBusiness,
  validateUdyamOrganisation,
  validateUdyamAddress,
  validateUdyamUnits,
  validateUdyamBank,
  validateUdyamNIC,
  validateUdyamFinancials,
  validateFullUdyamApplication,
} = require('../utils/udyamValidation.js');

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
console.log('🧪 RUNNING MSME / UDYAM REGISTRATION TEST SUITE (14 SCENARIOS)');
console.log('===============================================================\n');

// -----------------------------------------------------------------------------
// Scenario 1: Master Configuration (10 Organisation Types, Activities)
// -----------------------------------------------------------------------------
console.log('Scenario 1: Master Configuration');
assert(UDYAM_ORGANISATION_TYPES.length === 10, 'Exactly 10 Organisation Types configured');
assert(UDYAM_MAJOR_ACTIVITIES.length === 4, 'Exactly 4 Major Business Activities configured');
assert(NIC_2008_DATABASE.length >= 15, 'At least 15 NIC 2008 Master codes indexed');

// -----------------------------------------------------------------------------
// Scenario 2: Aadhaar Holder Logic across Constitutions
// -----------------------------------------------------------------------------
console.log('\nScenario 2: Aadhaar Holder Logic across Constitutions');
const prop = UDYAM_ORGANISATION_TYPES.find((o) => o.id === 'proprietorship');
assert(prop.aadhaarHolderType === 'Proprietor', 'Proprietorship requires Proprietor Aadhaar');

const part = UDYAM_ORGANISATION_TYPES.find((o) => o.id === 'partnership');
assert(part.aadhaarHolderType === 'Managing Partner', 'Partnership requires Managing Partner Aadhaar');

const huf = UDYAM_ORGANISATION_TYPES.find((o) => o.id === 'huf');
assert(huf.aadhaarHolderType === 'Karta', 'HUF requires Karta Aadhaar');

const pvt = UDYAM_ORGANISATION_TYPES.find((o) => o.id === 'pvt_ltd');
assert(pvt.aadhaarHolderType === 'Authorized Signatory', 'Company requires Authorized Signatory Aadhaar');

const llp = UDYAM_ORGANISATION_TYPES.find((o) => o.id === 'llp');
assert(llp.aadhaarHolderType === 'Designated Partner', 'LLP requires Designated Partner Aadhaar');

// -----------------------------------------------------------------------------
// Scenario 3: NIC 2008 Search Engine by Keywords
// -----------------------------------------------------------------------------
console.log('\nScenario 3: NIC 2008 Search Engine by Keywords');
const mobileResults = searchNICCodes('mobile repair');
assert(mobileResults.some((n) => n.nic5 === '95120'), 'Search "mobile repair" returns NIC 95120');

const softwareResults = searchNICCodes('software');
assert(softwareResults.some((n) => n.nic5 === '62011'), 'Search "software" returns NIC 62011');

const foodResults = searchNICCodes('restaurant');
assert(foodResults.some((n) => n.nic5 === '56101'), 'Search "restaurant" returns NIC 56101');

// -----------------------------------------------------------------------------
// Scenario 4: Micro Enterprise Classification (Limits: Inv <= ₹2.5 Cr & Turn <= ₹10 Cr)
// -----------------------------------------------------------------------------
console.log('\nScenario 4: Micro Enterprise Classification Engine');
const microRes = calculateMSMECategory({
  investmentAmount: 5000000, // ₹50 Lakhs (0.5 Cr <= 2.5 Cr)
  domesticTurnover: 20000000, // ₹2 Crore (2 Cr <= 10 Cr)
  exportTurnover: 0,
});
assert(microRes.category === 'micro', 'Classified as Micro Enterprise');
assert(microRes.isEligible === true, 'Enterprise is eligible under MSMED Act');

// -----------------------------------------------------------------------------
// Scenario 5: Small Enterprise Classification (Limits: Inv <= ₹25 Cr & Turn <= ₹100 Cr)
// -----------------------------------------------------------------------------
console.log('\nScenario 5: Small Enterprise Classification Engine');
const smallRes = calculateMSMECategory({
  investmentAmount: 50000000, // ₹5 Crore (> 2.5 Cr & <= 25 Cr)
  domesticTurnover: 250000000, // ₹25 Crore (> 10 Cr & <= 100 Cr)
  exportTurnover: 0,
});
assert(smallRes.category === 'small', 'Classified as Small Enterprise');
assert(smallRes.isEligible === true, 'Small enterprise is eligible');

// -----------------------------------------------------------------------------
// Scenario 6: Medium Enterprise Classification (Limits: Inv <= ₹125 Cr & Turn <= ₹500 Cr)
// -----------------------------------------------------------------------------
console.log('\nScenario 6: Medium Enterprise Classification Engine');
const medRes = calculateMSMECategory({
  investmentAmount: 500000000, // ₹50 Crore (> 25 Cr & <= 125 Cr)
  domesticTurnover: 2000000000, // ₹200 Crore (> 100 Cr & <= 500 Cr)
  exportTurnover: 0,
});
assert(medRes.category === 'medium', 'Classified as Medium Enterprise');
assert(medRes.isEligible === true, 'Medium enterprise is eligible');

// -----------------------------------------------------------------------------
// Scenario 7: Ineligible / Large Enterprise Classification
// -----------------------------------------------------------------------------
console.log('\nScenario 7: Ineligible / Large Enterprise Classification');
const largeRes = calculateMSMECategory({
  investmentAmount: 1500000000, // ₹150 Crore (> 125 Cr)
  domesticTurnover: 6000000000, // ₹600 Crore (> 500 Cr)
  exportTurnover: 0,
});
assert(largeRes.category === 'not_eligible', 'Exceeding limits classified as not eligible');
assert(largeRes.isEligible === false, 'Large enterprise flagged ineligible for MSME');

// -----------------------------------------------------------------------------
// Scenario 8: Export Turnover Exclusion as per Section 7(1) of MSMED Act
// -----------------------------------------------------------------------------
console.log('\nScenario 8: Export Turnover Exclusion under MSMED Act');
const exportRes = calculateMSMECategory({
  investmentAmount: 10000000, // ₹1 Crore
  domesticTurnover: 50000000, // ₹5 Crore (Within Micro ₹10 Cr limit)
  exportTurnover: 500000000, // ₹50 Crore Export (Excluded!)
});
assert(
  exportRes.category === 'micro',
  'Export turnover is excluded from MSME limits, qualifying business as Micro Enterprise'
);

// -----------------------------------------------------------------------------
// Scenario 9: Transparent Fee Engine (Govt Fee ₹0, Service Fee ₹2,000)
// -----------------------------------------------------------------------------
console.log('\nScenario 9: Transparent Fee Engine');
const feeRes = calculateUdyamFees();
assert(feeRes.governmentFee === 0, 'Official Government Udyam fee is ₹0 (FREE)');
assert(feeRes.serviceFee === 2000, 'Assisted-filing fee is ₹2,000');
assert(feeRes.totalPayable === 2000, 'Total payable is ₹2,000');

// -----------------------------------------------------------------------------
// Scenario 10: Optional Internal Documents List
// -----------------------------------------------------------------------------
console.log('\nScenario 10: Optional Internal Documents List');
assert(UDYAM_OPTIONAL_DOCUMENTS.length >= 6, 'Optional document list configured');
assert(
  UDYAM_OPTIONAL_DOCUMENTS.every((d) => d.hint.includes('Optional')),
  'All supporting documents are strictly marked Optional'
);

// -----------------------------------------------------------------------------
// Scenario 11: Regex Validations (Aadhaar, PAN, GSTIN, Mobile, PIN, IFSC, CIN)
// -----------------------------------------------------------------------------
console.log('\nScenario 11: Regex Validations');
assert(validateAadhaar('123456789012'), 'Valid 12-digit Aadhaar passes');
assert(!validateAadhaar('12345'), 'Short Aadhaar rejected');
assert(validatePAN('ABCDE1234F'), 'Valid PAN passes');
assert(!validatePAN('ABCDE12345'), 'Invalid PAN format rejected');
assert(validateGSTIN('07AAAAA0000A1Z5'), 'Valid 15-character GSTIN passes');
assert(!validateGSTIN('07AAAAA0000A1Z'), 'Short GSTIN rejected');
assert(validateMobile('9876543210'), 'Valid 10-digit mobile passes');
assert(validatePIN('110001'), 'Valid 6-digit PIN passes');
assert(validateIFSC('SBIN0001234'), 'Valid IFSC passes');
assert(validateCIN('U72200DL2026PTC123456'), 'Valid 21-digit CIN passes');
assert(validateLLPIN('AAA-1234'), 'Valid LLPIN passes');

// -----------------------------------------------------------------------------
// Scenario 12: Step-by-Step Validators
// -----------------------------------------------------------------------------
console.log('\nScenario 12: Step-by-Step Validators');
const validAadhaarStep = {
  aadhaarDetails: {
    aadhaarNumber: '123456789012',
    nameAsPerAadhaar: 'Ramesh Kumar',
    mobile: '9876543210',
    email: 'ramesh@example.com',
    aadhaarHolderType: 'Proprietor',
    isAadhaarVerified: true,
  },
};
assert(Object.keys(validateUdyamAadhaar(validAadhaarStep)).length === 0, 'Valid Aadhaar step passes');

const invalidAadhaarStep = { aadhaarDetails: { isAadhaarVerified: false } };
assert(
  Object.keys(validateUdyamAadhaar(invalidAadhaarStep)).length > 0,
  'Unverified Aadhaar step fails'
);

const validBusinessStep = {
  businessDetails: {
    enterpriseName: 'Apex Innovations',
    organisationType: 'proprietorship',
    commencementDate: '2026-01-15',
    majorActivity: 'services',
  },
};
assert(Object.keys(validateUdyamBusiness(validBusinessStep)).length === 0, 'Valid Business step passes');

// -----------------------------------------------------------------------------
// Scenario 13: Full Pre-flight Application Validator
// -----------------------------------------------------------------------------
console.log('\nScenario 13: Full Pre-flight Application Validator');
const completeApp = {
  aadhaarDetails: {
    aadhaarNumber: '123456789012',
    nameAsPerAadhaar: 'Ramesh Kumar',
    mobile: '9876543210',
    email: 'ramesh@example.com',
    aadhaarHolderType: 'Proprietor',
    isAadhaarVerified: true,
  },
  panDetails: {
    hasPAN: true,
    panNumber: 'ABCDE1234F',
    nameAsPerPAN: 'Ramesh Kumar',
    isPANVerified: true,
  },
  businessDetails: {
    enterpriseName: 'Apex Innovations',
    organisationType: 'proprietorship',
    commencementDate: '2026-01-15',
    majorActivity: 'services',
  },
  organisationDetails: {},
  officialAddress: {
    flatDoorBlock: 'Shop 1',
    roadStreet: 'Main Market',
    city: 'New Delhi',
    state: '07',
    pinCode: '110001',
  },
  plantUnits: [
    {
      unitName: 'Unit 1',
      pinCode: '110001',
    },
  ],
  bankDetails: {
    bankName: 'State Bank of India',
    accountHolderName: 'Apex Innovations',
    accountNumber: '50200012345678',
    ifsc: 'SBIN0001234',
  },
  selectedNICCodes: [
    { nic5: '62011', activity: 'Software Development' },
  ],
  financialDetails: {
    investmentAmount: 500000,
    domesticTurnover: 2000000,
  },
};

const fullErrs = validateFullUdyamApplication(completeApp);
assert(Object.keys(fullErrs).length === 0, 'Complete valid application yields 0 pre-flight errors');

// -----------------------------------------------------------------------------
// Scenario 14: Statutory Disclaimer Text Verification
// -----------------------------------------------------------------------------
console.log('\nScenario 14: Statutory Disclaimer Text Verification');
assert(
  UDYAM_DISCLAIMER_TEXT &&
    UDYAM_DISCLAIMER_TEXT.includes('free of cost') &&
    UDYAM_DISCLAIMER_TEXT.includes('assisted filing'),
  'Statutory disclaimer clarifies official registration is free and ₹2,000 is assisted filing fee'
);

console.log('\n===============================================================');
console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('===============================================================');

if (failedTests === 0) {
  console.log('🎉 ALL 14 MSME / UDYAM TEST SCENARIOS PASSED WITH 100% SUCCESS!\n');
} else {
  process.exit(1);
}
