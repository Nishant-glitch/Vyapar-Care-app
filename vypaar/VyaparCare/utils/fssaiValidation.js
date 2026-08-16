/**
 * FSSAI Food License / Registration — Validation Engine
 *
 * Provides regex validations, formatting helpers and comprehensive
 * multi-step validators for all 11 steps of the FSSAI FoSCoS Application.
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
export const IEC_REGEX = /^[A-Za-z0-9]{10}$/;
export const FSSAI_LIC_REGEX = /^[0-9]{14}$/;

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

export function validateIEC(iec) {
  if (!iec) return false;
  return IEC_REGEX.test(String(iec).trim().toUpperCase());
}

export function validateFSSAILicenseNumber(lic) {
  if (!lic) return false;
  return FSSAI_LIC_REGEX.test(String(lic).trim());
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

export function formatIEC(text) {
  if (!text) return '';
  return String(text)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);
}

// -----------------------------------------------------------------------------
// Step 1 Validator: KoB & Eligibility
// -----------------------------------------------------------------------------

export function validateFSSAIEligibility(formState = {}) {
  const errors = {};
  const { kob } = formState;

  if (!kob) {
    errors.kob = 'Please select your Kind of Business (KoB)';
  }

  return errors;
}

// -----------------------------------------------------------------------------
// Step 2 Validator: Applicant Details & Constitution
// -----------------------------------------------------------------------------

export function validateFSSAIApplicant(formState = {}) {
  const errors = {};
  const { constitution = 'proprietorship', applicantDetails = {} } = formState;

  if (!applicantDetails.businessLegalName?.trim()) {
    errors.businessLegalName = 'Applicant / Business Legal Name is required';
  }

  if (!applicantDetails.applicantName?.trim()) {
    errors.applicantName = 'Applicant Authorized Person Name is required';
  }

  if (!validatePAN(applicantDetails.pan)) {
    errors.pan = 'Please enter a valid 10-digit PAN (e.g. ABCDE1234F)';
  }

  if (!validateMobile(applicantDetails.mobile)) {
    errors.mobile = 'Please enter a valid 10-digit mobile number';
  }

  if (!validateEmail(applicantDetails.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!applicantDetails.address1?.trim()) {
    errors.address1 = 'Residential / Correspondence address is required';
  }

  if (!applicantDetails.city?.trim()) {
    errors.city = 'City is required';
  }

  if (!applicantDetails.state?.trim()) {
    errors.state = 'State is required';
  }

  if (!validatePIN(applicantDetails.pinCode)) {
    errors.pinCode = 'Please enter a valid 6-digit PIN code';
  }

  // Constitution Specific Validations
  if (constitution === 'partnership') {
    const partners = applicantDetails.partners || [];
    if (partners.length < 2) {
      errors.partners = 'At least 2 partners required for Partnership Firm';
    } else {
      partners.forEach((p, idx) => {
        if (!p.name?.trim()) {
          errors[`partner_${idx}_name`] = `Partner ${idx + 1} Name is required`;
        }
        if (p.mobile && !validateMobile(p.mobile)) {
          errors[`partner_${idx}_mobile`] = `Partner ${idx + 1} Mobile is invalid`;
        }
      });
    }
  } else if (constitution === 'llp') {
    if (!applicantDetails.llpin?.trim()) {
      errors.llpin = 'LLPIN is required for Limited Liability Partnership';
    } else if (!validateLLPIN(applicantDetails.llpin)) {
      errors.llpin = 'Invalid LLPIN format';
    }
  } else if (constitution === 'pvt_ltd' || constitution === 'public_ltd') {
    if (!applicantDetails.cin?.trim()) {
      errors.cin = 'Company CIN is required';
    } else if (!validateCIN(applicantDetails.cin)) {
      errors.cin = 'Invalid 21-digit CIN format (e.g. U72200DL2026PTC123456)';
    }
  }

  return errors;
}

// -----------------------------------------------------------------------------
// Step 3 Validator: Food Business Details
// -----------------------------------------------------------------------------

export function validateFSSAIBusiness(formState = {}) {
  const errors = {};
  const { businessDetails = {} } = formState;

  if (!businessDetails.foodBusinessName?.trim()) {
    errors.foodBusinessName = 'Food Business / Brand Name is required';
  }

  if (!businessDetails.annualTurnover) {
    errors.annualTurnover = 'Please specify annual turnover bracket';
  }

  return errors;
}

// -----------------------------------------------------------------------------
// Step 4 Validator: Business Premises Details
// -----------------------------------------------------------------------------

export function validateFSSAIPremises(formState = {}) {
  const errors = {};
  const { premisesDetails = {} } = formState;

  if (!premisesDetails.premisesName?.trim()) {
    errors.premisesName = 'Premises / Shop / Unit Name is required';
  }

  if (!premisesDetails.address1?.trim()) {
    errors.address1 = 'Complete Address Line 1 is required';
  }

  if (!premisesDetails.city?.trim()) {
    errors.city = 'City / Town is required';
  }

  if (!premisesDetails.district?.trim()) {
    errors.district = 'District is required';
  }

  if (!premisesDetails.state?.trim()) {
    errors.state = 'State is required';
  }

  if (!validatePIN(premisesDetails.pinCode)) {
    errors.pinCode = 'Valid 6-digit PIN code is required';
  }

  if (!premisesDetails.premisesType) {
    errors.premisesType = 'Please select premises ownership type (Owned / Rented / Leased / Shared)';
  }

  return errors;
}

// -----------------------------------------------------------------------------
// Step 5 Validator: Food Category / Products
// -----------------------------------------------------------------------------

export function validateFSSAIProducts(formState = {}) {
  const errors = {};
  const { products = [] } = formState;

  if (!products || products.length === 0) {
    errors.products = 'Please add at least 1 food product / menu item';
  } else {
    products.forEach((prod, idx) => {
      if (!prod.productName?.trim()) {
        errors[`product_${idx}_name`] = `Product ${idx + 1} Name is required`;
      }
      if (!prod.categoryCode) {
        errors[`product_${idx}_category`] = `Select category for product ${idx + 1}`;
      }
    });
  }

  return errors;
}

// -----------------------------------------------------------------------------
// Step 6 Validator: Business-Specific Details (KoB Specific)
// -----------------------------------------------------------------------------

export function validateFSSAISpecific(formState = {}) {
  const errors = {};
  const { kob, specificDetails = {} } = formState;

  // Manufacturer / Processor
  if (['manufacturer', 'processor', 'oil_processing', 'bakery'].includes(kob)) {
    if (!specificDetails.productionCapacity?.trim()) {
      errors.productionCapacity = 'Daily / Annual Production Capacity is required';
    }
  }

  // Water Plant
  if (kob === 'water') {
    if (!specificDetails.waterSource?.trim()) {
      errors.waterSource = 'Source of raw water is required (Groundwater / River / Municipal)';
    }
  }

  // Dairy
  if (kob === 'dairy') {
    if (!specificDetails.dairyLPD?.trim()) {
      errors.dairyLPD = 'Milk handling capacity in Litres Per Day (LPD) is required';
    }
  }

  // Meat
  if (kob === 'meat') {
    if (!specificDetails.meatSource?.trim()) {
      errors.meatSource = 'Source of raw meat is required';
    }
  }

  // Repacker / Relabeller
  if (['repacker', 'relabeller'].includes(kob)) {
    if (!specificDetails.manufacturerName?.trim()) {
      errors.manufacturerName = 'Original Manufacturer Name is required';
    }
    if (
      specificDetails.manufacturerFSSAI &&
      !validateFSSAILicenseNumber(specificDetails.manufacturerFSSAI)
    ) {
      errors.manufacturerFSSAI = 'Original Manufacturer FSSAI must be 14 digits';
    }
  }

  // Transporter
  if (kob === 'transporter') {
    const vehicles = specificDetails.vehicles || [];
    if (vehicles.length === 0) {
      errors.vehicles = 'Please add at least 1 vehicle in transport fleet';
    } else {
      vehicles.forEach((v, idx) => {
        if (!v.vehicleNumber?.trim()) {
          errors[`vehicle_${idx}_no`] = `Vehicle ${idx + 1} Number is required`;
        }
      });
    }
  }

  // Importer / Exporter
  if (['importer', 'exporter'].includes(kob)) {
    if (!specificDetails.iecCode?.trim()) {
      errors.iecCode = 'Import Export Code (IEC) is required';
    } else if (!validateIEC(specificDetails.iecCode)) {
      errors.iecCode = 'Invalid 10-character IEC Code format';
    }
  }

  return errors;
}

// -----------------------------------------------------------------------------
// Step 7/8 Validator: Document Uploads
// -----------------------------------------------------------------------------

export function validateFSSAIDocuments(documents = []) {
  const errors = {};

  documents.forEach((doc) => {
    if (doc.required) {
      const isUploaded =
        doc.status === 'uploaded' ||
        doc.status === 'approved' ||
        !!doc.file ||
        !!doc.fileUrl;
      if (!isUploaded) {
        errors[doc.id] = `${doc.label} is required for this FSSAI application`;
      }
    }
  });

  return errors;
}

// -----------------------------------------------------------------------------
// Full Application Pre-flight Validator
// -----------------------------------------------------------------------------

export function validateFullFSSAIApplication(formState = {}, documents = []) {
  return {
    eligibilityErrors: validateFSSAIEligibility(formState),
    applicantErrors: validateFSSAIApplicant(formState),
    businessErrors: validateFSSAIBusiness(formState),
    premisesErrors: validateFSSAIPremises(formState),
    productErrors: validateFSSAIProducts(formState),
    specificErrors: validateFSSAISpecific(formState),
    documentErrors: validateFSSAIDocuments(documents),
  };
}
