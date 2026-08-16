/**
 * Form GST REG-01 Validation Engine
 * Validations for PAN, Aadhaar, Mobile, Email, PIN, IFSC, CIN, and Step-by-Step form checks.
 */

import { getRequiredGSTDocuments } from '../config/gstConfig.js';

export const validatePAN = (pan) => {
  if (!pan) return false;
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(String(pan).trim().toUpperCase());
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

export const validateAadhaar = (aadhaar) => {
  if (!aadhaar) return false;
  const clean = String(aadhaar).replace(/\s+/g, '');
  const re = /^\d{12}$/;
  return re.test(clean);
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

export const validateGSTConstitution = (form) => {
  const errors = {};
  if (!form.constitution) {
    errors.constitution = 'Please select your Business Constitution';
  }
  if (!form.registrationReason) {
    errors.registrationReason = 'Please select a reason for obtaining GST registration';
  }
  return errors;
};

export const validateGSTBusinessDetails = (form) => {
  const errors = {};
  const { businessDetails = {} } = form;

  if (!businessDetails.legalName || !businessDetails.legalName.trim()) {
    errors.legalName = 'Legal Name of Business (as per PAN) is required';
  }
  if (!businessDetails.tradeName || !businessDetails.tradeName.trim()) {
    errors.tradeName = 'Trade Name (Store / Shop Name) is required';
  }
  if (!businessDetails.pan || !validatePAN(businessDetails.pan)) {
    errors.pan = 'Please enter a valid 10-character PAN (e.g. ABCDE1234F)';
  }
  if (!businessDetails.commencementDate) {
    errors.commencementDate = 'Date of commencement of business is required';
  }

  return errors;
};

export const validateGSTPromoters = (form) => {
  const errors = {};
  const promoters = form.promoters || [];

  if (!promoters.length) {
    errors.promoters = 'At least one Promoter / Partner / Director is required';
    return errors;
  }

  promoters.forEach((p, idx) => {
    if (!p.name || !p.name.trim()) {
      errors[`promoter_${idx}_name`] = `Promoter #${idx + 1}: Full Name is required`;
    }
    if (!p.mobile || !validateMobile(p.mobile)) {
      errors[`promoter_${idx}_mobile`] = `Promoter #${idx + 1}: Valid 10-digit mobile required`;
    }
    if (!p.email || !validateEmail(p.email)) {
      errors[`promoter_${idx}_email`] = `Promoter #${idx + 1}: Valid email address required`;
    }
    if (!p.pan || !validatePAN(p.pan)) {
      errors[`promoter_${idx}_pan`] = `Promoter #${idx + 1}: Valid PAN required`;
    }
    if (!p.aadhaar || !validateAadhaar(p.aadhaar)) {
      errors[`promoter_${idx}_aadhaar`] = `Promoter #${idx + 1}: 12-digit Aadhaar required`;
    }
  });

  return errors;
};

export const validateGSTPremises = (form) => {
  const errors = {};
  const { premisesDetails = {} } = form;

  if (!premisesDetails.buildingNumber || !premisesDetails.buildingNumber.trim()) {
    errors.buildingNumber = 'Building / Flat / Door Number is required';
  }
  if (!premisesDetails.street || !premisesDetails.street.trim()) {
    errors.street = 'Street / Road / Locality name is required';
  }
  if (!premisesDetails.city || !premisesDetails.city.trim()) {
    errors.city = 'City / Town / Village is required';
  }
  if (!premisesDetails.state) {
    errors.state = 'State / Union Territory is required';
  }
  if (!premisesDetails.pinCode || !validatePIN(premisesDetails.pinCode)) {
    errors.pinCode = 'Valid 6-digit PIN code is required';
  }
  if (!premisesDetails.possessionType) {
    errors.possessionType = 'Nature of possession of premises is required';
  }

  return errors;
};

export const validateGSTGoodsServices = (form) => {
  const errors = {};
  const items = form.goodsServices || [];
  if (!items.length) {
    errors.goodsServices = 'Please add at least one Top Good (HSN) or Service (SAC)';
  }
  return errors;
};

export const validateGSTBankDetails = (form) => {
  const errors = {};
  const { bankDetails = {} } = form;

  if (!bankDetails.accountNumber || bankDetails.accountNumber.trim().length < 8) {
    errors.accountNumber = 'Valid Bank Account Number is required';
  }
  if (!bankDetails.accountType) {
    errors.accountType = 'Please select Account Type (Current / Savings)';
  }
  if (!bankDetails.ifsc || !validateIFSC(bankDetails.ifsc)) {
    errors.ifsc = 'Valid 11-character IFSC Code is required (e.g. SBIN0001234)';
  }
  if (!bankDetails.bankName || !bankDetails.bankName.trim()) {
    errors.bankName = 'Bank Name is required';
  }

  return errors;
};

export const validateGSTDocuments = (form) => {
  const errors = {};
  const requiredDocs = getRequiredGSTDocuments({
    constitution: form.constitution,
    possessionType: form.premisesDetails?.possessionType,
  });

  const uploads = form.documents || {};
  requiredDocs.forEach((doc) => {
    if (doc.required && !uploads[doc.id]) {
      errors[doc.id] = `Missing mandatory document: ${doc.label}`;
    }
  });

  return errors;
};

export const validateFullGSTApplication = (form) => {
  return {
    ...validateGSTConstitution(form),
    ...validateGSTBusinessDetails(form),
    ...validateGSTPromoters(form),
    ...validateGSTPremises(form),
    ...validateGSTGoodsServices(form),
    ...validateGSTBankDetails(form),
    ...validateGSTDocuments(form),
  };
};
