/**
 * Other Services Dynamic Requirement & Document Consultation Automated Test Suite
 * Validates 9 Categories, Hinglish Search Index, Dynamic Questionnaires,
 * Dynamic Document Matrices, "I Don't Know" flow, Validations, and Pricing.
 */

const {
  OTHER_SERVICE_BASE_INFO,
  OTHER_CATEGORIES,
  OTHER_APPLICANT_TYPES,
  OTHER_GOVERNMENT_DEPARTMENTS,
  OTHER_URGENCY_LEVELS,
  searchOtherServices,
  getServiceSpecificQuestions,
  getRequiredOtherDocuments,
  calculateOtherFees,
} = require('../config/otherServicesConfig');

const {
  validatePAN,
  validateMobile,
  validateEmail,
  validatePIN,
  validateGSTIN,
  validateOtherSelectService,
  validateOtherApplicant,
  validateOtherRequirement,
  validateOtherBusiness,
  validateFullOtherApplication,
} = require('../utils/otherServicesValidation');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failedTests++;
  }
}

function runTestSuite() {
  console.log('================================================================');
  console.log('🚀 RUNNING OTHER SERVICES DYNAMIC CONSULTATION TEST SUITE');
  console.log('================================================================\n');

  // 1. Configuration & Categories Tests
  console.log('--- 1. Configuration & Master Categories ---');
  assert(OTHER_CATEGORIES.length === 9, 'Exactly 9 Master Categories exist');
  
  const categoryIds = OTHER_CATEGORIES.map((c) => c.id);
  assert(categoryIds.includes('gst'), 'Category GST exists');
  assert(categoryIds.includes('income_tax'), 'Category Income Tax exists');
  assert(categoryIds.includes('business_reg'), 'Category Business Registrations exists');
  assert(categoryIds.includes('licensing'), 'Category Licensing exists');
  assert(categoryIds.includes('trademark_ip'), 'Category Trademark/IP exists');
  assert(categoryIds.includes('import_export'), 'Category Import/Export exists');
  assert(categoryIds.includes('company_compliance'), 'Category Company Compliance exists');
  assert(categoryIds.includes('accounting'), 'Category Accounting exists');
  assert(categoryIds.includes('other_misc'), 'Category Other / Misc exists');

  const totalServices = OTHER_CATEGORIES.reduce((acc, cat) => acc + cat.services.length, 0);
  assert(totalServices >= 50, `Catalog contains ${totalServices} total specialized services (>= 50)`);

  // 2. Search Indexing & Hinglish Keywords Tests
  console.log('\n--- 2. Search Engine & Hinglish Keyword Queries ---');
  const gstCancelSearch = searchOtherServices('gst cancel');
  assert(gstCancelSearch.length > 0 && gstCancelSearch.some((s) => s.id === 'gst_cancellation'), 'Found GST cancellation via "gst cancel"');

  const noticeSearch = searchOtherServices('notice aaya hai');
  assert(noticeSearch.length > 0 && noticeSearch.some((s) => s.id === 'gst_notice_reply'), 'Found GST Notice reply via "notice aaya hai"');

  const fssaiRenewSearch = searchOtherServices('fssai renew');
  assert(fssaiRenewSearch.length > 0 && fssaiRenewSearch.some((s) => s.id === 'fssai_renewal'), 'Found FSSAI renewal via "fssai renew"');

  const companyCloseSearch = searchOtherServices('company close');
  assert(companyCloseSearch.length > 0 && companyCloseSearch.some((s) => s.id === 'company_closure'), 'Found Company Strike Off via "company close"');

  const iecChangeSearch = searchOtherServices('iec change');
  assert(iecChangeSearch.length > 0 && iecChangeSearch.some((s) => s.id === 'iec_modification'), 'Found IEC Modification via "iec change"');

  const dscSearch = searchOtherServices('dsc banana hai');
  assert(dscSearch.length > 0 && dscSearch.some((s) => s.id === 'dsc_token'), 'Found DSC token via "dsc banana hai"');

  // 3. 10 Applicant Types & 12 Government Departments
  console.log('\n--- 3. Applicant Types & Government Departments ---');
  assert(OTHER_APPLICANT_TYPES.length === 10, '10 Applicant types configured');
  assert(OTHER_GOVERNMENT_DEPARTMENTS.length === 12, '12 Government departments configured');
  assert(OTHER_URGENCY_LEVELS.length === 5, '5 Urgency tiers configured');

  // 4. Dynamic Questionnaires & Reference Rules
  console.log('\n--- 4. Dynamic Questionnaires Matrix ---');
  const gstAmendQ = getServiceSpecificQuestions('gst_amendment');
  assert(gstAmendQ.showGSTIN === true && gstAmendQ.options.length > 0, 'GST Amendment triggers GSTIN & specific change options');

  const itNoticeQ = getServiceSpecificQuestions('it_notice_reply');
  assert(itNoticeQ.showPAN === true && itNoticeQ.showNoticeFields === true, 'IT Notice Reply triggers PAN & Notice reference fields');

  const tmObjQ = getServiceSpecificQuestions('tm_objection');
  assert(tmObjQ.showTMAppNumber === true && tmObjQ.dept === 'ip_india', 'TM Objection triggers TM application number and IP India department');

  // 5. Dynamic Document Matrix Tests
  console.log('\n--- 5. Dynamic Document Matrix Engine ---');
  // Uncertain / "I Don't Know" Flow
  const uncertainDocs = getRequiredOtherDocuments({ isUncertainService: true });
  assert(uncertainDocs.length === 2 && uncertainDocs.every((d) => !d.required), 'Uncertain flow generates lightweight optional checklist');

  // GST Notice Reply Docs
  const gstNoticeDocs = getRequiredOtherDocuments({ selectedService: { id: 'gst_notice_reply' } });
  assert(gstNoticeDocs.some((d) => d.id === 'gst_notice_pdf' && d.required), 'GST Notice Reply mandates official notice PDF');

  // FSSAI Renewal Docs
  const fssaiRenewDocs = getRequiredOtherDocuments({ selectedService: { id: 'fssai_renewal' } });
  assert(fssaiRenewDocs.some((d) => d.id === 'existing_fssai_certificate' && d.required), 'FSSAI Renewal mandates existing certificate');

  // DSC Token Docs
  const dscDocs = getRequiredOtherDocuments({ selectedService: { id: 'dsc_token' } });
  assert(dscDocs.some((d) => d.id === 'pan_card_dsc' && d.required), 'DSC issuance mandates PAN card color scan');

  // 6. Pricing & Quote Calculation Engine
  console.log('\n--- 6. Pricing & Custom Quote Calculation ---');
  const defaultFee = calculateOtherFees();
  assert(defaultFee.serviceFee === 2500 && defaultFee.totalPayable === 2500, 'Default consultation fee is ₹2,500');

  const customQuote = calculateOtherFees({
    serviceFee: 5000,
    governmentFee: 1000,
    additionalCharges: 500,
    gst: 900,
    discount: 400,
    total: 7000,
  });
  assert(customQuote.isCustomQuote === true && customQuote.totalPayable === 7000, 'Custom admin quote calculated correctly to ₹7,000');

  // 7. Validation Engine Tests
  console.log('\n--- 7. Validation Engine Tests ---');
  assert(validateMobile('9876543210') === true, 'Valid 10-digit mobile passes');
  assert(validateMobile('12345') === false, 'Invalid mobile rejected');
  assert(validateEmail('client@test.com') === true, 'Valid email passes');
  assert(validateEmail('invalid_email') === false, 'Invalid email rejected');
  assert(validatePAN('ABCDE1234F') === true, 'Valid PAN passes');
  assert(validatePAN('INVALID') === false, 'Invalid PAN rejected');

  // Step 1 validation
  const selErr1 = validateOtherSelectService({ selectedService: null, isUncertainService: false });
  assert(Object.keys(selErr1).length > 0, 'Select service validation rejects empty selection');
  const selErr2 = validateOtherSelectService({ isUncertainService: true });
  assert(Object.keys(selErr2).length === 0, 'Select service validation passes with isUncertainService: true');

  // Step 2 validation
  const appErr = validateOtherApplicant({
    applicantDetails: { fullName: '', mobile: 'invalid', email: 'bad' },
  });
  assert(appErr.fullName && appErr.mobile && appErr.email, 'Applicant validation catches missing name, mobile, and email');

  // Step 3 validation
  const reqErr = validateOtherRequirement({
    requirementDetails: { description: 'short', urgency: 'urgent', deadlineDate: '' },
  });
  assert(reqErr.description && reqErr.deadlineDate, 'Requirement validation catches short description and missing urgent deadline');

  // Step 4 validation (Business entity vs Individual)
  const bizErr = validateOtherBusiness({
    applicantDetails: { applicantType: 'pvt_ltd' },
    businessDetails: { businessName: '' },
  });
  assert(bizErr.businessName !== undefined, 'Business entity requires enterprise name');

  const indBizErr = validateOtherBusiness({
    applicantDetails: { applicantType: 'individual' },
    businessDetails: { businessName: '' },
  });
  assert(Object.keys(indBizErr).length === 0, 'Individual applicant does not require business name');

  // Full Pre-flight application validation
  const validApp = {
    selectedService: { id: 'gst_notice_reply' },
    applicantDetails: {
      fullName: 'Vikram Mehta',
      mobile: '9876543210',
      email: 'vikram@example.com',
      applicantType: 'individual',
    },
    requirementDetails: {
      description: 'Received GST DRC-01 notice regarding ITC mismatch for FY 2023-24. Need legal reply.',
      urgency: 'normal',
    },
  };
  const fullErrs = validateFullOtherApplication(validApp);
  assert(Object.keys(fullErrs).length === 0, 'Full valid application passes with 0 errors');

  // Summary
  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite();
