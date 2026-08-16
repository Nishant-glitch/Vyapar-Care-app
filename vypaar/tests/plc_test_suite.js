/**
 * Automated Verification Test Suite for Private Limited Company Registration
 * Tests all 12 edge cases and MCA rules from user requirements.
 */

const {
  getRequiredPLCDocuments,
  calculatePLCFees,
  DYNAMIC_ACTIVITY_FIELDS,
} = require('../config/plcDocumentConfig');

const {
  validatePAN,
  validateDIN,
  validateAadhaar,
  validateMobile,
  validateApplicant,
  validateCompanyDetails,
  validateDirectors,
  validateSubscribers,
  validateRegisteredOffice,
  validateBusinessDetails,
  validateDocumentUploads,
} = require('../utils/plcValidation');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

console.log('===============================================================');
console.log('🧪 RUNNING PLC APPLICATION FORM TEST SUITE (12 SCENARIOS)');
console.log('===============================================================\n');

// -----------------------------------------------------------------------------
// Scenario 1: 2 Directors + Owned Premises Documents Matrix
// -----------------------------------------------------------------------------
console.log('Scenario 1: 2 Directors + Owned Premises Documents Matrix');
const docsOwned = getRequiredPLCDocuments({
  directorCount: 2,
  directors: [{ fullName: 'Dir 1' }, { fullName: 'Dir 2' }],
  subscriberCount: 2,
  subscribers: [{ fullName: 'Sub 1' }, { fullName: 'Sub 2' }],
  premisesType: 'owned',
});
assert(
  docsOwned.some((d) => d.id === 'office_ownership_proof' && d.required),
  'Owned office includes Ownership Proof (Electricity/Sale Deed/Tax Receipt)'
);
assert(
  !docsOwned.some((d) => d.id === 'office_rent_agreement'),
  'Owned office does NOT include Rent Agreement'
);

// -----------------------------------------------------------------------------
// Scenario 2: 2 Directors + Rented Premises Documents Matrix
// -----------------------------------------------------------------------------
console.log('\nScenario 2: 2 Directors + Rented Premises Documents Matrix');
const docsRented = getRequiredPLCDocuments({
  directorCount: 2,
  directors: [{ fullName: 'Dir 1' }, { fullName: 'Dir 2' }],
  subscriberCount: 2,
  subscribers: [{ fullName: 'Sub 1' }, { fullName: 'Sub 2' }],
  premisesType: 'rented',
});
assert(
  docsRented.some((d) => d.id === 'office_rent_agreement' && d.required),
  'Rented office includes Rent Agreement'
);
assert(
  docsRented.some((d) => d.id === 'office_noc' && d.required),
  'Rented office includes Owner NOC'
);
assert(
  docsRented.some((d) => d.id === 'office_utility_bill' && d.required),
  'Rented office includes Utility Bill'
);

// -----------------------------------------------------------------------------
// Scenario 3: 2 Directors + Consent Premises Documents Matrix
// -----------------------------------------------------------------------------
console.log('\nScenario 3: 2 Directors + Consent Premises Documents Matrix');
const docsConsent = getRequiredPLCDocuments({
  directorCount: 2,
  directors: [{ fullName: 'Dir 1' }, { fullName: 'Dir 2' }],
  subscriberCount: 2,
  subscribers: [{ fullName: 'Sub 1' }, { fullName: 'Sub 2' }],
  premisesType: 'consent',
});
assert(
  docsConsent.some((d) => d.id === 'office_consent_noc' && d.required),
  'Consent office includes Owner Consent Letter / NOC'
);
assert(
  !docsConsent.some((d) => d.id === 'office_rent_agreement'),
  'Consent office does NOT include Rent Agreement'
);

// -----------------------------------------------------------------------------
// Scenario 4: Director = Subscriber Deduplication & Document Reuse
// -----------------------------------------------------------------------------
console.log('\nScenario 4: Director = Subscriber Deduplication & Document Reuse');
const docsReused = getRequiredPLCDocuments({
  directorCount: 2,
  directors: [{ fullName: 'Rajesh Kumar' }, { fullName: 'Pooja Kumar' }],
  subscriberCount: 2,
  subscribers: [
    { fullName: 'Rajesh Kumar', isDirector: true, linkedDirectorIndex: 0 },
    { fullName: 'Pooja Kumar', isDirector: true, linkedDirectorIndex: 1 },
  ],
  premisesType: 'rented',
});
const sub1Pan = docsReused.find((d) => d.id === 'subscriber_pan__0');
assert(
  sub1Pan && sub1Pan.isReused && sub1Pan.reusedFromDocId === 'director_pan__0',
  'Subscriber 1 PAN is linked to Director 1 PAN with isReused=true'
);
assert(
  sub1Pan.reusedFromLabel.includes('Director 1'),
  'Reused label correctly states reused from Director 1'
);

// -----------------------------------------------------------------------------
// Scenario 5: Existing DIN vs New DIN Validation
// -----------------------------------------------------------------------------
console.log('\nScenario 5: Existing DIN vs New DIN Validation');
assert(validateDIN('01234567'), 'Valid 8-digit DIN 01234567 is accepted');
assert(!validateDIN('1234'), 'Invalid short DIN 1234 is rejected');
assert(!validateDIN('ABC12345'), 'Alphanumeric DIN is rejected');

const dirErrors = validateDirectors(
  [
    { fullName: 'Dir 1', hasDIN: true, din: '123' }, // invalid DIN
    { fullName: 'Dir 2', hasDIN: false }, // new DIN valid
  ],
  2
);
assert(
  dirErrors['director_0_din'] !== undefined,
  'Director with hasDIN=true and 3 digits returns validation error'
);

// -----------------------------------------------------------------------------
// Scenario 6: PAN & Aadhaar Regex Validations
// -----------------------------------------------------------------------------
console.log('\nScenario 6: PAN & Aadhaar Regex Validations');
assert(validatePAN('ABCDE1234F'), 'Valid PAN ABCDE1234F accepted');
assert(!validatePAN('12345ABCDE'), 'Invalid PAN 12345ABCDE rejected');
assert(!validatePAN('ABCDE12345'), 'Invalid PAN with numbers at end rejected');
assert(validateAadhaar('123456789012'), 'Valid 12-digit Aadhaar accepted');
assert(!validateAadhaar('12345'), 'Invalid short Aadhaar rejected');

// -----------------------------------------------------------------------------
// Scenario 7: Minimum 2 Directors & 2 Subscribers Enforcement
// -----------------------------------------------------------------------------
console.log('\nScenario 7: Minimum 2 Directors & 2 Subscribers Enforcement');
const compErr1 = validateCompanyDetails({
  proposedName1: 'Acme Corp Pvt Ltd',
  proposedName2: 'Acme Solutions Pvt Ltd',
  registeredState: '07',
  mainActivity: 'it_software',
  description: 'IT Services',
  authorizedCapital: 100000,
  paidUpCapital: 100000,
  directorCount: 1, // Invalid
  subscriberCount: 1, // Invalid
});
assert(
  compErr1.directorCount !== undefined,
  'directorCount = 1 triggers minimum 2 directors error'
);
assert(
  compErr1.subscriberCount !== undefined,
  'subscriberCount = 1 triggers minimum 2 subscribers error'
);

// -----------------------------------------------------------------------------
// Scenario 8: Capital Validation: Paid-up <= Authorized
// -----------------------------------------------------------------------------
console.log('\nScenario 8: Capital Validation: Paid-up <= Authorized');
const capErr = validateCompanyDetails({
  proposedName1: 'Acme Corp Pvt Ltd',
  proposedName2: 'Acme Solutions Pvt Ltd',
  registeredState: '07',
  mainActivity: 'it_software',
  description: 'IT Services',
  authorizedCapital: 100000,
  paidUpCapital: 200000, // Invalid: PaidUp > Authorized
  directorCount: 2,
  subscriberCount: 2,
});
assert(
  capErr.paidUpCapital !== undefined,
  'Paid-up Capital (2 Lakh) > Authorized Capital (1 Lakh) triggers error'
);

// -----------------------------------------------------------------------------
// Scenario 9: Zero MCA Filing Fee for Capital <= 15 Lakhs
// -----------------------------------------------------------------------------
console.log('\nScenario 9: Zero MCA Filing Fee for Capital <= 15 Lakhs');
const fee1 = calculatePLCFees({ authorizedCapital: 100000, directorCount: 2 });
assert(
  fee1.mcaGovtFee === 0,
  'Authorized Capital ₹1,00,000 has ₹0 MCA Govt filing fee'
);
assert(
  fee1.totalFee === 15000 && fee1.advanceAmount === 7500,
  'Professional Fee is ₹15,000 with 50% advance (₹7,500)'
);

const fee2 = calculatePLCFees({ authorizedCapital: 2500000, directorCount: 2 });
assert(
  fee2.mcaGovtFee > 0,
  'Authorized Capital ₹25,00,000 has MCA Govt filing fee > 0'
);

// -----------------------------------------------------------------------------
// Scenario 10: Dynamic Business Activity Fields Matrix
// -----------------------------------------------------------------------------
console.log('\nScenario 10: Dynamic Business Activity Fields Matrix');
assert(
  DYNAMIC_ACTIVITY_FIELDS['it_software'].length >= 3,
  'it_software has specialized dynamic fields (Software Type, Hosting Model, Target Market)'
);
assert(
  DYNAMIC_ACTIVITY_FIELDS['manufacturing'].some((f) => f.key === 'productCategory'),
  'manufacturing has productCategory field'
);
assert(
  DYNAMIC_ACTIVITY_FIELDS['food_restaurant'].some((f) => f.key === 'fssaiStatus'),
  'food_restaurant has fssaiStatus field'
);

// -----------------------------------------------------------------------------
// Scenario 11: Document Upload Completeness Validator
// -----------------------------------------------------------------------------
console.log('\nScenario 11: Document Upload Completeness Validator');
const testDocsIncomplete = [
  { id: 'dir_pan_0', label: 'Dir 1 PAN', required: true, status: 'required', file: null },
  { id: 'office_rent', label: 'Rent Agreement', required: true, status: 'uploaded', file: { name: 'rent.pdf' } },
];
const docCheckErr = validateDocumentUploads(testDocsIncomplete);
assert(
  docCheckErr['dir_pan_0'] !== undefined,
  'Missing mandatory document dir_pan_0 is caught by validator'
);

const testDocsComplete = [
  { id: 'dir_pan_0', label: 'Dir 1 PAN', required: true, status: 'uploaded', file: { name: 'pan.pdf' } },
  { id: 'sub_pan_0', label: 'Sub 1 PAN', required: true, isReused: true, status: 'reused' },
];
const docCheckSuccess = validateDocumentUploads(testDocsComplete);
assert(
  Object.keys(docCheckSuccess).length === 0,
  'Uploaded and reused documents satisfy mandatory requirements'
);

// -----------------------------------------------------------------------------
// Scenario 12: Shareholding Summation to 100%
// -----------------------------------------------------------------------------
console.log('\nScenario 12: Shareholding Summation to 100%');
const subErrPct = validateSubscribers(
  [
    { fullName: 'Sub 1', pan: 'ABCDE1234F', mobile: '9876543210', email: 's1@test.com', sharesCount: 5000, shareholdingPercent: 40 },
    { fullName: 'Sub 2', pan: 'FGHIJ5678K', mobile: '9876543211', email: 's2@test.com', sharesCount: 5000, shareholdingPercent: 40 },
  ],
  2
);
assert(
  subErrPct.totalShareholding !== undefined,
  'Subscribers total shareholding = 80% (<100%) triggers error'
);

const subSuccessPct = validateSubscribers(
  [
    { fullName: 'Sub 1', pan: 'ABCDE1234F', mobile: '9876543210', email: 's1@test.com', sharesCount: 5000, shareholdingPercent: 50 },
    { fullName: 'Sub 2', pan: 'FGHIJ5678K', mobile: '9876543211', email: 's2@test.com', sharesCount: 5000, shareholdingPercent: 50 },
  ],
  2
);
assert(
  subSuccessPct.totalShareholding === undefined,
  'Subscribers total shareholding = 100% passes validation'
);

console.log('\n===============================================================');
console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('===============================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL 12 TEST SCENARIOS PASSED WITH 100% SUCCESS!');
}
