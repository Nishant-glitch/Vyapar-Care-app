/**
 * Other Services — Central Configuration Matrix & Dynamic Rules Engine
 * Supports 9 Master Categories, 50+ Specialized Services, Hinglish Search Indexing,
 * Dynamic Questionnaires, Conditional Document Matrices, and Admin Quote Rules.
 */

export const OTHER_SERVICE_BASE_INFO = {
  title: 'Other Services',
  shortDescription: 'Tell us your requirement and our team will guide you.',
  defaultConsultationFee: 2500,
  processingTime: 'Varies by requirement',
  included: [
    'Expert Legal & CA Consultation',
    'Document Scrutiny & Guidance',
    'Customized Action Plan & Filing Strategy',
    'Dedicated Dedicated Case Manager',
  ],
  bannerNotice:
    'Tell us what you need. Our team will review your requirement, identify the appropriate service, confirm the required documents and guide you through the process.',
  uncertainNotice:
    "You don't need to know the exact service. Just describe your requirement and upload any notice or document you have.",
};

/* ========================================================================= */
/* 1. 9 Master Categories & Catalog                                          */
/* ========================================================================= */

export const OTHER_CATEGORIES = [
  {
    id: 'gst',
    name: 'GST Services',
    icon: '📋',
    desc: 'Amendments, Cancellations, Notice Replies, Returns & LUT',
    services: [
      { id: 'gst_amendment', name: 'GST Amendment', tags: ['change address', 'change name', 'update mobile', 'add director', 'gst badalna', 'gst update'] },
      { id: 'gst_cancellation', name: 'GST Cancellation', tags: ['cancel gst', 'close gst', 'surrender gst', 'gst band karna', 'surrender'] },
      { id: 'gst_revocation', name: 'GST Revocation', tags: ['revocation', 'restore gst', 'activate cancelled gst', 'gst wapas chalu'] },
      { id: 'gst_return_filing', name: 'GST Return Filing', tags: ['gstr1', 'gstr3b', 'monthly return', 'quarterly', 'gst file karna'] },
      { id: 'gst_annual_return', name: 'GST Annual Return (GSTR-9)', tags: ['gstr9', 'gstr9c', 'annual gst audit', 'yearly return'] },
      { id: 'gst_notice_reply', name: 'GST Notice Reply', tags: ['gst notice', 'asmt 10', 'drc 01', 'notice aaya hai', 'department notice', 'scrutiny'] },
      { id: 'gst_lut', name: 'GST LUT (Letter of Undertaking)', tags: ['lut', 'zero rated export', 'export without tax', 'lut apply'] },
      { id: 'gst_einvoice', name: 'E-Invoice Setup & Compliance', tags: ['e-invoice', 'irn generation', 'qr code on invoice', 'b2b invoice'] },
      { id: 'gst_eway_bill', name: 'E-Way Bill Consultation', tags: ['eway bill', 'part a', 'part b', 'transport bill', 'goods movement'] },
      { id: 'gst_reg_assistance', name: 'GST Registration Assistance', tags: ['new gst', 'fresh gst', 'gst apply help'] },
      { id: 'gst_compliance', name: 'GST Health Check & Compliance', tags: ['audit', 'itc reconciliation', '2b vs 3b', 'reconciliation'] },
      { id: 'gst_reconciliation', name: 'GST ITC Reconciliation', tags: ['itc mismatch', 'gstr 2a 2b reconciliation', 'supplier mismatch'] },
    ],
  },
  {
    id: 'income_tax',
    name: 'Income Tax',
    icon: '📊',
    desc: 'Notices, Rectifications, Computation, TDS & Advance Tax',
    services: [
      { id: 'itr_filing_help', name: 'ITR Filing Assistance', tags: ['itr file', 'income tax return', 'tax return', 'tax bharna'] },
      { id: 'it_notice_reply', name: 'Income Tax Notice Reply', tags: ['income tax notice', '143(1)', '148', '142(1)', 'scrutiny notice', 'it notice aaya'] },
      { id: 'it_rectification', name: 'Income Tax Rectification (154)', tags: ['rectification', 'demand notice', 'wrong tax calculation', 'tax dispute'] },
      { id: 'tax_computation', name: 'Tax Computation & Advisory', tags: ['computation sheet', 'capital gains calculation', 'tax planning'] },
      { id: 'tds_return', name: 'TDS Return Filing (24Q/26Q)', tags: ['tds file', 'form 24q', 'form 26q', 'salary tds', 'vendor tds'] },
      { id: 'tds_correction', name: 'TDS Correction & Justification', tags: ['tds mismatch', 'traces correction', 'pan correction in tds'] },
      { id: 'advance_tax', name: 'Advance Tax Calculation & Challan', tags: ['advance tax', 'tax installment', 'march tax payment'] },
      { id: 'tax_consultation', name: 'General Tax Consultation', tags: ['tax advice', 'ca consultation', 'tax query', 'salary tax'] },
    ],
  },
  {
    id: 'business_reg',
    name: 'Business Registrations',
    icon: '🏢',
    desc: 'Proprietorship, Partnership, LLP, Company, Startup & Shop Act',
    services: [
      { id: 'company_registration', name: 'Company Registration (Pvt Ltd / OPC)', tags: ['new company', 'pvt ltd banao', 'opc registration'] },
      { id: 'llp_registration', name: 'LLP Registration', tags: ['llp registration', 'llp formation', 'partnership company'] },
      { id: 'partnership_registration', name: 'Partnership Firm Registration', tags: ['partnership deed', 'firm registration', 'rof registration'] },
      { id: 'proprietorship_registration', name: 'Proprietorship Registration', tags: ['sole proprietor', 'dukaan registration', 'individual firm'] },
      { id: 'msme_udyam_help', name: 'MSME / Udyam Certificate Assistance', tags: ['udyam registration', 'msme certificate', 'udyam number'] },
      { id: 'startup_india', name: 'Startup India DPIIT Recognition', tags: ['startup india', 'dpiit', 'tax exemption 80iac', 'angel tax'] },
      { id: 'shop_establishment', name: 'Shop & Establishment Act (Gumasta)', tags: ['gumasta', 'trade license', 'shop license', 'mcd license'] },
      { id: 'professional_tax', name: 'Professional Tax (PT) Registration', tags: ['pt registration', 'ptec', 'ptrc', 'state tax'] },
    ],
  },
  {
    id: 'licensing',
    name: 'Licensing',
    icon: '🍽️',
    desc: 'FSSAI Renewal/Modification, Trade, Factory & Labour Licenses',
    services: [
      { id: 'fssai_registration', name: 'FSSAI Registration / State License', tags: ['food license', 'food certificate', 'restaurant license'] },
      { id: 'fssai_renewal', name: 'FSSAI Renewal', tags: ['fssai renew', 'food license expire', 'renew food license', 'fssai renew karna hai'] },
      { id: 'fssai_modification', name: 'FSSAI Modification', tags: ['fssai change', 'add food product', 'change premises', 'fssai update'] },
      { id: 'trade_license', name: 'Trade License (Municipal / Nagar Nigam)', tags: ['trade license', 'nagar nigam license', 'muncipal health trade'] },
      { id: 'factory_license', name: 'Factory License & Consent to Operate', tags: ['factory license', 'cfo', 'pollution board', 'pcb consent'] },
      { id: 'labour_license', name: 'Labour License & Contract Act', tags: ['labour license', 'contract labour', 'clra license'] },
      { id: 'other_license', name: 'Other Government / Department License', tags: ['fire noc', 'drug license', 'ayush license', 'psara license'] },
    ],
  },
  {
    id: 'trademark_ip',
    name: 'Trademark / IP',
    icon: '™️',
    desc: 'Objections, Renewals, Oppositions, Amendments & Copyright',
    services: [
      { id: 'tm_registration', name: 'Trademark Registration (Form TM-A)', tags: ['brand name', 'logo trademark', 'tm apply'] },
      { id: 'tm_objection', name: 'Trademark Objection Reply (MIS-R)', tags: ['tm objection', 'examination report', 'section 9', 'section 11', 'tm notice reply'] },
      { id: 'tm_renewal', name: 'Trademark Renewal (Form TM-R)', tags: ['tm renewal', 'renew brand', '10 year renewal'] },
      { id: 'tm_opposition', name: 'Trademark Opposition / Hearing (TM-O)', tags: ['tm hearing', 'show cause hearing', 'opposition notice'] },
      { id: 'tm_amendment', name: 'Trademark Amendment (Form TM-M)', tags: ['change applicant', 'change class', 'rectify trademark'] },
      { id: 'copyright_registration', name: 'Copyright Registration', tags: ['copyright', 'software copyright', 'artistic work', 'book copyright'] },
      { id: 'ip_consultation', name: 'IP Portfolio & Brand Consultation', tags: ['brand protection', 'patent advisory', 'ip search'] },
    ],
  },
  {
    id: 'import_export',
    name: 'Import / Export',
    icon: '🌐',
    desc: 'IEC Modifications, Updates, Surrender, RCMC & Port Setup',
    services: [
      { id: 'iec_registration_help', name: 'IEC Registration (Fresh)', tags: ['import export code', 'dgft iec', 'iec apply'] },
      { id: 'iec_modification', name: 'IEC Modification / Update', tags: ['iec change', 'update iec', 'annual iec update', 'change bank in iec', 'iec mein change karna hai'] },
      { id: 'iec_surrender', name: 'IEC Surrender / Cancellation', tags: ['surrender iec', 'close iec', 'cancel iec'] },
      { id: 'rcmc_registration', name: 'RCMC (Export Promotion Council)', tags: ['rcmc', 'fieo', 'epc registration', 'apeda', 'texprocil'] },
      { id: 'import_export_consultation', name: 'Import / Export Regulatory Consultation', tags: ['customs query', 'icegate setup', 'ftr compliance', 'ad code registration'] },
    ],
  },
  {
    id: 'company_compliance',
    name: 'Company Compliance',
    icon: '⚖️',
    desc: 'ROC Filings, Director KYC, DIN, Office Change & Closure',
    services: [
      { id: 'annual_roc_filing', name: 'Annual ROC Compliance (AOC-4 / MGT-7)', tags: ['roc filing', 'annual filing', 'aoc4', 'mgt7', 'mca compliance'] },
      { id: 'director_kyc', name: 'Director KYC (DIR-3 KYC)', tags: ['dir 3 kyc', 'director kyc', 'din kyc web'] },
      { id: 'din_services', name: 'DIN Activation & Services', tags: ['deactivated din', 'din reactivation', 'din correction'] },
      { id: 'registered_office_change', name: 'Registered Office Change (INC-22 / 23)', tags: ['change address', 'office shift', 'state change'] },
      { id: 'director_change', name: 'Director Appointment / Resignation (DIR-12)', tags: ['add director', 'remove director', 'resign director', 'dir12'] },
      { id: 'share_transfer', name: 'Share Transfer & Increase in Capital', tags: ['sh-4', 'share transfer', 'increase authorized capital'] },
      { id: 'company_closure', name: 'Company Closure / Strike Off (STK-2)', tags: ['close company', 'strike off', 'stk 2', 'company close karni hai', 'shut down pvt ltd'] },
      { id: 'company_amendment', name: 'MoA / AoA / Name Change Amendment', tags: ['change company name', 'change object clause', 'mca amendment'] },
    ],
  },
  {
    id: 'accounting',
    name: 'Accounting',
    icon: '📈',
    desc: 'Bookkeeping, Financial Statements, Balance Sheet & Reconciliation',
    services: [
      { id: 'bookkeeping_services', name: 'Monthly Bookkeeping & Accounting', tags: ['bookkeeping', 'tally accounting', 'zoho books', 'monthly accounts'] },
      { id: 'accounting_setup', name: 'Accounting Setup & Chart of Accounts', tags: ['setup accounting', 'new books', 'cloud accounting'] },
      { id: 'bank_reconciliation', name: 'Bank Account Reconciliation', tags: ['brs', 'bank mismatch', 'ledger matching'] },
      { id: 'financial_statements', name: 'Financial Statements Preparation', tags: ['balance sheet', 'p&l', 'trial balance', 'financial report'] },
      { id: 'accounting_consultation', name: 'Accounting & Virtual CFO Consultation', tags: ['virtual cfo', 'financial health', 'cash flow analysis'] },
    ],
  },
  {
    id: 'other_misc',
    name: 'Other',
    icon: '⚙️',
    desc: 'Digital Signature (DSC), PAN, TAN, Legal Notices & Verification',
    services: [
      { id: 'dsc_token', name: 'Digital Signature Certificate (Class 3 DSC)', tags: ['dsc', 'digital signature', 'class 3 dsc', 'usb token', 'dsc banana hai'] },
      { id: 'pan_services', name: 'PAN Card Services (New / Correction)', tags: ['pan correction', 'reprint pan', 'minor pan', 'duplicate pan'] },
      { id: 'tan_services', name: 'TAN Registration & Correction (Form 49B)', tags: ['tan apply', 'new tan', 'tan correction'] },
      { id: 'govt_notice_reply', name: 'Other Government / Department Notice', tags: ['govt notice', 'statutory notice', 'legal notice', 'summons'] },
      { id: 'document_verification', name: 'Legal Document Scrutiny & Vetting', tags: ['agreement vetting', 'contract review', 'deed check'] },
      { id: 'legal_tax_consultation', name: 'Custom Legal & Tax Consultation', tags: ['lawyer consultation', 'tax expert', 'legal guidance'] },
      { id: 'custom_requirement', name: 'Other Custom Business Requirement', tags: ['custom service', 'special request', 'general inquiry'] },
    ],
  },
];

/* ========================================================================= */
/* 2. Search Indexing Engine with Hinglish Keywords                          */
/* ========================================================================= */

export function searchOtherServices(query = '') {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  const results = [];

  OTHER_CATEGORIES.forEach((cat) => {
    cat.services.forEach((svc) => {
      const matchName = svc.name.toLowerCase().includes(q);
      const matchTags = (svc.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchCat = cat.name.toLowerCase().includes(q);

      if (matchName || matchTags || matchCat) {
        results.push({
          ...svc,
          categoryId: cat.id,
          categoryName: cat.name,
          categoryIcon: cat.icon,
        });
      }
    });
  });

  return results;
}

/* ========================================================================= */
/* 3. Applicant Types (10 Legal Structures)                                 */
/* ========================================================================= */

export const OTHER_APPLICANT_TYPES = [
  { id: 'individual', label: 'Individual / Salaried', icon: '👤', isBusiness: false },
  { id: 'proprietorship', label: 'Proprietorship Firm', icon: '💼', isBusiness: true },
  { id: 'partnership', label: 'Partnership Firm', icon: '🤝', isBusiness: true },
  { id: 'llp', label: 'Limited Liability Partnership (LLP)', icon: '⚖️', isBusiness: true },
  { id: 'pvt_ltd', label: 'Private Limited Company', icon: '🏢', isBusiness: true },
  { id: 'pub_ltd', label: 'Public Limited Company', icon: '🏛️', isBusiness: true },
  { id: 'huf', label: 'Hindu Undivided Family (HUF)', icon: '👨‍👩‍👧‍👦', isBusiness: false },
  { id: 'trust', label: 'Trust', icon: '🛡️', isBusiness: true },
  { id: 'society_ngo', label: 'Society / NGO / Section 8', icon: '🌱', isBusiness: true },
  { id: 'other', label: 'Other Applicant Type', icon: '⚙️', isBusiness: false },
];

/* ========================================================================= */
/* 4. 12 Government Departments                                              */
/* ========================================================================= */

export const OTHER_GOVERNMENT_DEPARTMENTS = [
  { id: 'gst', label: 'Goods & Services Tax (GST / CBIC)', icon: '📋' },
  { id: 'income_tax', label: 'Income Tax Department (CBDT)', icon: '📊' },
  { id: 'mca', label: 'Ministry of Corporate Affairs (MCA / ROC)', icon: '⚖️' },
  { id: 'dgft', label: 'Directorate General of Foreign Trade (DGFT)', icon: '🌐' },
  { id: 'fssai', label: 'Food Safety and Standards Authority (FSSAI)', icon: '🍽️' },
  { id: 'ip_india', label: 'Trademark Registry / IP India (CGPDTM)', icon: '™️' },
  { id: 'epfo', label: 'Employees Provident Fund (EPFO)', icon: '💼' },
  { id: 'esic', label: 'Employees State Insurance (ESIC)', icon: '🏥' },
  { id: 'labour', label: 'Labour Department', icon: '👷' },
  { id: 'local_body', label: 'Local Municipal Corporation / Nagar Nigam', icon: '🏛️' },
  { id: 'other_dept', label: 'Other Government Department', icon: '📁' },
  { id: 'not_sure', label: 'Not Sure (Help me identify)', icon: '❓' },
];

/* ========================================================================= */
/* 5. Urgency Levels                                                         */
/* ========================================================================= */

export const OTHER_URGENCY_LEVELS = [
  { id: 'normal', label: 'Normal (Standard Processing)', color: '#0284C7', desc: 'Standard turnaround time' },
  { id: 'within_7_days', label: 'Within 7 Days', color: '#D97706', desc: 'Expected completion within a week' },
  { id: 'within_3_days', label: 'Within 3 Days', color: '#EA580C', desc: 'Priority processing required' },
  { id: 'urgent', label: 'Urgent / Priority', color: '#DC2626', desc: 'Immediate attention required' },
  { id: 'govt_deadline', label: 'Government Deadline Approaching', color: '#B91C1C', desc: 'Statutory deadline is critical' },
];

/* ========================================================================= */
/* 6. Dynamic Questionnaires & Reference Inputs Matrix                       */
/* ========================================================================= */

export function getServiceSpecificQuestions(serviceId) {
  switch (serviceId) {
    case 'gst_amendment':
      return {
        showGSTIN: true,
        optionsTitle: 'What needs to be changed in your GST registration?',
        options: [
          'Principal Place of Business Address',
          'Legal Name / Trade Name',
          'Mobile Number / Email Address',
          'Bank Account Details',
          'Additional Place of Business (Warehouse / Branch)',
          'Business Activity / Goods / HSN',
          'Partner / Director Details',
          'Other Amendment',
        ],
      };

    case 'gst_cancellation':
      return {
        showGSTIN: true,
        optionsTitle: 'Reason for GST Cancellation',
        options: [
          'Closure of Business / Discontinued Operations',
          'Change in Constitution of Business',
          'Turnover below Exemption Threshold',
          'Merged / Amalgamated with Another Entity',
          'Voluntary Cancellation',
          'Other Reason',
        ],
      };

    case 'gst_notice_reply':
      return {
        showGSTIN: true,
        showNoticeFields: true,
        noticeLabel: 'GST Notice / DRC Reference Number',
        dept: 'gst',
      };

    case 'it_notice_reply':
    case 'it_rectification':
      return {
        showPAN: true,
        showAssessmentYear: true,
        showNoticeFields: true,
        noticeLabel: 'Income Tax Notice / Demand Reference Number',
        dept: 'income_tax',
      };

    case 'fssai_renewal':
    case 'fssai_modification':
      return {
        showFSSAINumber: true,
        optionsTitle: 'License Details & Required Change',
        options: [
          'Renewal before Expiry',
          'Change in Premises / Address',
          'Addition of Food Products / Categories',
          'Change in Business Capacity / Turnover',
          'Kind of Business Modification',
        ],
        dept: 'fssai',
      };

    case 'iec_modification':
      return {
        showIECNumber: true,
        optionsTitle: 'What details need to be updated in IEC?',
        options: [
          'Entity / Firm Name',
          'Registered Business Address',
          'Bank Account & IFSC Details',
          'Authorized Partner / Director Details',
          'Annual IEC Profile Updation',
          'Other Update',
        ],
        dept: 'dgft',
      };

    case 'tm_objection':
      return {
        showTMAppNumber: true,
        showTMClass: true,
        showNoticeFields: true,
        noticeLabel: 'Examination Report / Objection Number',
        dept: 'ip_india',
      };

    case 'annual_roc_filing':
    case 'company_closure':
    case 'director_change':
    case 'registered_office_change':
      return {
        showCIN: true,
        showFinancialYear: true,
        dept: 'mca',
      };

    case 'bookkeeping_services':
    case 'financial_statements':
      return {
        showAccountingDetails: true,
        optionsTitle: 'Accounting Software in Use',
        options: ['Tally Prime / ERP 9', 'Zoho Books', 'QuickBooks', 'Busy Accounting', 'Excel / Manual', 'None (Fresh Setup)'],
        dept: 'gst',
      };

    case 'dsc_token':
      return {
        showDSCDetails: true,
        optionsTitle: 'Class 3 DSC Usage Purpose',
        options: ['GST & Income Tax Filing', 'MCA / ROC Company Filings', 'DGFT & Import Export (IEC)', 'E-Tendering & GeM Portal', 'Trademark / IP Filing', 'Foreign Director / Non-Resident'],
      };

    default:
      return {
        showGeneralReference: true,
      };
  }
}

/* ========================================================================= */
/* 7. Dynamic Document Checklist Generator                                   */
/* ========================================================================= */

export function getRequiredOtherDocuments(formData = {}) {
  const serviceId = formData.selectedService?.id || '';
  const isUncertain = formData.isUncertainService || serviceId === 'unknown' || !serviceId;

  // "I Don't Know" Flow -> Lightweight minimal checklist
  if (isUncertain) {
    return [
      {
        id: 'notice_or_reference_doc',
        label: 'Notice, Application, or Supporting Document (If Available)',
        category: 'Requirement Proof',
        required: false,
        hint: 'Attach any government notice, previous challan or reference letter you have received.',
      },
      {
        id: 'applicant_id_proof',
        label: 'Applicant Identity / PAN Card (Optional)',
        category: 'Identity Proof',
        required: false,
        hint: 'Helps our team look up your tax / entity records faster.',
      },
    ];
  }

  const docs = [];

  // Service-specific document rules
  switch (serviceId) {
    case 'gst_notice_reply':
      docs.push({
        id: 'gst_notice_pdf',
        label: 'Official GST Notice Copy (PDF / Scan)',
        category: 'Statutory Notice',
        required: true,
        hint: 'Upload complete copy of the notice (ASMT-10, DRC-01, SCN, or Order) with all pages.',
      });
      docs.push({
        id: 'previous_reply_or_invoices',
        label: 'Invoices, GSTR Returns, or Supporting Ledger',
        category: 'Supporting Records',
        required: false,
        hint: 'Relevant purchase/sales bills or reconciliation sheet.',
      });
      break;

    case 'gst_amendment':
      docs.push({
        id: 'existing_gst_certificate',
        label: 'Existing GST Registration Certificate (Form REG-06)',
        category: 'Registration Proof',
        required: true,
        hint: 'Current 3-page GST certificate.',
      });
      docs.push({
        id: 'amendment_supporting_proof',
        label: 'Supporting Proof for Requested Change (Address / Rent / Bank / Deed)',
        category: 'Amendment Proof',
        required: true,
        hint: 'Rent agreement & electricity bill for address change, or bank cheque for bank update.',
      });
      break;

    case 'gst_cancellation':
      docs.push({
        id: 'existing_gst_certificate',
        label: 'Existing GST Certificate (REG-06)',
        category: 'Registration Proof',
        required: true,
        hint: 'Certificate of the GST to be cancelled.',
      });
      docs.push({
        id: 'closure_proof',
        label: 'Business Closure Proof / Final Return Copy (Optional)',
        category: 'Supporting Records',
        required: false,
        hint: 'NOC, dissolution deed, or surrender letter.',
      });
      break;

    case 'it_notice_reply':
    case 'it_rectification':
      docs.push({
        id: 'income_tax_notice_pdf',
        label: 'Income Tax Notice / Intimation / Order Copy (PDF)',
        category: 'Statutory Notice',
        required: true,
        hint: 'Intimation u/s 143(1), Notice u/s 142(1)/148, or demand intimation.',
      });
      docs.push({
        id: 'previous_itr_computation',
        label: 'Filed ITR-V Acknowledgment & Computation of Income',
        category: 'Tax Records',
        required: false,
        hint: 'ITR acknowledgment for the relevant Assessment Year.',
      });
      docs.push({
        id: 'form26as_ais',
        label: 'Form 26AS / AIS / TIS Statement (Optional)',
        category: 'Tax Records',
        required: false,
        hint: 'Annual information statement from income tax portal.',
      });
      break;

    case 'fssai_renewal':
    case 'fssai_modification':
      docs.push({
        id: 'existing_fssai_certificate',
        label: 'Existing FSSAI License / Registration Certificate',
        category: 'License Proof',
        required: true,
        hint: 'Current FSSAI certificate showing 14-digit license number.',
      });
      docs.push({
        id: 'premises_address_proof',
        label: 'Premises Proof / Electricity Bill (If address modified)',
        category: 'Premises Proof',
        required: false,
        hint: 'Recent utility bill or rent agreement.',
      });
      break;

    case 'iec_modification':
      docs.push({
        id: 'existing_iec_certificate',
        label: 'Existing e-IEC Certificate',
        category: 'DGFT Record',
        required: true,
        hint: 'Current IEC certificate copy.',
      });
      docs.push({
        id: 'iec_change_proof',
        label: 'Bank Proof / Address Proof for Requested IEC Change',
        category: 'Supporting Proof',
        required: true,
        hint: 'Cancelled cheque in firm name or updated electricity bill.',
      });
      break;

    case 'tm_objection':
      docs.push({
        id: 'tm_examination_report',
        label: 'Trademark Examination Report / Objection Notice (PDF)',
        category: 'Statutory Notice',
        required: true,
        hint: 'Official Examination Report issued by IP India Trade Marks Registry.',
      });
      docs.push({
        id: 'tm_user_affidavit',
        label: 'Prior Invoices / Logo / User Proof (Optional)',
        category: 'Evidence',
        required: false,
        hint: 'Evidence supporting brand usage and distinctiveness.',
      });
      break;

    case 'annual_roc_filing':
    case 'company_closure':
    case 'director_change':
      docs.push({
        id: 'company_coi_moa',
        label: 'Certificate of Incorporation & MoA/AoA',
        category: 'Corporate Records',
        required: true,
        hint: 'MCA company incorporation records.',
      });
      docs.push({
        id: 'financial_statements_roc',
        label: 'Financial Statements / Balance Sheet (If filing Annual Returns)',
        category: 'Financial Records',
        required: false,
        hint: 'Audited balance sheet and Director report.',
      });
      break;

    case 'bookkeeping_services':
    case 'financial_statements':
      docs.push({
        id: 'bank_statements_accounts',
        label: 'Bank Statements for the Accounting Period (PDF / Excel)',
        category: 'Financial Records',
        required: true,
        hint: 'Bank statements with clear narration for all active business accounts.',
      });
      docs.push({
        id: 'sales_purchase_invoices',
        label: 'Sales & Purchase Invoices / Bills (Optional)',
        category: 'Financial Records',
        required: false,
        hint: 'Monthly summary or invoice sample PDFs.',
      });
      break;

    case 'dsc_token':
      docs.push({
        id: 'pan_card_dsc',
        label: 'Applicant PAN Card (Clear Color Scan)',
        category: 'Identity Proof',
        required: true,
        hint: 'Mandatory for digital signature issuance.',
      });
      docs.push({
        id: 'address_proof_dsc',
        label: 'Applicant Aadhaar / Passport / Voter ID',
        category: 'Address Proof',
        required: true,
        hint: 'Clear front and back scan.',
      });
      break;

    default:
      docs.push({
        id: 'general_supporting_doc',
        label: 'Relevant Notice, Agreement, or Supporting Document',
        category: 'Supporting Records',
        required: false,
        hint: 'Attach any related file that helps describe your case.',
      });
      docs.push({
        id: 'applicant_pan',
        label: 'Entity / Individual PAN Card',
        category: 'Identity Proof',
        required: true,
        hint: 'Standard tax identity proof.',
      });
  }

  return docs;
}

/* ========================================================================= */
/* 8. Pricing & Quote Calculation Engine                                     */
/* ========================================================================= */

export function calculateOtherFees(customQuote = null) {
  if (customQuote && typeof customQuote === 'object' && customQuote.total !== undefined) {
    return {
      serviceFee: customQuote.serviceFee || 0,
      governmentFee: customQuote.governmentFee || 0,
      additionalCharges: customQuote.additionalCharges || 0,
      gst: customQuote.gst || 0,
      discount: customQuote.discount || 0,
      totalPayable: customQuote.total || 0,
      isCustomQuote: true,
    };
  }

  const baseConsultationFee = OTHER_SERVICE_BASE_INFO.defaultConsultationFee; // ₹2,500
  return {
    serviceFee: baseConsultationFee,
    governmentFee: 0,
    additionalCharges: 0,
    gst: 0,
    discount: 0,
    totalPayable: baseConsultationFee,
    isCustomQuote: false,
  };
}

/* ========================================================================= */
/* 9. CommonJS Export Compatibility for Tests                                */
/* ========================================================================= */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    OTHER_SERVICE_BASE_INFO,
    OTHER_CATEGORIES,
    OTHER_APPLICANT_TYPES,
    OTHER_GOVERNMENT_DEPARTMENTS,
    OTHER_URGENCY_LEVELS,
    searchOtherServices,
    getServiceSpecificQuestions,
    getRequiredOtherDocuments,
    calculateOtherFees,
  };
}
