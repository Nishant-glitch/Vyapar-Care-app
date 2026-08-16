/**
 * Import Export Code (IEC) Registration — Central Configuration Matrix
 * DGFT (Directorate General of Foreign Trade) compliant configuration for 10 Entity Types,
 * Business Activities, Dynamic Document Matrix, Bank Proofs, and Fee Breakdown.
 */

/* ========================= A) Base Service Information ========================= */

export const IEC_SERVICE_INFO = {
  title: 'Import Export Code (IEC)',
  shortDescription: 'IEC registration required for import and export businesses.',
  serviceFee: 4000, // Platform assisted-filing / CA review fee
  governmentFee: 500, // DGFT statutory application fee
  processingTime: '3–5 Working Days',
  included: [
    'DGFT IEC Registration & e-IEC Certificate',
    'PAN & Entity Profile Verification',
    'Bank Account & IFSC Pre-Validation',
    'Aadhaar OTP / Class 3 DSC E-Sign Assistance',
    'All DGFT Government Fees Included',
    'Lifetime Validity & Port Registration Support',
  ],
  complianceDisclaimer:
    'IEC application requirements, fees, authentication methods and supporting documents are subject to current DGFT rules and portal workflow. The document checklist shown here is for assisted application processing. Final requirements will be verified by our foreign trade professionals before official filing.',
};

export const IEC_PRICING = {
  governmentFee: 500, // DGFT statutory application fee
  serviceFee: 4000, // Assisted-filing / CA review fee
  totalPayable: 4500,
};

export const IEC_DISCLAIMER_TEXT = IEC_SERVICE_INFO.complianceDisclaimer;

/* ========================= B) 10 Entity Types ========================= */

export const IEC_ENTITY_TYPES = [
  {
    id: 'proprietorship',
    label: 'Proprietorship',
    icon: '👤',
    desc: 'Sole business owner applying using individual PAN',
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'partnership',
    label: 'Partnership Firm',
    icon: '🤝',
    desc: 'Firm formed under Indian Partnership Act with 2+ partners',
    requiresPartners: true,
    requiresDirectors: false,
  },
  {
    id: 'llp',
    label: 'Limited Liability Partnership (LLP)',
    icon: '⚖️',
    desc: 'Registered LLP incorporated with MCA under LLP Act',
    requiresPartners: true,
    requiresDirectors: false,
  },
  {
    id: 'pvt_ltd',
    label: 'Private Limited Company',
    icon: '🏢',
    desc: 'Private limited company incorporated under Companies Act',
    requiresPartners: false,
    requiresDirectors: true,
  },
  {
    id: 'pub_ltd',
    label: 'Public Limited Company',
    icon: '🏛️',
    desc: 'Public limited corporate entity registered with MCA',
    requiresPartners: false,
    requiresDirectors: true,
  },
  {
    id: 'huf',
    label: 'Hindu Undivided Family (HUF)',
    icon: '👨‍👩‍👧‍👦',
    desc: 'Traditional family business represented by Karta',
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'trust',
    label: 'Trust',
    icon: '🛡️',
    desc: 'Public or private trust registered under Trust Act',
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'society',
    label: 'Society',
    icon: '📜',
    desc: 'Registered society under Societies Registration Act',
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'coop_society',
    label: 'Registered Cooperative Society',
    icon: '🌾',
    desc: 'Cooperative society registered with state or multi-state registrar',
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'other',
    label: 'Other Entity',
    icon: '🏷️',
    desc: 'Statutory corporation, Government entity, or unincorporated body',
    requiresPartners: false,
    requiresDirectors: false,
  },
];

/* ========================= C) Business & Trade Activities ========================= */

export const IEC_BUSINESS_ACTIVITIES = [
  { id: 'manufacturer', label: 'Manufacturer' },
  { id: 'trader', label: 'Trader / Merchant' },
  { id: 'service_provider', label: 'Service Provider' },
  { id: 'importer', label: 'Importer' },
  { id: 'exporter', label: 'Exporter' },
  { id: 'mfg_exporter', label: 'Manufacturer + Exporter' },
  { id: 'trader_importer', label: 'Trader + Importer' },
  { id: 'trader_exporter', label: 'Trader + Exporter' },
  { id: 'importer_exporter', label: 'Importer + Exporter (Both)' },
  { id: 'other', label: 'Other Activity' },
];

export const IEC_TRADE_ACTIVITIES = [
  { id: 'import_goods', label: 'Import Goods', icon: '🚢' },
  { id: 'export_goods', label: 'Export Goods', icon: '✈️' },
  { id: 'import_services', label: 'Import Services', icon: '💻' },
  { id: 'export_services', label: 'Export Services', icon: '🌐' },
  { id: 'both_goods_services', label: 'Both Import & Export (Goods & Services)', icon: '🔄' },
];

/* ========================= D) Premises Possession Types ========================= */

export const IEC_PREMISES_TYPES = [
  { id: 'owned', label: 'Owned', desc: 'Premises owned by the entity or proprietor' },
  { id: 'rented', label: 'Rented', desc: 'Premises occupied under valid Rent Agreement' },
  { id: 'leased', label: 'Leased', desc: 'Long-term commercial or industrial lease deed' },
  { id: 'shared', label: 'Shared / Co-working', desc: 'Shared premises with Owner NOC and utility bill' },
  { id: 'other', label: 'Other Possession', desc: 'Any other legal possession arrangement' },
];

/* ========================= E) Bank Account & Proof Types ========================= */

export const IEC_BANK_ACCOUNT_TYPES = [
  { id: 'current', label: 'Current Account (Firm Name)' },
  { id: 'savings', label: 'Savings Account (Proprietor Name)' },
  { id: 'cc', label: 'Cash Credit (CC) Account' },
  { id: 'od', label: 'Overdraft (OD) Account' },
];

export const IEC_BANK_PROOF_TYPES = [
  { id: 'cancelled_cheque', label: 'Cancelled Cheque', desc: 'Pre-printed with Account Holder Name & Account Number' },
  { id: 'bank_certificate', label: 'Bank Certificate (DGFT Format)', desc: 'Official bank certificate with branch stamp and signature' },
];

/* ========================= F) Signatory Designations & Authentication ========================= */

export const IEC_SIGNATORY_DESIGNATIONS = [
  { id: 'proprietor', label: 'Proprietor' },
  { id: 'partner', label: 'Partner' },
  { id: 'designated_partner', label: 'Designated Partner' },
  { id: 'director', label: 'Director' },
  { id: 'managing_director', label: 'Managing Director' },
  { id: 'karta', label: 'Karta (HUF)' },
  { id: 'trustee', label: 'Trustee / Secretary' },
  { id: 'authorized_signatory', label: 'Authorized Signatory' },
  { id: 'other', label: 'Other Designation' },
];

export const IEC_AUTH_METHODS = [
  {
    id: 'aadhaar_otp',
    label: 'Aadhaar-Based OTP Authentication (E-Sign)',
    icon: '📲',
    desc: 'Instant OTP sent to Aadhaar-linked mobile number of signatory',
  },
  {
    id: 'dsc',
    label: 'Digital Signature Certificate (Class 3 DSC)',
    icon: '🔐',
    desc: 'USB Token based Class 3 DSC registered on DGFT portal',
  },
];

/* ========================= G) Top Export / Import Markets ========================= */

export const IEC_COMMON_COUNTRIES = [
  'United States (USA)',
  'United Arab Emirates (UAE)',
  'China',
  'United Kingdom (UK)',
  'Germany',
  'Saudi Arabia',
  'Singapore',
  'Hong Kong',
  'Japan',
  'Australia',
  'Canada',
  'Vietnam',
  'France',
  'Netherlands',
  'South Africa',
  'Global / Worldwide',
];

/* ========================= H) Dynamic Document Checklist Engine ========================= */

export function getRequiredIECDocuments(formData = {}) {
  const entityType = formData.entityType || 'proprietorship';
  const premisesType = formData.addressDetails?.premisesType || 'owned';
  const addressProofInEntityName = formData.addressDetails?.proofInEntityName !== false;

  const docs = [
    // 1. PAN Card
    {
      id: 'pan_card',
      label: entityType === 'proprietorship' ? 'Proprietor PAN Card' : 'Entity PAN Card',
      category: 'Identity Proof',
      required: true,
      hint: 'Primary tax identity for IEC issuance (matching DGFT & NSDL records)',
    },
    // 2. Bank Proof
    {
      id: 'bank_proof',
      label: 'Firm Bank Account Proof (Cancelled Cheque or Bank Certificate)',
      category: 'Banking Proof',
      required: true,
      hint: 'Must show entity/firm name, account number and IFSC clearly',
    },
  ];

  // 3. Address Proof
  if (premisesType === 'owned') {
    docs.push({
      id: 'address_proof',
      label: 'Ownership Proof (Sale Deed / Municipal Tax Receipt / Electricity Bill)',
      category: 'Premises Proof',
      required: true,
      hint: 'Recent utility bill or ownership deed in entity/owner name (less than 2 months old)',
    });
  } else if (premisesType === 'rented' || premisesType === 'leased') {
    docs.push({
      id: 'rent_agreement',
      label: 'Registered Rent Agreement / Lease Deed',
      category: 'Premises Proof',
      required: true,
      hint: 'Valid agreement between premises owner and firm with full address',
    });
    docs.push({
      id: 'utility_bill',
      label: 'Electricity Bill / Water Bill of Premises',
      category: 'Premises Proof',
      required: true,
      hint: 'Utility bill matching the rented address for DGFT jurisdiction verification',
    });
  } else {
    docs.push({
      id: 'shared_noc',
      label: 'Premises Owner NOC / Consent Letter + Electricity Bill',
      category: 'Premises Proof',
      required: true,
      hint: 'Combined PDF of Owner NOC and latest utility bill',
    });
  }

  // If address proof is not in firm's legal name, mandatory owner NOC combined
  if (!addressProofInEntityName) {
    docs.push({
      id: 'owner_noc',
      label: "Premises Owner NOC (Since bill is not in firm's name)",
      category: 'Premises Proof',
      required: true,
      hint: 'No Objection Certificate from property owner permitting commercial import/export use',
    });
  }

  // 4. Establishment / Incorporation Proof
  if (entityType === 'partnership') {
    docs.push({
      id: 'partnership_deed',
      label: 'Partnership Deed',
      category: 'Constitution Proof',
      required: true,
      hint: 'Notarized or registered deed stating partners profit sharing and managing partner',
    });
    docs.push({
      id: 'firm_reg_cert',
      label: 'Firm Registration Certificate (Optional / Where registered)',
      category: 'Constitution Proof',
      required: false,
      hint: 'Issued by Registrar of Firms (ROF)',
    });
  } else if (entityType === 'llp') {
    docs.push({
      id: 'incorporation_certificate',
      label: 'LLP Certificate of Incorporation',
      category: 'Constitution Proof',
      required: true,
      hint: 'Issued by Ministry of Corporate Affairs (MCA)',
    });
    docs.push({
      id: 'llp_agreement',
      label: 'LLP Agreement',
      category: 'Constitution Proof',
      required: false,
      hint: 'Initial or amended LLP agreement filed with MCA',
    });
  } else if (entityType === 'pvt_ltd' || entityType === 'pub_ltd') {
    docs.push({
      id: 'incorporation_certificate',
      label: 'Certificate of Incorporation (COI)',
      category: 'Constitution Proof',
      required: true,
      hint: 'MCA incorporation certificate with CIN',
    });
    docs.push({
      id: 'moa_aoa',
      label: 'Memorandum & Articles of Association (MoA / AoA)',
      category: 'Constitution Proof',
      required: true,
      hint: 'Constitutional charter documents of the company',
    });
    docs.push({
      id: 'board_resolution',
      label: 'Board Resolution for Authorized Signatory',
      category: 'Authorization',
      required: true,
      hint: 'Board resolution authorizing director/signatory to apply for IEC on DGFT',
    });
  } else if (entityType === 'trust') {
    docs.push({
      id: 'trust_deed',
      label: 'Trust Deed & Registration Certificate',
      category: 'Constitution Proof',
      required: true,
      hint: 'Registered trust deed and registration proof',
    });
  } else if (entityType === 'society' || entityType === 'coop_society') {
    docs.push({
      id: 'society_reg_cert',
      label: 'Society Registration Certificate & Bye-laws',
      category: 'Constitution Proof',
      required: true,
      hint: 'Issued by Registrar of Societies / Cooperative Societies',
    });
  }

  // 5. Authorized Signatory Photograph
  docs.push({
    id: 'signatory_photo',
    label: 'Authorized Signatory Passport Size Photograph',
    category: 'Signatory Proof',
    required: true,
    hint: 'Clear front-facing digital photograph of proprietor, partner, or authorized director',
  });

  return docs;
}

/* ========================= I) Fee Calculation Engine ========================= */

export function calculateIECFees() {
  const govtFee = 500; // DGFT Official Application Fee
  const serviceFee = 4000; // Professional CA & DGFT Assisted-Filing Fee
  const totalPayable = govtFee + serviceFee; // ₹4,500

  return {
    governmentFee: govtFee,
    serviceFee: serviceFee,
    totalPayable: totalPayable,
  };
}

/* ========================= J) Export Compatibility ========================= */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    IEC_SERVICE_INFO,
    IEC_PRICING,
    IEC_DISCLAIMER_TEXT,
    IEC_ENTITY_TYPES,
    IEC_BUSINESS_ACTIVITIES,
    IEC_TRADE_ACTIVITIES,
    IEC_PREMISES_TYPES,
    IEC_BANK_ACCOUNT_TYPES,
    IEC_BANK_PROOF_TYPES,
    IEC_SIGNATORY_DESIGNATIONS,
    IEC_AUTH_METHODS,
    IEC_COMMON_COUNTRIES,
    getRequiredIECDocuments,
    calculateIECFees,
  };
}
