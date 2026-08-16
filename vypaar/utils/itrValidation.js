/**
 * Income Tax Return (ITR) Validation Engine
 * Validations for PAN, Aadhaar, Mobile, Email, PIN, IFSC, TAN, and Step-by-Step form checks.
 */

import { getRequiredITRDocuments } from '../config/itrConfig.js';

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

export const validateTAN = (tan) => {
  if (!tan) return false;
  const re = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
  return re.test(String(tan).trim().toUpperCase());
};

/* ================= Step-by-Step Validators ================= */

export const validateITRProfile = (form) => {
  const errors = {};
  const { profile = {} } = form;

  if (!profile.pan || !validatePAN(profile.pan)) {
    errors.pan = 'Please enter a valid 10-character PAN';
  }
  if (!profile.fullName || !profile.fullName.trim()) {
    errors.fullName = 'Full Name as per PAN card is required';
  }
  if (!profile.dob) {
    errors.dob = 'Date of Birth / Incorporation is required';
  }
  if (!profile.mobile || !validateMobile(profile.mobile)) {
    errors.mobile = 'Valid 10-digit mobile number is required';
  }
  if (!profile.email || !validateEmail(profile.email)) {
    errors.email = 'Valid email address is required';
  }
  if (!profile.address || !profile.address.trim()) {
    errors.address = 'Residential / Office Address is required';
  }
  if (!profile.city || !profile.city.trim()) {
    errors.city = 'City is required';
  }
  if (!profile.pinCode || !validatePIN(profile.pinCode)) {
    errors.pinCode = 'Valid 6-digit PIN code is required';
  }

  return errors;
};

export const validateITRSources = (form) => {
  const errors = {};
  const sources = form.incomeSources || {};
  const hasAtLeastOne = Object.values(sources).some(Boolean);

  if (!hasAtLeastOne) {
    errors.incomeSources = 'Please select at least one source of income';
  }

  return errors;
};

export const validateITRSalary = (form) => {
  const errors = {};
  const { incomeSources = {}, incomeDetails = {} } = form;

  if (incomeSources.salary) {
    if (!incomeDetails.employerName || !incomeDetails.employerName.trim()) {
      errors.employerName = 'Employer Name is required';
    }
    if (incomeDetails.salaryGross === undefined || incomeDetails.salaryGross === '' || Number(incomeDetails.salaryGross) <= 0) {
      errors.salaryGross = 'Gross Salary amount is required';
    }
  }

  return errors;
};

export const validateITRHouseProperty = (form) => {
  const errors = {};
  const { incomeSources = {}, incomeDetails = {} } = form;

  if (incomeSources.houseProperty) {
    if (!incomeDetails.hpAddress || !incomeDetails.hpAddress.trim()) {
      errors.hpAddress = 'Property address is required';
    }
  }

  return errors;
};

export const validateITRBusiness = (form) => {
  const errors = {};
  const { incomeSources = {}, incomeDetails = {} } = form;

  if (incomeSources.business || incomeSources.profession) {
    if (!incomeDetails.businessName || !incomeDetails.businessName.trim()) {
      errors.businessName = 'Business or Professional Practice name is required';
    }
    if (
      (incomeDetails.businessTurnover === undefined || incomeDetails.businessTurnover === '') &&
      (incomeDetails.businessProfit === undefined || incomeDetails.businessProfit === '') &&
      (incomeDetails.professionProfit === undefined || incomeDetails.professionProfit === '')
    ) {
      errors.businessProfit = 'Gross turnover or Net Profit amount is required';
    }
  }

  return errors;
};

export const validateITRBank = (form) => {
  const errors = {};
  const { bankDetails = {} } = form;

  if (!bankDetails.bankName || !bankDetails.bankName.trim()) {
    errors.bankName = 'Bank Name is required';
  }
  if (!bankDetails.accountHolderName || !bankDetails.accountHolderName.trim()) {
    errors.accountHolderName = 'Account Holder Name is required';
  }
  if (!bankDetails.accountNumber || bankDetails.accountNumber.trim().length < 8) {
    errors.accountNumber = 'Valid Bank Account Number is required';
  }
  if (!bankDetails.ifsc || !validateIFSC(bankDetails.ifsc)) {
    errors.ifsc = 'Valid 11-character IFSC code is required (e.g. SBIN0001234)';
  }

  return errors;
};

export const validateFullITRApplication = (form) => {
  return {
    ...validateITRProfile(form),
    ...validateITRSources(form),
    ...validateITRSalary(form),
    ...validateITRHouseProperty(form),
    ...validateITRBusiness(form),
    ...validateITRBank(form),
  };
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validatePAN,
    validateAadhaar,
    validateMobile,
    validateEmail,
    validatePIN,
    validateIFSC,
    validateTAN,
    validateITRProfile,
    validateITRSources,
    validateITRSalary,
    validateITRHouseProperty,
    validateITRBusiness,
    validateITRBank,
    validateFullITRApplication,
  };
}

