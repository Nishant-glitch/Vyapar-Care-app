/**
 * MSME / Udyam Registration — Central Configuration Matrix
 *
 * Configurable master data for 10 Organisation Types, Aadhaar Holder Logic,
 * Searchable NIC 2008 Master Database, MSME Classification Engine (1 April 2025 limits),
 * and Platform Assisted-Filing Fee Breakdown.
 */

/* ========================= A) Service Base Information ========================= */

export const UDYAM_SERVICE_INFO = {
  title: 'MSME / Udyam Registration',
  shortDescription: 'Udyam registration for micro, small and medium enterprises.',
  serviceFee: 2000, // Platform assisted-filing fee
  governmentFee: 0, // Official Udyam registration is FREE
  processingTime: '1–2 Working Days',
  included: [
    'Official Udyam Registration Certificate (with Dynamic QR Code)',
    '19-Digit Permanent Udyam Registration Number (URN)',
    'Paperless Application Filing on Official National Portal',
    'NIC (National Industrial Classification) 2008 Code Mapping',
    'Aadhaar OTP & PAN-Linked Verification Support',
    'Priority MSME Subsidies & Govt Tender Advisory',
  ],
  legalDisclaimer:
    'Udyam Registration on the official Government of India portal (udyamregistration.gov.in) is completely free of cost, paperless and based on self-declaration. The ₹2,000 charged by this platform is an assisted filing, advisory and documentation service fee. Optional documents are collected for internal verification only. Final classification and registration are subject to verification of government records under MSMED Act, 2006.',
};

export const UDYAM_DISCLAIMER_TEXT = UDYAM_SERVICE_INFO.legalDisclaimer;

/* ========================= B) 10 Organisation Types ========================= */

export const UDYAM_ORGANISATION_TYPES = [
  {
    id: 'proprietorship',
    label: 'Proprietorship',
    icon: '👤',
    aadhaarHolderType: 'Proprietor',
    aadhaarHolderLabel: 'Proprietor',
    requiresFirmPAN: false,
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'partnership',
    label: 'Partnership Firm',
    icon: '🤝',
    aadhaarHolderType: 'Managing Partner',
    aadhaarHolderLabel: 'Managing Partner / Partner',
    requiresFirmPAN: true,
    requiresPartners: true,
    requiresDirectors: false,
  },
  {
    id: 'huf',
    label: 'Hindu Undivided Family (HUF)',
    icon: '👨‍👩‍👧‍👦',
    aadhaarHolderType: 'Karta',
    aadhaarHolderLabel: 'Karta of HUF',
    requiresFirmPAN: true,
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'pvt_ltd',
    label: 'Private Limited Company',
    icon: '🏢',
    aadhaarHolderType: 'Authorized Signatory',
    aadhaarHolderLabel: 'Authorized Signatory / Director',
    requiresFirmPAN: true,
    requiresPartners: false,
    requiresDirectors: true,
  },
  {
    id: 'public_ltd',
    label: 'Public Limited Company',
    icon: '🏛️',
    aadhaarHolderType: 'Authorized Signatory',
    aadhaarHolderLabel: 'Authorized Signatory / Director',
    requiresFirmPAN: true,
    requiresPartners: false,
    requiresDirectors: true,
  },
  {
    id: 'llp',
    label: 'Limited Liability Partnership (LLP)',
    icon: '⚖️',
    aadhaarHolderType: 'Designated Partner',
    aadhaarHolderLabel: 'Designated Partner / Authorized Signatory',
    requiresFirmPAN: true,
    requiresPartners: true,
    requiresDirectors: false,
  },
  {
    id: 'cooperative',
    label: 'Co-Operative Society',
    icon: '🌾',
    aadhaarHolderType: 'Authorized Signatory',
    aadhaarHolderLabel: 'Authorized Signatory / Secretary',
    requiresFirmPAN: true,
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'society',
    label: 'Society',
    icon: '📜',
    aadhaarHolderType: 'Authorized Signatory',
    aadhaarHolderLabel: 'Authorized Signatory / President',
    requiresFirmPAN: true,
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'trust',
    label: 'Trust',
    icon: '🛡️',
    aadhaarHolderType: 'Authorized Signatory',
    aadhaarHolderLabel: 'Managing Trustee / Authorized Signatory',
    requiresFirmPAN: true,
    requiresPartners: false,
    requiresDirectors: false,
  },
  {
    id: 'other',
    label: 'Others',
    icon: '🏷️',
    aadhaarHolderType: 'Authorized Signatory',
    aadhaarHolderLabel: 'Authorized Person',
    requiresFirmPAN: true,
    requiresPartners: false,
    requiresDirectors: false,
  },
];

/* ========================= C) Major Activities ========================= */

export const UDYAM_MAJOR_ACTIVITIES = [
  { id: 'manufacturing', label: 'Manufacturing', icon: '🏭', desc: 'Production or processing of physical goods' },
  { id: 'services', label: 'Services', icon: '💼', desc: 'Commercial, professional or digital service operations' },
  { id: 'trading', label: 'Trading (Retail / Wholesale)', icon: '🛒', desc: 'Retail or wholesale distribution of goods' },
  { id: 'both', label: 'Manufacturing + Services', icon: '⚙️', desc: 'Combined manufacturing and service operations' },
];

/* ========================= D) NIC 2008 Master Searchable Database ========================= */

export const NIC_2008_DATABASE = [
  // IT & Digital Services
  {
    nic2: '62',
    nic4: '6201',
    nic5: '62011',
    category: 'Services',
    activity: 'IT Services',
    description: 'Writing, modifying, testing of computer program and mobile application development',
    keywords: ['software', 'it', 'app', 'coding', 'web development', 'digital', 'tech', 'computer'],
  },
  {
    nic2: '62',
    nic4: '6202',
    nic5: '62020',
    category: 'Services',
    activity: 'IT Consulting',
    description: 'Computer consultancy and computer facilities management activities',
    keywords: ['consulting', 'it consultancy', 'hardware', 'networking', 'system integration'],
  },
  {
    nic2: '63',
    nic4: '6311',
    nic5: '63111',
    category: 'Services',
    activity: 'Data Hosting & Cloud',
    description: 'Data processing, hosting and related activities (Cloud servers, SaaS, Web hosting)',
    keywords: ['cloud', 'hosting', 'saas', 'server', 'data center', 'analytics'],
  },
  {
    nic2: '63',
    nic4: '6312',
    nic5: '63121',
    category: 'Services',
    activity: 'Web Portals & E-Commerce',
    description: 'Web portals and internet marketplace operations',
    keywords: ['portal', 'ecommerce', 'marketplace', 'website', 'online platform'],
  },

  // Repair & Technical Services
  {
    nic2: '95',
    nic4: '9512',
    nic5: '95120',
    category: 'Services',
    activity: 'Mobile & Telecom Repair',
    description: 'Repair and servicing of mobile phones and communication equipment',
    keywords: ['mobile repair', 'phone', 'cell phone', 'telecom', 'smartphone', 'electronics repair'],
  },
  {
    nic2: '95',
    nic4: '9511',
    nic5: '95111',
    category: 'Services',
    activity: 'Computer & Laptop Repair',
    description: 'Repair and maintenance of computers and peripheral equipment (printers, monitors)',
    keywords: ['computer repair', 'laptop', 'printer', 'hardware servicing'],
  },

  // Food & Hospitality Services
  {
    nic2: '56',
    nic4: '5610',
    nic5: '56101',
    category: 'Services',
    activity: 'Restaurants & Mobile Food',
    description: 'Restaurants and mobile food service activities (Dine-in, takeaway, food trucks)',
    keywords: ['restaurant', 'cafe', 'food truck', 'dining', 'eating place', 'fast food'],
  },
  {
    nic2: '56',
    nic4: '5621',
    nic5: '56210',
    category: 'Services',
    activity: 'Event Catering Services',
    description: 'Event catering and institutional food services for weddings and corporate events',
    keywords: ['catering', 'caterer', 'party', 'wedding food', 'banquet'],
  },
  {
    nic2: '56',
    nic4: '5629',
    nic5: '56291',
    category: 'Services',
    activity: 'Cloud Kitchen & Canteens',
    description: 'Operation of canteens and delivery-only cloud kitchen food services',
    keywords: ['cloud kitchen', 'canteen', 'tiffin', 'food delivery', 'mess'],
  },

  // Retail & Wholesale Trading
  {
    nic2: '47',
    nic4: '4711',
    nic5: '47110',
    category: 'Trading',
    activity: 'Grocery & Supermarket Retail',
    description: 'Retail sale in non-specialized stores with food, beverages or tobacco predominating',
    keywords: ['grocery', 'kirana', 'supermarket', 'fmcg', 'retail store', 'departmental store'],
  },
  {
    nic2: '47',
    nic4: '4771',
    nic5: '47711',
    category: 'Trading',
    activity: 'Clothing & Apparel Retail',
    description: 'Retail sale of readymade garments, footwear and clothing accessories',
    keywords: ['garments', 'clothes', 'clothing', 'apparel', 'fashion', 'boutique', 'saree'],
  },
  {
    nic2: '47',
    nic4: '4741',
    nic5: '47411',
    category: 'Trading',
    activity: 'Electronics & Mobiles Retail',
    description: 'Retail sale of mobile phones, computers, audio-video equipment and gadgets',
    keywords: ['mobile shop', 'electronics retail', 'gadgets', 'appliances', 'tv shop'],
  },
  {
    nic2: '46',
    nic4: '4630',
    nic5: '46301',
    category: 'Trading',
    activity: 'Food & Grain Wholesale',
    description: 'Wholesale of food, beverages, grains, pulses and spices',
    keywords: ['wholesale food', 'grain merchant', 'mandi', 'bulk trade', 'spices'],
  },

  // Manufacturing
  {
    nic2: '14',
    nic4: '1410',
    nic5: '14101',
    category: 'Manufacturing',
    activity: 'Garments & Apparel Manufacturing',
    description: 'Manufacture of all types of wearing apparel, readymade garments and uniforms',
    keywords: ['garment manufacturing', 'textile mill', 'stitching', 'tailoring unit', 'clothing factory'],
  },
  {
    nic2: '10',
    nic4: '1071',
    nic5: '10712',
    category: 'Manufacturing',
    activity: 'Bakery & Confectionery Manufacturing',
    description: 'Manufacture of bakery products, bread, biscuits, pastries and confectionery',
    keywords: ['bakery', 'bread', 'cake', 'biscuit factory', 'cookies', 'pastry'],
  },
  {
    nic2: '10',
    nic4: '1079',
    nic5: '10792',
    category: 'Manufacturing',
    activity: 'Snacks & Namkeen Manufacturing',
    description: 'Manufacture of snacks, potato chips, namkeen, savouries and packaged sweets',
    keywords: ['namkeen', 'snacks factory', 'chips', 'farsan', 'sweets manufacturing'],
  },
  {
    nic2: '25',
    nic4: '2511',
    nic5: '25111',
    category: 'Manufacturing',
    activity: 'Metal Fabrication & Engineering',
    description: 'Manufacture of structural metal products, gates, railings, grills and industrial fixtures',
    keywords: ['fabrication', 'metal works', 'welding', 'steel fixtures', 'iron grill'],
  },
  {
    nic2: '31',
    nic4: '3100',
    nic5: '31001',
    category: 'Manufacturing',
    activity: 'Furniture & Woodwork Manufacturing',
    description: 'Manufacture of wooden, steel and modular office and household furniture',
    keywords: ['furniture factory', 'carpentry', 'modular kitchen', 'wooden fixtures'],
  },

  // Professional & Other Services
  {
    nic2: '69',
    nic4: '6920',
    nic5: '69201',
    category: 'Services',
    activity: 'Accounting & Bookkeeping',
    description: 'Accounting, bookkeeping, tax advisory and auditing activities',
    keywords: ['accounting', 'tax', 'gst filing', 'bookkeeping', 'audit', 'ca services'],
  },
  {
    nic2: '73',
    nic4: '7310',
    nic5: '73101',
    category: 'Services',
    activity: 'Advertising & Digital Marketing',
    description: 'Advertising agencies, digital marketing, SEO, social media and branding',
    keywords: ['marketing', 'digital marketing', 'advertising', 'branding', 'seo', 'media agency'],
  },
  {
    nic2: '49',
    nic4: '4923',
    nic5: '49231',
    category: 'Services',
    activity: 'Goods Transportation & Logistics',
    description: 'Freight transport by road (Trucks, tempo, goods carrier fleet, logistics delivery)',
    keywords: ['transporter', 'logistics', 'trucks', 'freight', 'delivery service', 'courier'],
  },
];

/* ========================= E) Search NIC Codes Helper ========================= */

export function searchNICCodes(query = '') {
  if (!query || !query.trim()) return NIC_2008_DATABASE.slice(0, 10);
  const q = query.toLowerCase().trim();

  return NIC_2008_DATABASE.filter((item) => {
    if (item.nic2.includes(q) || item.nic4.includes(q) || item.nic5.includes(q)) return true;
    if (item.activity.toLowerCase().includes(q)) return true;
    if (item.description.toLowerCase().includes(q)) return true;
    if (item.category.toLowerCase().includes(q)) return true;
    if (item.keywords.some((k) => k.toLowerCase().includes(q))) return true;
    return false;
  });
}

/* ========================= F) MSME Classification Rules Engine (Effective 1 April 2025) ========================= */

/**
 * Official MSME Definition Limits (Updated 1 April 2025):
 *
 * Micro:
 *   Investment <= ₹2.5 Crore (250 Lakhs) AND Turnover <= ₹10 Crore (1000 Lakhs)
 *
 * Small:
 *   Investment <= ₹25 Crore (2500 Lakhs) AND Turnover <= ₹100 Crore (10000 Lakhs)
 *
 * Medium:
 *   Investment <= ₹125 Crore (12500 Lakhs) AND Turnover <= ₹500 Crore (50000 Lakhs)
 *
 * Note: As per Section 7(1) of MSMED Act, Export turnover is EXCLUDED from aggregate turnover
 * for calculating MSME classification limit!
 */
export const MSME_CLASSIFICATION_LIMITS = {
  effectiveDate: '2025-04-01',
  micro: {
    maxInvestmentCrores: 2.5,
    maxTurnoverCrores: 10,
    label: 'Micro Enterprise',
    badgeColor: '#10B981',
    desc: 'Investment in P&M ≤ ₹2.5 Cr and Net Turnover ≤ ₹10 Cr',
  },
  small: {
    maxInvestmentCrores: 25,
    maxTurnoverCrores: 100,
    label: 'Small Enterprise',
    badgeColor: '#3B82F6',
    desc: 'Investment in P&M ≤ ₹25 Cr and Net Turnover ≤ ₹100 Cr',
  },
  medium: {
    maxInvestmentCrores: 125,
    maxTurnoverCrores: 500,
    label: 'Medium Enterprise',
    badgeColor: '#F59E0B',
    desc: 'Investment in P&M ≤ ₹125 Cr and Net Turnover ≤ ₹500 Cr',
  },
};

/**
 * Computes MSME classification category based on:
 * - investmentAmount (in Rupees or Lakhs/Crores)
 * - domesticTurnover
 * - exportTurnover (Excluded from MSME calculation)
 */
export function calculateMSMECategory(params = {}) {
  const investment = Number(params.investmentAmount || 0); // In Rupees
  const domesticTurnover = Number(params.domesticTurnover || 0); // In Rupees
  const exportTurnover = Number(params.exportTurnover || 0); // In Rupees

  const totalTurnover = domesticTurnover + exportTurnover;
  // Export turnover is excluded from MSME classification calculation!
  const turnoverConsidered = domesticTurnover > 0 ? domesticTurnover : totalTurnover;

  const investmentCrores = investment / 10000000;
  const turnoverCrores = turnoverConsidered / 10000000;

  const { micro, small, medium } = MSME_CLASSIFICATION_LIMITS;

  let category = 'micro';
  let categoryLabel = micro.label;
  let isEligible = true;
  let reason = '';

  if (
    investmentCrores <= micro.maxInvestmentCrores &&
    turnoverCrores <= micro.maxTurnoverCrores
  ) {
    category = 'micro';
    categoryLabel = micro.label;
    reason = `Investment (₹${investmentCrores.toFixed(2)} Cr ≤ ₹2.5 Cr) and Net Turnover (₹${turnoverCrores.toFixed(2)} Cr ≤ ₹10 Cr)`;
  } else if (
    investmentCrores <= small.maxInvestmentCrores &&
    turnoverCrores <= small.maxTurnoverCrores
  ) {
    category = 'small';
    categoryLabel = small.label;
    reason = `Investment (₹${investmentCrores.toFixed(2)} Cr ≤ ₹25 Cr) and Net Turnover (₹${turnoverCrores.toFixed(2)} Cr ≤ ₹100 Cr)`;
  } else if (
    investmentCrores <= medium.maxInvestmentCrores &&
    turnoverCrores <= medium.maxTurnoverCrores
  ) {
    category = 'medium';
    categoryLabel = medium.label;
    reason = `Investment (₹${investmentCrores.toFixed(2)} Cr ≤ ₹125 Cr) and Net Turnover (₹${turnoverCrores.toFixed(2)} Cr ≤ ₹500 Cr)`;
  } else {
    category = 'not_eligible';
    categoryLabel = 'Large Enterprise / Exceeds MSME Limits';
    isEligible = false;
    reason = `Investment (₹${investmentCrores.toFixed(2)} Cr) or Turnover (₹${turnoverCrores.toFixed(2)} Cr) exceeds Medium Enterprise ceiling limits.`;
  }

  return {
    category,
    categoryLabel,
    isEligible,
    reason,
    investmentCrores,
    turnoverCrores,
    totalTurnover,
    turnoverConsidered,
  };
}

/* ========================= G) Optional Internal Documents List ========================= */

export const UDYAM_OPTIONAL_DOCUMENTS = [
  {
    id: 'opt_pan_card',
    label: 'PAN Card Copy (Proprietor / Firm / Company)',
    hint: 'Optional — For internal verification and name matching',
    category: 'identity',
  },
  {
    id: 'opt_aadhaar_card',
    label: 'Aadhaar Card (Applicant / Signatory)',
    hint: 'Optional — For internal verification of mobile/name spelling',
    category: 'identity',
  },
  {
    id: 'opt_gst_cert',
    label: 'GST Registration Certificate (REG-06)',
    hint: 'Optional — If GST registered, helps verify business address and trade name',
    category: 'tax',
  },
  {
    id: 'opt_entity_proof',
    label: 'Entity Proof (Partnership Deed / COI / Trust Deed)',
    hint: 'Optional — For verification of firm, company or trust details',
    category: 'constitution',
  },
  {
    id: 'opt_bank_proof',
    label: 'Bank Account Proof (Cancelled Cheque / Statement)',
    hint: 'Optional — For verification of Account Number & IFSC Code',
    category: 'bank',
  },
  {
    id: 'opt_uam_cert',
    label: 'Old Udyog Aadhaar (UAM) Certificate',
    hint: 'Optional — If migrating from pre-2020 Udyog Aadhaar registration',
    category: 'migration',
  },
];

/* ========================= H) Fee Calculation ========================= */

export function calculateUdyamFees() {
  return {
    governmentFee: 0, // ₹0 Free on official portal
    serviceFee: 2000, // ₹2,000 Platform Assisted-Filing Fee
    totalPayable: 2000,
  };
}
