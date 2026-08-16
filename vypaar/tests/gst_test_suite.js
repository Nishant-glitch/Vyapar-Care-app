/**
 * FORM GST REG-01 AUTOMATED TEST SUITE
 * Comprehensive validation of 8 Business Constitutions, Dynamic Document Matrix Engine,
 * Statutory PAN/Aadhaar/IFSC Regex Validations, Fee Calculations, and Pre-flight checks.
 */

const {
  GST_CONSTITUTIONS,
  GST_REASONS,
  GST_POSSESSION_TYPES,
  getRequiredGSTDocuments,
  calculateGSTFees,
  GST_DISCLAIMER_TEXT,
} = require('../config/gstConfig');

const {
  validatePAN,
  validateMobile,
  validateEmail,
  validatePIN,
  validateAadhaar,
  validateIFSC,
  validateCIN,
  validateLLPIN,
  validateGSTConstitution,
  validateGSTBusinessDetails,
  validateGSTPromoters,
  validateGSTPremises,
  validateGSTGoodsServices,
  validateGSTBankDetails,
  validateGSTDocuments,
  validateFullGSTApplication,
} = require('../utils/gstValidation');

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
console.log('🧪 RUNNING FORM GST REG-01 TEST SUITE (12 SCENARIOS)');
console.log('===============================================================\n');

// -----------------------------------------------------------------------------
// Scenario 1: Master Configuration (8 Constitutions, Reasons, Possession Types)
// -----------------------------------------------------------------------------
console.log('Scenario 1: Master Configuration');
assert(GST_CONSTITUTIONS.length === 8, 'Exactly 8 Business Constitutions configured');
assert(GST_REASONS.length >= 7, 'At least 7 Statutory Registration Reasons configured');
assert(GST_POSSESSION_TYPES.length === 5, 'Exactly 5 Premises Possession Types configured');

// -----------------------------------------------------------------------------
// Scenario 2: Proprietorship Rented Dynamic Documents
// -----------------------------------------------------------------------------
console.log('\nScenario 2: Proprietorship with Rented Premises Documents');
const docsPropRented = getRequiredGSTDocuments({
  constitution: 'proprietorship',
  possessionType: 'rented',
});
assert(
  docsPropRented.some((d) => d.id === 'applicant_photo' && d.required),
  'Proprietor requires Photograph'
);
assert(
  docsPropRented.some((d) => d.id === 'applicant_pan' && d.required),
  'Proprietor requires PAN Card'
);
assert(
  docsPropRented.some((d) => d.id === 'applicant_aadhaar' && d.required),
  'Proprietor requires Aadhaar Card for Authentication'
);
assert(
  docsPropRented.some((d) => d.id === 'premises_rent_agreement' && d.required),
  'Rented premises requires Rent Agreement'
);
assert(
  docsPropRented.some((d) => d.id === 'premises_owner_noc' && d.required),
  'Rented premises requires Owner NOC & Electricity bill'
);
assert(
  docsPropRented.some((d) => d.id === 'bank_account_proof' && d.required),
  'Requires Bank Account Proof'
);

// -----------------------------------------------------------------------------
// Scenario 3: Partnership Firm Dynamic Documents
// -----------------------------------------------------------------------------
console.log('\nScenario 3: Partnership Firm Dynamic Documents');
const docsPartnership = getRequiredGSTDocuments({
  constitution: 'partnership',
  possessionType: 'owned',
});
assert(
  docsPartnership.some((d) => d.id === 'partnership_deed' && d.required),
  'Partnership requires Partnership Deed'
);
assert(
  docsPartnership.some((d) => d.id === 'partner_authorization_letter' && d.required),
  'Partnership requires Partner Authorization Letter'
);
assert(
  docsPartnership.some((d) => d.id === 'premises_ownership_doc' && d.required),
  'Owned premises requires Ownership Proof'
);

// -----------------------------------------------------------------------------
// Scenario 4: LLP Dynamic Documents
// -----------------------------------------------------------------------------
console.log('\nScenario 4: LLP Dynamic Documents');
const docsLLP = getRequiredGSTDocuments({
  constitution: 'llp',
  possessionType: 'leased',
});
assert(
  docsLLP.some((d) => d.id === 'llp_coi' && d.required),
  'LLP requires Certificate of Incorporation'
);
assert(
  docsLLP.some((d) => d.id === 'llp_agreement' && d.required),
  'LLP requires LLP Agreement'
);
assert(
  docsLLP.some((d) => d.id === 'llp_authorization_letter' && d.required),
  'LLP requires Designated Partner Authorization'
);

// -----------------------------------------------------------------------------
// Scenario 5: Private Limited Company Dynamic Documents
// -----------------------------------------------------------------------------
console.log('\nScenario 5: Private Limited Company Dynamic Documents');
const docsPvtLtd = getRequiredGSTDocuments({
  constitution: 'pvt_ltd',
  possessionType: 'rented',
});
assert(
  docsPvtLtd.some((d) => d.id === 'company_coi' && d.required),
  'Private Limited requires MCA Certificate of Incorporation'
);
assert(
  docsPvtLtd.some((d) => d.id === 'board_resolution_gst' && d.required),
  'Private Limited requires Board Resolution for GST Signatory'
);

// -----------------------------------------------------------------------------
// Scenario 6: Fee Calculator Engine (₹10,000 Service Fee, 50% Advance)
// -----------------------------------------------------------------------------
console.log('\nScenario 6: Fee Calculator Engine');
const fee = calculateGSTFees();
assert(fee.serviceFee === 10000, 'Total service fee is ₹10,000');
assert(fee.advancePercent === 50, 'Advance percent is 50%');
assert(fee.advanceAmount === 5000, 'Advance amount is ₹5,000');
assert(fee.balanceAmount === 5000, 'Balance amount is ₹5,000');
assert(fee.totalPayable === 10000, 'Total payable is ₹10,000');

// -----------------------------------------------------------------------------
// Scenario 7: PAN, Aadhaar, Mobile, Email Regex Validations
// -----------------------------------------------------------------------------
console.log('\nScenario 7: PAN, Aadhaar, Mobile, Email Regex Validations');
assert(validatePAN('ABCDE1234F'), 'Valid PAN passes');
assert(!validatePAN('ABCDE12345'), 'Invalid PAN with numbers at end fails');
assert(validateMobile('9876543210'), 'Valid 10-digit mobile passes');
assert(!validateMobile('1234567'), 'Short mobile fails');
assert(validateEmail('test@vypaar.in'), 'Valid email passes');
assert(!validateEmail('invalid_email'), 'Invalid email fails');
assert(validatePIN('110001'), 'Valid 6-digit PIN passes');
assert(!validatePIN('110'), 'Invalid PIN fails');
assert(validateAadhaar('123456789012'), 'Valid 12-digit Aadhaar passes');
assert(!validateAadhaar('12345'), 'Invalid short Aadhaar fails');

// -----------------------------------------------------------------------------
// Scenario 8: IFSC, CIN, LLPIN Regex Validations
// -----------------------------------------------------------------------------
console.log('\nScenario 8: IFSC, CIN, LLPIN Regex Validations');
assert(validateIFSC('SBIN0001234'), 'Valid SBI IFSC code passes');
assert(validateIFSC('HDFC0000050'), 'Valid HDFC IFSC code passes');
assert(!validateIFSC('SBIN1234'), 'Short IFSC fails');
assert(validateCIN('U72200DL2026PTC123456'), 'Valid CIN passes');
assert(validateLLPIN('AAB-1234'), 'Valid LLPIN passes');

// -----------------------------------------------------------------------------
// Scenario 9: Step 1 & 2 Validation Checks
// -----------------------------------------------------------------------------
console.log('\nScenario 9: Step 1 & 2 Validation Checks');
const validStep1 = { constitution: 'proprietorship', registrationReason: 'voluntary' };
assert(Object.keys(validateGSTConstitution(validStep1)).length === 0, 'Valid Step 1 passes');

const invalidStep1 = { constitution: '', registrationReason: '' };
assert(Object.keys(validateGSTConstitution(invalidStep1)).length === 2, 'Empty Step 1 fails with 2 errors');

const validStep2 = {
  businessDetails: {
    legalName: 'Aditya Retail',
    tradeName: 'Aditya Super Store',
    pan: 'ABCDE1234F',
    commencementDate: '2026-01-01',
  },
};
assert(Object.keys(validateGSTBusinessDetails(validStep2)).length === 0, 'Valid Step 2 passes');

// -----------------------------------------------------------------------------
// Scenario 10: Step 3 (Promoters) Validation Checks
// -----------------------------------------------------------------------------
console.log('\nScenario 10: Step 3 (Promoters) Validation Checks');
const validPromoterState = {
  promoters: [
    {
      name: 'Aditya Sharma',
      mobile: '9876543210',
      email: 'aditya@sharma.in',
      pan: 'ABCDE1234F',
      aadhaar: '123456789012',
    },
  ],
};
assert(Object.keys(validateGSTPromoters(validPromoterState)).length === 0, 'Valid promoter passes');

const emptyPromoterState = { promoters: [] };
assert(Object.keys(validateGSTPromoters(emptyPromoterState)).length > 0, 'Empty promoter list fails');

// -----------------------------------------------------------------------------
// Scenario 11: Step 4, 5, 6 (Premises, Goods/Services, Bank) Checks
// -----------------------------------------------------------------------------
console.log('\nScenario 11: Step 4, 5, 6 Checks');
const validPremisesState = {
  premisesDetails: {
    buildingNumber: 'Shop 1',
    street: 'Main Road',
    city: 'New Delhi',
    state: '07',
    pinCode: '110001',
    possessionType: 'owned',
  },
};
assert(Object.keys(validateGSTPremises(validPremisesState)).length === 0, 'Valid premises passes');

const validGoodsState = {
  goodsServices: [{ id: '1', type: 'goods', hsnSacCode: '6203', description: 'Garments' }],
};
assert(Object.keys(validateGSTGoodsServices(validGoodsState)).length === 0, 'Valid goods passes');

const validBankState = {
  bankDetails: {
    accountNumber: '50200012345678',
    accountType: 'Current',
    ifsc: 'HDFC0000050',
    bankName: 'HDFC Bank',
  },
};
assert(Object.keys(validateGSTBankDetails(validBankState)).length === 0, 'Valid bank details pass');

// -----------------------------------------------------------------------------
// Scenario 12: Statutory Disclaimer Text Verification
// -----------------------------------------------------------------------------
console.log('\nScenario 12: Statutory Disclaimer Text Verification');
assert(
  GST_DISCLAIMER_TEXT &&
    GST_DISCLAIMER_TEXT.includes('CGST') &&
    GST_DISCLAIMER_TEXT.includes('GST Portal'),
  'Statutory GST disclaimer text configured with CGST reference'
);

console.log('\n===============================================================');
console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('===============================================================');

if (failedTests === 0) {
  console.log('🎉 ALL 12 GST TEST SCENARIOS PASSED WITH 100% SUCCESS!\n');
} else {
  process.exit(1);
}
