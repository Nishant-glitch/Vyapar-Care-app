/**
 * TRADEMARK REGISTRATION (FORM TM-A) AUTOMATED TEST SUITE
 * Complete validation of 15 Applicant Types, 45 Nice Classes, Dynamic Documents,
 * Fee Calculation Engine, Step Validation Rules, and Admin Operations.
 */

import {
  TM_APPLICANT_TYPES,
  TM_MARK_TYPES,
  NICE_CLASSES,
  getRequiredTMDocuments,
  calculateTMFees,
  TM_APPLICATION_STATUSES,
  TM_DISCLAIMER_TEXT,
} from '../config/trademarkConfig.js';

import {
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
} from '../utils/tmValidation.js';

import {
  submitTMApplication,
  getTMApplications,
  getTMApplicationById,
  updateTMApplicationStatus,
  updateTMDocumentStatus,
  requestTMDocument,
} from '../lib/database.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTestSuite() {
  console.log('\n================================================================');
  console.log('  RUNNING TRADEMARK REGISTRATION (FORM TM-A) COMPREHENSIVE TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST GROUP 1: CONFIGURATION & CONSTANTS
  // -------------------------------------------------------------
  console.log('Test Group 1: Configuration & Master Constants');

  assert(TM_APPLICANT_TYPES.length === 15, 'Exactly 15 official applicant types configured');
  assert(NICE_CLASSES.length === 45, 'Exactly 45 Nice Classification classes configured (1-45)');

  const goodsClasses = NICE_CLASSES.filter((c) => c.type === 'goods');
  const servicesClasses = NICE_CLASSES.filter((c) => c.type === 'services');
  assert(goodsClasses.length === 34, 'Classes 1 to 34 are categorized as Goods (34 classes)');
  assert(servicesClasses.length === 11, 'Classes 35 to 45 are categorized as Services (11 classes)');

  assert(TM_MARK_TYPES.length >= 6, 'All standard Mark Types supported (Word, Logo, Device, 3D, Colour, Sound)');
  assert(TM_DISCLAIMER_TEXT && TM_DISCLAIMER_TEXT.includes('Trade Marks Act'), 'Statutory disclaimer text is defined');

  // -------------------------------------------------------------
  // TEST GROUP 2: DYNAMIC DOCUMENT MATRIX GENERATOR
  // -------------------------------------------------------------
  console.log('\nTest Group 2: Dynamic Document Matrix Generator');

  // Scenario 2.1: Individual (Proposed to be used, Word mark)
  const docsIndividual = getRequiredTMDocuments({
    applicantType: 'individual',
    markDetails: { markType: 'word' },
    usageDetails: { usageStatus: 'proposed' },
    agentDetails: { isFiledThroughAgent: true },
  });
  assert(
    docsIndividual.some((d) => d.id === 'pan_card' && d.required),
    'Individual requires PAN Card'
  );
  assert(
    docsIndividual.some((d) => d.id === 'aadhaar_id' && d.required),
    'Individual requires Identity Proof'
  );
  assert(
    docsIndividual.some((d) => d.id === 'tm_48' && d.required),
    'Form TM-48 required when filed through Agent'
  );
  assert(
    !docsIndividual.some((d) => d.id === 'user_affidavit'),
    'No User Affidavit required when Proposed to be Used'
  );

  // Scenario 2.2: Startup (Already in Use, Logo mark)
  const docsStartup = getRequiredTMDocuments({
    applicantType: 'startup',
    isStartupClaimed: true,
    markDetails: { markType: 'logo' },
    usageDetails: { usageStatus: 'used' },
    agentDetails: { isFiledThroughAgent: false },
  });
  assert(
    docsStartup.some((d) => d.id === 'startup_cert' && d.required),
    'DPIIT Startup certificate mandatory when startup is claimed'
  );
  assert(
    docsStartup.some((d) => d.id === 'tm_logo' && d.required),
    'Trademark artwork file mandatory for Logo mark'
  );
  assert(
    docsStartup.some((d) => d.id === 'user_affidavit' && d.required),
    'User Affidavit on stamp paper mandatory when Already in Use'
  );
  assert(
    docsStartup.some((d) => d.id === 'prior_use_invoices' && d.required),
    'Earliest sales invoices mandatory for Prior Use'
  );
  assert(
    !docsStartup.some((d) => d.id === 'tm_48'),
    'No TM-48 required when direct self-filing'
  );

  // Scenario 2.3: Private Limited Company
  const docsCompany = getRequiredTMDocuments({
    applicantType: 'company_pvt',
    markDetails: { markType: 'word_logo' },
    usageDetails: { usageStatus: 'proposed' },
  });
  assert(
    docsCompany.some((d) => d.id === 'coi' && d.required),
    'Certificate of Incorporation mandatory for Private Limited Company'
  );
  assert(
    docsCompany.some((d) => d.id === 'board_resolution' && d.required),
    'Board Resolution / Authorization mandatory for Corporate entities'
  );

  // Scenario 2.4: Partnership Firm
  const docsPartnership = getRequiredTMDocuments({
    applicantType: 'partnership_firm',
    markDetails: { markType: 'word' },
    usageDetails: { usageStatus: 'proposed' },
  });
  assert(
    docsPartnership.some((d) => d.id === 'partnership_deed' && d.required),
    'Partnership Deed mandatory for Partnership Firm'
  );

  // -------------------------------------------------------------
  // TEST GROUP 3: OFFICIAL IP INDIA FEE CALCULATION ENGINE
  // -------------------------------------------------------------
  console.log('\nTest Group 3: Official Fee Calculation Engine');

  // Scenario 3.1: Individual (1 Class)
  const feeInd1 = calculateTMFees({ applicantType: 'individual', selectedClasses: [35] });
  assert(feeInd1.serviceFee === 8000, 'Service fee is ₹8,000');
  assert(feeInd1.perClassGovtFee === 4500, 'Individual per-class govt fee is ₹4,500');
  assert(feeInd1.totalGovtFee === 4500, 'Individual 1-class govt fee is ₹4,500');
  assert(feeInd1.totalPayable === 12500, 'Total payable for Individual 1-class is ₹12,500 (8000 + 4500)');
  assert(feeInd1.isConcessionCategory === true, 'Individual qualifies for concession rate');

  // Scenario 3.2: Startup (2 Classes Multi-Class Filing)
  const feeStartup2 = calculateTMFees({
    applicantType: 'startup',
    isStartupClaimed: true,
    selectedClasses: [9, 42],
  });
  assert(feeStartup2.totalGovtFee === 9000, 'Startup 2-class govt fee is ₹9,000 (4500 * 2)');
  assert(feeStartup2.totalPayable === 17000, 'Total payable for Startup 2-class is ₹17,000 (8000 + 9000)');

  // Scenario 3.3: Private Limited Company (1 Class)
  const feeCompany1 = calculateTMFees({
    applicantType: 'company_pvt',
    isStartupClaimed: false,
    selectedClasses: [25],
  });
  assert(feeCompany1.perClassGovtFee === 9000, 'Body corporate per-class govt fee is ₹9,000');
  assert(feeCompany1.totalGovtFee === 9000, 'Company 1-class govt fee is ₹9,000');
  assert(feeCompany1.totalPayable === 17000, 'Total payable for Company 1-class is ₹17,000 (8000 + 9000)');
  assert(feeCompany1.isConcessionCategory === false, 'Company pays standard statutory rate');

  // Scenario 3.4: Company with DPIIT Startup recognition (1 Class)
  const feeCompanyStartup = calculateTMFees({
    applicantType: 'company_pvt',
    isStartupClaimed: true,
    selectedClasses: [41],
  });
  assert(
    feeCompanyStartup.perClassGovtFee === 4500 && feeCompanyStartup.isConcessionCategory === true,
    'Company with DPIIT Startup recognition gets 50% concession (₹4,500 per class)'
  );

  // -------------------------------------------------------------
  // TEST GROUP 4: STEP-BY-STEP VALIDATION LOGIC
  // -------------------------------------------------------------
  console.log('\nTest Group 4: Step-by-Step Validation Logic');

  // 4.1 Regex Helper Validations
  assert(validatePAN('ABCDE1234F'), 'Valid PAN format ABCDE1234F passes');
  assert(!validatePAN('ABC1234F'), 'Invalid short PAN rejected');
  assert(validateMobile('9876543210'), 'Valid 10-digit mobile passes');
  assert(!validateMobile('12345'), 'Invalid mobile rejected');
  assert(validateEmail('test@vyaparcare.com'), 'Valid email passes');
  assert(validatePIN('110001'), 'Valid 6-digit PIN code passes');
  assert(validateCIN('U72200DL2026PTC123456'), 'Valid 21-digit CIN passes');
  assert(validateLLPIN('AAB-1234'), 'Valid LLPIN passes');

  // 4.2 Applicant Details Validation
  const validApplicantData = {
    applicantType: 'individual',
    applicantDetails: {
      applicantLegalName: 'Rahul Verma',
      pan: 'ABCDE1234F',
      mobile: '9876543210',
      email: 'rahul@example.com',
      address1: '123 MG Road',
      city: 'Bengaluru',
      state: '29',
      pinCode: '560001',
    },
  };
  assert(
    Object.keys(validateTMApplicantDetails(validApplicantData)).length === 0,
    'Valid applicant details yield 0 errors'
  );

  const invalidApplicantData = {
    applicantType: 'company_pvt',
    applicantDetails: {
      applicantLegalName: '',
      pan: 'INVALID',
      mobile: '123',
      email: 'bad-email',
      cin: 'BAD_CIN',
    },
  };
  const appErrs = validateTMApplicantDetails(invalidApplicantData);
  assert(appErrs.applicantLegalName && appErrs.pan && appErrs.mobile && appErrs.cin, 'Invalid corporate applicant details correctly flagged with specific errors');

  // 4.3 Mark Details Validation
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
  assert(markErrs.languageName && markErrs.transliteration, 'Missing foreign language transliteration and translation flagged');

  // 4.4 Classes Validation
  assert(
    Object.keys(validateTMClasses({ selectedClasses: [35] })).length === 0,
    'Selecting class 35 passes class validation'
  );
  assert(
    validateTMClasses({ selectedClasses: [] }).selectedClasses !== undefined,
    'Empty class selection rejected'
  );

  // 4.5 Usage Validation
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
  assert(usageErrs.firstUseDate && usageErrs.firstUsePlace, 'Prior use claim without first use date/place rejected');

  // -------------------------------------------------------------
  // TEST GROUP 5: DATABASE SUBMISSION & WORKFLOW OPERATIONS
  // -------------------------------------------------------------
  console.log('\nTest Group 5: Database & Admin Workflow Operations');

  // Submit test application
  const testPayload = {
    applicantType: 'individual',
    applicantDetails: validApplicantData.applicantDetails,
    markDetails: { markType: 'word', trademarkName: 'TESTMARK' },
    selectedClasses: [35],
    usageDetails: { usageStatus: 'proposed' },
    agentDetails: { isFiledThroughAgent: true, agentName: 'VyaparCare Legal Desk' },
    documents: docsIndividual,
    calculatedFees: feeInd1,
  };

  const submitRes = await submitTMApplication(testPayload);
  assert(
    submitRes.applicationId && submitRes.applicationId.startsWith('TM-2026-'),
    `Application submitted with official ID format: ${submitRes.applicationId}`
  );

  // Retrieve applications
  const allApps = await getTMApplications();
  assert(allApps.length >= 2, `Retrieved ${allApps.length} applications from database store`);

  const fetchedApp = await getTMApplicationById(submitRes.applicationId);
  assert(
    fetchedApp && fetchedApp.markDetails?.trademarkName === 'TESTMARK',
    'Retrieved submitted application by ID successfully'
  );

  // Admin status update
  await updateTMApplicationStatus(submitRes.applicationId, 'under_review');
  const updatedApp = await getTMApplicationById(submitRes.applicationId);
  assert(updatedApp.status === 'under_review', 'Admin updated application status to under_review');

  // Admin document approval
  await updateTMDocumentStatus(submitRes.applicationId, 'pan_card', 'approved');
  const appAfterDoc = await getTMApplicationById(submitRes.applicationId);
  const panDoc = appAfterDoc.documents.find((d) => d.id === 'pan_card');
  assert(panDoc && panDoc.status === 'approved', 'Admin approved pan_card document');

  // Admin request additional document
  await requestTMDocument(
    submitRes.applicationId,
    'Electricity Bill of Principal Place of Business',
    'Address proof mismatch'
  );
  const appAfterReq = await getTMApplicationById(submitRes.applicationId);
  assert(
    appAfterReq.status === 'clarification_required',
    'Status transitioned to clarification_required after requesting additional document'
  );
  assert(
    appAfterReq.documents.some((d) => d.label === 'Electricity Bill of Principal Place of Business'),
    'Additional document added to application checklist'
  );

  console.log('\n================================================================');
  console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
