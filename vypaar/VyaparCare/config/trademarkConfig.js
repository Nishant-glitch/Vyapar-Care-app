/**
 * Trademark Registration — Central Configuration Matrix
 *
 * All 45 Nice Classification classes, 15 applicant types, mark types,
 * dynamic field definitions, document generation rules, and fee calculators
 * are defined centrally here.
 * Future Trade Marks Act / IP India regulatory changes can be updated in this file directly.
 */

/* ========================= A) Service Base Information ========================= */

export const TM_SERVICE_INFO = {
  title: 'Trademark Registration',
  shortDescription: 'Protect your brand name and logo with a registered trademark.',
  serviceFee: 8000,
  processingTime: '5–7 Working Days',
  included: [
    'Trademark Application Filing (Form TM-A)',
    'Official TM Application Number Generation',
    'Classification & Class Selection Guidance',
    'Comprehensive Trademark Search & Availability Report',
    'Drafting of Form TM-48 (Power of Attorney)',
    'Government Fees for 1 Class (as per selected applicant category)',
    'Real-time Application Status Updates',
  ],
  legalDisclaimer:
    'Trademark registration requirements may vary depending on applicant type, trademark type, class, prior-use claim and other applicable requirements. The application and supporting documents will be reviewed before filing. Official requirements, fees and forms may change; applicable Trade Marks Act, Trade Marks Rules and current IP India requirements will prevail.',
};

export const TM_DISCLAIMER_TEXT = TM_SERVICE_INFO.legalDisclaimer;

/* ========================= B) 15 Applicant Types ========================= */

export const TM_APPLICANT_TYPES = [
  {
    id: 'individual',
    label: 'Individual / Natural Person',
    category: 'individual',
    icon: '👤',
    description: 'Sole person applying in personal capacity',
    govtFeeCategory: 'individual_startup',
    baseFee: 4500,
  },
  {
    id: 'proprietorship',
    label: 'Sole Proprietorship',
    category: 'individual',
    icon: '🏪',
    description: 'Unregistered or registered single-owner business',
    govtFeeCategory: 'individual_startup',
    baseFee: 4500,
  },
  {
    id: 'partnership',
    label: 'Partnership Firm',
    category: 'body_corporate',
    icon: '🤝',
    description: 'Registered or unregistered firm with 2 or more partners',
    govtFeeCategory: 'other',
    baseFee: 9000,
  },
  {
    id: 'llp',
    label: 'Limited Liability Partnership (LLP)',
    category: 'body_corporate',
    icon: '⚖️',
    description: 'Registered under LLP Act, 2008',
    govtFeeCategory: 'other',
    baseFee: 9000,
  },
  {
    id: 'pvt_ltd',
    label: 'Private Limited Company',
    category: 'body_corporate',
    icon: '🏢',
    description: 'Incorporated under Companies Act',
    govtFeeCategory: 'other',
    baseFee: 9000,
  },
  {
    id: 'public_ltd',
    label: 'Public Limited Company',
    category: 'body_corporate',
    icon: '🏛️',
    description: 'Publicly held or listed company',
    govtFeeCategory: 'other',
    baseFee: 9000,
  },
  {
    id: 'startup',
    label: 'Startup (DPIIT Recognized)',
    category: 'startup',
    icon: '🚀',
    description: 'Eligible for 50% Govt Fee Concession under DPIIT Recognition',
    govtFeeCategory: 'individual_startup',
    baseFee: 4500,
  },
  {
    id: 'small_enterprise',
    label: 'Small Enterprise / MSME (Udyam)',
    category: 'small_enterprise',
    icon: '🏭',
    description: 'Eligible for 50% Govt Fee Concession with Udyam Certificate',
    govtFeeCategory: 'individual_startup',
    baseFee: 4500,
  },
  {
    id: 'trust',
    label: 'Trust',
    category: 'other_entity',
    icon: '📜',
    description: 'Public or Private Charitable / Educational Trust',
    govtFeeCategory: 'other',
    baseFee: 9000,
  },
  {
    id: 'society',
    label: 'Society / NGO',
    category: 'other_entity',
    icon: '👥',
    description: 'Registered under Societies Registration Act',
    govtFeeCategory: 'other',
    baseFee: 9000,
  },
  {
    id: 'huf',
    label: 'Hindu Undivided Family (HUF)',
    category: 'individual',
    icon: '👨‍👩‍👧‍👦',
    description: 'Family business managed by Karta',
    govtFeeCategory: 'individual_startup',
    baseFee: 4500,
  },
  {
    id: 'aop',
    label: 'Association of Persons (AOP / BOI)',
    category: 'other_entity',
    icon: '🌐',
    description: 'Unincorporated group or joint venture',
    govtFeeCategory: 'other',
    baseFee: 9000,
  },
  {
    id: 'govt_dept',
    label: 'Government Department',
    category: 'government',
    icon: '🇮🇳',
    description: 'Central or State Government department / undertaking',
    govtFeeCategory: 'other',
    baseFee: 9000,
  },
  {
    id: 'statutory_org',
    label: 'Statutory Organization / Body Corporate',
    category: 'government',
    icon: '🏛️',
    description: 'Established under special Act of Parliament / State legislature',
    govtFeeCategory: 'other',
    baseFee: 9000,
  },
  {
    id: 'other',
    label: 'Other Legal Entity',
    category: 'other_entity',
    icon: '📄',
    description: 'Any other recognized legal entity',
    govtFeeCategory: 'other',
    baseFee: 9000,
  },
];

/* ========================= C) Mark Types ========================= */

export const TM_MARK_TYPES = [
  {
    id: 'word',
    label: 'Word Mark',
    icon: '🔤',
    description: 'Standard brand name, letters, numerals or combination (without design/stylization)',
    requiresLogo: false,
  },
  {
    id: 'logo',
    label: 'Logo / Device Mark',
    icon: '🎨',
    description: 'Visual artwork, symbol, crest or standalone design (without specific words)',
    requiresLogo: true,
  },
  {
    id: 'word_logo',
    label: 'Word + Logo (Composite)',
    icon: '🖼️',
    description: 'Combination of stylized brand name together with a logo or emblem',
    requiresLogo: true,
  },
  {
    id: 'colour',
    label: 'Colour Mark',
    icon: '🌈',
    description: 'Specific combination of distinctive colors associated with product/brand',
    requiresLogo: true,
  },
  {
    id: 'shape_3d',
    label: 'Shape / 3D Mark',
    icon: '📦',
    description: 'Three-dimensional shape of goods or their packaging (bottle, container, etc.)',
    requiresLogo: true,
  },
  {
    id: 'sound',
    label: 'Sound Mark',
    icon: '🎵',
    description: 'Distinctive audio jingle or musical notes (requires audio file & notation)',
    requiresAudio: true,
    requiresLogo: false,
  },
  {
    id: 'other',
    label: 'Other Mark Type',
    icon: '⚙️',
    description: 'Certification, Collective, Series or Pattern mark',
    requiresLogo: false,
  },
];

/* ========================= D) 45 Nice Classification Classes ========================= */

export const NICE_CLASSES = [
  // --- GOODS: Classes 1 to 34 ---
  {
    classNumber: 1,
    type: 'goods',
    title: 'Chemicals',
    shortDescription: 'Chemicals for use in industry, science, agriculture, horticulture and forestry.',
    keywords: ['chemicals', 'resins', 'fertilizers', 'adhesives', 'plastics raw'],
  },
  {
    classNumber: 2,
    type: 'goods',
    title: 'Paints & Varnishes',
    shortDescription: 'Paints, varnishes, lacquers, rust preservatives, colorants, mordants, raw natural resins.',
    keywords: ['paints', 'varnish', 'coatings', 'colorants', 'inks', 'anti-corrosion'],
  },
  {
    classNumber: 3,
    type: 'goods',
    title: 'Cosmetics & Cleaning Preparations',
    shortDescription: 'Cosmetics, skincare, soaps, perfumes, essential oils, detergents, cleaning & polishing goods.',
    keywords: ['cosmetics', 'perfumes', 'skincare', 'shampoo', 'soap', 'detergent', 'makeup'],
  },
  {
    classNumber: 4,
    type: 'goods',
    title: 'Industrial Oils & Fuels',
    shortDescription: 'Industrial oils, greases, lubricants, dust absorbing compositions, fuels, candles & wicks.',
    keywords: ['oil', 'grease', 'lubricant', 'fuel', 'petrol', 'candles', 'coal'],
  },
  {
    classNumber: 5,
    type: 'goods',
    title: 'Pharmaceuticals & Medical Preparations',
    shortDescription: 'Pharmaceuticals, medical and veterinary preparations, sanitary preparations, dietary supplements.',
    keywords: ['medicines', 'pharma', 'supplements', 'vitamins', 'ayurvedic', 'disinfectants'],
  },
  {
    classNumber: 6,
    type: 'goods',
    title: 'Common Metals & Hardware',
    shortDescription: 'Common metals and their alloys, metal ores, metal building materials, small items of metal hardware.',
    keywords: ['metals', 'steel', 'aluminum', 'pipes', 'hardware', 'locks', 'wires'],
  },
  {
    classNumber: 7,
    type: 'goods',
    title: 'Machines & Power Tools',
    shortDescription: 'Machines, machine tools, power-operated tools, motors and engines (except land vehicles), pumps.',
    keywords: ['machines', 'tools', 'motors', 'generators', 'pumps', 'compressors', 'industrial machinery'],
  },
  {
    classNumber: 8,
    type: 'goods',
    title: 'Hand Tools & Cutlery',
    shortDescription: 'Hand-operated tools and implements, cutlery, side arms, razors, electric and non-electric.',
    keywords: ['hand tools', 'cutlery', 'knives', 'scissors', 'razors', 'spanners'],
  },
  {
    classNumber: 9,
    type: 'goods',
    title: 'Electronics, Software & Instruments',
    shortDescription: 'Computers, downloadable software, mobile apps, electronics, audiovisual apparatus, solar cells.',
    keywords: ['software', 'apps', 'electronics', 'smartphones', 'computers', 'cameras', 'chargers', 'ai'],
  },
  {
    classNumber: 10,
    type: 'goods',
    title: 'Medical Devices & Apparatus',
    shortDescription: 'Surgical, medical, dental and veterinary apparatus, diagnostic equipment, prosthetics, PPE.',
    keywords: ['medical devices', 'surgical', 'diagnostic', 'thermometers', 'masks', 'gloves', 'implants'],
  },
  {
    classNumber: 11,
    type: 'goods',
    title: 'Appliances, Lighting & HVAC',
    shortDescription: 'Lighting, heating, cooling, steam generating, cooking, drying, ventilating, water supply.',
    keywords: ['lighting', 'fans', 'air conditioners', 'heaters', 'water purifiers', 'refrigerators', 'ovens'],
  },
  {
    classNumber: 12,
    type: 'goods',
    title: 'Vehicles & Automotive Parts',
    shortDescription: 'Vehicles, apparatus for locomotion by land, air or water, automotive parts and accessories.',
    keywords: ['cars', 'ev', 'motorcycles', 'bicycles', 'automotive parts', 'drones', 'tyres'],
  },
  {
    classNumber: 13,
    type: 'goods',
    title: 'Firearms & Fireworks',
    shortDescription: 'Firearms, ammunition and projectiles, explosives, fireworks, pyrotechnic products.',
    keywords: ['firearms', 'ammunition', 'explosives', 'fireworks', 'crackers'],
  },
  {
    classNumber: 14,
    type: 'goods',
    title: 'Jewelry & Precious Metals',
    shortDescription: 'Precious metals, jewelry, precious stones, horological and chronometric instruments, watches.',
    keywords: ['jewelry', 'gold', 'diamonds', 'watches', 'silver', 'gems'],
  },
  {
    classNumber: 15,
    type: 'goods',
    title: 'Musical Instruments',
    shortDescription: 'Musical instruments, music stands and stands for instruments, conductors’ batons.',
    keywords: ['guitars', 'keyboards', 'drums', 'pianos', 'violins', 'musical instruments'],
  },
  {
    classNumber: 16,
    type: 'goods',
    title: 'Paper Goods & Stationery',
    shortDescription: 'Paper, cardboard, printed matter, books, photographs, stationery, adhesives for stationery, packaging.',
    keywords: ['paper', 'books', 'stationery', 'notebooks', 'pens', 'packaging material', 'printed cards'],
  },
  {
    classNumber: 17,
    type: 'goods',
    title: 'Rubber & Plastics Materials',
    shortDescription: 'Unprocessed and semi-processed rubber, gutta-percha, asbestos, plastics in extruded form, packing.',
    keywords: ['rubber', 'plastics', 'insulation', 'sealants', 'flexible pipes', 'gaskets'],
  },
  {
    classNumber: 18,
    type: 'goods',
    title: 'Leather Goods & Luggage',
    shortDescription: 'Leather and imitations of leather, animal skins, luggage and carrying bags, umbrellas, wallets.',
    keywords: ['leather', 'bags', 'backpacks', 'luggage', 'wallets', 'handbags', 'belts'],
  },
  {
    classNumber: 19,
    type: 'goods',
    title: 'Non-Metallic Building Materials',
    shortDescription: 'Materials, not of metal, for building and construction, rigid pipes, asphalt, pitch, cement, marble.',
    keywords: ['cement', 'bricks', 'tiles', 'marble', 'timber', 'glass building', 'concrete'],
  },
  {
    classNumber: 20,
    type: 'goods',
    title: 'Furniture & Home Decor',
    shortDescription: 'Furniture, mirrors, picture frames, containers, not of metal, for storage or transport, mattresses.',
    keywords: ['furniture', 'chairs', 'tables', 'beds', 'mattresses', 'mirrors', 'storage boxes'],
  },
  {
    classNumber: 21,
    type: 'goods',
    title: 'Household & Kitchen Utensils',
    shortDescription: 'Household or kitchen utensils and containers, cookware and tableware, glassware, porcelain.',
    keywords: ['cookware', 'kitchenware', 'glasses', 'bottles', 'plates', 'cleaning cloths', 'brushes'],
  },
  {
    classNumber: 22,
    type: 'goods',
    title: 'Ropes, Sacks & Fibers',
    shortDescription: 'Ropes and string, nets, tents and tarpaulins, sacks for transport and storage, raw fibrous textile.',
    keywords: ['ropes', 'tents', 'tarpaulins', 'sacks', 'bags storage', 'raw fibers', 'jute'],
  },
  {
    classNumber: 23,
    type: 'goods',
    title: 'Yarns & Threads',
    shortDescription: 'Yarns and threads for textile use.',
    keywords: ['yarns', 'threads', 'sewing thread', 'cotton yarn', 'silk yarn', 'synthetic thread'],
  },
  {
    classNumber: 24,
    type: 'goods',
    title: 'Textiles & Bed Covers',
    shortDescription: 'Textiles and substitutes for textiles, household linen, curtains, bed sheets, blankets, towels.',
    keywords: ['textiles', 'fabrics', 'bed sheets', 'towels', 'curtains', 'blankets', 'linens'],
  },
  {
    classNumber: 25,
    type: 'goods',
    title: 'Clothing, Footwear & Headwear',
    shortDescription: 'Clothing, footwear, headwear, innerwear, ethnic wear, sportswear, formal wear, shoes.',
    keywords: ['clothing', 'apparel', 'shirts', 't-shirts', 'shoes', 'footwear', 'caps', 'jeans', 'dresses'],
  },
  {
    classNumber: 26,
    type: 'goods',
    title: 'Lace, Ribbons & Embroidery',
    shortDescription: 'Lace, braid and embroidery, and haberdashery ribbons and bows, buttons, hooks and eyes, wigs.',
    keywords: ['lace', 'ribbons', 'buttons', 'zippers', 'embroidery', 'hair accessories', 'wigs'],
  },
  {
    classNumber: 27,
    type: 'goods',
    title: 'Carpets & Floor Coverings',
    shortDescription: 'Carpets, rugs, mats and matting, linoleum and other materials for covering existing floors, wall hangings.',
    keywords: ['carpets', 'rugs', 'mats', 'floor coverings', 'wallpapers', 'artificial turf'],
  },
  {
    classNumber: 28,
    type: 'goods',
    title: 'Games, Toys & Sports Equipment',
    shortDescription: 'Games, toys and playthings, video game apparatus, gymnastic and sporting articles, fitness gear.',
    keywords: ['toys', 'games', 'sports equipment', 'fitness equipment', 'board games', 'cricket bats', 'gym'],
  },
  {
    classNumber: 29,
    type: 'goods',
    title: 'Meat, Dairy & Preserved Foods',
    shortDescription: 'Meat, fish, poultry, dairy products, milk, cheese, edible oils and fats, preserved/frozen fruits.',
    keywords: ['dairy', 'milk', 'cheese', 'edible oil', 'meat', 'dry fruits', 'pickles', 'frozen foods'],
  },
  {
    classNumber: 30,
    type: 'goods',
    title: 'Coffee, Tea, Bakery & Spices',
    shortDescription: 'Coffee, tea, cocoa, rice, pasta, flour, bread, pastries, confectionery, chocolate, spices, salt.',
    keywords: ['tea', 'coffee', 'spices', 'bakery', 'sweets', 'chocolates', 'snacks', 'rice', 'flour'],
  },
  {
    classNumber: 31,
    type: 'goods',
    title: 'Agricultural Produce & Pet Food',
    shortDescription: 'Raw and unprocessed agricultural, aquacultural, horticultural and forestry products, fresh fruits, pet food.',
    keywords: ['fresh fruits', 'vegetables', 'seeds', 'plants', 'flowers', 'pet food', 'animal feed'],
  },
  {
    classNumber: 32,
    type: 'goods',
    title: 'Beer, Mineral Water & Juices',
    shortDescription: 'Beers, non-alcoholic beverages, mineral and aerated waters, fruit beverages and fruit juices, energy drinks.',
    keywords: ['mineral water', 'fruit juices', 'soft drinks', 'energy drinks', 'beverages', 'beer'],
  },
  {
    classNumber: 33,
    type: 'goods',
    title: 'Alcoholic Beverages (Except Beer)',
    shortDescription: 'Alcoholic beverages (except beers), spirits, wines, whiskies, rum, vodka, gin, liqueurs.',
    keywords: ['wine', 'whisky', 'rum', 'vodka', 'liquor', 'spirits', 'alcoholic drinks'],
  },
  {
    classNumber: 34,
    type: 'goods',
    title: 'Tobacco & Smokers’ Articles',
    shortDescription: 'Tobacco and tobacco substitutes, cigarettes, cigars, electronic cigarettes, matches, lighters.',
    keywords: ['tobacco', 'cigarettes', 'e-cigarettes', 'vapes', 'matches', 'lighters', 'cigars'],
  },

  // --- SERVICES: Classes 35 to 45 ---
  {
    classNumber: 35,
    type: 'services',
    title: 'Advertising, Business Management & Retail',
    shortDescription: 'Advertising, business management, organisation and administration, office functions, e-commerce & retail.',
    keywords: ['advertising', 'marketing', 'retail', 'e-commerce', 'business consultancy', 'trading', 'wholesale'],
  },
  {
    classNumber: 36,
    type: 'services',
    title: 'Financial, Banking & Real Estate',
    shortDescription: 'Financial, monetary and banking services, insurance services, real estate affairs, loan advisory.',
    keywords: ['banking', 'finance', 'fintech', 'insurance', 'real estate', 'investments', 'loans'],
  },
  {
    classNumber: 37,
    type: 'services',
    title: 'Construction, Repair & Installation',
    shortDescription: 'Construction services, installation and repair services, mining extraction, oil and gas drilling.',
    keywords: ['construction', 'repairs', 'installation', 'maintenance', 'interior work', 'civil contractors'],
  },
  {
    classNumber: 38,
    type: 'services',
    title: 'Telecommunications & Broadcasting',
    shortDescription: 'Telecommunication services, broadcasting, internet service provision, electronic data transmission.',
    keywords: ['telecom', 'broadcasting', 'streaming', 'internet service', 'messaging', 'cellular'],
  },
  {
    classNumber: 39,
    type: 'services',
    title: 'Transport, Logistics & Travel',
    shortDescription: 'Transport, packaging and storage of goods, travel arrangement, courier services, warehousing.',
    keywords: ['logistics', 'transport', 'courier', 'warehousing', 'travel booking', 'shipping', 'cargo'],
  },
  {
    classNumber: 40,
    type: 'services',
    title: 'Material Treatment & Manufacturing Services',
    shortDescription: 'Treatment of materials, recycling of waste and trash, custom manufacturing, printing, food preservation.',
    keywords: ['custom manufacturing', 'job work', 'printing', 'recycling', 'metal plating', 'textile processing'],
  },
  {
    classNumber: 41,
    type: 'services',
    title: 'Education, Training & Entertainment',
    shortDescription: 'Education, providing of training, entertainment, sporting and cultural activities, publishing, media.',
    keywords: ['education', 'training', 'courses', 'entertainment', 'coaching', 'schools', 'media production', 'gaming'],
  },
  {
    classNumber: 42,
    type: 'services',
    title: 'IT, Software & Scientific Services',
    shortDescription: 'Scientific and technological services, design and development of computer hardware and software, SaaS.',
    keywords: ['software development', 'saas', 'cloud hosting', 'it services', 'web design', 'engineering', 'ai tech'],
  },
  {
    classNumber: 43,
    type: 'services',
    title: 'Restaurants, Hotels & Catering',
    shortDescription: 'Services for providing food and drink, temporary accommodation, restaurants, cafes, cloud kitchens, hotels.',
    keywords: ['restaurants', 'hotels', 'catering', 'cafes', 'cloud kitchen', 'food delivery', 'hospitality'],
  },
  {
    classNumber: 44,
    type: 'services',
    title: 'Medical, Healthcare & Beauty Services',
    shortDescription: 'Medical services, veterinary services, hygienic and beauty care for human beings or animals, salons, spas.',
    keywords: ['healthcare', 'hospitals', 'clinics', 'salons', 'spas', 'doctors', 'beauty parlours', 'wellness'],
  },
  {
    classNumber: 45,
    type: 'services',
    title: 'Legal, Security & Personal Services',
    shortDescription: 'Legal services, security services for the physical protection of tangible property and individuals, matrimonial.',
    keywords: ['legal services', 'lawyers', 'security services', 'surveillance', 'matrimonial', 'investigation'],
  },
];

/* ========================= E) Dynamic Document Generator Matrix ========================= */

/**
 * Generates the dynamic document checklist based on:
 * - applicantType (Individual, Startup, MSME, Company, Partnership, LLP, Trust, Society, etc.)
 * - markType (Word, Logo, Sound, 3D, etc.)
 * - usageStatus (proposed vs used)
 * - isStartupOrMSME claimed (DPIIT / Udyam certificate)
 * - isFiledThroughAgent (Power of Attorney / TM-48)
 * - language (if non-Hindi/English)
 */
export function getRequiredTMDocuments(params = {}) {
  const applicantType = params.applicantType || 'individual';
  const isStartupClaimed = params.isStartupClaimed ?? (params.formState?.isStartupClaimed || false);
  const isMSMEClaimed = params.isMSMEClaimed ?? (params.formState?.isMSMEClaimed || false);
  const markType = params.markType || params.markDetails?.markType || 'word';
  const usageStatus = params.usageStatus || params.usageDetails?.usageStatus || 'proposed';
  const isFiledThroughAgent = params.isFiledThroughAgent ?? (params.agentDetails?.isFiledThroughAgent ?? true);
  const isOtherLanguage = params.isOtherLanguage ?? (params.markDetails?.isOtherLanguage || false);

  const docs = [];

  // 1. Identity & Constitution Documents based on Applicant Type
  if (applicantType === 'individual' || applicantType === 'huf') {
    docs.push({
      id: 'applicant_pan',
      label: 'Applicant PAN Card',
      category: 'identity',
      categoryLabel: '👤 Applicant Identity Proofs',
      required: true,
      hint: 'Self-attested PAN card of the applicant',
    });
    docs.push({
      id: 'applicant_id_proof',
      label: 'Identity / Address Proof (Aadhaar / Voter ID / Passport)',
      category: 'identity',
      categoryLabel: '👤 Applicant Identity Proofs',
      required: true,
      hint: 'Self-attested Govt ID card with address',
    });
  } else if (applicantType === 'proprietorship') {
    docs.push({
      id: 'applicant_pan',
      label: 'Proprietor PAN Card',
      category: 'identity',
      categoryLabel: '🏪 Proprietorship Proofs',
      required: true,
      hint: 'Self-attested PAN card of the sole proprietor',
    });
    docs.push({
      id: 'proprietor_business_proof',
      label: 'Business Proof (GST Certificate / MSME / Shop Act / Bank Statement)',
      category: 'identity',
      categoryLabel: '🏪 Proprietorship Proofs',
      required: true,
      hint: 'Proof of business name and principal place of business',
    });
  } else if (applicantType === 'partnership') {
    docs.push({
      id: 'firm_pan',
      label: 'Partnership Firm PAN Card',
      category: 'constitution',
      categoryLabel: '🤝 Partnership Firm Documents',
      required: true,
      hint: 'PAN card issued in the name of the firm',
    });
    docs.push({
      id: 'partnership_deed',
      label: 'Partnership Deed (Signed & Executed)',
      category: 'constitution',
      categoryLabel: '🤝 Partnership Firm Documents',
      required: true,
      hint: 'Complete copy of the registered or notarized partnership deed',
    });
    docs.push({
      id: 'authorized_signatory_id',
      label: 'Managing Partner / Authorized Signatory ID & PAN',
      category: 'constitution',
      categoryLabel: '🤝 Partnership Firm Documents',
      required: true,
      hint: 'PAN & Aadhaar of the partner signing Form TM-A',
    });
  } else if (applicantType === 'llp') {
    docs.push({
      id: 'llp_pan',
      label: 'LLP PAN Card',
      category: 'constitution',
      categoryLabel: '⚖️ Limited Liability Partnership (LLP) Documents',
      required: true,
      hint: 'PAN card of the LLP',
    });
    docs.push({
      id: 'llp_coi',
      label: 'LLP Certificate of Incorporation (MCA)',
      category: 'constitution',
      categoryLabel: '⚖️ Limited Liability Partnership (LLP) Documents',
      required: true,
      hint: 'Certificate of Incorporation issued by ROC',
    });
    docs.push({
      id: 'llp_partner_authorization',
      label: 'Designated Partner Authorization / Resolution',
      category: 'constitution',
      categoryLabel: '⚖️ Limited Liability Partnership (LLP) Documents',
      required: true,
      hint: 'Letter of authorization signed by all partners',
    });
  } else if (applicantType === 'pvt_ltd' || applicantType === 'public_ltd') {
    docs.push({
      id: 'company_pan',
      label: 'Company PAN Card',
      category: 'constitution',
      categoryLabel: '🏢 Company Legal Documents',
      required: true,
      hint: 'PAN card in the name of the company',
    });
    docs.push({
      id: 'company_coi',
      label: 'Certificate of Incorporation (COI)',
      category: 'constitution',
      categoryLabel: '🏢 Company Legal Documents',
      required: true,
      hint: 'MCA Certificate of Incorporation',
    });
    docs.push({
      id: 'company_board_resolution',
      label: 'Board Resolution / Authorization Letter',
      category: 'constitution',
      categoryLabel: '🏢 Company Legal Documents',
      required: true,
      hint: 'Board resolution authorizing the director / attorney to sign TM-A',
    });
    docs.push({
      id: 'authorized_signatory_id',
      label: 'Authorized Signatory ID & PAN Card',
      category: 'constitution',
      categoryLabel: '🏢 Company Legal Documents',
      required: true,
      hint: 'Identity proof of the authorized director or officer',
    });
  } else if (applicantType === 'trust' || applicantType === 'society' || applicantType === 'aop') {
    docs.push({
      id: 'entity_pan',
      label: 'Trust / Society PAN Card',
      category: 'constitution',
      categoryLabel: '📜 Entity Legal Documents',
      required: true,
      hint: 'PAN card of the Trust or Society',
    });
    docs.push({
      id: 'entity_registration_doc',
      label: 'Trust Deed / Society Registration Certificate',
      category: 'constitution',
      categoryLabel: '📜 Entity Legal Documents',
      required: true,
      hint: 'Certified copy of the registration deed or certificate',
    });
    docs.push({
      id: 'entity_authorization',
      label: 'Authorization Letter / Managing Committee Resolution',
      category: 'constitution',
      categoryLabel: '📜 Entity Legal Documents',
      required: true,
      hint: 'Resolution authorizing application for trademark registration',
    });
  } else {
    docs.push({
      id: 'entity_pan',
      label: 'Applicant / Entity PAN Card',
      category: 'constitution',
      categoryLabel: '🏛️ Legal Entity Proofs',
      required: true,
      hint: 'PAN card of the applicant organization',
    });
    docs.push({
      id: 'entity_registration_doc',
      label: 'Establishment / Registration Document',
      category: 'constitution',
      categoryLabel: '🏛️ Legal Entity Proofs',
      required: true,
      hint: 'Proof of legal status / government notification',
    });
  }

  // 2. Startup / Small Enterprise Concession Certificate
  if (isStartupClaimed || applicantType === 'startup') {
    docs.push({
      id: 'startup_dpiit_certificate',
      label: 'DPIIT Startup Recognition Certificate',
      category: 'fee_concession',
      categoryLabel: '🚀 50% Govt Fee Concession Proof',
      required: true,
      hint: 'Certificate of recognition issued by DPIIT (mandatory for ₹4,500 govt fee claim)',
    });
  }

  if (isMSMEClaimed || applicantType === 'small_enterprise') {
    docs.push({
      id: 'msme_udyam_certificate',
      label: 'Udyam Registration Certificate (MSME)',
      category: 'fee_concession',
      categoryLabel: '🏭 50% Govt Fee Concession Proof',
      required: true,
      hint: 'Valid Udyam Registration Certificate (mandatory for ₹4,500 govt fee claim)',
    });
  }

  // 3. Trademark Representation Documents
  if (['logo', 'word_logo', 'colour', 'shape_3d'].includes(markType)) {
    docs.push({
      id: 'trademark_logo_file',
      label: 'Trademark Logo / Device Artwork Representation',
      category: 'trademark_rep',
      categoryLabel: '🎨 Trademark Visual Representation',
      required: true,
      hint: 'High-resolution logo image (PNG / JPG / JPEG / PDF, max 5MB)',
    });
  }

  if (markType === 'sound') {
    docs.push({
      id: 'sound_clip_file',
      label: 'Sound Mark Audio Clip (.mp3 / .wav)',
      category: 'trademark_rep',
      categoryLabel: '🎵 Sound Mark Representation',
      required: true,
      hint: 'Clear audio recording (MP3/WAV format, max 30 seconds)',
    });
    docs.push({
      id: 'sound_musical_notes',
      label: 'Musical Notation Representation Document',
      category: 'trademark_rep',
      categoryLabel: '🎵 Sound Mark Representation',
      required: false,
      hint: 'Graphical representation of the sound in musical stave notation',
    });
  }

  if (markType === 'shape_3d') {
    docs.push({
      id: 'shape_3d_perspectives',
      label: '3D Perspective Views (Front, Side, Top, Isometric)',
      category: 'trademark_rep',
      categoryLabel: '📦 3D Shape Representation',
      required: true,
      hint: 'Multiple angles showing distinct shape features of product/packaging',
    });
  }

  // 4. Non-English / Non-Hindi Translation & Transliteration
  if (isOtherLanguage) {
    docs.push({
      id: 'translation_transliteration_doc',
      label: 'Certified Transliteration & English Translation Sheet',
      category: 'trademark_rep',
      categoryLabel: '🌐 Language Declarations',
      required: true,
      hint: 'Declaration showing exact transliteration in Roman script and English meaning',
    });
  }

  // 5. Prior Use / User Affidavit & Invoices
  if (usageStatus === 'used') {
    docs.push({
      id: 'user_affidavit_doc',
      label: 'User Affidavit Supporting Prior Use (on Stamp Paper)',
      category: 'prior_use',
      categoryLabel: '📅 Prior Use Claim Evidence (Mandatory)',
      required: true,
      hint: 'Notarized affidavit stating first use date and continuous usage in commerce',
    });
    docs.push({
      id: 'prior_use_invoices_evidence',
      label: 'Earliest Invoices & Sales Bills with Trademark',
      category: 'prior_use',
      categoryLabel: '📅 Prior Use Claim Evidence (Mandatory)',
      required: true,
      hint: 'Tax invoices, sales bills or purchase orders displaying the brand name',
    });
    docs.push({
      id: 'prior_use_marketing_evidence',
      label: 'Marketing Material, Packaging & Website Screenshots',
      category: 'prior_use',
      categoryLabel: '📅 Prior Use Claim Evidence (Mandatory)',
      required: false,
      hint: 'Product photographs, packaging, brochures, advertisements, social media posts',
    });
  }

  // 6. Agent / Attorney Authorization
  if (isFiledThroughAgent) {
    docs.push({
      id: 'power_of_attorney_tm48',
      label: 'Power of Attorney / Form TM-48 (Signed & Executed)',
      category: 'authorization',
      categoryLabel: '⚖️ Agent / Attorney Authorization',
      required: true,
      hint: 'Form TM-48 authorizing Trademark Attorney / Agent to file and prosecute the application',
    });
  }

  return docs;
}

/* ========================= F) Dynamic Fee Calculator ========================= */

/**
 * Calculates accurate government and professional service fees based on:
 * - Applicant Category (Individual, Startup, Small Enterprise vs Others)
 * - Number of Nice classes selected
 * - Professional service fee
 *
 * Current IP India Schedule for E-filing Form TM-A:
 * - ₹4,500 per class for Individual, Startup, Small Enterprise
 * - ₹9,000 per class for Others (Body corporate, Companies, Firms, LLPs, etc.)
 */
export function calculateTMFees({
  applicantType = 'individual',
  isStartupClaimed = false,
  isMSMEClaimed = false,
  selectedClasses = [1],
}) {
  const serviceFee = TM_SERVICE_INFO.serviceFee;
  const numClasses = Math.max(1, selectedClasses.length);

  // Fee category determination
  const isConcessionCategory =
    applicantType === 'individual' ||
    applicantType === 'proprietorship' ||
    applicantType === 'huf' ||
    applicantType === 'startup' ||
    applicantType === 'small_enterprise' ||
    isStartupClaimed === true ||
    isMSMEClaimed === true;

  const perClassGovtFee = isConcessionCategory ? 4500 : 9000;
  const totalGovtFee = perClassGovtFee * numClasses;

  // Single class govt fee included in ₹8,000 package:
  // Base package includes 1 class at applicable rate or professional fee covers drafting + filing
  const totalPayable = serviceFee + (numClasses > 1 ? (numClasses - 1) * perClassGovtFee : 0);

  // 50% advance breakdown for service fee
  const advanceAmount = Math.round(serviceFee / 2) + totalGovtFee;
  const balanceAmount = serviceFee - Math.round(serviceFee / 2);

  return {
    serviceFee,
    perClassGovtFee,
    numClasses,
    totalGovtFee,
    totalPayable,
    advanceAmount,
    balanceAmount,
    isConcessionCategory,
    feeCategoryLabel: isConcessionCategory
      ? 'Individual / Startup / Small Enterprise (₹4,500 / class)'
      : 'Company / Partnership / Large Enterprise (₹9,000 / class)',
  };
}

/* ========================= G) Statuses & Filter Constants ========================= */

export const TM_DOCUMENT_STATUSES = {
  required: { id: 'required', label: 'Required', color: '#E74C3C', icon: '!' },
  uploaded: { id: 'uploaded', label: 'Uploaded', color: '#25D366', icon: '✓' },
  missing: { id: 'missing', label: 'Missing', color: '#E74C3C', icon: '!' },
  optional: { id: 'optional', label: 'Optional', color: '#666666', icon: '○' },
  under_review: { id: 'under_review', label: 'Under Review', color: '#C5991A', icon: '⋯' },
  approved: { id: 'approved', label: 'Approved', color: '#25D366', icon: '✓' },
  rejected: { id: 'rejected', label: 'Rejected', color: '#E74C3C', icon: '✕' },
};

export const TM_APPLICATION_STATUSES = {
  draft: { id: 'draft', label: 'Draft', color: '#7F8C8D' },
  submitted: { id: 'submitted', label: 'Application Received', color: '#3498DB' },
  payment_pending: { id: 'payment_pending', label: 'Payment Pending', color: '#F39C12' },
  under_review: { id: 'under_review', label: 'Under Review', color: '#F1C40F' },
  clarification_required: { id: 'clarification_required', label: 'Clarification Required', color: '#E74C3C', alert: true },
  filed: { id: 'filed', label: 'Filed with IP India (TM-A)', color: '#2ECC71' },
  examination: { id: 'examination', label: 'Under Examination', color: '#9B59B6' },
  objection: { id: 'objection', label: 'Examination Report / Objection', color: '#E67E22' },
  published: { id: 'published', label: 'Published in TM Journal', color: '#1ABC9C' },
  registered: { id: 'registered', label: 'Trademark Registered (®)', color: '#27AE60', bold: true },
  completed: { id: 'completed', label: 'Completed', color: '#27AE60' },
};

export const TM_ADMIN_FILTERS = [
  { id: 'all', label: 'All', statuses: null },
  { id: 'new', label: 'New / Received', statuses: ['submitted', 'payment_pending'] },
  { id: 'under_review', label: 'Under Review', statuses: ['under_review'] },
  { id: 'clarification', label: 'Clarification', statuses: ['clarification_required'] },
  { id: 'filed', label: 'Filed / Examination', statuses: ['filed', 'examination', 'objection', 'published'] },
  { id: 'registered', label: 'Registered (®)', statuses: ['registered', 'completed'] },
];
