/**
 * MSME / Udyam Registration Validation Engine
 * Validations for Aadhaar, PAN, GSTIN, Mobile, Email, PIN, IFSC, and Step-by-Step form checks.
 */

export const validateAadhaar = (aadhaar) => {
  if (!aadhaar) return false;
  const clean = String(aadhaar).replace(/\s+/g, '');
  const re = /^\d{12}$/;
  return re.test(clean);
};

export const validatePAN = (pan) => {
  if (!pan) return false;
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(String(pan).trim().toUpperCase());
};

export const validateGSTIN = (gstin) => {
  if (!gstin) return false;
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return re.test(String(gstin).trim().toUpperCase());
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
  const re = /^[A-Z]{3}-[0-9]{4}$|^[A-Z0-9]{7,8}$/;
  return re.test(String(llpin).trim().toUpperCase());
};

/* ================= Step-by-Step Validators ================= */

export const validateUdyamAadhaar = (form) => {
  const errors = {};
  const { aadhaarDetails = {} } = form;

  if (!aadhaarDetails.aadhaarNumber || !validateAadhaar(aadhaarDetails.aadhaarNumber)) {
    errors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar number';
  }
  if (!aadhaarDetails.nameAsPerAadhaar || !aadhaarDetails.nameAsPerAadhaar.trim()) {
    errors.nameAsPerAadhaar = 'Name as per Aadhaar card is required';
  }
  if (!aadhaarDetails.mobile || !validateMobile(aadhaarDetails.mobile)) {
    errors.mobile = 'Please enter a valid 10-digit mobile number linked with Aadhaar';
  }
  if (!aadhaarDetails.email || !validateEmail(aadhaarDetails.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!aadhaarDetails.aadhaarHolderType) {
    errors.aadhaarHolderType = 'Please select who the Aadhaar holder is';
  }
  if (!aadhaarDetails.isAadhaarVerified) {
    errors.isAadhaarVerified = 'Aadhaar OTP verification is required to proceed';
  }

  return errors;
};

export const validateUdyamPAN = (form) => {
  const errors = {};
  const { panDetails = {} } = form;

  if (panDetails.hasPAN === undefined || panDetails.hasPAN === null) {
    errors.hasPAN = 'Please specify whether you have PAN';
    return errors;
  }

  if (panDetails.hasPAN) {
    if (!panDetails.panNumber || !validatePAN(panDetails.panNumber)) {
      errors.panNumber = 'Please enter a valid 10-character PAN';
    }
    if (!panDetails.nameAsPerPAN || !panDetails.nameAsPerPAN.trim()) {
      errors.nameAsPerPAN = 'Name as per PAN card is required';
    }
    if (!panDetails.isPANVerified) {
      errors.isPANVerified = 'Please verify PAN before proceeding';
    }
  }

  // GSTIN Check
  if (panDetails.hasGSTIN === 'yes') {
    if (!panDetails.gstin || !validateGSTIN(panDetails.gstin)) {
      errors.gstin = 'Please enter a valid 15-character GSTIN';
    }
  }

  return errors;
};

export const validateUdyamBusiness = (form) => {
  const errors = {};
  const { businessDetails = {} } = form;

  if (!businessDetails.enterpriseName || !businessDetails.enterpriseName.trim()) {
    errors.enterpriseName = 'Name of Enterprise is required';
  }
  if (!businessDetails.organisationType) {
    errors.organisationType = 'Please select Organisation Type';
  }
  if (!businessDetails.commencementDate) {
    errors.commencementDate = 'Date of commencement of business is required';
  }
  if (!businessDetails.majorActivity) {
    errors.majorActivity = 'Please select major business activity';
  }

  return errors;
};

export const validateUdyamOrganisation = (form) => {
  const errors = {};
  const orgType = form.businessDetails?.organisationType || 'proprietorship';
  const org = form.organisationDetails || {};

  if (orgType === 'partnership') {
    if (!org.firmName || !org.firmName.trim()) {
      errors.firmName = 'Partnership Firm Name is required';
    }
    const partners = org.partners || [];
    if (partners.length < 2) {
      errors.partners = 'At least 2 partners required for Partnership Firm';
    }
  } else if (orgType === 'llp') {
    if (!org.llpName || !org.llpName.trim()) {
      errors.llpName = 'LLP Name is required';
    }
    if (!org.llpin || !validateLLPIN(org.llpin)) {
      errors.llpin = 'Valid LLPIN is required';
    }
  } else if (orgType === 'pvt_ltd' || orgType === 'public_ltd') {
    if (!org.companyName || !org.companyName.trim()) {
      errors.companyName = 'Company Name is required';
    }
    if (!org.cin || !validateCIN(org.cin)) {
      errors.cin = 'Valid 21-character Corporate Identification Number (CIN) is required';
    }
  } else if (orgType === 'huf') {
    if (!org.kartaName || !org.kartaName.trim()) {
      errors.kartaName = 'Karta Name is required';
    }
  }

  return errors;
};

export const validateUdyamAddress = (form) => {
  const errors = {};
  const addr = form.officialAddress || {};

  if (!addr.flatDoorBlock || !addr.flatDoorBlock.trim()) {
    errors.flatDoorBlock = 'Flat / Door / Block / Building No. is required';
  }
  if (!addr.roadStreet || !addr.roadStreet.trim()) {
    errors.roadStreet = 'Road / Street / Locality is required';
  }
  if (!addr.city || !addr.city.trim()) {
    errors.city = 'City / Town is required';
  }
  if (!addr.state) {
    errors.state = 'State / Union Territory is required';
  }
  if (!addr.pinCode || !validatePIN(addr.pinCode)) {
    errors.pinCode = 'Valid 6-digit PIN code is required';
  }

  return errors;
};

export const validateUdyamUnits = (form) => {
  const errors = {};
  const units = form.plantUnits || [];

  if (!units.length) {
    errors.plantUnits = 'At least one Plant / Unit / Office location is required';
    return errors;
  }

  units.forEach((u, idx) => {
    if (!u.unitName || !u.unitName.trim()) {
      errors[`unit_${idx}_name`] = `Unit #${idx + 1}: Unit name is required`;
    }
    if (!u.pinCode || !validatePIN(u.pinCode)) {
      errors[`unit_${idx}_pincode`] = `Unit #${idx + 1}: Valid 6-digit PIN is required`;
    }
  });

  return errors;
};

export const validateUdyamBank = (form) => {
  const errors = {};
  const bank = form.bankDetails || {};

  if (!bank.bankName || !bank.bankName.trim()) {
    errors.bankName = 'Bank Name is required';
  }
  if (!bank.accountHolderName || !bank.accountHolderName.trim()) {
    errors.accountHolderName = 'Account Holder Name is required';
  }
  if (!bank.accountNumber || bank.accountNumber.trim().length < 8) {
    errors.accountNumber = 'Valid Bank Account Number is required';
  }
  if (!bank.ifsc || !validateIFSC(bank.ifsc)) {
    errors.ifsc = 'Valid 11-character IFSC Code is required (e.g. SBIN0001234)';
  }

  return errors;
};

export const validateUdyamNIC = (form) => {
  const errors = {};
  const nics = form.selectedNICCodes || [];

  if (!nics.length) {
    errors.selectedNICCodes = 'Please select at least one primary NIC (National Industrial Classification) code';
  }

  return errors;
};

export const validateUdyamFinancials = (form) => {
  const errors = {};
  const fin = form.financialDetails || {};

  if (fin.investmentAmount === undefined || fin.investmentAmount === null || fin.investmentAmount === '') {
    errors.investmentAmount = 'Investment in Plant & Machinery / Equipment is required';
  }
  if (fin.domesticTurnover === undefined || fin.domesticTurnover === null || fin.domesticTurnover === '') {
    errors.domesticTurnover = 'Annual Domestic Turnover is required';
  }

  return errors;
};

export const validateFullUdyamApplication = (form) => {
  return {
    ...validateUdyamAadhaar(form),
    ...validateUdyamPAN(form),
    ...validateUdyamBusiness(form),
    ...validateUdyamOrganisation(form),
    ...validateUdyamAddress(form),
    ...validateUdyamUnits(form),
    ...validateUdyamBank(form),
    ...validateUdyamNIC(form),
    ...validateUdyamFinancials(form),
  };
};
