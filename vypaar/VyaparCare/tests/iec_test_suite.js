/**
 * IEC (IMPORT EXPORT CODE) TEST SUITE
 * Complete validation tests for 12-Step DGFT IEC Registration Flow
 */

const {
  IEC_ENTITY_TYPES,
  IEC_BUSINESS_ACTIVITIES,
  IEC_TRADE_ACTIVITIES,
  IEC_PREMISES_TYPES,
  IEC_BANK_ACCOUNT_TYPES,
  IEC_BANK_PROOF_TYPES,
  IEC_AUTH_METHODS,
  IEC_SIGNATORY_DESIGNATIONS,
  IEC_PRICING,
  calculateIECFees,
  getRequiredIECDocuments,
} = require('../config/iecConfig');

const {
  validatePAN,
  validateIFSC,
  validateGSTIN,
  validateIECApplicantType,
  validateIECPAN,
  validateIECBusiness,
  validateIECAddress,
  validateIECBank,
  validateIECSignatory,
  validateFullIECApplication,
} = require('../utils/iecValidation');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✕ FAIL: ${message}`);
  }
}

console.log('\n======================================================');
console.log('🧪 RUNNING IMPORT EXPORT CODE (IEC) TEST SUITE');
console.log('======================================================\n');

// ---------------------------------------------------------------------------
// 1. DGFT Master Configuration Tests
// ---------------------------------------------------------------------------
console.log('--- 1. Master Configuration Matrix ---');
assert(IEC_ENTITY_TYPES.length === 10, 'Supports 10 DGFT entity constitutions');
assert(
  IEC_ENTITY_TYPES.some((t) => t.id === 'proprietorship') &&
    IEC_ENTITY_TYPES.some((t) => t.id === 'pvt_ltd') &&
    IEC_ENTITY_TYPES.some((t) => t.id === 'llp') &&
    IEC_ENTITY_TYPES.some((t) => t.id === 'partnership'),
  'Includes Proprietorship, Pvt Ltd, LLP, Partnership'
);
assert(IEC_BUSINESS_ACTIVITIES.length >= 6, 'Includes all major business activities');
assert(IEC_TRADE_ACTIVITIES.length >= 4, 'Includes import/export goods & services');
assert(IEC_PREMISES_TYPES.length === 5, 'Includes 5 premises possession types');
assert(IEC_AUTH_METHODS.length === 2, 'Includes Aadhaar OTP and Class 3 DSC authentication');

// ---------------------------------------------------------------------------
// 2. Pricing & Statutory Fee Breakdown
// ---------------------------------------------------------------------------
console.log('\n--- 2. Pricing & Statutory Fee Breakdown ---');
assert(IEC_PRICING.governmentFee === 500, 'DGFT statutory government application fee is ₹500');
assert(IEC_PRICING.serviceFee === 4000, 'Assisted-filing / CA scrutiny fee is ₹4,000');
assert(IEC_PRICING.totalPayable === 4500, 'Total payable is ₹4,500');

const calculated = calculateIECFees();
assert(
  calculated.governmentFee === 500 &&
    calculated.serviceFee === 4000 &&
    calculated.totalPayable === 4500,
  'calculateIECFees() returns exact statutory split (₹500 + ₹4000 = ₹4500)'
);

// ---------------------------------------------------------------------------
// 3. Format Validation Engine Tests
// ---------------------------------------------------------------------------
console.log('\n--- 3. Format Validation Engine ---');
assert(validatePAN('ABCDE1234F') === true, 'Valid PAN ABCDE1234F accepted');
assert(validatePAN('invalid_pan') === false, 'Invalid PAN format rejected');
assert(validatePAN('ABCDE12345') === false, 'PAN with digits at end rejected');

assert(validateIFSC('SBIN0001234') === true, 'Valid IFSC SBIN0001234 accepted');
assert(validateIFSC('HDFC0000001') === true, 'Valid IFSC HDFC0000001 accepted');
assert(validateIFSC('INVALID_IFSC') === false, 'Invalid IFSC format rejected');

assert(validateGSTIN('07AAAAA0000A1Z5') === true, 'Valid 15-digit GSTIN accepted');
assert(validateGSTIN('07AAAAA0000A1') === false, 'Incomplete GSTIN rejected');

// ---------------------------------------------------------------------------
// 4. Step-by-Step Validation Tests
// ---------------------------------------------------------------------------
console.log('\n--- 4. Step-by-Step Validation ---');

// Step 1: Entity Type
assert(
  Object.keys(validateIECApplicantType({ entityType: 'proprietorship' })).length === 0,
  'Step 1 valid when entityType provided'
);
assert(
  validateIECApplicantType({ entityType: '' }).entityType !== undefined,
  'Step 1 invalid when entityType missing'
);

// Step 2: PAN & Entity
const validPANForm = {
  entityType: 'proprietorship',
  panDetails: {
    panNumber: 'ABCDE1234F',
    legalName: 'Acme Global Exports',
    incorporationDate: '2024-01-15',
  },
};
assert(
  Object.keys(validateIECPAN(validPANForm)).length === 0,
  'Step 2 valid with complete PAN details'
);

const invalidPANForm = {
  entityType: 'proprietorship',
  panDetails: { panNumber: 'BAD_PAN', legalName: '', incorporationDate: '' },
};
const panErrors = validateIECPAN(invalidPANForm);
assert(
  panErrors.panNumber && panErrors.legalName && panErrors.incorporationDate,
  'Step 2 catches invalid PAN, missing legal name, and missing date'
);

// Company CIN & Director check
const companyForm = {
  entityType: 'pvt_ltd',
  panDetails: {
    panNumber: 'ABCDE1234F',
    legalName: 'Acme Global Pvt Ltd',
    incorporationDate: '2024-01-15',
    cinNumber: '',
    directors: [{ name: '', pan: '' }],
  },
};
const compErrs = validateIECPAN(companyForm);
assert(compErrs.cinNumber !== undefined, 'Pvt Ltd requires CIN number');

// Step 3: Business Details
const validBizForm = {
  businessDetails: {
    businessName: 'Acme Global Exports',
    businessActivities: ['trader_importer', 'trader_exporter'],
  },
  tradeDetails: {
    selectedTradeActivities: ['import_goods', 'export_goods'],
  },
};
assert(
  Object.keys(validateIECBusiness(validBizForm)).length === 0,
  'Step 3 valid with business name and trade activities'
);

// Step 4: Registered Address
const validAddrForm = {
  addressDetails: {
    line1: 'Shop 12, Main Market',
    city: 'New Delhi',
    district: 'South Delhi',
    state: 'Delhi',
    pinCode: '110020',
  },
};
assert(
  Object.keys(validateIECAddress(validAddrForm)).length === 0,
  'Step 4 valid with complete registered address'
);

const invalidAddrForm = {
  addressDetails: {
    line1: '',
    city: '',
    district: '',
    state: '',
    pinCode: '123',
  },
};
const addrErrs = validateIECAddress(invalidAddrForm);
assert(
  addrErrs.line1 && addrErrs.city && addrErrs.pinCode,
  'Step 4 catches empty address lines and invalid 6-digit PIN code'
);

// Step 5: Bank Details
const validBankForm = {
  bankDetails: {
    bankName: 'State Bank of India',
    accountHolderName: 'Acme Global Exports',
    accountNumber: '50200012345678',
    ifsc: 'SBIN0001234',
  },
};
assert(
  Object.keys(validateIECBank(validBankForm)).length === 0,
  'Step 5 valid with verified bank account and IFSC'
);

// Step 6: Authorized Signatory
const validSigForm = {
  signatoryDetails: {
    fullName: 'Rahul Sharma',
    pan: 'ABCDE1234F',
    mobile: '9876543210',
    email: 'rahul@acme.com',
    designation: 'proprietor',
  },
};
assert(
  Object.keys(validateIECSignatory(validSigForm)).length === 0,
  'Step 6 valid with signatory name, PAN, mobile, email'
);

// ---------------------------------------------------------------------------
// 5. Dynamic Document Matrix Engine Tests
// ---------------------------------------------------------------------------
console.log('\n--- 5. Dynamic Document Matrix Engine ---');

// Proprietorship with Owned Premises (Bill in Firm Name)
const propOwned = {
  entityType: 'proprietorship',
  addressDetails: { premisesType: 'owned', proofInEntityName: true },
};
const docsPropOwned = getRequiredIECDocuments(propOwned);
assert(
  docsPropOwned.some((d) => d.id === 'pan_card') &&
    docsPropOwned.some((d) => d.id === 'bank_proof') &&
    docsPropOwned.some((d) => d.id === 'address_proof') &&
    docsPropOwned.some((d) => d.id === 'signatory_photo'),
  'Proprietorship requires PAN, Bank Proof, Address Proof, and Photo'
);
assert(
  !docsPropOwned.some((d) => d.id === 'owner_noc'),
  'Owner NOC not required when electricity bill is in firm name'
);

// Rented Premises where bill is NOT in firm name -> Owner NOC is Mandatory
const rentNotFirm = {
  entityType: 'proprietorship',
  addressDetails: { premisesType: 'rented', proofInEntityName: false },
};
const docsRentNotFirm = getRequiredIECDocuments(rentNotFirm);
assert(
  docsRentNotFirm.some((d) => d.id === 'owner_noc'),
  'Owner NOC dynamically mandated when utility bill is in landlord/owner name'
);

// Company Entity -> Certificate of Incorporation & MoA/AoA
const companyEntity = {
  entityType: 'pvt_ltd',
  addressDetails: { premisesType: 'owned', proofInEntityName: true },
};
const docsCompany = getRequiredIECDocuments(companyEntity);
assert(
  docsCompany.some((d) => d.id === 'incorporation_certificate') &&
    docsCompany.some((d) => d.id === 'moa_aoa'),
  'Pvt Ltd dynamically requires Certificate of Incorporation and MoA/AoA'
);

// Partnership Firm -> Partnership Deed
const partnershipEntity = {
  entityType: 'partnership',
  addressDetails: { premisesType: 'owned', proofInEntityName: true },
};
const docsPartner = getRequiredIECDocuments(partnershipEntity);
assert(
  docsPartner.some((d) => d.id === 'partnership_deed'),
  'Partnership Firm dynamically requires Registered Partnership Deed'
);

// LLP -> LLP Agreement
const llpEntity = {
  entityType: 'llp',
  addressDetails: { premisesType: 'owned', proofInEntityName: true },
};
const docsLLP = getRequiredIECDocuments(llpEntity);
assert(
  docsLLP.some((d) => d.id === 'llp_agreement'),
  'LLP dynamically requires LLP Agreement'
);

// ---------------------------------------------------------------------------
// 6. Full Application Integration Test
// ---------------------------------------------------------------------------
console.log('\n--- 6. Full Application Integration ---');
const completeApp = {
  entityType: 'proprietorship',
  panDetails: {
    panNumber: 'ABCDE1234F',
    legalName: 'Acme Global Exports',
    incorporationDate: '2024-01-15',
  },
  businessDetails: {
    businessName: 'Acme Global Exports',
    businessActivities: ['trader_importer', 'trader_exporter'],
  },
  tradeDetails: {
    selectedTradeActivities: ['import_goods', 'export_goods'],
  },
  addressDetails: {
    line1: 'Shop 12, Main Market',
    city: 'New Delhi',
    district: 'South Delhi',
    state: 'Delhi',
    pinCode: '110020',
  },
  bankDetails: {
    bankName: 'State Bank of India',
    accountHolderName: 'Acme Global Exports',
    accountNumber: '50200012345678',
    ifsc: 'SBIN0001234',
  },
  signatoryDetails: {
    fullName: 'Rahul Sharma',
    pan: 'ABCDE1234F',
    mobile: '9876543210',
    email: 'rahul@acme.com',
    designation: 'proprietor',
  },
};

const fullErrs = validateFullIECApplication(completeApp);
assert(
  Object.keys(fullErrs).length === 0,
  'Complete application passes all 12 validation checkpoints with zero errors'
);

// ---------------------------------------------------------------------------
// Test Results Summary
// ---------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`🏁 IEC TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
