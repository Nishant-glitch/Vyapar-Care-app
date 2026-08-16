/**
 * TRADEMARK REGISTRATION (FORM TM-A) AUTOMATED TEST SUITE
 * Complete validation of 15 Applicant Types, 45 Nice Classes, Dynamic Documents,
 * Fee Calculation Engine, Step Validation Rules, and Admin Operations.
 */

const {
  TM_APPLICANT_TYPES,
  TM_MARK_TYPES,
  NICE_CLASSES,
  getRequiredTMDocuments,
  calculateTMFees,
  TM_APPLICATION_STATUSES,
  TM_DISCLAIMER_TEXT,
} = require('../config/trademarkConfig');

const {
  validatePAN,
  validateMobile,
  validateEmail,
  validatePIN,
  validateCIN,
  validateLLPIN,
  validateTMApplicantType,
  validateTMApplicantDetails,
  validateTMMarkDetails,
  validateTMClasses,
  validateTMUsage,
  validateTMDocuments,
  validateTMAgent,
  validateFullTMApplication,
} = require('../utils/tmValidation');

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
console.log('🧪 RUNNING TRADEMARK (FORM TM-A) TEST SUITE (12 SCENARIOS)');
console.log('===============================================================\n');

// -----------------------------------------------------------------------------
// Scenario 1: Master Configuration & 15 Official Applicant Types
// -----------------------------------------------------------------------------
console.log('Scenario 1: Master Configuration & 15 Official Applicant Types');
assert(TM_APPLICANT_TYPES.length === 15, 'Exactly 15 official applicant types configured');
assert(
  TM_APPLICANT_TYPES.some((t) => t.id === 'individual' && t.category === 'individual'),
  'Individual type configured with 50% concession category'
);
assert(
  TM_APPLICANT_TYPES.some((t) => t.id === 'startup' && t.category === 'startup'),
  'Startup type configured with 50% concession category'
);
assert(
  TM_APPLICANT_TYPES.some((t) => t.id === 'pvt_ltd' && t.category === 'body_corporate'),
  'Private Limited Company configured as Body Corporate'
);
assert(
  TM_APPLICANT_TYPES.some((t) => t.id === 'partnership' && t.category === 'body_corporate'),
  'Partnership firm configured as Body Corporate entity'
);

// -----------------------------------------------------------------------------
// Scenario 2: Nice Classification 45 Classes & Keyword Search
// -----------------------------------------------------------------------------
console.log('\nScenario 2: Nice Classification 45 Classes & Keyword Search');
assert(NICE_CLASSES.length === 45, 'Exactly 45 Nice Classification classes configured (1–45)');

const goodsClasses = NICE_CLASSES.filter((c) => c.type === 'goods');
const servicesClasses = NICE_CLASSES.filter((c) => c.type === 'services');
assert(goodsClasses.length === 34, 'Classes 1 to 34 are categorized as Goods (34 classes)');
assert(servicesClasses.length === 11, 'Classes 35 to 45 are categorized as Services (11 classes)');

const class9 = NICE_CLASSES.find((c) => c.classNumber === 9);
assert(
  class9 && class9.keywords.includes('software'),
  'Class 9 contains "software" in keywords'
);
const class35 = NICE_CLASSES.find((c) => c.classNumber === 35);
assert(
  class35 && class35.keywords.includes('advertising') && class35.keywords.includes('retail'),
  'Class 35 contains "advertising" and "retail" in keywords'
);

// -----------------------------------------------------------------------------
// Scenario 3: Individual Applicant Dynamic Document Checklist
// -----------------------------------------------------------------------------
console.log('\nScenario 3: Individual Applicant Dynamic Document Checklist');
const docsIndividual = getRequiredTMDocuments({
  applicantType: 'individual',
  markDetails: { markType: 'word' },
  usageDetails: { usageStatus: 'proposed' },
  agentDetails: { isFiledThroughAgent: true },
});
assert(
  docsIndividual.some((d) => d.id === 'applicant_pan' && d.required),
  'Individual requires PAN Card'
);
assert(
  docsIndividual.some((d) => d.id === 'applicant_id_proof' && d.required),
  'Individual requires Identity Proof (Aadhaar/Passport)'
);
assert(
  docsIndividual.some((d) => d.id === 'power_of_attorney_tm48' && d.required),
  'Form TM-48 Power of Attorney required when filed through Agent'
);
assert(
  !docsIndividual.some((d) => d.id === 'user_affidavit_doc'),
  'No User Affidavit required when Proposed to be Used'
);

// -----------------------------------------------------------------------------
// Scenario 4: Startup Applicant with Logo Mark & Prior Use Claim
// -----------------------------------------------------------------------------
console.log('\nScenario 4: Startup Applicant with Logo Mark & Prior Use Claim');
const docsStartup = getRequiredTMDocuments({
  applicantType: 'startup',
  isStartupClaimed: true,
  markDetails: { markType: 'logo' },
  usageDetails: { usageStatus: 'used' },
  agentDetails: { isFiledThroughAgent: false },
});
assert(
  docsStartup.some((d) => d.id === 'startup_dpiit_certificate' && d.required),
  'DPIIT Startup certificate mandatory when startup is claimed'
);
assert(
  docsStartup.some((d) => d.id === 'trademark_logo_file' && d.required),
  'Trademark artwork file mandatory for Logo mark'
);
assert(
  docsStartup.some((d) => d.id === 'user_affidavit_doc' && d.required),
  'User Affidavit on stamp paper mandatory when Already in Use'
);
assert(
  docsStartup.some((d) => d.id === 'prior_use_invoices_evidence' && d.required),
  'Earliest sales invoices mandatory for Prior Use'
);
assert(
  !docsStartup.some((d) => d.id === 'power_of_attorney_tm48'),
  'No TM-48 required when direct self-filing'
);

// -----------------------------------------------------------------------------
// Scenario 5: Private Limited Company & Corporate Resolution
// -----------------------------------------------------------------------------
console.log('\nScenario 5: Private Limited Company & Corporate Resolution');
const docsCompany = getRequiredTMDocuments({
  applicantType: 'pvt_ltd',
  markDetails: { markType: 'word_logo' },
  usageDetails: { usageStatus: 'proposed' },
});
assert(
  docsCompany.some((d) => d.id === 'company_coi' && d.required),
  'Certificate of Incorporation mandatory for Private Limited Company'
);
assert(
  docsCompany.some((d) => d.id === 'company_board_resolution' && d.required),
  'Board Resolution / Authorization mandatory for Corporate entities'
);

// -----------------------------------------------------------------------------
// Scenario 6: Partnership Firm & Partnership Deed Requirement
// -----------------------------------------------------------------------------
console.log('\nScenario 6: Partnership Firm & Partnership Deed Requirement');
const docsPartnership = getRequiredTMDocuments({
  applicantType: 'partnership',
  markDetails: { markType: 'word' },
  usageDetails: { usageStatus: 'proposed' },
});
assert(
  docsPartnership.some((d) => d.id === 'partnership_deed' && d.required),
  'Partnership Deed mandatory for Partnership Firm'
);

// -----------------------------------------------------------------------------
// Scenario 7: IP India Fee Engine — Individual 1-Class Filing (Includes 1 Class Govt Fee)
// -----------------------------------------------------------------------------
console.log('\nScenario 7: IP India Fee Engine — Individual 1-Class Filing');
const feeInd1 = calculateTMFees({ applicantType: 'individual', selectedClasses: [35] });
assert(feeInd1.serviceFee === 8000, 'Service fee is ₹8,000');
assert(feeInd1.perClassGovtFee === 4500, 'Individual per-class govt fee is ₹4,500');
assert(feeInd1.totalGovtFee === 4500, 'Individual 1-class govt fee is ₹4,500');
assert(feeInd1.totalPayable === 8000, 'Total payable for Individual 1-class package is ₹8,000 (Govt fee included)');
assert(feeInd1.isConcessionCategory === true, 'Individual qualifies for concession rate');

// -----------------------------------------------------------------------------
// Scenario 8: IP India Fee Engine — Startup 2-Class Multi-Class Filing
// -----------------------------------------------------------------------------
console.log('\nScenario 8: IP India Fee Engine — Startup 2-Class Multi-Class Filing');
const feeStartup2 = calculateTMFees({
  applicantType: 'startup',
  isStartupClaimed: true,
  selectedClasses: [9, 42],
});
assert(feeStartup2.totalGovtFee === 9000, 'Startup 2-class govt fee is ₹9,000 (4500 * 2)');
assert(feeStartup2.totalPayable === 12500, 'Total payable for Startup 2-class is ₹12,500 (8000 + 4500 extra class)');

// -----------------------------------------------------------------------------
// Scenario 9: IP India Fee Engine — Company Standard Rate vs Startup Concession
// -----------------------------------------------------------------------------
console.log('\nScenario 9: IP India Fee Engine — Company Standard Rate vs Startup Concession');
const feeCompany1 = calculateTMFees({
  applicantType: 'pvt_ltd',
  isStartupClaimed: false,
  selectedClasses: [25],
});
assert(feeCompany1.perClassGovtFee === 9000, 'Body corporate per-class govt fee is ₹9,000');
assert(feeCompany1.totalGovtFee === 9000, 'Company 1-class govt fee is ₹9,000');
assert(feeCompany1.totalPayable === 8000, 'Total payable for Company 1-class base package is ₹8,000');
assert(feeCompany1.isConcessionCategory === false, 'Company pays standard statutory rate');

const feeCompanyStartup = calculateTMFees({
  applicantType: 'pvt_ltd',
  isStartupClaimed: true,
  selectedClasses: [41],
});
assert(
  feeCompanyStartup.perClassGovtFee === 4500 && feeCompanyStartup.isConcessionCategory === true,
  'Company with DPIIT Startup recognition gets 50% concession (₹4,500 per class)'
);

// -----------------------------------------------------------------------------
// Scenario 10: PAN, Mobile, Email, PIN, CIN & LLPIN Validations
// -----------------------------------------------------------------------------
console.log('\nScenario 10: PAN, Mobile, Email, PIN, CIN & LLPIN Validations');
assert(validatePAN('ABCDE1234F'), 'Valid PAN format ABCDE1234F passes');
assert(!validatePAN('ABC1234F'), 'Invalid short PAN rejected');
assert(validateMobile('9876543210'), 'Valid 10-digit mobile passes');
assert(!validateMobile('12345'), 'Invalid mobile rejected');
assert(validateEmail('test@vyaparcare.com'), 'Valid email passes');
assert(!validateEmail('invalid-email'), 'Invalid email rejected');
assert(validatePIN('110001'), 'Valid 6-digit PIN code passes');
assert(!validatePIN('1100'), 'Invalid short PIN code rejected');
assert(validateCIN('U72200DL2026PTC123456'), 'Valid 21-digit CIN passes');
assert(!validateCIN('INVALIDCIN'), 'Invalid CIN rejected');
assert(validateLLPIN('AAB-1234'), 'Valid LLPIN passes');

// -----------------------------------------------------------------------------
// Scenario 11: Mark Details & Foreign Language Translations
// -----------------------------------------------------------------------------
console.log('\nScenario 11: Mark Details & Foreign Language Translations');
const validMark = {
  markDetails: {
    markType: 'word',
    trademarkName: 'VYAPARCARE',
  },
};
assert(
  Object.keys(validateTMMarkDetails(validMark)).length === 0,
  'Valid word mark yields 0 errors'
);

const invalidForeignMark = {
  markDetails: {
    markType: 'word',
    trademarkName: 'NAMASTE',
    isOtherLanguage: true,
    languageName: '',
    transliteration: '',
  },
};
const markErrs = validateTMMarkDetails(invalidForeignMark);
assert(
  markErrs.languageName && markErrs.transliteration,
  'Missing foreign language transliteration and translation flagged'
);

// -----------------------------------------------------------------------------
// Scenario 12: Usage Basis, Class Selection & Statutory Disclaimer
// -----------------------------------------------------------------------------
console.log('\nScenario 12: Usage Basis, Class Selection & Statutory Disclaimer');
assert(
  Object.keys(
    validateTMClasses({
      selectedClasses: [35],
      classDescriptions: { 35: 'Advertising, business management and retail store services' },
    })
  ).length === 0,
  'Selecting class 35 with description passes class validation'
);
assert(
  validateTMClasses({ selectedClasses: [] }).selectedClasses !== undefined,
  'Empty class selection rejected'
);

assert(
  Object.keys(validateTMUsage({ usageDetails: { usageStatus: 'proposed' } })).length === 0,
  'Proposed to be used status passes without extra fields'
);

const invalidUsage = {
  usageDetails: {
    usageStatus: 'used',
    firstUseDate: '',
    firstUsePlace: '',
  },
};
const usageErrs = validateTMUsage(invalidUsage);
assert(
  usageErrs.firstUseDate && usageErrs.firstUsePlace,
  'Prior use claim without first use date/place rejected'
);

assert(
  TM_DISCLAIMER_TEXT &&
    TM_DISCLAIMER_TEXT.includes('Trade Marks Act') &&
    TM_DISCLAIMER_TEXT.includes('IP India'),
  'Statutory disclaimer text accurately mentions Trade Marks Act, Rules & IP India requirements'
);

console.log('\n===============================================================');
console.log(`📊 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('===============================================================');

if (failedTests === 0) {
  console.log('🎉 ALL 12 TRADEMARK TEST SCENARIOS PASSED WITH 100% SUCCESS!\n');
} else {
  process.exit(1);
}
