/**
 * Private Limited Company Registration — Validation Engine
 * Provides regex validations, single-field validators, formatting helpers,
 * and comprehensive multi-step form validators.
 */

export const PATTERNS = {
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
  aadhaar: /^[0-9]{12}$/,
  mobile: /^[6-9][0-9]{9}$/,
  email: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
  pin: /^[0-9]{6}$/,
  din: /^[0-9]{8}$/,
};

/* ========================= Single Field Checkers ========================= */

export const isBlank = (value) =>
  value === null || value === undefined || String(value).trim() === '';

export const validatePAN = (value) =>
  PATTERNS.pan.test(String(value || '').toUpperCase().trim());

export const validateAadhaar = (value) =>
  PATTERNS.aadhaar.test(String(value || '').replace(/\s/g, ''));

export const validateMobile = (value) =>
  PATTERNS.mobile.test(String(value || '').trim());

export const validateEmail = (value) =>
  PATTERNS.email.test(String(value || '').trim());

export const validatePIN = (value) =>
  PATTERNS.pin.test(String(value || '').trim());

export const validateDIN = (value) =>
  PATTERNS.din.test(String(value || '').trim());

/* ========================= Formatters ========================= */

export const digitsOnly = (value, max) => {
  const clean = String(value || '').replace(/[^0-9]/g, '');
  return max ? clean.slice(0, max) : clean;
};

export const formatPAN = (value) =>
  String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);

export const formatDIN = (value) =>
  digitsOnly(value, 8);

export const maskAadhaar = (value) => {
  const clean = digitsOnly(value, 12);
  if (clean.length <= 4) return clean;
  const last4 = clean.slice(-4);
  const hiddenGroups = Math.ceil((clean.length - 4) / 4);
  return `${'XXXX '.repeat(hiddenGroups).trim()} ${last4}`.trim();
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

/* ========================= Step 1: Applicant Validator ========================= */

export function validateApplicant(data = {}) {
  const errors = {};

  if (isBlank(data.fullName)) errors.fullName = 'Full name is required';
  else if (String(data.fullName).trim().length < 3)
    errors.fullName = 'Full name must have at least 3 characters';

  if (isBlank(data.parentName)) errors.parentName = "Father's / Mother's name is required";

  if (isBlank(data.dob)) errors.dob = 'Date of birth is required';
  else {
    const dob = new Date(data.dob);
    const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 18) errors.dob = 'Applicant must be at least 18 years old';
  }

  if (isBlank(data.pan)) errors.pan = 'PAN number is required';
  else if (!validatePAN(data.pan)) errors.pan = 'Invalid PAN format (e.g. ABCDE1234F)';

  if (isBlank(data.aadhaar)) errors.aadhaar = 'Aadhaar / ID number is required';
  else if (!validateAadhaar(data.aadhaar))
    errors.aadhaar = 'Aadhaar number must be 12 digits';

  if (isBlank(data.mobile)) errors.mobile = 'Mobile number is required';
  else if (!validateMobile(data.mobile))
    errors.mobile = 'Valid 10-digit mobile number required (starting with 6-9)';

  if (isBlank(data.email)) errors.email = 'Email address is required';
  else if (!validateEmail(data.email)) errors.email = 'Please enter a valid email address';

  if (isBlank(data.address)) errors.address = 'Residential address is required';
  if (isBlank(data.state)) errors.state = 'State selection is required';
  if (isBlank(data.city)) errors.city = 'City is required';
  if (isBlank(data.district)) errors.district = 'District is required';

  if (isBlank(data.pincode)) errors.pincode = 'PIN code is required';
  else if (!validatePIN(data.pincode)) errors.pincode = 'PIN code must be 6 digits';

  return errors;
}

/* ========================= Step 2: Company Details Validator ========================= */

export function validateCompanyDetails(data = {}) {
  const errors = {};

  if (isBlank(data.proposedName1))
    errors.proposedName1 = 'Proposed Company Name (Option 1) is required';
  else if (String(data.proposedName1).trim().length < 3)
    errors.proposedName1 = 'Name must be at least 3 characters';

  if (isBlank(data.proposedName2))
    errors.proposedName2 = 'Proposed Company Name (Option 2) is required';

  if (isBlank(data.registeredState))
    errors.registeredState = 'Please select Registered Office State';

  if (isBlank(data.mainActivity))
    errors.mainActivity = 'Please select main business activity';

  if (isBlank(data.description))
    errors.description = 'Please describe the proposed business activities';

  // Capital validations
  const authCap = Number(data.authorizedCapital || 0);
  const paidCap = Number(data.paidUpCapital || 0);

  if (!authCap || authCap < 10000) {
    errors.authorizedCapital = 'Authorized Capital must be at least ₹10,000';
  }

  if (!paidCap || paidCap < 10000) {
    errors.paidUpCapital = 'Paid-up Capital must be at least ₹10,000';
  } else if (paidCap > authCap) {
    errors.paidUpCapital = 'Paid-up capital cannot exceed Authorized capital';
  }

  // Directors count validation (min 2 for Pvt Ltd)
  const dirCount = Number(data.directorCount || 2);
  if (dirCount < 2) {
    errors.directorCount = 'Minimum 2 Directors are legally required for a Private Limited Company';
  } else if (dirCount > 15) {
    errors.directorCount = 'Maximum 15 Directors allowed without special resolution';
  }

  // Subscribers count validation (min 2 for Pvt Ltd)
  const subCount = Number(data.subscriberCount || 2);
  if (subCount < 2) {
    errors.subscriberCount = 'Minimum 2 Shareholders/Subscribers required';
  } else if (subCount > 200) {
    errors.subscriberCount = 'Maximum 200 Shareholders allowed for a Private Limited Company';
  }

  return errors;
}

/* ========================= Step 3: Directors & Subscribers Validator ========================= */

export function validateDirectors(directors = [], directorCount = 2) {
  const errors = {};
  const count = Math.max(directorCount, 2);

  for (let i = 0; i < count; i++) {
    const dir = directors[i] || {};
    const prefix = `director_${i}`;
    const label = `Director ${i + 1}`;

    if (isBlank(dir.fullName)) errors[`${prefix}_fullName`] = `${label}: Full Name is required`;
    if (isBlank(dir.parentName)) errors[`${prefix}_parentName`] = `${label}: Parent's Name is required`;

    if (isBlank(dir.dob)) errors[`${prefix}_dob`] = `${label}: Date of birth is required`;
    else {
      const dob = new Date(dir.dob);
      const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 18) errors[`${prefix}_dob`] = `${label}: Must be at least 18 years old`;
    }

    if (isBlank(dir.pan)) errors[`${prefix}_pan`] = `${label}: PAN is required`;
    else if (!validatePAN(dir.pan)) errors[`${prefix}_pan`] = `${label}: Invalid PAN format`;

    if (isBlank(dir.aadhaar)) errors[`${prefix}_aadhaar`] = `${label}: ID / Aadhaar is required`;

    if (isBlank(dir.gender)) errors[`${prefix}_gender`] = `${label}: Gender is required`;
    if (isBlank(dir.nationality)) errors[`${prefix}_nationality`] = `${label}: Nationality is required`;

    if (isBlank(dir.address)) errors[`${prefix}_address`] = `${label}: Residential address is required`;
    if (isBlank(dir.state)) errors[`${prefix}_state`] = `${label}: State is required`;
    if (isBlank(dir.city)) errors[`${prefix}_city`] = `${label}: City is required`;
    if (isBlank(dir.district)) errors[`${prefix}_district`] = `${label}: District is required`;

    if (isBlank(dir.pincode)) errors[`${prefix}_pincode`] = `${label}: PIN code is required`;
    else if (!validatePIN(dir.pincode)) errors[`${prefix}_pincode`] = `${label}: 6-digit PIN code required`;

    if (isBlank(dir.mobile)) errors[`${prefix}_mobile`] = `${label}: Mobile number is required`;
    else if (!validateMobile(dir.mobile)) errors[`${prefix}_mobile`] = `${label}: Valid 10-digit mobile required`;

    if (isBlank(dir.email)) errors[`${prefix}_email`] = `${label}: Email address is required`;
    else if (!validateEmail(dir.email)) errors[`${prefix}_email`] = `${label}: Valid email required`;

    // DIN check
    if (dir.hasDIN) {
      if (isBlank(dir.din)) errors[`${prefix}_din`] = `${label}: 8-digit Existing DIN is required`;
      else if (!validateDIN(dir.din)) errors[`${prefix}_din`] = `${label}: DIN must be 8 digits`;
    }
  }

  return errors;
}

export function validateSubscribers(subscribers = [], subscriberCount = 2) {
  const errors = {};
  const count = Math.max(subscriberCount, 2);

  let totalPercentage = 0;

  for (let i = 0; i < count; i++) {
    const sub = subscribers[i] || {};
    const prefix = `subscriber_${i}`;
    const label = `Subscriber ${i + 1}`;

    if (isBlank(sub.fullName)) errors[`${prefix}_fullName`] = `${label}: Full Name is required`;
    if (isBlank(sub.pan)) errors[`${prefix}_pan`] = `${label}: PAN is required`;
    else if (!validatePAN(sub.pan)) errors[`${prefix}_pan`] = `${label}: Invalid PAN format`;

    if (isBlank(sub.mobile)) errors[`${prefix}_mobile`] = `${label}: Mobile is required`;
    if (isBlank(sub.email)) errors[`${prefix}_email`] = `${label}: Email is required`;

    if (isBlank(sub.sharesCount) || Number(sub.sharesCount) <= 0) {
      errors[`${prefix}_sharesCount`] = `${label}: Number of shares must be greater than 0`;
    }

    const pct = Number(sub.shareholdingPercent || 0);
    if (!pct || pct <= 0) {
      errors[`${prefix}_shareholdingPercent`] = `${label}: Shareholding percentage required`;
    } else {
      totalPercentage += pct;
    }
  }

  if (Math.round(totalPercentage) !== 100 && count > 0) {
    errors.totalShareholding = `Total shareholding percentage across subscribers must equal 100% (currently ${totalPercentage}%)`;
  }

  return errors;
}

/* ========================= Step 4: Registered Office Validator ========================= */

export function validateRegisteredOffice(data = {}) {
  const errors = {};

  if (isBlank(data.premisesType)) errors.premisesType = 'Please select Registered Office Premises Status';
  if (isBlank(data.line1)) errors.line1 = 'Address Line 1 is required';
  if (isBlank(data.locality)) errors.locality = 'Locality / Area is required';
  if (isBlank(data.city)) errors.city = 'City is required';
  if (isBlank(data.district)) errors.district = 'District is required';
  if (isBlank(data.state)) errors.state = 'State is required';

  if (isBlank(data.pincode)) errors.pincode = 'PIN code is required';
  else if (!validatePIN(data.pincode)) errors.pincode = 'PIN code must be 6 digits';

  return errors;
}

/* ========================= Step 5: Business Details Validator ========================= */

export function validateBusinessDetails(data = {}, dynamicFieldDefs = []) {
  const errors = {};

  if (isBlank(data.mainActivity)) errors.mainActivity = 'Main business activity is required';

  if (!data.natureOfBusiness || data.natureOfBusiness.length === 0) {
    errors.natureOfBusiness = 'Select at least one nature of business';
  }

  if (isBlank(data.productsServices)) errors.productsServices = 'Products / Services details are required';
  if (isBlank(data.description)) errors.description = 'Business description is required';
  if (isBlank(data.turnover)) errors.turnover = 'Expected annual turnover is required';
  if (isBlank(data.startDate)) errors.startDate = 'Proposed business start date is required';

  // Dynamic activity fields check
  (dynamicFieldDefs || []).forEach((field) => {
    if (!field.required) return;
    const val = data.additionalFields?.[field.key];
    if (isBlank(val)) {
      errors[`additional_${field.key}`] = `${field.label} is required`;
    }
  });

  return errors;
}

/* ========================= Step 6: Documents Upload Validator ========================= */

export function validateDocumentUploads(documents = []) {
  const errors = {};
  const missing = [];

  documents.forEach((doc) => {
    if (doc.required) {
      const isSatisfied = !!doc.file || doc.isReused || ['uploaded', 'reused', 'under_review', 'approved'].includes(doc.status);
      if (!isSatisfied) {
        errors[doc.id] = `Please upload ${doc.label}`;
        missing.push(doc.label);
      }
    }
  });

  if (missing.length > 0) {
    errors.summary = `${missing.length} mandatory document(s) missing. Please upload before proceeding.`;
    errors.missingList = missing;
  }

  return errors;
}

export const hasErrors = (errors) => Object.keys(errors || {}).length > 0;
