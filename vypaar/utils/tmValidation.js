/**
 * Trademark Registration — Validation Engine
 *
 * Provides regex validations, formatting helpers and comprehensive
 * multi-step validators for all 10 steps of the Trademark Application.
 */

// -----------------------------------------------------------------------------
// Core Regex Helpers
// -----------------------------------------------------------------------------

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PIN_REGEX = /^[1-9][0-9]{5}$/;
export const CIN_REGEX = /^[LUu][0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;
export const LLPIN_REGEX = /^[A-Za-z0-9-]{7,10}$/;

export function validatePAN(pan) {
  if (!pan) return false;
  return PAN_REGEX.test(String(pan).trim().toUpperCase());
}

export function validateMobile(mobile) {
  if (!mobile) return false;
  const digits = String(mobile).replace(/\D/g, '');
  return MOBILE_REGEX.test(digits);
}

export function validateEmail(email) {
  if (!email) return false;
  return EMAIL_REGEX.test(String(email).trim().toLowerCase());
}

export function validatePIN(pin) {
  if (!pin) return false;
  return PIN_REGEX.test(String(pin).trim());
}

export function validateCIN(cin) {
  if (!cin) return false;
  return CIN_REGEX.test(String(cin).trim().toUpperCase());
}

export function validateLLPIN(llpin) {
  if (!llpin) return false;
  return LLPIN_REGEX.test(String(llpin).trim().toUpperCase());
}

export function formatPAN(text) {
  if (!text) return '';
  return String(text)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);
}

export function formatCIN(text) {
  if (!text) return '';
  return String(text)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 21);
}

// -----------------------------------------------------------------------------
// Step 1 Validator: Applicant Type & Concession
// -----------------------------------------------------------------------------

export function validateTMApplicantType(formState = {}) {
  const errors = {};
  if (!formState.applicantType) {
    errors.applicantType = 'Please select who is applying for the trademark';
  }
  return errors;
}

// -----------------------------------------------------------------------------
// Step 2 Validator: Applicant Details & Entity-specific Fields
// -----------------------------------------------------------------------------

export function validateTMApplicantDetails(formState = {}) {
  const errors = {};
  const { applicantType, applicantDetails = {} } = formState;

  if (!applicantDetails.applicantLegalName?.trim()) {
    errors.applicantLegalName = 'Applicant full/legal name is required';
  }

  if (!applicantDetails.pan?.trim()) {
    errors.pan = 'PAN number is required';
  } else if (!validatePAN(applicantDetails.pan)) {
    errors.pan = 'Enter valid 10-character PAN (e.g. ABCDE1234F)';
  }

  if (!applicantDetails.mobile?.trim()) {
    errors.mobile = 'Mobile number is required';
  } else if (!validateMobile(applicantDetails.mobile)) {
    errors.mobile = 'Enter valid 10-digit mobile number starting with 6-9';
  }

  if (!applicantDetails.email?.trim()) {
    errors.email = 'Email address is required';
  } else if (!validateEmail(applicantDetails.email)) {
    errors.email = 'Enter valid email address';
  }

  if (!applicantDetails.address1?.trim()) {
    errors.address1 = 'Address Line 1 is required';
  }

  if (!applicantDetails.city?.trim()) {
    errors.city = 'City / Town is required';
  }

  if (!applicantDetails.state?.trim()) {
    errors.state = 'Please select State / Union Territory';
  }

  if (!applicantDetails.pinCode?.trim()) {
    errors.pinCode = 'PIN code is required';
  } else if (!validatePIN(applicantDetails.pinCode)) {
    errors.pinCode = 'Enter valid 6-digit PIN code';
  }

  // Type-specific field validations
  if (applicantType === 'individual') {
    if (!applicantDetails.dob?.trim()) {
      errors.dob = 'Date of birth is required';
    }
  } else if (applicantType === 'proprietorship') {
    if (!applicantDetails.proprietorName?.trim()) {
      errors.proprietorName = 'Proprietor name is required';
    }
  } else if (applicantType === 'partnership') {
    const partners = applicantDetails.partners || [];
    if (partners.length < 2) {
      errors.partners = 'At least 2 partners are required for a Partnership firm';
    } else {
      partners.forEach((p, idx) => {
        if (!p.fullName?.trim()) {
          errors[`partner_${idx}_fullName`] = `Partner ${idx + 1} name is required`;
        }
        if (p.pan && !validatePAN(p.pan)) {
          errors[`partner_${idx}_pan`] = `Partner ${idx + 1} PAN is invalid`;
        }
      });
    }
  } else if (applicantType === 'llp') {
    if (!applicantDetails.llpin?.trim()) {
      errors.llpin = 'LLPIN is required';
    }
    if (!applicantDetails.authorizedPersonName?.trim()) {
      errors.authorizedPersonName = 'Designated Partner name is required';
    }
  } else if (applicantType === 'pvt_ltd' || applicantType === 'public_ltd') {
    if (!applicantDetails.cin?.trim()) {
      errors.cin = 'Company CIN is required';
    }
    if (!applicantDetails.authorizedPersonName?.trim()) {
      errors.authorizedPersonName = 'Authorized Director / Signatory name is required';
    }
  } else if (['trust', 'society', 'aop'].includes(applicantType)) {
    if (!applicantDetails.authorizedPersonName?.trim()) {
      errors.authorizedPersonName = 'Authorized person / trustee name is required';
    }
  }

  return errors;
}

// -----------------------------------------------------------------------------
// Step 3 Validator: Trademark Details & Representation
// -----------------------------------------------------------------------------

export function validateTMMarkDetails(formState = {}) {
  const errors = {};
  const { markDetails = {} } = formState;

  if (!markDetails.markType) {
    errors.markType = 'Please select what type of mark you want to register';
  }

  if (['word', 'word_logo'].includes(markDetails.markType)) {
    if (!markDetails.trademarkName?.trim()) {
      errors.trademarkName = 'Trademark name / brand name is required';
    }
  }

  if (markDetails.isOtherLanguage) {
    if (!markDetails.languageName?.trim()) {
      errors.languageName = 'Language name is required';
    }
    if (!markDetails.transliteration?.trim()) {
      errors.transliteration = 'Transliteration in Roman script is required';
    }
    if (!markDetails.translation?.trim()) {
      errors.translation = 'English translation is required';
    }
  }

  if (markDetails.isColourClaimed) {
    if (!markDetails.colourDescription?.trim()) {
      errors.colourDescription = 'Please describe the claimed colour combination';
    }
  }

  return errors;
}

// -----------------------------------------------------------------------------
// Step 4 Validator: Goods / Services & Nice Classes
// -----------------------------------------------------------------------------

export function validateTMClasses(formState = {}) {
  const errors = {};
  const { selectedClasses = [], classDescriptions = {} } = formState;

  if (!selectedClasses || selectedClasses.length === 0) {
    errors.selectedClasses = 'Please select at least 1 Trademark Class';
  } else {
    selectedClasses.forEach((cls) => {
      const desc = classDescriptions[cls];
      if (!desc || !desc.trim()) {
        errors[`class_desc_${cls}`] = `Goods/Services description is required for Class ${cls}`;
      }
    });
  }

  return errors;
}

// -----------------------------------------------------------------------------
// Step 5 Validator: Usage Status & Prior Use Details
// -----------------------------------------------------------------------------

export function validateTMUsage(formState = {}) {
  const errors = {};
  const { usageDetails = {} } = formState;

  if (!usageDetails.usageStatus) {
    errors.usageStatus = 'Please select trademark usage status';
  }

  if (usageDetails.usageStatus === 'used') {
    if (!usageDetails.firstUseDate?.trim()) {
      errors.firstUseDate = 'Date of first use is required for prior use claim';
    }
    if (!usageDetails.firstUsePlace?.trim()) {
      errors.firstUsePlace = 'Place / Location of first use is required';
    }
    if (!usageDetails.goodsServicesUsed?.trim()) {
      errors.goodsServicesUsed = 'Description of goods/services used is required';
    }
  }

  return errors;
}

// -----------------------------------------------------------------------------
// Step 6 Validator: Document Upload Matrix
// -----------------------------------------------------------------------------

export function validateTMDocuments(documents = []) {
  const errors = {};
  if (!Array.isArray(documents)) return errors;

  const missing = documents.filter((doc) => {
    if (!doc.required) return false;
    const isSatisfied =
      doc.status === 'uploaded' ||
      doc.status === 'under_review' ||
      doc.status === 'approved' ||
      !!doc.file ||
      !!doc.fileUrl;
    return !isSatisfied;
  });

  missing.forEach((doc) => {
    errors[doc.id] = `${doc.label} is mandatory and must be uploaded`;
  });

  return errors;
}

// -----------------------------------------------------------------------------
// Step 7 Validator: Agent / Authorization
// -----------------------------------------------------------------------------

export function validateTMAgent(formState = {}) {
  const errors = {};
  const { agentDetails = {} } = formState;

  if (agentDetails.isFiledThroughAgent) {
    if (!agentDetails.agentName?.trim()) {
      errors.agentName = 'Agent / Attorney name is required';
    }
    if (agentDetails.agentMobile && !validateMobile(agentDetails.agentMobile)) {
      errors.agentMobile = 'Enter valid 10-digit agent mobile number';
    }
    if (agentDetails.agentEmail && !validateEmail(agentDetails.agentEmail)) {
      errors.agentEmail = 'Enter valid agent email address';
    }
  }

  return errors;
}

// -----------------------------------------------------------------------------
// Full Application Pre-Flight Validator (Step 8 Review)
// -----------------------------------------------------------------------------

export function validateFullTMApplication(formState = {}, documents = []) {
  return {
    step1: validateTMApplicantType(formState),
    step2: validateTMApplicantDetails(formState),
    step3: validateTMMarkDetails(formState),
    step4: validateTMClasses(formState),
    step5: validateTMUsage(formState),
    step6: validateTMDocuments(documents),
    step7: validateTMAgent(formState),
  };
}

export function isTMApplicationValid(formState = {}, documents = []) {
  const validation = validateFullTMApplication(formState, documents);
  return Object.values(validation).every((stepErr) => Object.keys(stepErr).length === 0);
}
