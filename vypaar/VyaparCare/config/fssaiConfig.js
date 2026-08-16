/**
 * FSSAI Food License / Registration — Central Configuration Matrix
 *
 * Configurable master data for 27 Kind of Business (KoB) types,
 * 16 Food Categories, FoSCoS Eligibility Rules, Dynamic Document Matrix,
 * and Official Government Fee calculation engine.
 */

/* ========================= A) Service Base Info ========================= */

export const FSSAI_SERVICE_INFO = {
  title: 'FSSAI Food License',
  shortDescription: 'Food business license registration for manufacturers, traders and restaurants.',
  serviceFee: 5000,
  processingTime: '5–7 Working Days',
  included: [
    'FSSAI Registration Certificate (Form A / Form B)',
    'Official FoSCoS Application Filing',
    'Food Category & KoB Mapping Assistance',
    'Basic Government Fees Included for 1 Year',
    'Inspection & Query Handling with Food Safety Officer',
    'Real-time Application Tracking & Status Alerts',
  ],
  legalDisclaimer:
    'FSSAI document requirements depend on the nature of food business, Kind of Business (KoB), license category, premises, food products and applicable state/central requirements. The document checklist shown here is for application assistance. Final requirements will be verified against the current FoSCoS/FSSAI requirements before filing.',
};

export const FSSAI_DISCLAIMER_TEXT = FSSAI_SERVICE_INFO.legalDisclaimer;

/* ========================= B) 27 Kind of Business (KoB) Types ========================= */

export const FSSAI_KOB_TYPES = [
  {
    id: 'restaurant',
    label: 'Restaurant',
    category: 'food_service',
    icon: '🍽️',
    description: 'Dine-in and takeaway food service establishment',
    defaultLicense: 'state',
    requiresSeating: true,
  },
  {
    id: 'cafe',
    label: 'Cafe / Coffee Shop',
    category: 'food_service',
    icon: '☕',
    description: 'Beverages, snacks and light meals',
    defaultLicense: 'registration',
    requiresSeating: true,
  },
  {
    id: 'bakery',
    label: 'Bakery',
    category: 'manufacturing',
    icon: '🥐',
    description: 'Baked goods, cakes, pastries, bread manufacturing and retail',
    defaultLicense: 'registration',
    requiresManufacturing: true,
  },
  {
    id: 'sweet_shop',
    label: 'Sweet Shop / Mithai',
    category: 'food_service',
    icon: '🍬',
    description: 'Traditional sweets, savouries and snacks',
    defaultLicense: 'registration',
  },
  {
    id: 'retailer',
    label: 'Food Retailer / Grocery Store',
    category: 'trade',
    icon: '🛒',
    description: 'Kirana store, supermarket, packaged food retail',
    defaultLicense: 'registration',
  },
  {
    id: 'wholesaler',
    label: 'Food Wholesaler',
    category: 'trade',
    icon: '📦',
    description: 'Bulk food purchasing and B2B wholesale supply',
    defaultLicense: 'state',
  },
  {
    id: 'distributor',
    label: 'Food Distributor / Supplier',
    category: 'trade',
    icon: '🚚',
    description: 'Distribution network for FMCG and food brands',
    defaultLicense: 'state',
  },
  {
    id: 'warehouse',
    label: 'Food Storage / Warehouse / Cold Storage',
    category: 'storage',
    icon: '🏭',
    description: 'Temperature-controlled or dry food warehousing',
    defaultLicense: 'state',
  },
  {
    id: 'manufacturer',
    label: 'Food Manufacturer',
    category: 'manufacturing',
    icon: '⚙️',
    description: 'Processing raw materials into packaged food products',
    defaultLicense: 'state',
    requiresManufacturing: true,
  },
  {
    id: 'processor',
    label: 'Food Processor',
    category: 'manufacturing',
    icon: '🥣',
    description: 'Value addition, milling, sorting, grading of food',
    defaultLicense: 'state',
    requiresManufacturing: true,
  },
  {
    id: 'repacker',
    label: 'Repacker',
    category: 'repacking',
    icon: '📦',
    description: 'Repacking bulk food into smaller commercial units',
    defaultLicense: 'state',
    requiresRepacker: true,
  },
  {
    id: 'relabeller',
    label: 'Relabeller',
    category: 'repacking',
    icon: '🏷️',
    description: 'Marketing food products manufactured by third party under own brand',
    defaultLicense: 'state',
    requiresRelabeller: true,
  },
  {
    id: 'caterer',
    label: 'Caterer / Outdoor Catering',
    category: 'food_service',
    icon: '🍱',
    description: 'Event catering, institutional and party catering',
    defaultLicense: 'state',
  },
  {
    id: 'cloud_kitchen',
    label: 'Cloud Kitchen / Delivery Only',
    category: 'food_service',
    icon: '🛵',
    description: 'Online food delivery without dine-in seating',
    defaultLicense: 'registration',
  },
  {
    id: 'dhaba',
    label: 'Dhaba / Food Stall / Street Food Vendor',
    category: 'food_service',
    icon: '🍲',
    description: 'Petty food stall, kiosk, hawker, mobile food cart',
    defaultLicense: 'registration',
  },
  {
    id: 'hotel',
    label: 'Hotel / Resort',
    category: 'food_service',
    icon: '🏨',
    description: 'Hotels with in-house restaurant, room service, banquet kitchens',
    defaultLicense: 'state',
    requiresHotel: true,
  },
  {
    id: 'dairy',
    label: 'Dairy / Milk Products Processing',
    category: 'dairy',
    icon: '🥛',
    description: 'Milk chilling, pasteurization, cheese, paneer, curd, ghee production',
    defaultLicense: 'state',
    requiresDairy: true,
  },
  {
    id: 'meat',
    label: 'Meat / Meat Products Processing & Shop',
    category: 'meat',
    icon: '🥩',
    description: 'Slaughtering, raw meat retail, processed meat products',
    defaultLicense: 'state',
    requiresMeat: true,
  },
  {
    id: 'fish',
    label: 'Fish / Fish Products Processing',
    category: 'fish',
    icon: '🐟',
    description: 'Fresh seafood retail, freezing, processing and canning',
    defaultLicense: 'state',
  },
  {
    id: 'oil_processing',
    label: 'Vegetable Oil Processing / Solvent Extraction',
    category: 'manufacturing',
    icon: '🌻',
    description: 'Edible oil extraction, refining and packaging',
    defaultLicense: 'state',
    requiresManufacturing: true,
  },
  {
    id: 'water',
    label: 'Packaged Drinking Water / Mineral Water',
    category: 'water',
    icon: '💧',
    description: 'Packaged natural mineral water, RO water packaging, carbonated water',
    defaultLicense: 'state',
    requiresWater: true,
  },
  {
    id: 'transporter',
    label: 'Food Transporter',
    category: 'transport',
    icon: '🚛',
    description: 'Logistics fleet carrying food products with refrigerated / dry vehicles',
    defaultLicense: 'state',
    requiresTransporter: true,
  },
  {
    id: 'importer',
    label: 'Food Importer',
    category: 'foreign_trade',
    icon: '🚢',
    description: 'Importing food articles into India from foreign jurisdictions',
    defaultLicense: 'central',
    requiresIEC: true,
  },
  {
    id: 'exporter',
    label: 'Food Exporter',
    category: 'foreign_trade',
    icon: '✈️',
    description: 'Exporting Indian food products overseas (100% EOU)',
    defaultLicense: 'central',
    requiresIEC: true,
  },
  {
    id: 'ecommerce',
    label: 'E-commerce Food Business / Marketplace',
    category: 'ecommerce',
    icon: '🌐',
    description: 'Online platforms, mobile apps selling food / groceries directly or via sellers',
    defaultLicense: 'central',
    requiresEcommerce: true,
  },
  {
    id: 'central_premises',
    label: 'Central Govt Premises Food Service (Airports, Seaports, Defense)',
    category: 'central_govt',
    icon: '🛫',
    description: 'Food outlets inside Airports, Seaports, Railways, Cantonments, Defense units',
    defaultLicense: 'central',
  },
  {
    id: 'other',
    label: 'Other Food Business',
    category: 'other',
    icon: '🏷️',
    description: 'Any other food related operation not classified above',
    defaultLicense: 'registration',
  },
];

/* ========================= C) 16 Indian Food Categories (FSSAI Schedule) ========================= */

export const FSSAI_FOOD_CATEGORIES = [
  { code: '01', name: 'Dairy products and analogues, excluding products of category 2.0', icon: '🥛' },
  { code: '02', name: 'Fats and oils, and fat emulsions (Vegetable oils, butter, ghee, margarines)', icon: '🧈' },
  { code: '03', name: 'Edible ices, including sherbet and sorbet (Ice cream, kulfi, frozen desserts)', icon: '🍦' },
  { code: '04', name: 'Fruits and vegetables (including mushrooms, roots, pulses, legumes, nuts and seeds)', icon: '🍎' },
  { code: '05', name: 'Confectionery (Cocoa, chocolate products, hard candies, chewing gum)', icon: '🍫' },
  { code: '06', name: 'Cereals and cereal products, flours, starches, noodles, pasta, bakery mixes', icon: '🌾' },
  { code: '07', name: 'Bakery products (Bread, cakes, cookies, biscuits, pastries)', icon: '🍞' },
  { code: '08', name: 'Meat and meat products, including poultry and game', icon: '🍗' },
  { code: '09', name: 'Fish and fish products, including molluscs, crustaceans, and echinoderms', icon: '🐟' },
  { code: '10', name: 'Eggs and egg products', icon: '🥚' },
  { code: '11', name: 'Sweeteners, including honey, sugar, jaggery, syrups', icon: '🍯' },
  { code: '12', name: 'Salts, spices, soups, sauces, salads and protein products (Curry powders, seasonings)', icon: '🧂' },
  { code: '13', name: 'Foodstuffs intended for particular nutritional uses (Infant foods, dietetic foods)', icon: '👶' },
  { code: '14', name: 'Beverages, excluding dairy products (Tea, coffee, fruit juices, packaged drinking water)', icon: '🥤' },
  { code: '15', name: 'Ready-to-eat savouries, snacks, potato crisps, bhujia, namkeen', icon: '🥨' },
  { code: '16', name: 'Prepared foods / Catering / Restaurant cuisines (Cooked meals, biryani, thalis, combos)', icon: '🍲' },
];

/* ========================= D) 10 Business Constitutions ========================= */

export const FSSAI_CONSTITUTIONS = [
  { id: 'proprietorship', label: 'Proprietorship', icon: '👤' },
  { id: 'partnership', label: 'Partnership Firm', icon: '🤝' },
  { id: 'llp', label: 'Limited Liability Partnership (LLP)', icon: '⚖️' },
  { id: 'pvt_ltd', label: 'Private Limited Company', icon: '🏢' },
  { id: 'public_ltd', label: 'Public Limited Company', icon: '🏛️' },
  { id: 'trust', label: 'Trust', icon: '📜' },
  { id: 'society', label: 'Society / NGO', icon: '👥' },
  { id: 'cooperative', label: 'Cooperative Society', icon: '🌾' },
  { id: 'govt_body', label: 'Government Body / PSU', icon: '🇮🇳' },
  { id: 'other', label: 'Other Organization', icon: '🏷️' },
];

/* ========================= E) FoSCoS Eligibility Rules Engine ========================= */

/**
 * Evaluates recommended license tier (Registration, State License, Central License)
 * based on official FoSCoS criteria:
 * - KoB type (Importer/Exporter/Airports/Ecom -> Central)
 * - Annual Turnover (up to ₹12 Lakh -> Registration; ₹12 Lakh to ₹20 Crore -> State; > ₹20 Crore -> Central)
 * - Production Capacity (Dairy > 50,000 LPD or Meat > 500 kg/day or Mfg > 2 MT/day -> Central)
 */
export function determineFSSAIEligibility({
  kob = 'restaurant',
  turnover = 1000000, // in INR
  capacity = 0,
  isMultipleStates = false,
  isCentralPremises = false,
  isImportExport = false,
}) {
  // 1. Mandatory Central License Checks
  if (kob === 'importer' || kob === 'exporter' || isImportExport) {
    return {
      licenseType: 'central',
      label: 'FSSAI Central License',
      badgeColor: '#7C3AED',
      baseGovtFee: 7500,
      reason: 'Mandatory Central License under FoSCoS for all Food Importers and Exporters with IEC.',
    };
  }

  if (kob === 'central_premises' || isCentralPremises) {
    return {
      licenseType: 'central',
      label: 'FSSAI Central License',
      badgeColor: '#7C3AED',
      baseGovtFee: 7500,
      reason: 'Premises located under Central Government jurisdiction (Airport / Seaport / Railways / Defense).',
    };
  }

  if (kob === 'ecommerce' || isMultipleStates) {
    return {
      licenseType: 'central',
      label: 'FSSAI Central License',
      badgeColor: '#7C3AED',
      baseGovtFee: 7500,
      reason: 'E-commerce food platforms or head offices operating across multiple states require a Central License.',
    };
  }

  // 2. Large Scale Manufacturer / Processing Capacity Checks (> 2 Metric Tonnes / day)
  if (['manufacturer', 'processor', 'oil_processing'].includes(kob) && capacity > 2000) {
    return {
      licenseType: 'central',
      label: 'FSSAI Central License',
      badgeColor: '#7C3AED',
      baseGovtFee: 7500,
      reason: 'Large scale food manufacturing capacity exceeding 2 MT / day.',
    };
  }

  if (kob === 'dairy' && capacity > 50000) {
    return {
      licenseType: 'central',
      label: 'FSSAI Central License',
      badgeColor: '#7C3AED',
      baseGovtFee: 7500,
      reason: 'Large dairy processing unit with capacity exceeding 50,000 Litres of milk per day.',
    };
  }

  // 3. Turnover Threshold Checks
  // > ₹20 Crore -> Central License
  if (turnover > 200000000) {
    return {
      licenseType: 'central',
      label: 'FSSAI Central License',
      badgeColor: '#7C3AED',
      baseGovtFee: 7500,
      reason: 'Annual business turnover exceeds ₹20 Crore (Large Enterprise threshold).',
    };
  }

  // > ₹12 Lakh to ₹20 Crore -> State License
  if (turnover > 1200000) {
    return {
      licenseType: 'state',
      label: 'FSSAI State License',
      badgeColor: '#2563EB',
      baseGovtFee: 2000,
      reason: `Annual turnover is above ₹12 Lakh (estimated at ₹${(turnover / 100000).toFixed(1)} Lakh), qualifying for State License under FoSCoS rules.`,
    };
  }

  // Specific KoBs that mandatory require State License regardless of turnover
  if (['wholesaler', 'distributor', 'warehouse', 'transporter', 'hotel', 'caterer'].includes(kob)) {
    return {
      licenseType: 'state',
      label: 'FSSAI State License',
      badgeColor: '#2563EB',
      baseGovtFee: 2000,
      reason: `Selected Kind of Business (${kob.toUpperCase()}) generally falls under State License schedule. Final eligibility verified during drafting.`,
    };
  }

  // Default Petty Food Business (up to ₹12 Lakh) -> Basic Registration
  return {
    licenseType: 'registration',
    label: 'FSSAI Basic Registration (Form A)',
    badgeColor: '#16A34A',
    baseGovtFee: 100,
    reason: 'Petty Food Business / Small Operator with annual turnover up to ₹12 Lakh eligible for Basic Registration.',
  };
}

/* ========================= F) Dynamic Document Matrix Generator ========================= */

/**
 * Generates the precise required and conditional document checklist based on:
 * - Kind of Business (KoB)
 * - Constitution (Proprietorship, Partnership, Company, Trust, etc.)
 * - Premises Type (Owned, Rented, Leased, Shared)
 * - Special activities (Manufacturing, Dairy, Meat, Water, Transporter, Importer, etc.)
 * - Conditional flags (Water test, FSMS, Municipal NOC)
 */
export function getRequiredFSSAIDocuments(params = {}) {
  const kob = params.kob || params.businessType || 'restaurant';
  const licenseType = params.licenseType || 'state'; // 'registration' | 'state' | 'central'
  const constitution = params.constitution || params.businessConstitution || 'proprietorship';
  const premisesType = params.premisesType || 'rented';
  const isWaterTestRequired = params.isWaterTestRequired || ['water', 'dairy', 'meat', 'manufacturer'].includes(kob);
  const hasFSMS = params.hasFSMS ?? false;
  const hasMunicipalNOC = params.hasMunicipalNOC ?? false;

  const docs = [];

  // 1. Applicant & Constitution Documents
  docs.push({
    id: 'applicant_photo',
    label: 'Applicant Passport Size Photograph',
    category: 'identity',
    categoryLabel: '👤 Applicant Identity & Photo',
    required: true,
    hint: 'Clear passport-size photo of the proprietor / partner / authorized director',
  });

  docs.push({
    id: 'applicant_pan',
    label: 'Applicant / Entity PAN Card',
    category: 'identity',
    categoryLabel: '👤 Applicant Identity & Photo',
    required: true,
    hint: 'PAN Card of the Individual Proprietor or Registered Entity',
  });

  docs.push({
    id: 'applicant_id_proof',
    label: 'Identity & Address Proof (Aadhaar / Voter ID / Passport)',
    category: 'identity',
    categoryLabel: '👤 Applicant Identity & Photo',
    required: true,
    hint: 'Government-issued photo identity proof with current residential address',
  });

  // Constitution-specific documents
  if (constitution === 'partnership') {
    docs.push({
      id: 'partnership_deed',
      label: 'Partnership Deed (Signed & Executed)',
      category: 'constitution',
      categoryLabel: '🤝 Firm Constitution Documents',
      required: true,
      hint: 'Complete partnership deed showing partner names and profit sharing',
    });
  } else if (constitution === 'llp') {
    docs.push({
      id: 'llp_coi',
      label: 'LLP Certificate of Incorporation & Agreement',
      category: 'constitution',
      categoryLabel: '⚖️ LLP Legal Documents',
      required: true,
      hint: 'MCA Certificate of Incorporation & Designated Partner Authorization',
    });
  } else if (constitution === 'pvt_ltd' || constitution === 'public_ltd') {
    docs.push({
      id: 'company_coi',
      label: 'Certificate of Incorporation (COI)',
      category: 'constitution',
      categoryLabel: '🏢 Company Corporate Documents',
      required: true,
      hint: 'MCA Certificate of Incorporation',
    });
    docs.push({
      id: 'board_resolution_auth',
      label: 'Board Resolution & List of Directors',
      category: 'constitution',
      categoryLabel: '🏢 Company Corporate Documents',
      required: true,
      hint: 'Board resolution authorizing the signatory to apply for FSSAI License',
    });
  } else if (['trust', 'society'].includes(constitution)) {
    docs.push({
      id: 'trust_society_registration',
      label: 'Trust Deed / Society Registration Certificate',
      category: 'constitution',
      categoryLabel: '📜 Organization Documents',
      required: true,
      hint: 'Certified copy of Trust Deed / Society registration & Managing Committee authorization',
    });
  }

  // 2. Premises Proofs
  if (premisesType === 'owned') {
    docs.push({
      id: 'premises_ownership_proof',
      label: 'Premises Ownership Proof (Sale Deed / Property Tax Receipt)',
      category: 'premises',
      categoryLabel: '📍 Business Premises Documents',
      required: true,
      hint: 'Title deed, latest property tax receipt or electricity bill in owner name',
    });
    docs.push({
      id: 'premises_utility_bill',
      label: 'Latest Electricity / Utility Bill',
      category: 'premises',
      categoryLabel: '📍 Business Premises Documents',
      required: true,
      hint: 'Electricity bill not older than 2 months for location verification',
    });
  } else if (premisesType === 'rented' || premisesType === 'leased') {
    docs.push({
      id: 'premises_rent_agreement',
      label: 'Rent Agreement / Lease Deed (Executed)',
      category: 'premises',
      categoryLabel: '📍 Business Premises Documents',
      required: true,
      hint: 'Notarized or registered rent agreement showing food business operation',
    });
    docs.push({
      id: 'premises_owner_noc',
      label: 'Owner NOC & Utility Bill',
      category: 'premises',
      categoryLabel: '📍 Business Premises Documents',
      required: true,
      hint: 'No Objection Certificate from property owner along with latest electricity bill',
    });
  } else {
    docs.push({
      id: 'premises_consent_letter',
      label: 'Consent Letter / NOC from Premises Owner',
      category: 'premises',
      categoryLabel: '📍 Business Premises Documents',
      required: true,
      hint: 'Consent letter permitting food business on shared premises',
    });
  }

  // 3. KoB-Specific Technical Documents

  // Manufacturer / Processor
  if (['manufacturer', 'processor', 'oil_processing', 'bakery'].includes(kob)) {
    docs.push({
      id: 'blueprint_layout_plan',
      label: 'Manufacturing Unit Blueprint / Layout Plan',
      category: 'technical',
      categoryLabel: '⚙️ Manufacturing & Technical Documents',
      required: licenseType !== 'registration',
      hint: 'Floor plan showing dimensions, processing areas, storage and machinery layout',
    });
    docs.push({
      id: 'equipment_machinery_list',
      label: 'List of Equipment & Machinery with Installed HP',
      category: 'technical',
      categoryLabel: '⚙️ Manufacturing & Technical Documents',
      required: licenseType !== 'registration',
      hint: 'List of food processing machines, capacities and horse power ratings',
    });
    docs.push({
      id: 'food_category_product_list',
      label: 'List of Food Categories & Products to be Manufactured',
      category: 'technical',
      categoryLabel: '⚙️ Manufacturing & Technical Documents',
      required: true,
      hint: 'Detailed product specifications intended for commercial manufacturing',
    });
  }

  // Water Test Analysis Report
  if (isWaterTestRequired && licenseType !== 'registration') {
    docs.push({
      id: 'water_test_report',
      label: 'Potable Water Test Report (Bacteriological & Chemical)',
      category: 'technical',
      categoryLabel: '💧 Water Quality Verification',
      required: true,
      hint: 'Analysis report from NABL-accredited laboratory confirming potable water parameters',
    });
  }

  // Packaged Drinking Water specific pesticide report
  if (kob === 'water') {
    docs.push({
      id: 'pesticide_residue_report',
      label: 'Pesticide Residue Report for Water Plant',
      category: 'technical',
      categoryLabel: '💧 Packaged Water Regulatory Proofs',
      required: true,
      hint: 'Lab report testing for pesticide residues as required under FSSAI water standards',
    });
    docs.push({
      id: 'bis_license_doc',
      label: 'BIS / ISI Certificate or Application Copy',
      category: 'technical',
      categoryLabel: '💧 Packaged Water Regulatory Proofs',
      required: true,
      hint: 'Bureau of Indian Standards (BIS) certification for packaged drinking water',
    });
  }

  // Dairy source of milk procurement
  if (kob === 'dairy') {
    docs.push({
      id: 'dairy_milk_source_plan',
      label: 'Source of Milk / Procurement Plan Document',
      category: 'technical',
      categoryLabel: '🥛 Dairy Procurement Plan',
      required: true,
      hint: 'Details of milk collection centres, chilling units and procurement source',
    });
  }

  // Meat source of raw material
  if (kob === 'meat') {
    docs.push({
      id: 'meat_raw_material_source',
      label: 'Source of Raw Meat / Slaughterhouse NOC',
      category: 'technical',
      categoryLabel: '🥩 Meat Source Verification',
      required: true,
      hint: 'Evidence of sourcing from registered slaughterhouses / meat vendors',
    });
  }

  // Repacker / Relabeller NOC & License
  if (kob === 'repacker' || kob === 'relabeller') {
    docs.push({
      id: 'manufacturer_fssai_license',
      label: 'Original Manufacturer FSSAI License Copy',
      category: 'trade_auth',
      categoryLabel: '📦 Manufacturer Authorization',
      required: true,
      hint: 'FSSAI License of the primary manufacturing unit from whom goods are procured',
    });
    docs.push({
      id: 'manufacturer_noc_undertaking',
      label: 'Manufacturer NOC / Repacker Undertaking',
      category: 'trade_auth',
      categoryLabel: '📦 Manufacturer Authorization',
      required: true,
      hint: 'NOC / Authorization letter from original manufacturer authorizing repacking/relabelling',
    });
  }

  // Transporter Vehicle RC
  if (kob === 'transporter') {
    docs.push({
      id: 'vehicle_rc_documents',
      label: 'Vehicle Registration Certificates (RCs) / Lease Proof',
      category: 'transport',
      categoryLabel: '🚛 Fleet Documents',
      required: true,
      hint: 'RC copies of food delivery / transport vehicles in fleet',
    });
  }

  // Importer / Exporter IEC
  if (kob === 'importer' || kob === 'exporter') {
    docs.push({
      id: 'iec_certificate',
      label: 'Import Export Code (IEC Certificate by DGFT)',
      category: 'foreign_trade',
      categoryLabel: '🚢 Foreign Trade Certification',
      required: true,
      hint: 'Valid IEC certificate issued by Directorate General of Foreign Trade',
    });
  }

  // Hotel Ministry of Tourism Certificate
  if (kob === 'hotel') {
    docs.push({
      id: 'hotel_hracc_certificate',
      label: 'Ministry of Tourism / HRACC Star Classification Certificate',
      category: 'technical',
      categoryLabel: '🏨 Hotel Certification',
      required: false,
      hint: 'Star rating certificate from HRACC / Ministry of Tourism (mandatory for 4-star & above)',
    });
  }

  // 4. Optional / Conditional Supporting Proofs
  if (hasFSMS) {
    docs.push({
      id: 'fsms_certificate_plan',
      label: 'Food Safety Management System (FSMS) Plan / Certificate',
      category: 'fsms',
      categoryLabel: '🛡️ Food Safety Management System (FSMS)',
      required: false,
      hint: 'HACCP / ISO 22000 certificate or custom FSMS plan',
    });
  }

  if (hasMunicipalNOC) {
    docs.push({
      id: 'municipal_health_noc',
      label: 'Municipal Health NOC / Trade License',
      category: 'local_body',
      categoryLabel: '🏛️ Local Authority Clearance',
      required: false,
      hint: 'NOC or Trade License issued by local Municipal Corporation / Panchayat',
    });
  }

  return docs;
}

/* ========================= G) Dynamic Fee Calculator ========================= */

/**
 * Calculates total FSSAI application cost:
 * - Base VyaparCare Professional Service Fee: ₹5,000
 * - FoSCoS Government License Fee based on License tier and validity years:
 *   - Basic Registration: ₹100 / year
 *   - State License: ₹2,000 to ₹5,000 / year (default ₹2,000 / year)
 *   - Central License: ₹7,500 / year
 */
export function calculateFSSAIFees({
  licenseType = 'state', // 'registration' | 'state' | 'central'
  validityYears = 1,
  kob = 'restaurant',
}) {
  const serviceFee = FSSAI_SERVICE_INFO.serviceFee; // ₹5,000
  const years = Math.min(Math.max(1, validityYears), 5);

  let annualGovtFee = 2000;
  if (licenseType === 'registration') {
    annualGovtFee = 100;
  } else if (licenseType === 'central') {
    annualGovtFee = 7500;
  } else {
    // State License (defaults to ₹2,000/yr for restaurant/trader; ₹5,000/yr for manufacturer)
    if (['manufacturer', 'processor', 'water', 'dairy'].includes(kob)) {
      annualGovtFee = 3000;
    } else {
      annualGovtFee = 2000;
    }
  }

  const totalGovtFee = annualGovtFee * years;
  const totalPayable = serviceFee + totalGovtFee;
  const advanceAmount = Math.round(serviceFee / 2) + totalGovtFee;
  const balanceAmount = serviceFee - Math.round(serviceFee / 2);

  return {
    serviceFee,
    annualGovtFee,
    validityYears: years,
    totalGovtFee,
    totalPayable,
    advanceAmount,
    balanceAmount,
    licenseTierLabel:
      licenseType === 'central'
        ? 'Central License'
        : licenseType === 'state'
        ? 'State License'
        : 'Basic Registration',
  };
}

/* ========================= H) Statuses & Filter Constants ========================= */

export const FSSAI_APPLICATION_STATUSES = {
  draft: { id: 'draft', label: 'Draft', color: '#7F8C8D' },
  submitted: { id: 'submitted', label: 'Application Received', color: '#3498DB' },
  payment_pending: { id: 'payment_pending', label: 'Payment Pending', color: '#F39C12' },
  under_review: { id: 'under_review', label: 'Under Scrutiny', color: '#F1C40F' },
  clarification_required: { id: 'clarification_required', label: 'Clarification Required', color: '#E74C3C', alert: true },
  inspection_scheduled: { id: 'inspection_scheduled', label: 'FSO Inspection Scheduled', color: '#9B59B6' },
  approved: { id: 'approved', label: 'FSSAI License Approved (✓)', color: '#2ECC71', bold: true },
  rejected: { id: 'rejected', label: 'Application Rejected', color: '#E74C3C' },
  completed: { id: 'completed', label: 'Certificate Issued', color: '#27AE60' },
};

export const FSSAI_ADMIN_FILTERS = [
  { id: 'all', label: 'All', statuses: null },
  { id: 'new', label: 'New / Received', statuses: ['submitted', 'payment_pending'] },
  { id: 'under_review', label: 'Under Scrutiny', statuses: ['under_review', 'inspection_scheduled'] },
  { id: 'clarification', label: 'Clarification', statuses: ['clarification_required'] },
  { id: 'approved', label: 'Approved / Completed', statuses: ['approved', 'completed'] },
];
