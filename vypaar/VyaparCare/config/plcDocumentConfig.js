/**
 * Private Limited Company Registration — Central Configuration Matrix
 *
 * All document requirements, MCA rules, business activities, dynamic office premises rules,
 * DIN rules, fee calculations, and statuses are defined centrally here.
 * Future MCA or regulatory changes can be updated in this file directly.
 */

/* ========================= A) Company Base Information ========================= */

export const PLC_SERVICE_INFO = {
  title: 'Private Limited Company Registration',
  shortDescription: 'Incorporate your Private Limited Company with MCA.',
  serviceFee: 15000,
  advancePercent: 50,
  processingTime: '7-10 Working Days',
  included: [
    'Certificate of Incorporation (COI)',
    'PAN & TAN Generation',
    'DIN for up to 2 Directors',
    'MOA & AOA Drafting',
    'Digital Signature Certificates (DSC) for 2 Directors',
    'Government fees (SPICe+ zero filing fee scheme for capital up to ₹15 Lakhs)',
    'Name Approval through RUN / SPICe+ Part A',
    'Bank Account Opening Assistance',
  ],
  legalDisclaimer:
    'Required documents and registration requirements may vary depending on the applicant, company structure, registered office, state, business activity and applicable MCA rules. Final requirements will be verified before filing.',
};

export const DISCLAIMER_TEXT = PLC_SERVICE_INFO.legalDisclaimer;

/* ========================= B) Registered Office Premises Types ========================= */

export const OFFICE_PREMISES_TYPES = [
  {
    id: 'owned',
    label: 'Owned',
    icon: '🏠',
    description: 'Premises owned by any director or company promoter',
    documents: [
      {
        id: 'office_ownership_proof',
        label: 'Ownership / Property Proof (Conveyance Deed / Title Deed / Sale Deed / Tax Receipt)',
        required: true,
        category: 'office',
      },
      {
        id: 'office_utility_bill',
        label: 'Recent Utility Bill (Electricity / Gas / Telephone Bill — max 2 months old)',
        required: true,
        category: 'office',
      },
      {
        id: 'office_address_proof',
        label: 'Address Proof / Municipal Tax Receipt',
        required: true,
        category: 'office',
      },
    ],
  },
  {
    id: 'rented',
    label: 'Rented / Leased',
    icon: '🔑',
    description: 'Premises taken on rent or lease from a landlord',
    documents: [
      {
        id: 'office_rent_agreement',
        label: 'Rent Agreement / Lease Agreement (signed & notarized)',
        required: true,
        category: 'office',
      },
      {
        id: 'office_owner_proof',
        label: "Owner's Ownership Proof (Property Tax Receipt / Title Deed / Electricity Bill)",
        required: true,
        category: 'office',
      },
      {
        id: 'office_utility_bill',
        label: 'Recent Utility Bill (Electricity / Gas Bill in owner name — max 2 months old)',
        required: true,
        category: 'office',
      },
      {
        id: 'office_noc',
        label: "Owner's NOC / Consent Letter to use premises as Registered Office",
        required: true,
        category: 'office',
      },
    ],
  },
  {
    id: 'consent',
    label: 'Consent / Shared',
    icon: '📝',
    description: 'Premises owned by family member or friend who gives consent (no rent)',
    documents: [
      {
        id: 'office_consent_noc',
        label: "Owner's NOC / Consent Letter (on stamp paper / signed declaration)",
        required: true,
        category: 'office',
      },
      {
        id: 'office_owner_proof',
        label: "Owner's Ownership Proof (Property Tax Receipt / Title Deed)",
        required: true,
        category: 'office',
      },
      {
        id: 'office_utility_bill',
        label: 'Recent Utility Bill (Electricity Bill — max 2 months old)',
        required: true,
        category: 'office',
      },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    icon: '📄',
    description: 'Special commercial or virtual office setups',
    documents: [
      {
        id: 'office_address_proof',
        label: 'Address Proof / Commercial Space Agreement',
        required: true,
        category: 'office',
      },
      {
        id: 'office_utility_bill',
        label: 'Recent Utility Bill (max 2 months old)',
        required: true,
        category: 'office',
      },
      {
        id: 'office_noc',
        label: 'NOC / Authorization Letter from Space Provider',
        required: true,
        category: 'office',
      },
    ],
  },
];

/* ========================= C) Business Activities & Dynamic Fields ========================= */

export const BUSINESS_ACTIVITIES = [
  { id: 'it_software', label: 'IT / Software', icon: '💻' },
  { id: 'services', label: 'Services', icon: '🛠️' },
  { id: 'trading', label: 'Trading', icon: '📦' },
  { id: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { id: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  { id: 'consultancy', label: 'Consultancy', icon: '💼' },
  { id: 'construction', label: 'Construction', icon: '🏗️' },
  { id: 'food_restaurant', label: 'Food / Restaurant', icon: '🍽️' },
  { id: 'import_export', label: 'Import / Export', icon: '🌐' },
  { id: 'other', label: 'Other', icon: '⚙️' },
];

export const NATURE_OF_BUSINESS_OPTIONS = [
  { id: 'it_services', label: 'IT & Digital Services', icon: '💻' },
  { id: 'software_dev', label: 'Software & App Development', icon: '📱' },
  { id: 'saas_cloud', label: 'SaaS & Cloud Computing', icon: '☁️' },
  { id: 'b2b_wholesale', label: 'B2B Wholesale & Distribution', icon: '🏢' },
  { id: 'retail_trade', label: 'Retail & Consumer Goods', icon: '🛍️' },
  { id: 'mfg_assembly', label: 'Manufacturing & Assembly', icon: '🏭' },
  { id: 'import_export_trade', label: 'Import & Export', icon: '🌐' },
  { id: 'ecom_platform', label: 'E-commerce Platform', icon: '🛒' },
  { id: 'financial_advisory', label: 'Financial & Management Consultancy', icon: '💼' },
  { id: 'hospitality_food', label: 'Restaurant & Cloud Kitchen', icon: '🍽️' },
];

export const ACTIVITY_DYNAMIC_FIELDS = {
  ecommerce: [
    {
      key: 'platform_type',
      label: 'E-commerce Platform Type',
      type: 'select',
      required: true,
      options: [
        { id: 'own_website', label: 'Own Website / Mobile App' },
        { id: 'marketplaces', label: 'Marketplace Seller (Amazon, Flipkart, etc.)' },
        { id: 'both', label: 'Both (Own Platform + Marketplaces)' },
        { id: 'aggregator', label: 'Aggregator / Marketplace Platform Operator' },
      ],
    },
    {
      key: 'marketplaces_list',
      label: 'Marketplace Name(s)',
      type: 'text',
      placeholder: 'e.g. Amazon, Flipkart, Meesho, Blinkit',
    },
    {
      key: 'website_url',
      label: 'Website / App URL (if live or planned)',
      type: 'text',
      placeholder: 'https://example.com',
      keyboardType: 'url',
    },
  ],

  it_software: [
    {
      key: 'softwareDomain',
      label: 'Software Domain',
      type: 'select',
      required: true,
      options: [
        { id: 'saas', label: 'SaaS / Cloud Software' },
        { id: 'custom_dev', label: 'Custom Software Development & IT Services' },
        { id: 'ai_ml', label: 'Artificial Intelligence & Machine Learning' },
        { id: 'cybersecurity', label: 'Cybersecurity / Data Solutions' },
        { id: 'fintech', label: 'FinTech / Payment Solutions' },
        { id: 'edtech', label: 'EdTech / E-Learning' },
        { id: 'other_it', label: 'Other IT Solutions' },
      ],
    },
    {
      key: 'exportOriented',
      label: 'Export Oriented / Serving International Clients?',
      type: 'select',
      required: false,
      options: [
        { id: 'yes', label: 'Yes (Export of IT Services)' },
        { id: 'no', label: 'No (Domestic Clients Only)' },
        { id: 'both', label: 'Both Domestic and International' },
      ],
    },
    {
      key: 'primaryTechStack',
      label: 'Key Technologies / Specialization',
      type: 'text',
      placeholder: 'e.g. React Native, Node.js, Cloud, Python',
    },
  ],

  manufacturing: [
    {
      key: 'manufacturingType',
      label: 'Manufacturing Nature',
      type: 'select',
      required: true,
      options: [
        { id: 'own_factory', label: 'Own Manufacturing Plant / Facility' },
        { id: 'contract_mfg', label: 'Contract / Third-Party Manufacturing' },
        { id: 'job_work', label: 'Job Work / Processing' },
        { id: 'assembly', label: 'Assembly & Packaging' },
      ],
    },
    {
      key: 'productCategory',
      label: 'Main Product Category',
      type: 'text',
      required: true,
      placeholder: 'e.g. Textiles, Electronics, Plasticware, Food Packaging',
    },
    {
      key: 'hsnCodes',
      label: 'Target HSN Code(s)',
      type: 'text',
      placeholder: 'e.g. 8471, 8517 (comma separated)',
    },
    {
      key: 'factoryAddress',
      label: 'Factory / Unit Location (if separate from office)',
      type: 'textarea',
      placeholder: 'Full address of the manufacturing facility',
    },
  ],

  food_restaurant: [
    {
      key: 'foodEstablishmentType',
      label: 'Food Establishment Type',
      type: 'select',
      required: true,
      options: [
        { id: 'restaurant_dine_in', label: 'Dine-in Restaurant / Cafe' },
        { id: 'cloud_kitchen', label: 'Cloud Kitchen / Delivery Only' },
        { id: 'food_processing', label: 'Packaged Food Manufacturer / Processing' },
        { id: 'bakery_confectionery', label: 'Bakery / Confectionery' },
        { id: 'catering', label: 'Catering & Event Food Services' },
      ],
    },
    {
      key: 'fssaiStatus',
      label: 'Do you need FSSAI Central / State License Assistance?',
      type: 'select',
      options: [
        { id: 'yes_state', label: 'Yes — State FSSAI License' },
        { id: 'yes_central', label: 'Yes — Central FSSAI License' },
        { id: 'not_now', label: 'Not required at this moment' },
      ],
    },
  ],

  import_export: [
    {
      key: 'tradeType',
      label: 'Trade Scope',
      type: 'select',
      required: true,
      options: [
        { id: 'import_only', label: 'Import Only' },
        { id: 'export_only', label: 'Export Only' },
        { id: 'both', label: 'Both Import & Export' },
      ],
    },
    {
      key: 'majorCommodities',
      label: 'Major Commodities / Items for Trade',
      type: 'text',
      placeholder: 'e.g. Spices, Garments, Electronic components',
    },
    {
      key: 'targetCountries',
      label: 'Target Countries / Regions',
      type: 'text',
      placeholder: 'e.g. USA, UAE, Europe, Southeast Asia',
    },
  ],

  consultancy: [
    {
      key: 'consultancyDomain',
      label: 'Consultancy Domain',
      type: 'select',
      required: true,
      options: [
        { id: 'management', label: 'Management & Business Strategy' },
        { id: 'financial', label: 'Financial & Tax Advisory' },
        { id: 'legal_hr', label: 'Legal, Compliance & HR Advisory' },
        { id: 'technical', label: 'Engineering & Technical Consultancy' },
        { id: 'marketing', label: 'Digital Marketing & Brand Advisory' },
        { id: 'other', label: 'Other Specialization' },
      ],
    },
    {
      key: 'targetClientele',
      label: 'Primary Target Clientele',
      type: 'text',
      placeholder: 'e.g. Startups, Corporates, SMEs, Individuals',
    },
  ],

  construction: [
    {
      key: 'constructionType',
      label: 'Construction Activity',
      type: 'select',
      required: true,
      options: [
        { id: 'residential', label: 'Residential Real Estate Development' },
        { id: 'commercial', label: 'Commercial & Retail Infrastructure' },
        { id: 'civil_contractor', label: 'Civil Contracting & Government Works' },
        { id: 'interior_fitouts', label: 'Interior Fit-outs & Architecture' },
      ],
    },
  ],

  trading: [
    {
      key: 'tradingType',
      label: 'Trading Model',
      type: 'select',
      required: true,
      options: [
        { id: 'wholesale', label: 'B2B Wholesale / Distributor' },
        { id: 'retail', label: 'B2C Retail Trade' },
        { id: 'dealership', label: 'Authorized Franchise / Dealership' },
      ],
    },
    {
      key: 'primaryGoods',
      label: 'Key Goods Traded',
      type: 'text',
      placeholder: 'e.g. FMCG products, Hardware, Building materials',
    },
  ],

  services: [
    {
      key: 'serviceType',
      label: 'Service Specialization',
      type: 'text',
      placeholder: 'e.g. Logistics, Event Management, Maintenance',
    },
  ],
};

export const DYNAMIC_ACTIVITY_FIELDS = ACTIVITY_DYNAMIC_FIELDS;

/* ========================= D) Capital Presets & State Stamp Duty ========================= */

export const CAPITAL_PRESETS = [
  { label: '₹1,00,000 (Standard Minimum)', value: 100000 },
  { label: '₹5,00,000', value: 500000 },
  { label: '₹10,00,000', value: 1000000 },
  { label: '₹15,00,000 (Max Zero MCA Fee)', value: 1500000 },
  { label: '₹25,00,000', value: 2500000 },
  { label: '₹50,00,000', value: 5000000 },
  { label: '₹1,00,00,000 (₹1 Crore)', value: 10000000 },
];

export const ANNUAL_TURNOVER_OPTIONS = [
  { id: 'under_20l', label: 'Under ₹20 Lakh' },
  { id: '20l_50l', label: '₹20 Lakh – ₹50 Lakh' },
  { id: '50l_1cr', label: '₹50 Lakh – ₹1 Crore' },
  { id: '1cr_5cr', label: '₹1 Crore – ₹5 Crore' },
  { id: '5cr_plus', label: '₹5 Crore+' },
];

export const TURNOVER_BRACKETS = ANNUAL_TURNOVER_OPTIONS;

/* ========================= E) Document Statuses & Application Statuses ========================= */

export const DOCUMENT_STATUSES = {
  required: { id: 'required', label: 'Required', color: '#E74C3C', icon: '!' },
  uploaded: { id: 'uploaded', label: 'Uploaded', color: '#25D366', icon: '✓' },
  missing: { id: 'missing', label: 'Missing', color: '#E74C3C', icon: '!' },
  optional: { id: 'optional', label: 'Optional', color: '#666666', icon: '○' },
  reused: { id: 'reused', label: 'Reused (Linked)', color: '#25D366', icon: '🔗' },
  under_review: { id: 'under_review', label: 'Under Review', color: '#C5991A', icon: '⋯' },
  approved: { id: 'approved', label: 'Approved', color: '#25D366', icon: '✓' },
  rejected: { id: 'rejected', label: 'Rejected', color: '#E74C3C', icon: '✕' },
};

export const SATISFIED_STATUSES = ['uploaded', 'reused', 'under_review', 'approved'];

export const APPLICATION_STATUSES = {
  new: { id: 'new', label: 'New Application', color: '#3498DB' },
  payment_pending: { id: 'payment_pending', label: 'Payment Pending', color: '#F39C12' },
  documents_pending: { id: 'documents_pending', label: 'Documents Pending', color: '#E67E22' },
  documents_uploaded: { id: 'documents_uploaded', label: 'Documents Submitted', color: '#3498DB' },
  under_review: { id: 'under_review', label: 'Under Review', color: '#F1C40F' },
  clarification_required: { id: 'clarification_required', label: 'Clarification Required', color: '#E74C3C', alert: true },
  approved: { id: 'approved', label: 'Approved by MCA', color: '#25D366' },
  rejected: { id: 'rejected', label: 'Rejected', color: '#E74C3C' },
  completed: { id: 'completed', label: 'Incorporated & Completed', color: '#25D366', bold: true },
};

export const ADMIN_PLC_FILTERS = [
  { id: 'all', label: 'All', statuses: null },
  { id: 'new', label: 'New / Pending', statuses: ['new', 'payment_pending', 'documents_pending', 'documents_uploaded'] },
  { id: 'under_review', label: 'Under Review', statuses: ['under_review'] },
  { id: 'clarification', label: 'Clarification Required', statuses: ['clarification_required'] },
  { id: 'completed', label: 'Completed / Approved', statuses: ['approved', 'completed'] },
];

export const getApplicationStatus = (statusId) =>
  APPLICATION_STATUSES[statusId] || APPLICATION_STATUSES.new;

/* ========================= F) Dynamic Document Generator ========================= */

/**
 * Generates the complete document requirement list based on:
 * - Number of directors & director details (PAN, ID proof, Address proof, Photo)
 * - Subscribers & deduplication status (if subscriber = director, documents are reused)
 * - Registered office premises type (Owned vs Rented vs Consent)
 * - Company level declarations (INC-9, DIR-2, Name details)
 */
export function getRequiredPLCDocuments({
  directorCount = 2,
  directors = [],
  subscriberCount = 2,
  subscribers = [],
  premisesType = 'rented',
}) {
  const docs = [];

  // 1. Company Level Documents
  docs.push({
    id: 'company_name_doc',
    label: 'Proposed Company Name Details & Main Objects Sheet',
    category: 'company',
    categoryLabel: '🏢 Company Declarations & Details',
    required: true,
    hint: 'Details of primary and secondary name options with business activity description',
  });

  docs.push({
    id: 'company_moa_aoa_declaration',
    label: 'MOA & AOA Declarations & Subscriber Sheet Draft',
    category: 'company',
    categoryLabel: '🏢 Company Declarations & Details',
    required: true,
    hint: 'Signed declaration for Memorandum & Articles of Association',
  });

  docs.push({
    id: 'company_inc9_dir2_consent',
    label: 'INC-9 Declaration & DIR-2 Consent to Act as Director',
    category: 'company',
    categoryLabel: '🏢 Company Declarations & Details',
    required: true,
    hint: 'Mandatory statutory declaration by first directors and subscribers',
  });

  // 2. Director Documents (Dynamic for Director 1, Director 2, ...)
  const count = Math.max(directorCount, directors.length, 2);
  for (let i = 0; i < count; i++) {
    const dir = directors[i] || {};
    const dirName = dir.fullName?.trim() || `Director ${i + 1}`;
    const categoryLabel = `👤 ${dirName} Documents`;

    docs.push({
      id: `director_pan__${i}`,
      label: `PAN Card — ${dirName}`,
      category: 'director',
      categoryLabel,
      ownerType: 'director',
      ownerIndex: i,
      ownerName: dirName,
      docType: 'pan',
      required: true,
      hint: 'Self-attested PAN copy (must match Income Tax records)',
    });

    docs.push({
      id: `director_id_proof__${i}`,
      label: `Identity Proof (Passport / Voter ID / Driving License) — ${dirName}`,
      category: 'director',
      categoryLabel,
      ownerType: 'director',
      ownerIndex: i,
      ownerName: dirName,
      docType: 'id_proof',
      required: true,
      hint: 'Self-attested Government issued photo identity proof (Passport mandatory for Foreign Nationals)',
    });

    docs.push({
      id: `director_address_proof__${i}`,
      label: `Residential Address Proof (Bank Statement / Electricity / Mobile Bill <= 2 months) — ${dirName}`,
      category: 'director',
      categoryLabel,
      ownerType: 'director',
      ownerIndex: i,
      ownerName: dirName,
      docType: 'address_proof',
      required: true,
      hint: 'Bank statement or utility bill in the director name, not older than 2 months',
    });

    docs.push({
      id: `director_photo__${i}`,
      label: `Passport-size Photograph — ${dirName}`,
      category: 'director',
      categoryLabel,
      ownerType: 'director',
      ownerIndex: i,
      ownerName: dirName,
      docType: 'photo',
      required: true,
      hint: 'Clear recent passport photograph on white background',
    });
  }

  // 3. Subscriber Documents (with smart deduplication)
  const subCount = Math.max(subscriberCount, subscribers.length, 2);
  for (let s = 0; s < subCount; s++) {
    const sub = subscribers[s] || {};
    const subName = sub.fullName?.trim() || `Subscriber ${s + 1}`;
    const isLinkedDirector = sub.isDirector && sub.linkedDirectorIndex !== undefined && sub.linkedDirectorIndex !== null;
    const linkedIndex = sub.linkedDirectorIndex;

    const categoryLabel = `👥 ${subName} (Shareholder) Documents`;

    docs.push({
      id: `subscriber_pan__${s}`,
      label: `PAN Card — ${subName}`,
      category: 'subscriber',
      categoryLabel,
      ownerType: 'subscriber',
      ownerIndex: s,
      ownerName: subName,
      docType: 'pan',
      required: true,
      isReused: isLinkedDirector,
      reusedFromDocId: isLinkedDirector ? `director_pan__${linkedIndex}` : null,
      reusedFromLabel: isLinkedDirector ? `Reused from Director ${linkedIndex + 1}` : null,
      hint: isLinkedDirector
        ? `Reusing uploaded PAN from Director ${linkedIndex + 1}`
        : 'Self-attested PAN copy of subscriber',
    });

    docs.push({
      id: `subscriber_id_proof__${s}`,
      label: `Identity Proof — ${subName}`,
      category: 'subscriber',
      categoryLabel,
      ownerType: 'subscriber',
      ownerIndex: s,
      ownerName: subName,
      docType: 'id_proof',
      required: true,
      isReused: isLinkedDirector,
      reusedFromDocId: isLinkedDirector ? `director_id_proof__${linkedIndex}` : null,
      reusedFromLabel: isLinkedDirector ? `Reused from Director ${linkedIndex + 1}` : null,
      hint: isLinkedDirector
        ? `Reusing uploaded Identity Proof from Director ${linkedIndex + 1}`
        : 'Self-attested Voter ID, Passport or Driving License',
    });

    docs.push({
      id: `subscriber_address_proof__${s}`,
      label: `Address Proof (Bank Statement <= 2 months) — ${subName}`,
      category: 'subscriber',
      categoryLabel,
      ownerType: 'subscriber',
      ownerIndex: s,
      ownerName: subName,
      docType: 'address_proof',
      required: true,
      isReused: isLinkedDirector,
      reusedFromDocId: isLinkedDirector ? `director_address_proof__${linkedIndex}` : null,
      reusedFromLabel: isLinkedDirector ? `Reused from Director ${linkedIndex + 1}` : null,
      hint: isLinkedDirector
        ? `Reusing Address Proof from Director ${linkedIndex + 1}`
        : 'Recent bank statement or utility bill',
    });

    docs.push({
      id: `subscriber_photo__${s}`,
      label: `Passport Photograph — ${subName}`,
      category: 'subscriber',
      categoryLabel,
      ownerType: 'subscriber',
      ownerIndex: s,
      ownerName: subName,
      docType: 'photo',
      required: true,
      isReused: isLinkedDirector,
      reusedFromDocId: isLinkedDirector ? `director_photo__${linkedIndex}` : null,
      reusedFromLabel: isLinkedDirector ? `Reused from Director ${linkedIndex + 1}` : null,
      hint: isLinkedDirector
        ? `Reusing Photo from Director ${linkedIndex + 1}`
        : 'Recent passport photo',
    });
  }

  // 4. Registered Office Documents
  const premisesConfig = OFFICE_PREMISES_TYPES.find((p) => p.id === premisesType) || OFFICE_PREMISES_TYPES[1];
  premisesConfig.documents.forEach((pDoc) => {
    docs.push({
      ...pDoc,
      categoryLabel: `🏠 Registered Office Documents (${premisesConfig.label})`,
      category: 'office',
    });
  });

  return docs;
}

/* ========================= G) Dynamic Fee Calculation Helper ========================= */

/**
 * Calculates estimated government & filing fees:
 * - Professional Service Fee: ₹15,000 (Advance 50% = ₹7,500)
 * - MCA SPICe+ Filing Fee: ₹0 for authorized capital <= ₹15,00,000 (₹1,000+ for higher capital)
 * - MCA Name Approval (RUN): ₹1,000 (included in package or filed directly)
 * - PAN & TAN Application Fees: ₹132 (₹66 + ₹66)
 * - DIN Application Fees: ₹0 for up to 2 directors (included in package), ₹500/director beyond 2
 * - State Stamp Duty on MOA/AOA: Varies by state (approx ₹1,000 - ₹3,000)
 */
export function calculatePLCFees({
  authorizedCapital = 100000,
  directorCount = 2,
  registeredState = '07',
}) {
  const serviceFee = PLC_SERVICE_INFO.serviceFee;
  const advancePercent = PLC_SERVICE_INFO.advancePercent;
  const advancePayable = Math.round((serviceFee * advancePercent) / 100);
  const balancePayable = serviceFee - advancePayable;

  let mcaFilingFee = 0;
  if (authorizedCapital > 1500000) {
    const extraUnits = Math.ceil((authorizedCapital - 1500000) / 100000);
    mcaFilingFee = 500 + extraUnits * 300;
  }

  const panTanFee = 132;
  const extraDirectors = Math.max(0, directorCount - 2);
  const extraDinFee = extraDirectors * 500;

  let estimatedStampDuty = 1000;
  if (['27', '24'].includes(registeredState)) {
    estimatedStampDuty = 2000;
  } else if (['29', '33'].includes(registeredState)) {
    estimatedStampDuty = 1500;
  }

  const estimatedGovtFees = mcaFilingFee + panTanFee + extraDinFee + estimatedStampDuty;
  const totalAmount = serviceFee + estimatedGovtFees;

  return {
    totalFee: serviceFee,
    serviceFee,
    advancePercent,
    advanceAmount: advancePayable,
    advancePayable,
    balanceAmount: balancePayable,
    balancePayable,
    mcaGovtFee: mcaFilingFee,
    mcaFilingFee,
    panTanFee,
    extraDinFee,
    estimatedStampDuty,
    estimatedGovtFees,
    totalAmount,
    extraDirectors,
    isZeroMcaFee: authorizedCapital <= 1500000,
  };
}
