/**
 * Import Export Code (IEC) Validation Engine
 * Validations for PAN, Aadhaar, Mobile, Email, PIN, IFSC, CIN, LLPIN, GSTIN, and Step-by-Step form checks.
 */

export const validatePAN = (pan) => {
  if (!pan) return false;
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(String(pan).trim().toUpperCase());
};

export const validateAadhaar = (aadhaar) => {
  if (!aadhaar) return false;
  const clean = String(aadhaar).replace(/\s+/g, '');
  const re = /^\d{12}$/;
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
  if (!pin) return false;
  const re = /^[1-9][0-9]{5}$/;
  return re.test(String(pin).trim());
};

export const validateIFSC = (ifsc) => {
  if (!ifsc) return false;
  const re = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  return re.test(String(ifsc).trim().toUpperCase());
};

export const validateCIN = (cin) => {
  if (!cin) return false;
  const re = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
  return re.test(String(cin).trim().toUpperCase());
};

export const validateLLPIN = (llpin) => {
  if (!llpin) return false;
  const clean = String(llpin).trim().toUpperCase();
  const re = /^[A-Z]{3}-?[0-9]{4}$|^[A-Z0-9]{7,8}$/;
  return re.test(clean);
};

export const validateGSTIN = (gstin) => {
  if (!gstin) return false;
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return re.test(String(gstin).trim().toUpperCase());
};

export const validateIECNumber = (iec) => {
  if (!iec) return false;
  const clean = String(iec).trim().toUpperCase();
  // Modern DGFT IEC is identical to the 10-digit PAN or legacy 10-digit numeric
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$|^\d{10}$/.test(clean);
};

/* ================= Step-by-Step Validators ================= */

export const validateIECApplicantType = (form) => {
  const errors = {};
  if (!form.entityType) {
    errors.entityType = 'Please select your entity constitution type';
  }
  return errors;
};

export const validateIECPAN = (form) => {
  const errors = {};
  const { panDetails = {} } = form;

  if (!panDetails.panNumber || !validatePAN(panDetails.panNumber)) {
    errors.panNumber = 'Please enter a valid 10-character PAN';
  }
  if (!panDetails.legalName || !panDetails.legalName.trim()) {
    errors.legalName = 'Legal Entity / Person name as per PAN is required';
  }
  if (!panDetails.incorporationDate) {
    errors.incorporationDate = 'Date of Establishment / Incorporation is required';
  }

  // CIN / LLPIN validations where applicable
  if (form.entityType === 'pvt_ltd' || form.entityType === 'pub_ltd') {
    if (!panDetails.cinNumber || !validateCIN(panDetails.cinNumber)) {
      errors.cinNumber = 'Please enter a valid 21-character Corporate Identification Number (CIN)';
    }
  } else if (form.entityType === 'llp') {
    if (!panDetails.llpinNumber || !validateLLPIN(panDetails.llpinNumber)) {
      errors.llpinNumber = 'Please enter a valid LLPIN (e.g. AAA-1234)';
    }
  }

  return errors;
};

export const validateIECBusiness = (form) => {
  const errors = {};
  const { businessDetails = {}, tradeDetails = {} } = form;

  if (!businessDetails.businessName || !businessDetails.businessName.trim()) {
    errors.businessName = 'Business or Enterprise Name is required';
  }

  const activities = businessDetails.businessActivities || [];
  if (!activities || activities.length === 0) {
    errors.businessActivities = 'Please select at least one main business activity';
  }

  const tradeActivities = tradeDetails.selectedTradeActivities || [];
  if (!tradeActivities || tradeActivities.length === 0) {
    errors.selectedTradeActivities = 'Please select what you plan to import / export';
  }

  return errors;
};

export const validateIECAddress = (form) => {
  const errors = {};
  const { addressDetails = {} } = form;

  if (!addressDetails.line1 || !addressDetails.line1.trim()) {
    errors.line1 = 'Address Line 1 (Building / Flat / Plot) is required';
  }
  if (!addressDetails.city || !addressDetails.city.trim()) {
    errors.city = 'City is required';
  }
  if (!addressDetails.district || !addressDetails.district.trim()) {
    errors.district = 'District is required';
  }
  if (!addressDetails.state || !addressDetails.state.trim()) {
    errors.state = 'State is required';
  }
  if (!addressDetails.pinCode || !validatePIN(addressDetails.pinCode)) {
    errors.pinCode = 'Valid 6-digit PIN code is required';
  }

  return errors;
};

export const validateIECBank = (form) => {
  const errors = {};
  const { bankDetails = {} } = form;

  if (bankDetails.hasActiveAccount === false) {
    errors.hasActiveAccount = 'An active firm/entity bank account is mandatory for DGFT IEC application';
  }
  if (!bankDetails.bankName || !bankDetails.bankName.trim()) {
    errors.bankName = 'Bank Name is required';
  }
  if (!bankDetails.accountHolderName || !bankDetails.accountHolderName.trim()) {
    errors.accountHolderName = 'Account Holder Name is required';
  }
  if (!bankDetails.accountNumber || String(bankDetails.accountNumber).trim().length < 8) {
    errors.accountNumber = 'Valid Bank Account Number is required';
  }
  if (!bankDetails.ifsc || !validateIFSC(bankDetails.ifsc)) {
    errors.ifsc = 'Valid 11-character IFSC code is required (e.g. HDFC0000050)';
  }

  return errors;
};

export const validateIECSignatory = (form) => {
  const errors = {};
  const { signatoryDetails = {} } = form;

  if (!signatoryDetails.fullName || !signatoryDetails.fullName.trim()) {
    errors.fullName = 'Signatory Full Name is required';
  }
  if (!signatoryDetails.pan || !validatePAN(signatoryDetails.pan)) {
    errors.pan = 'Valid 10-character PAN of Signatory is required';
  }
  if (!signatoryDetails.mobile || !validateMobile(signatoryDetails.mobile)) {
    errors.mobile = 'Valid 10-digit mobile number is required (for Aadhaar OTP)';
  }
  if (!signatoryDetails.email || !validateEmail(signatoryDetails.email)) {
    errors.email = 'Valid email address is required';
  }
  if (!signatoryDetails.designation) {
    errors.designation = 'Signatory designation is required';
  }

  return errors;
};

export const validateFullIECApplication = (form) => {
  return {
    ...validateIECApplicantType(form),
    ...validateIECPAN(form),
    ...validateIECBusiness(form),
    ...validateIECAddress(form),
    ...validateIECBank(form),
    ...validateIECSignatory(form),
  };
};

/* ================= Export Compatibility ================= */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validatePAN,
    validateAadhaar,
    validateMobile,
    validateEmail,
    validatePIN,
    validateIFSC,
    validateCIN,
    validateLLPIN,
    validateGSTIN,
    validateIECNumber,
    validateIECApplicantType,
    validateIECPAN,
    validateIECBusiness,
    validateIECAddress,
    validateIECBank,
    validateIECSignatory,
    validateFullIECApplication,
  };
}
