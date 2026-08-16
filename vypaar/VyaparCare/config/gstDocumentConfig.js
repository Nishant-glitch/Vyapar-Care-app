/**
 * GST Registration ka poora document + field matrix ek hi jagah.
 *
 * Screens me koi hardcoded document list nahi honi chahiye — sab kuch yahin se
 * aata hai, taaki rules badalne pe sirf ye file chhedni pade.
 *
 * Har document: { id, label, perMember? }
 *   perMember: true  -> ye document har partner/director/trustee ke liye alag
 *                       chahiye (count business screen se aata hai)
 *   fromPremises: true -> placeholder hai; getRequiredDocuments() ise premises
 *                       type ke asli documents se replace kar deta hai
 */

/* ========================= common documents ========================= */

// har constitution me lagte hain, isliye ek jagah define karke reuse kiye
const ADDRESS_PROOF = {
  id: 'address_proof',
  label: 'Address Proof (Principal Place of Business)',
  fromPremises: true,
};

const BANK_PROOF = {
  id: 'bank_proof',
  label: 'Bank Proof (Cancelled Cheque / Statement / Passbook)',
};

/* ========================= A) business types ========================= */

export const BUSINESS_TYPES = [
  {
    id: 'proprietorship',
    label: 'Proprietorship',
    icon: '👤',
    requiredDocuments: [
      { id: 'prop_pan', label: 'PAN Card (Proprietor)' },
      { id: 'prop_aadhaar', label: 'Aadhaar Card (Proprietor)' },
      { id: 'prop_photo', label: 'Photograph (Proprietor)' },
      ADDRESS_PROOF,
      BANK_PROOF,
    ],
    optionalDocuments: [
      { id: 'prop_trade_license', label: 'Trade License / Shop Act (if any)' },
      { id: 'prop_msme', label: 'MSME / Udyam Certificate (if any)' },
    ],
  },

  {
    id: 'partnership',
    label: 'Partnership Firm',
    icon: '🤝',
    requiredDocuments: [
      { id: 'firm_pan', label: 'Firm PAN Card' },
      { id: 'partnership_deed', label: 'Partnership Deed' },
      { id: 'partner_pan', label: 'PAN Card (each Partner)', perMember: true },
      { id: 'partner_aadhaar', label: 'Aadhaar Card (each Partner)', perMember: true },
      { id: 'partner_photo', label: 'Photograph (each Partner)', perMember: true },
      { id: 'auth_doc', label: 'Authorisation Letter / Board Resolution' },
      ADDRESS_PROOF,
      BANK_PROOF,
    ],
    optionalDocuments: [
      { id: 'firm_reg_certificate', label: 'Firm Registration Certificate (if registered)' },
    ],
  },

  {
    id: 'llp',
    label: 'LLP',
    icon: '📊',
    requiredDocuments: [
      { id: 'llp_pan', label: 'LLP PAN Card' },
      { id: 'llp_agreement', label: 'LLP Agreement' },
      { id: 'llp_coi', label: 'Certificate of Incorporation (COI)' },
      { id: 'partner_pan', label: 'PAN Card (each Partner)', perMember: true },
      { id: 'partner_aadhaar', label: 'Aadhaar Card (each Partner)', perMember: true },
      { id: 'partner_photo', label: 'Photograph (each Partner)', perMember: true },
      { id: 'auth_signatory', label: 'Authorised Signatory Proof' },
      ADDRESS_PROOF,
      BANK_PROOF,
    ],
    optionalDocuments: [{ id: 'llp_din', label: 'DIN / DPIN of Designated Partners' }],
  },

  {
    id: 'private_limited',
    label: 'Private Limited',
    icon: '🏢',
    requiredDocuments: [
      { id: 'company_pan', label: 'Company PAN Card' },
      { id: 'coi', label: 'Certificate of Incorporation (COI)' },
      { id: 'moa', label: 'Memorandum of Association (MOA)' },
      { id: 'aoa', label: 'Articles of Association (AOA)' },
      { id: 'director_pan', label: 'PAN Card (each Director)', perMember: true },
      { id: 'director_aadhaar', label: 'Aadhaar Card (each Director)', perMember: true },
      { id: 'director_photo', label: 'Photograph (each Director)', perMember: true },
      { id: 'board_resolution', label: 'Board Resolution' },
      ADDRESS_PROOF,
      BANK_PROOF,
    ],
    optionalDocuments: [{ id: 'din_certificate', label: 'DIN Certificate of Directors' }],
  },

  {
    id: 'public_limited',
    label: 'Public Limited',
    icon: '🏛️',
    // public limited ke documents private limited jaise hi hain
    requiredDocuments: [
      { id: 'company_pan', label: 'Company PAN Card' },
      { id: 'coi', label: 'Certificate of Incorporation (COI)' },
      { id: 'moa', label: 'Memorandum of Association (MOA)' },
      { id: 'aoa', label: 'Articles of Association (AOA)' },
      { id: 'director_pan', label: 'PAN Card (each Director)', perMember: true },
      { id: 'director_aadhaar', label: 'Aadhaar Card (each Director)', perMember: true },
      { id: 'director_photo', label: 'Photograph (each Director)', perMember: true },
      { id: 'board_resolution', label: 'Board Resolution' },
      ADDRESS_PROOF,
      BANK_PROOF,
    ],
    optionalDocuments: [{ id: 'din_certificate', label: 'DIN Certificate of Directors' }],
  },

  {
    id: 'trust',
    label: 'Trust',
    icon: '🕊️',
    requiredDocuments: [
      { id: 'trust_pan', label: 'Trust PAN Card' },
      { id: 'trust_registration', label: 'Trust Registration Certificate' },
      { id: 'trust_deed', label: 'Trust Deed' },
      { id: 'trustee_pan', label: 'PAN Card (each Trustee)', perMember: true },
      { id: 'trustee_aadhaar', label: 'Aadhaar Card (each Trustee)', perMember: true },
      { id: 'trustee_photo', label: 'Photograph (each Trustee)', perMember: true },
      { id: 'auth_doc', label: 'Authorisation Letter / Resolution' },
      ADDRESS_PROOF,
      BANK_PROOF,
    ],
    optionalDocuments: [{ id: 'trust_12a', label: '12A / 80G Certificate (if any)' }],
  },

  {
    id: 'society_ngo',
    label: 'Society / NGO',
    icon: '🤲',
    requiredDocuments: [
      { id: 'society_registration', label: 'Society Registration Certificate' },
      { id: 'society_pan', label: 'Society PAN Card' },
      { id: 'member_pan', label: 'PAN Card (each Member)', perMember: true },
      { id: 'member_aadhaar', label: 'Aadhaar Card (each Member)', perMember: true },
      { id: 'member_photo', label: 'Photograph (each Member)', perMember: true },
      { id: 'auth_doc', label: 'Authorisation Letter / Resolution' },
      ADDRESS_PROOF,
      BANK_PROOF,
    ],
    optionalDocuments: [{ id: 'society_bylaws', label: 'Bye-laws / Rules of the Society' }],
  },

  {
    id: 'other',
    label: 'Other',
    icon: '⚙️',
    requiredDocuments: [
      { id: 'other_pan', label: 'PAN Card' },
      { id: 'other_aadhaar', label: 'Aadhaar Card' },
      { id: 'other_photo', label: 'Photograph' },
      ADDRESS_PROOF,
      BANK_PROOF,
    ],
    optionalDocuments: [],
  },
];

/* ========================= B) premises types ========================= */

export const PREMISES_TYPES = [
  {
    id: 'owned',
    label: 'Owned',
    icon: '🏠',
    documents: [
      { id: 'premises_utility_bill', label: 'Electricity / Utility Bill' },
      { id: 'premises_property_tax', label: 'Property Tax Receipt' },
    ],
  },
  {
    id: 'rented',
    label: 'Rented / Leased',
    icon: '🔑',
    documents: [
      { id: 'premises_rent_agreement', label: 'Rent / Lease Agreement' },
      { id: 'premises_owner_proof', label: 'Owner Ownership Proof' },
      { id: 'premises_utility_bill', label: 'Electricity / Utility Bill' },
      { id: 'premises_noc', label: 'NOC from Owner' },
    ],
  },
  {
    id: 'consent',
    label: 'Consent / Shared',
    icon: '📝',
    documents: [
      { id: 'premises_consent', label: 'Consent Letter / NOC' },
      { id: 'premises_owner_proof', label: 'Owner Ownership Proof' },
      { id: 'premises_utility_bill', label: 'Electricity / Utility Bill' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    icon: '📄',
    documents: [{ id: 'premises_address_proof', label: 'Address Proof' }],
  },
];

/* ======================= C) business activities ======================= */

export const BUSINESS_ACTIVITIES = [
  { id: 'retail', label: 'Retail Trade', icon: '🛍️' },
  { id: 'wholesale', label: 'Wholesale Trade', icon: '📦' },
  { id: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { id: 'service_provider', label: 'Service Provider', icon: '🛠️' },
  { id: 'ecommerce', label: 'E-Commerce', icon: '🛒' },
  { id: 'import_export', label: 'Import / Export', icon: '🌐' },
  { id: 'restaurant_food', label: 'Restaurant / Food', icon: '🍽️' },
  { id: 'contractor', label: 'Works Contractor', icon: '👷' },
  { id: 'transport_logistics', label: 'Transport / Logistics', icon: '🚚' },
  { id: 'freelancer', label: 'Freelancer', icon: '💻' },
  { id: 'consultancy', label: 'Consultancy', icon: '💼' },
  { id: 'other', label: 'Other', icon: '⚙️' },
];

/* ==================== D) activity ke extra fields ==================== */

/**
 * Main business activity chunne pe ye fields dynamically render hote hain.
 * type: 'text' | 'textarea' | 'select' | 'boolean'
 */
export const ACTIVITY_ADDITIONAL_FIELDS = {
  ecommerce: [
    {
      key: 'platform',
      label: 'Platform Type',
      type: 'select',
      required: true,
      options: [
        { id: 'own_website', label: 'Own Website' },
        { id: 'marketplace', label: 'Marketplace Seller' },
        { id: 'both', label: 'Both' },
        { id: 'aggregator', label: 'Aggregator / Operator' },
      ],
    },
    {
      key: 'marketplace',
      label: 'Marketplace Name(s)',
      type: 'text',
      placeholder: 'Amazon, Flipkart, Meesho...',
    },
    {
      key: 'website_url',
      label: 'Website / App URL',
      type: 'text',
      placeholder: 'https://example.com',
      keyboardType: 'url',
    },
    {
      key: 'seller_account',
      label: 'Seller Account ID',
      type: 'text',
      placeholder: 'Seller / Vendor ID',
    },
  ],

  import_export: [
    {
      key: 'activity_type',
      label: 'Activity Type',
      type: 'select',
      required: true,
      options: [
        { id: 'import', label: 'Import Only' },
        { id: 'export', label: 'Export Only' },
        { id: 'both', label: 'Import & Export' },
      ],
    },
    {
      key: 'iec_available',
      label: 'IEC Code Available?',
      type: 'boolean',
      required: true,
    },
    {
      key: 'export_details',
      label: 'Import / Export Details',
      type: 'textarea',
      placeholder: 'Countries, main goods, IEC number...',
    },
  ],

  restaurant_food: [
    {
      key: 'type',
      label: 'Establishment Type',
      type: 'select',
      required: true,
      options: [
        { id: 'restaurant', label: 'Restaurant' },
        { id: 'cloud_kitchen', label: 'Cloud Kitchen' },
        { id: 'cafe', label: 'Cafe / Bakery' },
        { id: 'catering', label: 'Catering' },
        { id: 'food_truck', label: 'Food Truck / Stall' },
      ],
    },
    {
      key: 'food_activity',
      label: 'Food Activity',
      type: 'select',
      required: true,
      options: [
        { id: 'manufacturing', label: 'Manufacturing / Cooking' },
        { id: 'trading', label: 'Trading / Reselling' },
        { id: 'both', label: 'Both' },
      ],
    },
    {
      key: 'address',
      label: 'Kitchen / Outlet Address',
      type: 'textarea',
      placeholder: 'Poora address',
    },
  ],

  manufacturing: [
    {
      key: 'activity',
      label: 'Manufacturing Activity',
      type: 'select',
      required: true,
      options: [
        { id: 'own_unit', label: 'Own Manufacturing Unit' },
        { id: 'job_work', label: 'Job Work' },
        { id: 'contract', label: 'Contract Manufacturing' },
      ],
    },
    {
      key: 'product_category',
      label: 'Product Category',
      type: 'text',
      required: true,
      placeholder: 'Textiles, Food Products, Machinery...',
    },
    {
      key: 'hsn_codes',
      label: 'HSN Code(s)',
      type: 'text',
      placeholder: 'Comma se alag karein, e.g. 5208, 5209',
      keyboardType: 'numbers-and-punctuation',
    },
    {
      key: 'factory_address',
      label: 'Factory / Unit Address',
      type: 'textarea',
      placeholder: 'Poora address',
    },
  ],

  service_provider: [
    {
      key: 'service_category',
      label: 'Service Category',
      type: 'select',
      required: true,
      options: [
        { id: 'it_software', label: 'IT / Software' },
        { id: 'professional', label: 'Professional Services' },
        { id: 'repair', label: 'Repair & Maintenance' },
        { id: 'education', label: 'Education / Training' },
        { id: 'healthcare', label: 'Healthcare' },
        { id: 'other', label: 'Other' },
      ],
    },
    {
      key: 'sac_code',
      label: 'SAC Code',
      type: 'text',
      placeholder: 'e.g. 998314',
      keyboardType: 'number-pad',
    },
    {
      key: 'description',
      label: 'Service Description',
      type: 'textarea',
      placeholder: 'Aap kya service dete hain',
    },
  ],

  contractor: [
    {
      key: 'contract_type',
      label: 'Contract Type',
      type: 'select',
      required: true,
      options: [
        { id: 'civil', label: 'Civil Works' },
        { id: 'electrical', label: 'Electrical' },
        { id: 'interior', label: 'Interior / Fit-out' },
        { id: 'labour', label: 'Labour Supply' },
        { id: 'other', label: 'Other' },
      ],
    },
    {
      key: 'service_category',
      label: 'Service Category',
      type: 'text',
      placeholder: 'e.g. Government contracts, Private projects',
    },
    {
      key: 'client_details',
      label: 'Main Client Details',
      type: 'textarea',
      placeholder: 'Client ka naam / type',
    },
  ],
};

/* ======================= E) bank proof options ======================= */

export const BANK_PROOF_OPTIONS = [
  {
    id: 'cancelled_cheque',
    label: 'Cancelled Cheque',
    hint: 'Naam printed hona chahiye',
    documentLabel: 'Cancelled Cheque',
  },
  {
    id: 'bank_statement',
    label: 'Bank Statement',
    hint: 'Pehla page, last 1 month',
    documentLabel: 'Bank Statement (first page)',
  },
  {
    id: 'bank_passbook',
    label: 'Bank Passbook',
    hint: 'Front page with account details',
    documentLabel: 'Bank Passbook (front page)',
  },
];

/* ======================== F) document statuses ======================== */

export const DOCUMENT_STATUSES = {
  required: { id: 'required', label: 'Required', color: '#E74C3C', icon: '!' },
  uploaded: { id: 'uploaded', label: 'Uploaded', color: '#25D366', icon: '✓' },
  missing: { id: 'missing', label: 'Missing', color: '#E74C3C', icon: '!' },
  optional: { id: 'optional', label: 'Optional', color: '#666666', icon: '○' },
  under_review: { id: 'under_review', label: 'Under Review', color: '#C5991A', icon: '⋯' },
  rejected: { id: 'rejected', label: 'Rejected', color: '#E74C3C', icon: '✕' },
  approved: { id: 'approved', label: 'Approved', color: '#25D366', icon: '✓' },
};

/** in statuses ko "ho gaya" maana jaata hai (progress % ke liye) */
export const SATISFIED_STATUSES = ['uploaded', 'under_review', 'approved'];

/* ==================== application status (submit ke baad) ==================== */

export const APPLICATION_STATUSES = {
  new: { id: 'new', label: 'New', color: '#3498DB' },
  documents_pending: { id: 'documents_pending', label: 'Documents Pending', color: '#F39C12' },
  documents_uploaded: { id: 'documents_uploaded', label: 'Documents Uploaded', color: '#3498DB' },
  under_review: { id: 'under_review', label: 'Under Review', color: '#F1C40F' },
  approved: { id: 'approved', label: 'Approved', color: '#25D366' },
  rejected: { id: 'rejected', label: 'Rejected', color: '#E74C3C' },
  completed: { id: 'completed', label: 'Completed', color: '#25D366', bold: true },
};

/** admin screen ke filter tabs */
export const ADMIN_FILTERS = [
  { id: 'all', label: 'All', statuses: null },
  { id: 'new', label: 'New', statuses: ['new', 'documents_pending', 'documents_uploaded'] },
  { id: 'under_review', label: 'Under Review', statuses: ['under_review'] },
  { id: 'completed', label: 'Completed', statuses: ['approved', 'completed'] },
];

export const getApplicationStatus = (statusId) =>
  APPLICATION_STATUSES[statusId] || APPLICATION_STATUSES.new;

/* ==================== annual turnover (business step) ==================== */

export const TURNOVER_OPTIONS = [
  { id: 'under_20l', label: 'Under ₹20 Lakh' },
  { id: '20l_40l', label: '₹20 Lakh – ₹40 Lakh' },
  { id: '40l_1cr', label: '₹40 Lakh – ₹1 Crore' },
  { id: '1cr_5cr', label: '₹1 Crore – ₹5 Crore' },
  { id: '5cr_plus', label: '₹5 Crore+' },
];

/* ========================= G) helper functions ========================= */

export const getBusinessType = (businessTypeId) =>
  BUSINESS_TYPES.find((t) => t.id === businessTypeId) || null;

export const getPremisesType = (premisesTypeId) =>
  PREMISES_TYPES.find((p) => p.id === premisesTypeId) || null;

export const getActivity = (activityId) =>
  BUSINESS_ACTIVITIES.find((a) => a.id === activityId) || null;

/**
 * Business type + premises type ka poora document set.
 *
 * Business type ka generic "Address Proof" placeholder premises ke asli
 * documents se replace ho jaata hai (premisesType diya ho to). Duplicate ids
 * ek hi baar aate hain — e.g. utility bill do jagah se aa sakta hai.
 *
 * @returns {Array<{id, label, required, perMember, source}>}
 */
export function getRequiredDocuments(businessType, premisesType) {
  const type = getBusinessType(businessType);
  if (!type) return [];

  const premises = getPremisesType(premisesType);

  const out = [];
  const seen = new Set();

  const push = (doc, extra) => {
    if (seen.has(doc.id)) return;
    seen.add(doc.id);
    out.push({
      id: doc.id,
      label: doc.label,
      perMember: !!doc.perMember,
      ...extra,
    });
  };

  type.requiredDocuments.forEach((doc) => {
    // generic address proof ki jagah premises ke specific documents
    if (doc.fromPremises) {
      if (premises) {
        premises.documents.forEach((p) =>
          push(p, { required: true, source: 'premises' })
        );
      } else {
        push(doc, { required: true, source: 'business' });
      }
      return;
    }
    push(doc, { required: true, source: 'business' });
  });

  (type.optionalDocuments || []).forEach((doc) =>
    push(doc, { required: false, source: 'business' })
  );

  return out;
}

/** Activity ke hisaab se extra fields (koi na ho to khaali array) */
export function getAdditionalFields(businessActivity) {
  return ACTIVITY_ADDITIONAL_FIELDS[businessActivity] || [];
}

/**
 * Constitution ke hisaab se "partner section" ka shape.
 * Jin types me ye section nahi aata (proprietorship, other) wahan null.
 */
export function getPartnerFields(businessType) {
  switch (businessType) {
    case 'partnership':
    case 'llp':
      return {
        label: 'Partners',
        singular: 'Partner',
        countLabel: 'Number of Partners',
        min: 2,
        max: 20,
        hasAuthorizedSignatory: false,
      };

    case 'private_limited':
    case 'public_limited':
      return {
        label: 'Directors',
        singular: 'Director',
        countLabel: 'Number of Directors',
        min: 1,
        max: 15,
        hasAuthorizedSignatory: true,
      };

    case 'trust':
      return {
        label: 'Trustees',
        singular: 'Trustee',
        countLabel: 'Number of Trustees',
        min: 1,
        max: 10,
        hasAuthorizedSignatory: false,
      };

    case 'society_ngo':
      return {
        label: 'Members',
        singular: 'Member',
        countLabel: 'Number of Members',
        min: 1,
        max: 10,
        hasAuthorizedSignatory: false,
      };

    default:
      return null;
  }
}
