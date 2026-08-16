/**
 * Other Services Validation Engine
 * Validates Applicant details, Requirement, Business info, Dynamic Documents, and Pre-flight checks.
 */

export const validatePAN = (pan) => {
  if (!pan) return true; // Optional for certain general consultations unless required
  const clean = String(pan).trim().toUpperCase();
  if (clean.length === 0) return true;
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(clean);
};

export const validateMobile = (mobile) => {
  if (!mobile) return false;
  const re = /^[6-9]\d{9}$/;
  return re.test(String(mobile).trim());
};

export const validateEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).trim().toLowerCase());
};

export const validatePIN = (pin) => {
  if (!pin) return true; // Optional unless entered
  const clean = String(pin).trim();
  if (clean.length === 0) return true;
  const re = /^[1-9][0-9]{5}$/;
  return re.test(clean);
};

export const validateGSTIN = (gstin) => {
  if (!gstin) return true;
  const clean = String(gstin).trim().toUpperCase();
  if (clean.length === 0) return true;
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return re.test(clean);
};

/* ========================================================================= */
/* Step-by-Step Validators                                                   */
/* ========================================================================= */

export const validateOtherSelectService = (form) => {
  const errors = {};
  if (!form.isUncertainService && (!form.selectedService || !form.selectedService.id)) {
    errors.selectedService = 'Please select a service or choose "I don\'t know which service I need"';
  }
  return errors;
};

export const validateOtherApplicant = (form) => {
  const errors = {};
  const { applicantDetails = {} } = form;

  if (!applicantDetails.fullName || !applicantDetails.fullName.trim()) {
    errors.fullName = 'Applicant Full Name is required';
  }
  if (!applicantDetails.mobile || !validateMobile(applicantDetails.mobile)) {
    errors.mobile = 'Valid 10-digit mobile number is required';
  }
  if (!applicantDetails.email || !validateEmail(applicantDetails.email)) {
    errors.email = 'Valid email address is required';
  }
  if (applicantDetails.pan && !validatePAN(applicantDetails.pan)) {
    errors.pan = 'Please enter a valid 10-character PAN format (e.g. ABCDE1234F)';
  }
  if (applicantDetails.pinCode && !validatePIN(applicantDetails.pinCode)) {
    errors.pinCode = 'Please enter a valid 6-digit PIN code';
  }
  if (!applicantDetails.applicantType) {
    errors.applicantType = 'Please select your applicant constitution type';
  }

  return errors;
};

export const validateOtherRequirement = (form) => {
  const errors = {};
  const { requirementDetails = {} } = form;

  if (!requirementDetails.description || requirementDetails.description.trim().length < 10) {
    errors.description = 'Please describe your requirement in detail (minimum 10 characters)';
  }

  // If urgency is urgent or government deadline approaching, deadline date is mandatory
  const urgency = requirementDetails.urgency;
  if (urgency === 'urgent' || urgency === 'govt_deadline') {
    if (!requirementDetails.deadlineDate || !requirementDetails.deadlineDate.trim()) {
      errors.deadlineDate = 'Please provide the target deadline date for priority handling';
    }
  }

  return errors;
};

export const validateOtherBusiness = (form) => {
  const errors = {};
  const applicantType = form.applicantDetails?.applicantType;
  const isBusiness =
    applicantType === 'proprietorship' ||
    applicantType === 'partnership' ||
    applicantType === 'llp' ||
    applicantType === 'pvt_ltd' ||
    applicantType === 'pub_ltd' ||
    applicantType === 'trust' ||
    applicantType === 'society_ngo';

  if (isBusiness) {
    const { businessDetails = {} } = form;
    if (!businessDetails.businessName || !businessDetails.businessName.trim()) {
      errors.businessName = 'Business or Enterprise Name is required for entity applicants';
    }
  }

  return errors;
};

export const validateFullOtherApplication = (form) => {
  return {
    ...validateOtherSelectService(form),
    ...validateOtherApplicant(form),
    ...validateOtherRequirement(form),
    ...validateOtherBusiness(form),
  };
};

/* ========================================================================= */
/* CommonJS Export Compatibility for Tests                                   */
/* ========================================================================= */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
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
  };
}
