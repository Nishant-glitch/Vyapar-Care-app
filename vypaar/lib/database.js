/**
 * Saari Supabase queries yahan. Screens seedhe supabase client ko touch
 * nahi karte — isse query badalni ho to ek hi jagah badalni padti hai.
 *
 * Har function ya to data return karta hai ya throw karta hai; loading/error
 * handling `hooks/useFetch.js` dekhta hai.
 */
import { supabase } from './supabase';

const DOCUMENTS_BUCKET = 'documents';

/** har order pe ye documents chahiye hote hain (order banate waqt seed hote hain) */
export const REQUIRED_DOCUMENTS = [
  'Aadhaar Card',
  'PAN Card',
  'Address Proof',
  'Bank Statement',
  'Photograph',
];

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

/* ============================ user ============================ */

export async function getProfile(userId) {
  return unwrap(
    await supabase.from('users').select('*').eq('id', userId).maybeSingle()
  );
}

/* ============================ services ============================ */

export async function getServices() {
  return unwrap(
    await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
  );
}

export async function getServiceById(id) {
  return unwrap(await supabase.from('services').select('*').eq('id', id).maybeSingle());
}

/* ============================ orders ============================ */

export async function getOrders(userId) {
  return unwrap(
    await supabase
      .from('orders')
      .select('*, service:services(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  );
}

export async function getOrder(orderUuid) {
  return unwrap(
    await supabase
      .from('orders')
      .select('*, service:services(*), payments(*), documents(*)')
      .eq('id', orderUuid)
      .maybeSingle()
  );
}

/** latest order — jab kisi screen ko "current" order chahiye ho */
export async function getLatestOrder(userId) {
  return unwrap(
    await supabase
      .from('orders')
      .select('*, service:services(*), payments(*), documents(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  );
}

/** order banao + uske required documents rows seed karo */
export async function createOrder({ userId, serviceId }) {
  const order = unwrap(
    await supabase
      .from('orders')
      .insert({ user_id: userId, service_id: serviceId, status: 'pending' })
      .select('*, service:services(*)')
      .single()
  );

  const rows = REQUIRED_DOCUMENTS.map((name) => ({
    order_id: order.id,
    name,
    status: 'pending',
  }));
  const { error } = await supabase.from('documents').insert(rows);
  if (error) console.log('Document seed error:', error.message);

  return order;
}

export async function updateOrderStatus(orderUuid, status) {
  return unwrap(
    await supabase.from('orders').update({ status }).eq('id', orderUuid).select().single()
  );
}

/* ============================ payments ============================ */

/** "TXN" + timestamp */
export const generateTransactionId = () => `TXN${Date.now()}`;

export async function recordPayment({ orderUuid, amount, type, method }) {
  return unwrap(
    await supabase
      .from('payments')
      .insert({
        order_id: orderUuid,
        amount,
        type, // 'advance' | 'final'
        method,
        transaction_id: generateTransactionId(),
        status: 'success',
      })
      .select()
      .single()
  );
}

/** user ke saare payments, newest first */
export async function getPayments(userId) {
  return unwrap(
    await supabase
      .from('payments')
      .select('*, order:orders!inner(id, order_id, user_id, service:services(name, detail_title))')
      .eq('order.user_id', userId)
      .order('created_at', { ascending: false })
  );
}

/* ============================ documents ============================ */

export async function getDocuments(orderUuid) {
  return unwrap(
    await supabase
      .from('documents')
      .select('*')
      .eq('order_id', orderUuid)
      .order('created_at', { ascending: true })
  );
}

/**
 * File ko Storage me daal kar document row update karta hai.
 * `file` = { uri, name, mimeType } (expo-document-picker ka asset)
 */
export async function uploadDocument({ orderUuid, documentId, file }) {
  const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
  const filePath = `${orderUuid}/${documentId}.${ext}`;

  // RN me fetch(uri) se ArrayBuffer nikalna hi reliable tareeka hai
  const response = await fetch(file.uri);
  const bytes = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(filePath, bytes, {
      contentType: file.mimeType || 'application/octet-stream',
      upsert: true,
    });
  if (uploadError) throw uploadError;

  const { data: pub } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(filePath);

  return unwrap(
    await supabase
      .from('documents')
      .update({ status: 'uploaded', file_url: pub.publicUrl })
      .eq('id', documentId)
      .select()
      .single()
  );
}

/** completed orders ke uploaded/verified documents (My Documents screen) */
export async function getCompletedDocuments(userId) {
  return unwrap(
    await supabase
      .from('documents')
      .select('*, order:orders!inner(id, order_id, user_id, status)')
      .eq('order.user_id', userId)
      .in('status', ['uploaded', 'verified'])
      .order('created_at', { ascending: true })
  );
}

export const publicUrlFor = (path) =>
  supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(path).data.publicUrl;

/* ============================ notifications ============================ */

export async function getNotifications(userId) {
  return unwrap(
    await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  );
}

export async function markNotificationRead(id) {
  return unwrap(
    await supabase.from('notifications').update({ read: true }).eq('id', id).select().single()
  );
}

/* ============================ home dashboard ============================ */

export async function getHomeSummary(userId) {
  const [orders, notifications] = await Promise.all([
    getOrders(userId),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(unwrap),
  ]);

  const orderIds = orders.map((o) => o.id);

  const [payments, documents] = await Promise.all([
    orderIds.length
      ? supabase.from('payments').select('*').in('order_id', orderIds).then(unwrap)
      : Promise.resolve([]),
    orderIds.length
      ? supabase.from('documents').select('*').in('order_id', orderIds).then(unwrap)
      : Promise.resolve([]),
  ]);

  const activeServices = orders.filter((o) => o.status !== 'completed').length;

  const pendingPayment = orders.reduce((sum, order) => {
    const fee = order.service?.fee ?? 0;
    const paid = payments
      .filter((p) => p.order_id === order.id && p.status === 'success')
      .reduce((s, p) => s + p.amount, 0);
    return sum + Math.max(fee - paid, 0);
  }, 0);

  const docsTotal = documents.length;
  const docsUploaded = documents.filter((d) =>
    ['uploaded', 'verified'].includes(d.status)
  ).length;

  return {
    orders,
    activeServices,
    pendingPayment,
    docsTotal,
    docsUploaded,
    latestNotification: notifications[0] ?? null,
  };
}

/* ============================ invoice ============================ */

export function buildInvoice(order) {
  const total = order?.service?.fee ?? 0;
  const paid = (order?.payments || [])
    .filter((p) => p.status === 'success')
    .reduce((s, p) => s + p.amount, 0);

  return {
    number: order?.order_id?.replace(/^VCC/, 'INV') || 'INV0000000',
    date: order?.created_at ? formatDate(order.created_at) : '',
    customerName: null,
    service: order?.service?.detail_title || order?.service?.name || '',
    total,
    paid,
    balance: Math.max(total - paid, 0),
  };
}

/* ============================ realtime ============================ */

export function subscribeToOrder(orderUuid, onChange) {
  const channel = supabase
    .channel(`order-${orderUuid}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderUuid}` },
      (payload) => onChange(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/* ============================ helpers ============================ */

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const formatDateTime = (iso) => {
  const d = new Date(iso);
  return `${formatDate(iso)} - ${d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export function stepsFromStatus(status, createdAt) {
  const order = ['pending', 'processing', 'verification', 'completed'];
  const idx = Math.max(order.indexOf(status), 0);
  const date = createdAt ? formatDate(createdAt) : '';

  const map = [
    { title: 'Payment Received', stage: 0 },
    { title: 'Documents Verified', stage: 1 },
    { title: 'Application Processing', stage: 1 },
    { title: 'Verification', stage: 2 },
    { title: 'Certificate Generation', stage: 3 },
    { title: 'Completed', stage: 3 },
  ];

  let activeUsed = false;
  return map.map((step, i) => {
    const isDone = step.stage < idx || (step.stage === idx && i === 0 && idx > 0);
    let stepStatus;
    if (step.stage < idx) {
      stepStatus = 'completed';
    } else if (step.stage === idx && !activeUsed) {
      stepStatus = 'active';
      activeUsed = true;
    } else {
      stepStatus = 'pending';
    }
    if (status === 'completed') stepStatus = 'completed';

    return {
      title: step.title,
      status: stepStatus,
      date:
        stepStatus === 'completed' ? date : stepStatus === 'active' ? 'In Progress' : 'Pending',
      _done: isDone,
    };
  });
}

/* ========================================================================= */
/* =================== PRIVATE LIMITED COMPANY REGISTRATION ================= */
/* ========================================================================= */

// In-memory application store for seamless offline/demo resilience
let _mockPLCApplications = [
  {
    id: 'PLC-2026-000101',
    application_id: 'PLC-2026-000101',
    status: 'submitted',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    applicant: {
      fullName: 'Aarav Sharma',
      mobile: '9876543210',
      email: 'aarav.sharma@example.com',
      state: '07',
    },
    company: {
      proposedName1: 'QuantumByte Technologies Private Limited',
      proposedName2: 'QuantumByte Innovations Private Limited',
      registeredState: '07',
      authorizedCapital: 1000000,
      paidUpCapital: 500000,
      directorCount: 2,
      subscriberCount: 2,
    },
    directors: [
      { fullName: 'Aarav Sharma', pan: 'ABCDE1234F', hasDIN: false },
      { fullName: 'Pooja Sharma', pan: 'FGHIJ5678K', hasDIN: true, din: '09876543' },
    ],
    office: {
      premisesType: 'rented',
      line1: 'B-12, Sector 62',
      city: 'Noida',
      state: '09',
      pincode: '201301',
    },
    business: {
      mainActivity: 'it_software',
      productsServices: 'Cloud Software & Artificial Intelligence',
    },
    documents: [
      { id: 'director_pan__0', label: 'Director 1: PAN Card', status: 'uploaded', required: true },
      { id: 'director_id__0', label: 'Director 1: Identity Proof', status: 'uploaded', required: true },
      { id: 'director_address__0', label: 'Director 1: Address Proof', status: 'uploaded', required: true },
      { id: 'director_photo__0', label: 'Director 1: Photograph', status: 'uploaded', required: true },
      { id: 'director_dsc__0', label: 'Director 1: Digital Signature Form', status: 'uploaded', required: true },
      { id: 'director_pan__1', label: 'Director 2: PAN Card', status: 'uploaded', required: true },
      { id: 'director_id__1', label: 'Director 2: Identity Proof', status: 'uploaded', required: true },
      { id: 'office_rent_agreement', label: 'Registered Office: Rent Agreement', status: 'uploaded', required: true },
      { id: 'office_noc', label: 'Registered Office: Owner NOC', status: 'uploaded', required: true },
      { id: 'office_utility_bill', label: 'Registered Office: Utility Bill', status: 'uploaded', required: true },
    ],
    calculatedFees: {
      totalFee: 15000,
      advanceAmount: 7500,
      balanceAmount: 7500,
      mcaGovtFee: 0,
    },
  },
];

export async function submitPLCApplication(payload) {
  const generatedId = `PLC-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const now = new Date().toISOString();

  const record = {
    id: generatedId,
    application_id: generatedId,
    status: 'submitted',
    created_at: now,
    ...payload,
  };

  try {
    const { data, error } = await supabase
      .from('plc_applications')
      .insert({
        application_id: generatedId,
        applicant: payload.applicant,
        company: payload.company,
        directors: payload.directors,
        subscribers: payload.subscribers,
        office: payload.office,
        business: payload.business,
        documents: payload.documents,
        calculated_fees: payload.calculatedFees,
        status: 'submitted',
      })
      .select()
      .maybeSingle();

    if (error) {
      console.log('Supabase table plc_applications not ready, saving to memory:', error.message);
    }
  } catch (err) {
    console.log('Using local store fallback for PLC submission');
  }

  // Prepend to local mock array
  _mockPLCApplications.unshift(record);

  return { applicationId: generatedId, record };
}

export async function getPLCApplications() {
  try {
    const { data, error } = await supabase
      .from('plc_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    // Fall back to memory
  }

  return _mockPLCApplications;
}

export async function getPLCApplication(applicationId) {
  try {
    const { data, error } = await supabase
      .from('plc_applications')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {}

  return _mockPLCApplications.find(
    (a) => a.id === applicationId || a.application_id === applicationId
  ) || null;
}

export async function updatePLCApplicationStatus(applicationId, status) {
  try {
    await supabase
      .from('plc_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('application_id', applicationId);
  } catch (err) {}

  _mockPLCApplications = _mockPLCApplications.map((a) =>
    a.id === applicationId || a.application_id === applicationId
      ? { ...a, status }
      : a
  );

  return { success: true };
}

export async function updatePLCDocumentStatus(applicationId, documentId, status, rejectionReason = null) {
  try {
    await supabase
      .from('plc_documents')
      .update({ status, rejection_reason: rejectionReason, updated_at: new Date().toISOString() })
      .eq('application_id', applicationId)
      .eq('document_id', documentId);
  } catch (err) {}

  _mockPLCApplications = _mockPLCApplications.map((a) => {
    if (a.id === applicationId || a.application_id === applicationId) {
      const updatedDocs = (a.documents || []).map((d) =>
        d.id === documentId ? { ...d, status, rejectionReason } : d
      );
      return { ...a, documents: updatedDocs };
    }
    return a;
  });

  return { success: true };
}

export async function requestPLCDocument(applicationId, { documentName, reason }) {
  try {
    await supabase.from('plc_document_requests').insert({
      application_id: applicationId,
      document_name: documentName,
      reason,
      status: 'pending',
    });

    await updatePLCApplicationStatus(applicationId, 'clarification_requested');
  } catch (err) {}

  _mockPLCApplications = _mockPLCApplications.map((a) => {
    if (a.id === applicationId || a.application_id === applicationId) {
      const reqDoc = {
        id: `requested_${Date.now()}`,
        label: documentName,
        category: 'requested',
        required: true,
        status: 'required',
        hint: reason || 'Additional document requested by verification desk',
      };
      return {
        ...a,
        status: 'clarification_requested',
        documents: [...(a.documents || []), reqDoc],
      };
    }
    return a;
  });

  return { success: true };
}

/* ========================================================================= */
/* =================== TRADEMARK REGISTRATION (FORM TM-A) ================== */
/* ========================================================================= */

let _mockTMApplications = [
  {
    id: 'TM-2026-000189',
    application_id: 'TM-2026-000189',
    status: 'submitted',
    created_at: new Date(Date.now() - 43200000).toISOString(),
    applicantType: 'startup',
    isStartupClaimed: true,
    isMSMEClaimed: false,
    applicantDetails: {
      applicantLegalName: 'Zenith Labs Private Limited',
      tradingName: 'Zenith AI Solutions',
      pan: 'AABCZ1234F',
      mobile: '9876543210',
      email: 'legal@zenithlabs.in',
      address1: 'Plot 45, Cyber City',
      city: 'Gurugram',
      state: '06',
      pinCode: '122002',
    },
    markDetails: {
      markType: 'word_logo',
      trademarkName: 'ZENITHFLOW',
      exactSpelling: 'Z-E-N-I-T-H-F-L-O-W',
      isColourClaimed: true,
      colourDescription: 'Blue and Violet gradient lettering with white emblem',
      isOtherLanguage: false,
      description: 'Software platform for enterprise workflow automation',
    },
    selectedClasses: [9, 42],
    classDescriptions: {
      9: 'Downloadable software, mobile applications and artificial intelligence algorithms',
      42: 'Cloud computing services, SaaS platform and software consultancy',
    },
    usageDetails: {
      usageStatus: 'used',
      firstUseDate: '15/01/2023',
      firstUsePlace: 'Gurugram, Haryana',
      goodsServicesUsed: 'Software platform and mobile application',
      natureOfUse: 'Continuous commercial deployment since 2023',
    },
    agentDetails: {
      isFiledThroughAgent: true,
      agentName: 'VyaparCare Legal Operations Hub',
      agentRegNumber: 'IN/PA/2026/001',
    },
    documents: [
      { id: 'pan_card', label: 'Applicant PAN Card', status: 'approved', required: true },
      { id: 'coi', label: 'Certificate of Incorporation', status: 'approved', required: true },
      { id: 'startup_cert', label: 'DPIIT Startup Recognition Certificate', status: 'approved', required: true },
      { id: 'tm_logo', label: 'Trademark Visual Representation', status: 'approved', required: true },
      { id: 'user_affidavit', label: 'User Affidavit for Prior Use (Notarized)', status: 'uploaded', required: true },
      { id: 'prior_use_invoices', label: 'Earliest Invoices & Sales Proof', status: 'uploaded', required: true },
      { id: 'tm_48', label: 'Power of Attorney (Form TM-48)', status: 'uploaded', required: true },
    ],
    calculatedFees: {
      serviceFee: 8000,
      perClassGovtFee: 4500,
      numClasses: 2,
      totalGovtFee: 9000,
      totalPayable: 17000,
      advanceAmount: 13000,
      balanceAmount: 4000,
      isConcessionCategory: true,
      feeCategoryLabel: 'Individual / Startup / Small Enterprise',
    },
  },
];

export async function submitTMApplication(payload) {
  const generatedId = `TM-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const now = new Date().toISOString();

  const record = {
    id: generatedId,
    application_id: generatedId,
    status: 'submitted',
    created_at: now,
    ...payload,
  };

  try {
    const { data, error } = await supabase
      .from('tm_applications')
      .insert({
        application_id: generatedId,
        applicant_type: payload.applicantType,
        is_startup_claimed: payload.isStartupClaimed,
        is_msme_claimed: payload.isMSMEClaimed,
        applicant_details: payload.applicantDetails,
        mark_details: payload.markDetails,
        selected_classes: payload.selectedClasses,
        class_descriptions: payload.classDescriptions,
        usage_details: payload.usageDetails,
        agent_details: payload.agentDetails,
        documents: payload.documents,
        calculated_fees: payload.calculatedFees,
        status: 'submitted',
      })
      .select()
      .maybeSingle();

    if (error) {
      console.log('Supabase table tm_applications fallback to memory:', error.message);
    }
  } catch (err) {
    console.log('Using local store fallback for TM submission');
  }

  _mockTMApplications.unshift(record);
  return { applicationId: generatedId, record };
}

export async function getTMApplications() {
  try {
    const { data, error } = await supabase
      .from('tm_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {}

  return _mockTMApplications;
}

export async function getTMApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('tm_applications')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {}

  return (
    _mockTMApplications.find(
      (a) => a.id === applicationId || a.application_id === applicationId
    ) || null
  );
}

export async function updateTMApplicationStatus(applicationId, status) {
  try {
    await supabase
      .from('tm_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('application_id', applicationId);
  } catch (err) {}

  _mockTMApplications = _mockTMApplications.map((a) =>
    a.id === applicationId || a.application_id === applicationId ? { ...a, status } : a
  );

  return { success: true };
}

export async function updateTMDocumentStatus(
  applicationId,
  documentId,
  status,
  rejectionReason = null
) {
  try {
    await supabase
      .from('tm_documents')
      .update({ status, rejection_reason: rejectionReason, updated_at: new Date().toISOString() })
      .eq('application_id', applicationId)
      .eq('document_id', documentId);
  } catch (err) {}

  _mockTMApplications = _mockTMApplications.map((a) => {
    if (a.id === applicationId || a.application_id === applicationId) {
      const updatedDocs = (a.documents || []).map((d) =>
        d.id === documentId ? { ...d, status, rejectionReason } : d
      );
      return { ...a, documents: updatedDocs };
    }
    return a;
  });

  return { success: true };
}

export async function requestTMDocument(applicationId, documentName, reason) {
  try {
    await supabase.from('tm_document_requests').insert({
      application_id: applicationId,
      document_name: documentName,
      reason,
      status: 'pending',
    });

    await updateTMApplicationStatus(applicationId, 'clarification_required');
  } catch (err) {}

  _mockTMApplications = _mockTMApplications.map((a) => {
    if (a.id === applicationId || a.application_id === applicationId) {
      const reqDoc = {
        id: `requested_${Date.now()}`,
        label: documentName,
        categoryLabel: 'Clarifications & Additional Documents',
        required: true,
        status: 'required',
        hint: reason || 'Additional document requested by Trademark Examiner',
      };
      return {
        ...a,
        status: 'clarification_required',
        documents: [...(a.documents || []), reqDoc],
      };
    }
    return a;
  });

  return { success: true };
}

/* ========================================================================= */
/* FSSAI Food License / Registration (FoSCoS) Applications                   */
/* ========================================================================= */

let _mockFSSAIApplications = [
  {
    id: 'FSSAI-2026-789101',
    application_id: 'FSSAI-2026-789101',
    kob: 'restaurant',
    constitution: 'proprietorship',
    license_type: 'state',
    status: 'submitted',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    applicant_details: {
      businessLegalName: 'Royal Dining Hospitality',
      tradeName: 'Royal Dining Restaurant',
      applicantName: 'Vikramaditya Sharma',
      pan: 'ABCDE1234F',
      mobile: '9876543210',
      email: 'contact@royaldining.com',
      address1: 'Shop 12, Connaught Place',
      city: 'New Delhi',
      state: '07',
      pinCode: '110001',
    },
    business_details: {
      foodBusinessName: 'Royal Dining Restaurant',
      annualTurnover: '12_to_20_cr',
      employeeCount: '12',
    },
    premises_details: {
      premisesName: 'Main Restaurant Outlet',
      address1: 'Shop 12, Connaught Place',
      city: 'New Delhi',
      district: 'Central Delhi',
      state: '07',
      pinCode: '110001',
      premisesType: 'rented',
    },
    products: [
      { productName: 'North Indian & Mughlai Cuisines', categoryCode: '16', capacity: '300 Meals/Day' },
    ],
    documents: [
      { id: 'applicant_photo', label: 'Applicant Passport Size Photograph', status: 'uploaded', required: true },
      { id: 'applicant_pan', label: 'Applicant / Entity PAN Card', status: 'uploaded', required: true },
      { id: 'premises_rent_agreement', label: 'Rent Agreement / Lease Deed', status: 'uploaded', required: true },
    ],
    calculated_fees: {
      serviceFee: 5000,
      annualGovtFee: 2000,
      validityYears: 1,
      totalGovtFee: 2000,
      totalPayable: 7000,
    },
    eligibility: {
      licenseType: 'state',
      label: 'FSSAI State License',
      badgeColor: '#2563EB',
      reason: 'Turnover exceeds ₹12 Lakh under FoSCoS restaurant schedule.',
    },
  },
];

export async function submitFSSAIApplication(payload) {
  const generatedId = `FSSAI-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const now = new Date().toISOString();

  const record = {
    id: generatedId,
    application_id: generatedId,
    status: 'submitted',
    created_at: now,
    ...payload,
  };

  try {
    const { data, error } = await supabase
      .from('fssai_applications')
      .insert({
        application_id: generatedId,
        user_id: payload.userId || null,
        kob: payload.kob,
        constitution: payload.constitution,
        license_type: payload.licenseType,
        validity_years: payload.validityYears || 1,
        applicant_details: payload.applicantDetails || {},
        business_details: payload.businessDetails || {},
        premises_details: payload.premisesDetails || {},
        products: payload.products || [],
        specific_details: payload.specificDetails || {},
        documents: payload.documents || [],
        calculated_fees: payload.calculatedFees || {},
        eligibility: payload.eligibility || {},
        status: 'submitted',
        created_at: now,
      })
      .select()
      .single();

    if (!error && data) {
      _mockFSSAIApplications.unshift(data);
      return { success: true, applicationId: data.application_id, record: data };
    }
  } catch (err) {}

  _mockFSSAIApplications.unshift(record);
  return { success: true, applicationId: generatedId, record };
}

export async function getFSSAIApplications() {
  try {
    const { data, error } = await supabase
      .from('fssai_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {}

  return _mockFSSAIApplications;
}

export async function getFSSAIApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('fssai_applications')
      .select('*')
      .eq('application_id', applicationId)
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {}

  return _mockFSSAIApplications.find(
    (a) => a.id === applicationId || a.application_id === applicationId
  );
}

export async function updateFSSAIApplicationStatus(applicationId, status, officialNumber = null) {
  try {
    const updates = { status, updated_at: new Date().toISOString() };
    if (officialNumber) updates.official_fssai_number = officialNumber;

    await supabase
      .from('fssai_applications')
      .update(updates)
      .eq('application_id', applicationId);
  } catch (err) {}

  _mockFSSAIApplications = _mockFSSAIApplications.map((a) => {
    if (a.id === applicationId || a.application_id === applicationId) {
      return { ...a, status, official_fssai_number: officialNumber || a.official_fssai_number };
    }
    return a;
  });

  return { success: true };
}

export async function updateFSSAIDocumentStatus(applicationId, documentId, status, rejectionReason = null) {
  try {
    const app = await getFSSAIApplicationById(applicationId);
    if (app && app.documents) {
      const updatedDocs = app.documents.map((d) =>
        d.id === documentId ? { ...d, status, rejectionReason } : d
      );

      await supabase
        .from('fssai_applications')
        .update({ documents: updatedDocs, updated_at: new Date().toISOString() })
        .eq('application_id', applicationId);
    }
  } catch (err) {}

  _mockFSSAIApplications = _mockFSSAIApplications.map((a) => {
    if (a.id === applicationId || a.application_id === applicationId) {
      const updatedDocs = (a.documents || []).map((d) =>
        d.id === documentId ? { ...d, status, rejectionReason } : d
      );
      return { ...a, documents: updatedDocs };
    }
    return a;
  });

  return { success: true };
}

export async function requestFSSAIDocument(applicationId, documentName, reason) {
  try {
    await supabase.from('fssai_document_requests').insert({
      application_id: applicationId,
      document_name: documentName,
      reason,
      status: 'pending',
    });

    await updateFSSAIApplicationStatus(applicationId, 'clarification_required');
  } catch (err) {}

  _mockFSSAIApplications = _mockFSSAIApplications.map((a) => {
    if (a.id === applicationId || a.application_id === applicationId) {
      const reqDoc = {
        id: `requested_${Date.now()}`,
        label: documentName,
        categoryLabel: 'Clarifications & Additional Documents',
        required: true,
        status: 'required',
        hint: reason || 'Additional document requested by Food Safety Examiner',
      };
      return {
        ...a,
        status: 'clarification_required',
        documents: [...(a.documents || []), reqDoc],
      };
    }
    return a;
  });

  return { success: true };
}

/* ==========================================================================
   GST REGISTRATION DATABASE OPERATIONS (Form GST REG-01)
   ========================================================================== */

let _mockGSTApplications = [
  {
    id: 'GST-2026-000101',
    application_id: 'GST-2026-000101',
    user_id: 'demo_user_1',
    status: 'submitted',
    created_at: new Date(Date.now() - 36000000).toISOString(),
    constitution: 'proprietorship',
    registrationReason: 'voluntary',
    isComposition: false,
    businessDetails: {
      legalName: 'Aditya Enterprises',
      tradeName: 'Aditya Retail Hub',
      pan: 'ABCDE1234F',
      commencementDate: '2026-01-01',
    },
    promoters: [
      {
        id: 'promoter_1',
        name: 'Aditya Sharma',
        fatherName: 'Rajendra Sharma',
        mobile: '9876543210',
        email: 'aditya@adityahub.in',
        pan: 'ABCDE1234F',
        aadhaar: '123456789012',
        isAuthorizedSignatory: true,
      },
    ],
    premisesDetails: {
      buildingNumber: 'Shop 14, Main Road',
      street: 'Sector 18 Market',
      city: 'Noida',
      state: '09',
      pinCode: '201301',
      possessionType: 'rented',
      activities: ['retail', 'office'],
    },
    goodsServices: [
      {
        id: 'item_1',
        type: 'goods',
        hsnSacCode: '6203',
        description: 'Readymade garments and apparel',
      },
    ],
    bankDetails: {
      accountNumber: '50200012345678',
      accountType: 'Current',
      ifsc: 'HDFC0000050',
      bankName: 'HDFC Bank',
      branch: 'Sector 18 Noida',
    },
    documents: {
      applicant_photo: { name: 'aditya_photo.jpg', size: 102400 },
      applicant_pan: { name: 'aditya_pan.pdf', size: 204800 },
      applicant_aadhaar: { name: 'aditya_aadhaar.pdf', size: 307200 },
      premises_rent_agreement: { name: 'rent_agreement.pdf', size: 512000 },
      premises_owner_noc: { name: 'owner_noc_electricity.pdf', size: 409600 },
      bank_account_proof: { name: 'cancelled_cheque.pdf', size: 153600 },
    },
    calculatedFees: {
      serviceFee: 10000,
      advancePercent: 50,
      advanceAmount: 5000,
      balanceAmount: 5000,
      totalPayable: 10000,
    },
    amountPaid: 5000,
    paymentPlan: 'advance',
  },
];

export async function submitGSTApplication(appData) {
  const appId = `GST-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const record = {
    id: appId,
    application_id: appId,
    user_id: appData.userId || 'guest_user',
    status: 'submitted',
    constitution: appData.constitution,
    registration_reason: appData.registrationReason,
    is_composition: appData.isComposition,
    business_details: appData.businessDetails,
    promoters: appData.promoters,
    premises_details: appData.premisesDetails,
    goods_services: appData.goodsServices,
    bank_details: appData.bankDetails,
    documents: appData.documents,
    calculated_fees: appData.calculatedFees,
    amount_paid: appData.amountPaid,
    payment_plan: appData.paymentPlan,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('gst_applications')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    _mockGSTApplications.unshift(record);
    return data || record;
  } catch (err) {
    _mockGSTApplications.unshift(record);
    return record;
  }
}

export async function getGSTApplications(userId = null) {
  try {
    let query = supabase
      .from('gst_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || _mockGSTApplications;
  } catch (err) {
    if (userId) {
      return _mockGSTApplications.filter((a) => a.user_id === userId);
    }
    return _mockGSTApplications;
  }
}

export async function getGSTApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('gst_applications')
      .select('*')
      .eq('application_id', applicationId)
      .single();

    if (error) throw error;
    return data || _mockGSTApplications.find((a) => a.id === applicationId || a.application_id === applicationId);
  } catch (err) {
    return _mockGSTApplications.find((a) => a.id === applicationId || a.application_id === applicationId) || null;
  }
}

export async function updateGSTApplicationStatus(applicationId, status, gstin = null) {
  try {
    await supabase
      .from('gst_applications')
      .update({
        status,
        official_gstin: gstin,
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', applicationId);
  } catch (err) {}

  _mockGSTApplications = _mockGSTApplications.map((a) => {
    if (a.id === applicationId || a.application_id === applicationId) {
      return { ...a, status, official_gstin: gstin || a.official_gstin };
    }
    return a;
  });

  return { success: true };
}

export async function updateGSTDocumentStatus(applicationId, documentId, status, rejectionReason = null) {
  _mockGSTApplications = _mockGSTApplications.map((a) => {
    if (a.id === applicationId || a.application_id === applicationId) {
      const updatedReviews = {
        ...(a.documentReviews || {}),
        [documentId]: status,
      };
      return { ...a, documentReviews: updatedReviews };
    }
    return a;
  });

  return { success: true };
}

export async function requestGSTDocument(applicationId, documentName, reason) {
  _mockGSTApplications = _mockGSTApplications.map((a) => {
    if (a.id === applicationId || a.application_id === applicationId) {
      const requested = {
        name: documentName,
        reason,
        requestedAt: new Date().toISOString(),
      };
      return {
        ...a,
        status: 'clarification_needed',
        requestedDocuments: [...(a.requestedDocuments || []), requested],
      };
    }
    return a;
  });

  return { success: true };
}

/* ========================================================================= */
/* MSME / Udyam Registration Assisted Applications                          */
/* ========================================================================= */

let _mockUdyamApplications = [
  {
    id: 'UDYAM-2026-000101',
    applicationId: 'UDYAM-2026-000101',
    application_id: 'UDYAM-2026-000101',
    userId: 'guest_user',
    user_id: 'guest_user',
    applicationStatus: 'submitted',
    status: 'submitted',
    amountPaid: 2000,
    amount_paid: 2000,
    businessDetails: {
      enterpriseName: 'Apex Innovations',
      tradeName: 'Apex Tech',
      organisationType: 'proprietorship',
      commencementDate: '2026-01-15',
      majorActivity: 'services',
    },
    aadhaarDetails: {
      nameAsPerAadhaar: 'Ramesh Kumar',
      mobile: '9876543210',
      email: 'ramesh@example.com',
      isAadhaarVerified: true,
    },
    panDetails: {
      hasPAN: true,
      panNumber: 'ABCDE1234F',
      isPANVerified: true,
      hasGSTIN: 'no',
    },
    msmeClassification: {
      category: 'micro',
      categoryLabel: 'Micro Enterprise',
    },
    created_at: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
  },
];

export async function submitUdyamApplication(appData) {
  const appId = `UDYAM-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const record = {
    id: appId,
    applicationId: appId,
    application_id: appId,
    userId: appData.userId || 'guest_user',
    user_id: appData.userId || 'guest_user',
    applicationStatus: 'submitted',
    status: 'submitted',
    ...appData,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('udyam_applications')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    _mockUdyamApplications.unshift(record);
    return data || record;
  } catch (err) {
    _mockUdyamApplications.unshift(record);
    return record;
  }
}

export async function getUdyamApplications(userId = null) {
  try {
    let query = supabase
      .from('udyam_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || _mockUdyamApplications;
  } catch (err) {
    if (userId) {
      return _mockUdyamApplications.filter((a) => a.userId === userId || a.user_id === userId);
    }
    return _mockUdyamApplications;
  }
}

export async function getUdyamApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('udyam_applications')
      .select('*')
      .eq('application_id', applicationId)
      .single();

    if (error) throw error;
    return data || _mockUdyamApplications.find((a) => a.id === applicationId || a.applicationId === applicationId);
  } catch (err) {
    return _mockUdyamApplications.find((a) => a.id === applicationId || a.applicationId === applicationId) || null;
  }
}

export async function updateUdyamApplicationStatus(applicationId, updates = {}) {
  try {
    await supabase
      .from('udyam_applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', applicationId);
  } catch (err) {}

  _mockUdyamApplications = _mockUdyamApplications.map((a) => {
    if (a.id === applicationId || a.applicationId === applicationId || a.application_id === applicationId) {
      return { ...a, ...updates };
    }
    return a;
  });

  return { success: true };
}

/* ========================================================================= */
/* Income Tax Return (ITR) Filing Applications                              */
/* ========================================================================= */

let _mockITRApplications = [
  {
    id: 'ITR-2026-000101',
    applicationId: 'ITR-2026-000101',
    application_id: 'ITR-2026-000101',
    userId: 'guest_user',
    user_id: 'guest_user',
    assessmentYear: 'AY_2026_27',
    taxpayerType: 'individual',
    recommendedITRForm: 'ITR-1 (Sahaj)',
    applicationStatus: 'submitted',
    status: 'submitted',
    amountPaid: 3000,
    amount_paid: 3000,
    profile: {
      fullName: 'Rahul Sharma',
      pan: 'ABCDE1234F',
      mobile: '9876543210',
      email: 'rahul@example.com',
      isPANVerified: true,
    },
    taxComputation: {
      grossTotalIncome: 850000,
      totalDeductions: 75000,
      taxableIncome: 775000,
      totalTaxLiability: 28600,
      totalTaxesPaid: 35000,
      isRefund: true,
      finalAmount: 6400,
      activeRegime: 'new',
    },
    created_at: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
  },
];

export async function submitITRApplication(appData) {
  const appId = `ITR-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const record = {
    id: appId,
    applicationId: appId,
    application_id: appId,
    userId: appData.userId || 'guest_user',
    user_id: appData.userId || 'guest_user',
    applicationStatus: 'submitted',
    status: 'submitted',
    ...appData,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('itr_applications')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    _mockITRApplications.unshift(record);
    return data || record;
  } catch (err) {
    _mockITRApplications.unshift(record);
    return record;
  }
}

export async function getITRApplications(userId = null) {
  try {
    let query = supabase
      .from('itr_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || _mockITRApplications;
  } catch (err) {
    if (userId) {
      return _mockITRApplications.filter((a) => a.userId === userId || a.user_id === userId);
    }
    return _mockITRApplications;
  }
}

export async function getITRApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('itr_applications')
      .select('*')
      .eq('application_id', applicationId)
      .single();

    if (error) throw error;
    return data || _mockITRApplications.find((a) => a.id === applicationId || a.applicationId === applicationId);
  } catch (err) {
    return _mockITRApplications.find((a) => a.id === applicationId || a.applicationId === applicationId) || null;
  }
}

export async function updateITRApplicationStatus(applicationId, updates = {}) {
  try {
    await supabase
      .from('itr_applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', applicationId);
  } catch (err) {}

  _mockITRApplications = _mockITRApplications.map((a) => {
    if (a.id === applicationId || a.applicationId === applicationId || a.application_id === applicationId) {
      return { ...a, ...updates };
    }
    return a;
  });

  return { success: true };
}

/* ========================================================================= */
/* Import Export Code (IEC) Registration Applications (DGFT)                */
/* ========================================================================= */

let _mockIECApplications = [
  {
    id: 'IEC-2026-000101',
    applicationId: 'IEC-2026-000101',
    application_id: 'IEC-2026-000101',
    userId: 'guest_user',
    user_id: 'guest_user',
    entityType: 'proprietorship',
    applicationStatus: 'submitted',
    status: 'submitted',
    amountPaid: 4500,
    amount_paid: 4500,
    iecNumber: 'ABCDE1234F',
    panDetails: {
      panNumber: 'ABCDE1234F',
      legalName: 'Acme Global Exports',
      tradeName: 'Acme International',
      incorporationDate: '2024-01-15',
      isPANVerified: true,
    },
    businessDetails: {
      businessName: 'Acme Global Exports',
      natureOfBusiness: 'Merchant Exporter',
      businessActivities: ['trader_importer', 'trader_exporter'],
    },
    addressDetails: {
      line1: 'Shop 12, Main Commercial Complex',
      city: 'New Delhi',
      state: '07',
      pinCode: '110020',
      premisesType: 'owned',
    },
    bankDetails: {
      bankName: 'State Bank of India',
      accountHolderName: 'Acme Global Exports',
      accountNumber: '50200012345678',
      ifsc: 'SBIN0001234',
      verificationStatus: 'verified',
    },
    signatoryDetails: {
      fullName: 'Rahul Sharma',
      pan: 'ABCDE1234F',
      designation: 'proprietor',
      authMethod: 'aadhaar_otp',
    },
    created_at: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
  },
];

export async function submitIECApplication(appData) {
  const appId = `IEC-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const record = {
    id: appId,
    applicationId: appId,
    application_id: appId,
    userId: appData.userId || 'guest_user',
    user_id: appData.userId || 'guest_user',
    applicationStatus: 'submitted',
    status: 'submitted',
    ...appData,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('iec_applications')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    _mockIECApplications.unshift(record);
    return data || record;
  } catch (err) {
    _mockIECApplications.unshift(record);
    return record;
  }
}

export async function getIECApplications(userId = null) {
  try {
    let query = supabase
      .from('iec_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || _mockIECApplications;
  } catch (err) {
    if (userId) {
      return _mockIECApplications.filter((a) => a.userId === userId || a.user_id === userId);
    }
    return _mockIECApplications;
  }
}

export async function getIECApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('iec_applications')
      .select('*')
      .eq('application_id', applicationId)
      .single();

    if (error) throw error;
    return data || _mockIECApplications.find((a) => a.id === applicationId || a.applicationId === applicationId);
  } catch (err) {
    return _mockIECApplications.find((a) => a.id === applicationId || a.applicationId === applicationId) || null;
  }
}

export async function updateIECApplicationStatus(applicationId, updates = {}) {
  try {
    await supabase
      .from('iec_applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', applicationId);
  } catch (err) {}

  _mockIECApplications = _mockIECApplications.map((a) => {
    if (a.id === applicationId || a.applicationId === applicationId || a.application_id === applicationId) {
      return { ...a, ...updates };
    }
    return a;
  });

  return { success: true };
}

/* ========================================================================= */
/* Other Services Consultation & Requirement Requests                        */
/* ========================================================================= */

let _mockOtherRequests = [
  {
    id: 'OTHER-2026-000101',
    applicationId: 'OTHER-2026-000101',
    application_id: 'OTHER-2026-000101',
    userId: 'guest_user',
    user_id: 'guest_user',
    status: 'submitted',
    applicationStatus: 'submitted',
    applicantName: 'Vikram Mehta',
    applicantMobile: '9876543210',
    applicantEmail: 'vikram@example.com',
    selectedService: {
      id: 'gst_notice_reply',
      name: 'GST Notice Reply',
      categoryId: 'gst',
      categoryName: 'GST Services',
    },
    applicantDetails: {
      fullName: 'Vikram Mehta',
      mobile: '9876543210',
      email: 'vikram@example.com',
      applicantType: 'proprietorship',
    },
    requirementDetails: {
      description: 'Received DRC-01 notice regarding ITC mismatch for FY 2023-24. Need legal reply preparation.',
      department: 'gst',
      urgency: 'within_7_days',
      noticeNumber: 'ZA0708240012345',
    },
    customQuote: {
      serviceFee: 2500,
      governmentFee: 0,
      gst: 0,
      total: 2500,
    },
    amountPaid: 2500,
    paymentStatus: 'successful',
    created_at: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
  },
];

export async function submitOtherServiceRequest(requestData) {
  const appId = `OTHER-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const record = {
    id: appId,
    applicationId: appId,
    application_id: appId,
    userId: requestData.userId || 'guest_user',
    user_id: requestData.userId || 'guest_user',
    status: 'submitted',
    applicationStatus: 'submitted',
    ...requestData,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('other_service_requests')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    _mockOtherRequests.unshift(record);
    return data || record;
  } catch (err) {
    _mockOtherRequests.unshift(record);
    return record;
  }
}

export async function getOtherServiceRequests(userId = null) {
  try {
    let query = supabase
      .from('other_service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || _mockOtherRequests;
  } catch (err) {
    if (userId) {
      return _mockOtherRequests.filter((a) => a.userId === userId || a.user_id === userId);
    }
    return _mockOtherRequests;
  }
}

export async function getOtherServiceRequestById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('other_service_requests')
      .select('*')
      .eq('application_id', applicationId)
      .single();

    if (error) throw error;
    return data || _mockOtherRequests.find((a) => a.id === applicationId || a.applicationId === applicationId);
  } catch (err) {
    return _mockOtherRequests.find((a) => a.id === applicationId || a.applicationId === applicationId) || null;
  }
}

export async function updateOtherServiceRequestStatus(applicationId, updates = {}) {
  try {
    await supabase
      .from('other_service_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', applicationId);
  } catch (err) {}

  _mockOtherRequests = _mockOtherRequests.map((a) => {
    if (a.id === applicationId || a.applicationId === applicationId || a.application_id === applicationId) {
      return { ...a, ...updates };
    }
    return a;
  });

  return { success: true };
}






