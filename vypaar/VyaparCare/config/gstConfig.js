/**
 * GST Registration (Form GST REG-01) — Central Configuration Matrix
 *
 * Configurable master data for 8 Business Constitutions, Registration Reasons,
 * Top HSN/SAC Categories, Nature of Possession, Dynamic Document Matrix Engine,
 * and Fee Breakdown.
 */

/* ========================= A) Service Base Information ========================= */

export const GST_SERVICE_INFO = {
  title: 'GST Registration',
  shortDescription: 'New GST Registration for Proprietorship, Partnership or Private Limited.',
  serviceFee: 10000,
  advancePercent: 50,
  processingTime: '3-5 Working Days',
  included: [
    'GST Number (GSTIN) Generation',
    'Official GST Registration Certificate (Form GST REG-06)',
    'All Government Fees & Application Filing Included',
    'HSN & SAC Code Classification Advisory',
    'Aadhaar Authentication & TRN Verification Assistance',
    'Dedicated GST Practitioner Consultation',
  ],
  legalDisclaimer:
    'GST registration requirements and documents depend on business constitution, premises possession type, nature of business activities, and Aadhaar authentication status under the CGST / SGST Act, 2017. All documents will be verified before submission on the GST Portal.',
};

export const GST_DISCLAIMER_TEXT = GST_SERVICE_INFO.legalDisclaimer;

/* ========================= B) 8 Business Constitutions ========================= */

export const GST_CONSTITUTIONS = [
  {
    id: 'proprietorship',
    label: 'Sole Proprietorship',
    icon: '👤',
    description: 'Individual business owner operating under trade name',
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'partnership',
    label: 'Partnership Firm',
    icon: '🤝',
    description: 'Registered or unregistered firm with 2 or more partners',
    requiresPartners: true,
    requiresDirectors: false,
  },
  {
    id: 'llp',
    label: 'Limited Liability Partnership (LLP)',
    icon: '⚖️',
    description: 'Incorporated under LLP Act with Designated Partners',
    requiresPartners: true,
    requiresDirectors: false,
  },
  {
    id: 'pvt_ltd',
    label: 'Private Limited Company',
    icon: '🏢',
    description: 'Incorporated company under Companies Act, 2013',
    requiresPartners: false,
    requiresDirectors: true,
  },
  {
    id: 'public_ltd',
    label: 'Public Limited Company',
    icon: '🏛️',
    description: 'Listed or unlisted public company',
    requiresPartners: false,
    requiresDirectors: true,
  },
  {
    id: 'huf',
    label: 'Hindu Undivided Family (HUF)',
    icon: '👨‍👩‍👧‍👦',
    description: 'Family business managed by Karta',
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'society_trust',
    label: 'Society / Trust / Club / AOP',
    icon: '📜',
    description: 'Non-profit, charitable trust or association',
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'other',
    label: 'Other Legal Entity',
    icon: '🏷️',
    description: 'Statutory corporation, government department, etc.',
    requiresPartners: false,
    requiresDirectors: false,
  },
];

/* ========================= C) Registration Reasons ========================= */

export const GST_REASONS = [
  { id: 'voluntary', label: 'Voluntary Basis (Expanding B2B / Input Tax Credit)' },
  { id: 'threshold', label: 'Crossing Aggregate Turnover Limit (> ₹40L / ₹20L / ₹10L)' },
  { id: 'interstate', label: 'Inter-State Supply of Goods / Services (Mandatory)' },
  { id: 'ecommerce', label: 'E-Commerce Seller (Selling via Amazon, Flipkart, Swiggy, etc.)' },
  { id: 'casual', label: 'Casual Taxable Person' },
  { id: 'isd', label: 'Input Service Distributor (ISD)' },
  { id: 'other', label: 'Other Statutory Requirement' },
];

/* ========================= D) Premises Possession Types ========================= */

export const GST_POSSESSION_TYPES = [
  { id: 'owned', label: 'Owned', icon: '🏠', hint: 'Property Tax Receipt / Electricity Bill / Sale Deed' },
  { id: 'rented', label: 'Rented', icon: '📝', hint: 'Rent Agreement + Owner NOC + Electricity Bill' },
  { id: 'leased', label: 'Leased', icon: '🏢', hint: 'Lease Deed + Utility Bill' },
  { id: 'shared', label: 'Consent / Shared', icon: '🤝', hint: 'Consent Letter / NOC from Owner + Electricity Bill' },
  { id: 'others', label: 'Others', icon: '📍', hint: 'Legal Possession Proof' },
];

/* ========================= E) Dynamic Document Matrix Generator ========================= */

/**
 * Calculates the exact dynamic document checklist based on:
 * - Constitution (Proprietorship, Partnership, LLP, Company, etc.)
 * - Premises Possession Type (Owned, Rented, Leased, Shared)
 * - Bank Details Proof
 */
export function getRequiredGSTDocuments(params = {}) {
  const constitution = params.constitution || 'proprietorship';
  const possessionType = params.possessionType || params.premisesDetails?.possessionType || 'rented';

  const docs = [];

  // 1. Primary Identity & Photo
  docs.push({
    id: 'applicant_photo',
    label: 'Promoter / Proprietor / Authorized Signatory Photograph',
    category: 'identity',
    categoryLabel: '👤 Primary Identity Proofs',
    required: true,
    hint: 'Passport size photo (white background, max 5MB)',
  });

  docs.push({
    id: 'applicant_pan',
    label: 'Applicant / Entity PAN Card',
    category: 'identity',
    categoryLabel: '👤 Primary Identity Proofs',
    required: true,
    hint: 'Self-attested PAN card of Proprietor / Firm / Company',
  });

  docs.push({
    id: 'applicant_aadhaar',
    label: 'Promoter / Signatory Aadhaar Card (Front & Back)',
    category: 'identity',
    categoryLabel: '👤 Primary Identity Proofs',
    required: true,
    hint: 'Mandatory for instant Aadhaar Authentication & biometric exemption',
  });

  // 2. Constitution Documents
  if (constitution === 'partnership') {
    docs.push({
      id: 'partnership_deed',
      label: 'Partnership Deed (Signed & Notarized)',
      category: 'constitution',
      categoryLabel: '🤝 Partnership Firm Documents',
      required: true,
      hint: 'Complete partnership deed with all partner signatures',
    });
    docs.push({
      id: 'partner_authorization_letter',
      label: 'Letter of Authorization / Consent of Partners',
      category: 'constitution',
      categoryLabel: '🤝 Partnership Firm Documents',
      required: true,
      hint: 'Letter signed by all partners authorizing managing partner for GST',
    });
  } else if (constitution === 'llp') {
    docs.push({
      id: 'llp_coi',
      label: 'LLP Certificate of Incorporation (COI)',
      category: 'constitution',
      categoryLabel: '⚖️ LLP Legal Documents',
      required: true,
      hint: 'Certificate of Incorporation issued by ROC',
    });
    docs.push({
      id: 'llp_agreement',
      label: 'LLP Agreement (Signed & Executed)',
      category: 'constitution',
      categoryLabel: '⚖️ LLP Legal Documents',
      required: true,
      hint: 'Complete LLP agreement showing designated partners',
    });
    docs.push({
      id: 'llp_authorization_letter',
      label: 'Designated Partner Authorization Resolution',
      category: 'constitution',
      categoryLabel: '⚖️ LLP Legal Documents',
      required: true,
      hint: 'Board resolution or authorization letter signed by all partners',
    });
  } else if (constitution === 'pvt_ltd' || constitution === 'public_ltd') {
    docs.push({
      id: 'company_coi',
      label: 'Certificate of Incorporation (MCA)',
      category: 'constitution',
      categoryLabel: '🏢 Company Corporate Documents',
      required: true,
      hint: 'MCA Certificate of Incorporation',
    });
    docs.push({
      id: 'board_resolution_gst',
      label: 'Board Resolution for GST Authorized Signatory',
      category: 'constitution',
      categoryLabel: '🏢 Company Corporate Documents',
      required: true,
      hint: 'Board resolution passed by directors authorizing signatory for GST filing',
    });
  } else if (constitution === 'society_trust') {
    docs.push({
      id: 'trust_society_registration',
      label: 'Trust Deed / Society Registration Certificate',
      category: 'constitution',
      categoryLabel: '📜 Organization Documents',
      required: true,
      hint: 'Registration certificate and managing committee authorization',
    });
  }

  // 3. Principal Place of Business (Premises Proofs)
  if (possessionType === 'owned') {
    docs.push({
      id: 'premises_ownership_doc',
      label: 'Ownership Document (Property Tax Receipt / Sale Deed / Electricity Bill)',
      category: 'premises',
      categoryLabel: '📍 Principal Place of Business Proofs',
      required: true,
      hint: 'Document proving ownership of business address in applicant/owner name',
    });
    docs.push({
      id: 'premises_utility_bill',
      label: 'Latest Electricity / Water Bill (Max 2 Months Old)',
      category: 'premises',
      categoryLabel: '📍 Principal Place of Business Proofs',
      required: true,
      hint: 'Electricity bill for address and location verification',
    });
  } else if (possessionType === 'rented' || possessionType === 'leased') {
    docs.push({
      id: 'premises_rent_agreement',
      label: 'Rent Agreement / Lease Deed (Executed & Notarized)',
      category: 'premises',
      categoryLabel: '📍 Principal Place of Business Proofs',
      required: true,
      hint: 'Rent agreement in the name of the proprietor / firm / company',
    });
    docs.push({
      id: 'premises_owner_noc',
      label: 'Owner NOC & Latest Electricity Bill',
      category: 'premises',
      categoryLabel: '📍 Principal Place of Business Proofs',
      required: true,
      hint: 'No Objection Certificate from property owner along with electricity bill',
    });
  } else {
    docs.push({
      id: 'premises_consent_letter',
      label: 'Consent Letter / NOC from Premises Owner',
      category: 'premises',
      categoryLabel: '📍 Principal Place of Business Proofs',
      required: true,
      hint: 'Consent letter permitting commercial business use + latest electricity bill',
    });
  }

  // 4. Bank Account Verification
  docs.push({
    id: 'bank_account_proof',
    label: 'Bank Proof (Cancelled Cheque / Bank Statement / Passbook Front Page)',
    category: 'bank',
    categoryLabel: '🏦 Bank Account Details',
    required: true,
    hint: 'Showing Account Name, Account Number and IFSC Code',
  });

  return docs;
}

/* ========================= F) Fee Calculator ========================= */

export function calculateGSTFees() {
  const serviceFee = GST_SERVICE_INFO.serviceFee; // ₹10,000
  const advancePercent = GST_SERVICE_INFO.advancePercent; // 50%
  const advanceAmount = Math.round((serviceFee * advancePercent) / 100);
  const balanceAmount = serviceFee - advanceAmount;

  return {
    serviceFee,
    advancePercent,
    advanceAmount,
    balanceAmount,
    totalPayable: serviceFee,
  };
}
