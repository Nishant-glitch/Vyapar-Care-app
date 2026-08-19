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

export async function submitPLCApplication(payload) {
  const generatedId = `PLC-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const now = new Date().toISOString();

  const insertPayload = {
    application_id: generatedId,
    user_id: payload.userId || payload.user_id || null,
    applicant: payload.applicant || {},
    company: payload.company || {},
    directors: payload.directors || [],
    subscribers: payload.subscribers || [],
    office: payload.office || {},
    business: payload.business || {},
    calculated_fees: payload.calculatedFees || payload.calculated_fees || {},
    status: 'submitted',
    created_at: now,
  };

  try {
    const { data, error } = await supabase
      .from('plc_applications')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert failed:', error.message);
      throw error;
    }

    if (payload.documents && Array.isArray(payload.documents) && payload.documents.length > 0) {
      const docRows = payload.documents.map((d) => ({
        application_id: generatedId,
        document_id: d.id,
        label: d.label || d.name || d.id,
        category: d.category || 'general',
        required: d.required !== false,
        status: d.status || 'uploaded',
        file_name: d.file?.name || null,
        file_size: d.file?.size || null,
        mime_type: d.file?.mimeType || null,
      }));
      const { error: docErr } = await supabase.from('plc_documents').insert(docRows);
      if (docErr) console.warn('PLC documents insert warning:', docErr.message);
    }

    return { applicationId: generatedId, application_id: generatedId, record: data };
  } catch (err) {
    console.error('Supabase insert failed:', err.message);
    throw err;
  }
}

export async function getPLCApplications() {
  try {
    const { data, error } = await supabase
      .from('plc_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getPLCApplications failed:', error.message);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('getPLCApplications error:', err.message);
    throw err;
  }
}

export async function getPLCApplication(applicationId) {
  try {
    const { data, error } = await supabase
      .from('plc_applications')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (error) {
      console.error('Supabase getPLCApplication failed:', error.message);
      throw error;
    }
    return data || null;
  } catch (err) {
    console.error('getPLCApplication error:', err.message);
    throw err;
  }
}

export async function updatePLCApplicationStatus(applicationId, status) {
  try {
    const { data, error } = await supabase
      .from('plc_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('application_id', applicationId)
      .select();

    if (error) {
      console.error('Supabase updatePLCApplicationStatus failed:', error.message);
      throw error;
    }
    return { success: true, data };
  } catch (err) {
    console.error('updatePLCApplicationStatus error:', err.message);
    throw err;
  }
}

export async function updatePLCDocumentStatus(applicationId, documentId, status, rejectionReason = null) {
  try {
    const { data, error } = await supabase
      .from('plc_documents')
      .update({ status, rejection_reason: rejectionReason, updated_at: new Date().toISOString() })
      .eq('application_id', applicationId)
      .eq('document_id', documentId)
      .select();

    if (error) {
      console.error('Supabase updatePLCDocumentStatus failed:', error.message);
      throw error;
    }
    return { success: true, data };
  } catch (err) {
    console.error('updatePLCDocumentStatus error:', err.message);
    throw err;
  }
}

export async function requestPLCDocument(applicationId, { documentName, reason }) {
  try {
    const { error: reqErr } = await supabase.from('plc_document_requests').insert({
      application_id: applicationId,
      document_name: documentName,
      reason,
      status: 'pending',
    });
    if (reqErr) throw reqErr;

    await updatePLCApplicationStatus(applicationId, 'clarification_requested');
    return { success: true };
  } catch (err) {
    console.error('requestPLCDocument error:', err.message);
    throw err;
  }
}

/* ========================================================================= */
/* =================== TRADEMARK REGISTRATION (FORM TM-A) ================== */
/* ========================================================================= */

export async function submitTMApplication(payload, userId = null) {
  const generatedId = `TM-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const now = new Date().toISOString();

  const insertPayload = {
    application_id: generatedId,
    user_id: userId || payload.userId || payload.user_id || null,
    applicant_type: payload.applicantType || payload.applicant_type || 'individual',
    is_startup_claimed: Boolean(payload.isStartupClaimed || payload.is_startup_claimed),
    is_msme_claimed: Boolean(payload.isMSMEClaimed || payload.is_msme_claimed),
    applicant_details: payload.applicantDetails || payload.applicant_details || {},
    mark_details: payload.markDetails || payload.mark_details || {},
    selected_classes: payload.selectedClasses || payload.selected_classes || [],
    class_descriptions: payload.classDescriptions || payload.class_descriptions || {},
    usage_details: payload.usageDetails || payload.usage_details || {},
    agent_details: payload.agentDetails || payload.agent_details || {},
    documents: payload.documents || [],
    calculated_fees: payload.calculatedFees || payload.calculated_fees || {},
    status: 'submitted',
    created_at: now,
  };

  try {
    const { data, error } = await supabase
      .from('tm_applications')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert failed:', error.message);
      throw error;
    }
    return { applicationId: generatedId, application_id: generatedId, record: data };
  } catch (err) {
    console.error('Supabase insert failed:', err.message);
    throw err;
  }
}

export async function getTMApplications() {
  try {
    const { data, error } = await supabase
      .from('tm_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getTMApplications failed:', error.message);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('getTMApplications error:', err.message);
    throw err;
  }
}

export async function getTMApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('tm_applications')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (error) {
      console.error('Supabase getTMApplicationById failed:', error.message);
      throw error;
    }
    return data || null;
  } catch (err) {
    console.error('getTMApplicationById error:', err.message);
    throw err;
  }
}

export async function updateTMApplicationStatus(applicationId, status) {
  try {
    const { data, error } = await supabase
      .from('tm_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('application_id', applicationId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('updateTMApplicationStatus error:', err.message);
    throw err;
  }
}

export async function updateTMDocumentStatus(
  applicationId,
  documentId,
  status,
  rejectionReason = null
) {
  try {
    const app = await getTMApplicationById(applicationId);
    if (app && Array.isArray(app.documents)) {
      const updatedDocs = app.documents.map((d) =>
        d.id === documentId ? { ...d, status, rejectionReason } : d
      );
      const { data, error } = await supabase
        .from('tm_applications')
        .update({ documents: updatedDocs, updated_at: new Date().toISOString() })
        .eq('application_id', applicationId)
        .select();

      if (error) throw error;
      return { success: true, data };
    }
    return { success: true };
  } catch (err) {
    console.error('updateTMDocumentStatus error:', err.message);
    throw err;
  }
}

export async function requestTMDocument(applicationId, documentName, reason) {
  try {
    const { error: reqErr } = await supabase.from('tm_document_requests').insert({
      application_id: applicationId,
      document_name: documentName,
      reason,
      status: 'pending',
    });
    if (reqErr) throw reqErr;

    await updateTMApplicationStatus(applicationId, 'clarification_required');
    return { success: true };
  } catch (err) {
    console.error('requestTMDocument error:', err.message);
    throw err;
  }
}

/* ========================================================================= */
/* FSSAI Food License / Registration (FoSCoS) Applications                   */
/* ========================================================================= */

export async function submitFSSAIApplication(payload) {
  const generatedId = `FSSAI-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const now = new Date().toISOString();

  const insertPayload = {
    application_id: generatedId,
    user_id: payload.userId || payload.user_id || null,
    kob: payload.kob || 'restaurant',
    constitution: payload.constitution || 'proprietorship',
    license_type: payload.licenseType || payload.license_type || 'state',
    validity_years: Number(payload.validityYears || payload.validity_years || 1),
    applicant_details: payload.applicantDetails || payload.applicant_details || {},
    business_details: payload.businessDetails || payload.business_details || {},
    premises_details: payload.premisesDetails || payload.premises_details || {},
    products: payload.products || [],
    specific_details: payload.specificDetails || payload.specific_details || {},
    documents: payload.documents || [],
    calculated_fees: payload.calculatedFees || payload.calculated_fees || {},
    eligibility: payload.eligibility || {},
    status: 'submitted',
    created_at: now,
  };

  try {
    const { data, error } = await supabase
      .from('fssai_applications')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert failed:', error.message);
      throw error;
    }

    return { success: true, applicationId: generatedId, application_id: generatedId, record: data };
  } catch (err) {
    console.error('Supabase insert failed:', err.message);
    throw err;
  }
}

export async function getFSSAIApplications() {
  try {
    const { data, error } = await supabase
      .from('fssai_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getFSSAIApplications failed:', error.message);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('getFSSAIApplications error:', err.message);
    throw err;
  }
}

export async function getFSSAIApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('fssai_applications')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (error) {
      console.error('Supabase getFSSAIApplicationById failed:', error.message);
      throw error;
    }
    return data || null;
  } catch (err) {
    console.error('getFSSAIApplicationById error:', err.message);
    throw err;
  }
}

export async function updateFSSAIApplicationStatus(applicationId, status, officialNumber = null) {
  try {
    const updates = { status, updated_at: new Date().toISOString() };
    if (officialNumber) updates.official_fssai_number = officialNumber;

    const { data, error } = await supabase
      .from('fssai_applications')
      .update(updates)
      .eq('application_id', applicationId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('updateFSSAIApplicationStatus error:', err.message);
    throw err;
  }
}

export async function updateFSSAIDocumentStatus(applicationId, documentId, status, rejectionReason = null) {
  try {
    const app = await getFSSAIApplicationById(applicationId);
    if (app && Array.isArray(app.documents)) {
      const updatedDocs = app.documents.map((d) =>
        d.id === documentId ? { ...d, status, rejectionReason } : d
      );

      const { data, error } = await supabase
        .from('fssai_applications')
        .update({ documents: updatedDocs, updated_at: new Date().toISOString() })
        .eq('application_id', applicationId)
        .select();

      if (error) throw error;
      return { success: true, data };
    }
    return { success: true };
  } catch (err) {
    console.error('updateFSSAIDocumentStatus error:', err.message);
    throw err;
  }
}

export async function requestFSSAIDocument(applicationId, documentName, reason) {
  try {
    const { error: reqErr } = await supabase.from('fssai_document_requests').insert({
      application_id: applicationId,
      document_name: documentName,
      reason,
      status: 'pending',
    });
    if (reqErr) throw reqErr;

    await updateFSSAIApplicationStatus(applicationId, 'clarification_required');
    return { success: true };
  } catch (err) {
    console.error('requestFSSAIDocument error:', err.message);
    throw err;
  }
}

/* ==========================================================================
   GST REGISTRATION DATABASE OPERATIONS (Form GST REG-01)
   ========================================================================== */

export async function submitGSTApplication(appData) {
  const appId = `GST-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const insertPayload = {
    application_id: appId,
    user_id: appData.userId || appData.user_id || 'guest_user',
    status: 'submitted',
    constitution: appData.constitution || 'proprietorship',
    registration_reason: appData.registrationReason || appData.registration_reason || 'voluntary',
    is_composition: Boolean(appData.isComposition || appData.is_composition),
    business_details: appData.businessDetails || appData.business_details || {},
    promoters: appData.promoters || [],
    premises_details: appData.premisesDetails || appData.premises_details || {},
    goods_services: appData.goodsServices || appData.goods_services || [],
    bank_details: appData.bankDetails || appData.bank_details || {},
    documents: appData.documents || {},
    custom_documents: appData.customDocuments || appData.custom_documents || [],
    calculated_fees: appData.calculatedFees || appData.calculated_fees || {},
    amount_paid: Number(appData.amountPaid || appData.amount_paid || 0),
    payment_plan: appData.paymentPlan || appData.payment_plan || 'advance',
  };

  try {
    const { data, error } = await supabase
      .from('gst_applications')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert failed:', error.message);
      throw error;
    }

    // Send notification if user logged in
    if (appData.userId && appData.userId !== 'guest_user') {
      try {
        await supabase.from('notifications').insert({
          user_id: appData.userId,
          title: 'GST Application Submitted',
          description: `Your GST Registration application (${appId}) has been successfully submitted and is under scrutiny.`,
          type: 'info',
          read: false,
        });
      } catch (notifErr) {
        console.warn('Notification insert warning:', notifErr.message);
      }
    }

    return data;
  } catch (err) {
    console.error('Supabase insert failed:', err.message);
    throw err;
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
    if (error) {
      console.error('Supabase getGSTApplications failed:', error.message);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('getGSTApplications error:', err.message);
    throw err;
  }
}

export async function getGSTApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('gst_applications')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (error) {
      console.error('Supabase getGSTApplicationById failed:', error.message);
      throw error;
    }
    return data || null;
  } catch (err) {
    console.error('getGSTApplicationById error:', err.message);
    throw err;
  }
}

export async function updateGSTApplicationStatus(applicationId, status, gstin = null) {
  try {
    const { data, error } = await supabase
      .from('gst_applications')
      .update({
        status,
        official_gstin: gstin,
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', applicationId)
      .select();

    if (error) {
      console.error('Supabase updateGSTApplicationStatus failed:', error.message);
      throw error;
    }
    return { success: true, data };
  } catch (err) {
    console.error('updateGSTApplicationStatus error:', err.message);
    throw err;
  }
}

export async function updateGSTDocumentStatus(applicationId, documentId, status, rejectionReason = null) {
  try {
    const { data: app, error: fetchErr } = await supabase
      .from('gst_applications')
      .select('documents')
      .eq('application_id', applicationId)
      .single();

    if (fetchErr) throw fetchErr;

    const docs = app?.documents || {};
    if (docs[documentId]) {
      docs[documentId] = {
        ...(typeof docs[documentId] === 'object' ? docs[documentId] : { url: docs[documentId] }),
        status,
        rejectionReason,
      };
    } else {
      docs[documentId] = { status, rejectionReason };
    }

    const { data, error: updateErr } = await supabase
      .from('gst_applications')
      .update({ documents: docs, updated_at: new Date().toISOString() })
      .eq('application_id', applicationId)
      .select();

    if (updateErr) throw updateErr;
    return { success: true, data };
  } catch (err) {
    console.error('updateGSTDocumentStatus error:', err.message);
    throw err;
  }
}

export async function requestGSTDocument(applicationId, documentName, reason) {
  try {
    const { data: app, error: fetchErr } = await supabase
      .from('gst_applications')
      .select('custom_documents')
      .eq('application_id', applicationId)
      .single();

    if (fetchErr) throw fetchErr;

    const requested = {
      id: `req_${Date.now()}`,
      name: documentName,
      reason,
      status: 'requested',
      requestedAt: new Date().toISOString(),
    };

    const customDocs = [...(app?.custom_documents || []), requested];

    const { data, error: updateErr } = await supabase
      .from('gst_applications')
      .update({
        custom_documents: customDocs,
        status: 'clarification_needed',
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', applicationId)
      .select();

    if (updateErr) throw updateErr;
    return { success: true, data };
  } catch (err) {
    console.error('requestGSTDocument error:', err.message);
    throw err;
  }
}

/* ========================================================================= */
/* MSME / Udyam Registration Assisted Applications                          */
/* ========================================================================= */

export async function submitUdyamApplication(appData) {
  const appId = `UDYAM-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const insertPayload = {
    application_id: appId,
    user_id: appData.userId || appData.user_id || 'guest_user',
    status: 'submitted',
    aadhaar_details: appData.aadhaarDetails || appData.aadhaar_details || {},
    pan_details: appData.panDetails || appData.pan_details || {},
    business_details: appData.businessDetails || appData.business_details || {},
    organisation_details: appData.organisationDetails || appData.organisation_details || {},
    official_address: appData.officialAddress || appData.official_address || {},
    plant_units: appData.plantUnits || appData.plant_units || [],
    bank_details: appData.bankDetails || appData.bank_details || {},
    selected_nic_codes: appData.selectedNicCodes || appData.selected_nic_codes || [],
    financial_details: appData.financialDetails || appData.financial_details || {},
    msme_classification: appData.msmeClassification || appData.msme_classification || {},
    optional_documents: appData.optionalDocuments || appData.optional_documents || {},
    declaration_accepted: Boolean(appData.declarationAccepted ?? true),
    calculated_fees: appData.calculatedFees || appData.calculated_fees || {},
    amount_paid: Number(appData.amountPaid || appData.amount_paid || 2000),
    payment_status: appData.paymentStatus || appData.payment_status || 'successful',
  };

  try {
    const { data, error } = await supabase
      .from('udyam_applications')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert failed:', error.message);
      throw error;
    }

    if (appData.userId && appData.userId !== 'guest_user') {
      try {
        await supabase.from('notifications').insert({
          user_id: appData.userId,
          title: 'Udyam Registration Submitted',
          description: `Your MSME / Udyam application (${appId}) has been successfully submitted.`,
          type: 'info',
          read: false,
        });
      } catch (notifErr) {
        console.warn('Notification insert warning:', notifErr.message);
      }
    }

    return data;
  } catch (err) {
    console.error('Supabase insert failed:', err.message);
    throw err;
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
    if (error) {
      console.error('Supabase getUdyamApplications failed:', error.message);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('getUdyamApplications error:', err.message);
    throw err;
  }
}

export async function getUdyamApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('udyam_applications')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (error) {
      console.error('Supabase getUdyamApplicationById failed:', error.message);
      throw error;
    }
    return data || null;
  } catch (err) {
    console.error('getUdyamApplicationById error:', err.message);
    throw err;
  }
}

export async function updateUdyamApplicationStatus(applicationId, updates = {}) {
  try {
    const { data, error } = await supabase
      .from('udyam_applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', applicationId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('updateUdyamApplicationStatus error:', err.message);
    throw err;
  }
}

/* ========================================================================= */
/* Income Tax Return (ITR) Filing Applications                              */
/* ========================================================================= */

export async function submitITRApplication(appData) {
  const appId = `ITR-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const insertPayload = {
    application_id: appId,
    user_id: appData.userId || appData.user_id || 'guest_user',
    status: 'submitted',
    assessment_year: appData.assessmentYear || appData.assessment_year || 'AY_2026_27',
    taxpayer_type: appData.taxpayerType || appData.taxpayer_type || 'individual',
    residential_status: appData.residentialStatus || appData.residential_status || 'resident',
    recommended_itr_form: appData.recommendedItrForm || appData.recommended_itr_form || 'ITR-1',
    selected_regime: appData.selectedRegime || appData.selected_regime || 'new',
    profile: appData.profile || {},
    income_sources: appData.incomeSources || appData.income_sources || {},
    income_details: appData.incomeDetails || appData.income_details || {},
    deductions: appData.deductions || {},
    tax_paid: appData.taxPaid || appData.tax_paid || {},
    bank_details: appData.bankDetails || appData.bank_details || {},
    documents: appData.documents || {},
    tax_computation: appData.taxComputation || appData.tax_computation || {},
    calculated_fees: appData.calculatedFees || appData.calculated_fees || {},
    amount_paid: Number(appData.amountPaid || appData.amount_paid || 3000),
    payment_status: appData.paymentStatus || appData.payment_status || 'successful',
  };

  try {
    const { data, error } = await supabase
      .from('itr_applications')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert failed:', error.message);
      throw error;
    }

    if (appData.userId && appData.userId !== 'guest_user') {
      try {
        await supabase.from('notifications').insert({
          user_id: appData.userId,
          title: 'ITR Filing Submitted',
          description: `Your Income Tax Return filing application (${appId}) has been successfully submitted.`,
          type: 'info',
          read: false,
        });
      } catch (notifErr) {
        console.warn('Notification insert warning:', notifErr.message);
      }
    }

    return data;
  } catch (err) {
    console.error('Supabase insert failed:', err.message);
    throw err;
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
    if (error) {
      console.error('Supabase getITRApplications failed:', error.message);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('getITRApplications error:', err.message);
    throw err;
  }
}

export async function getITRApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('itr_applications')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (error) {
      console.error('Supabase getITRApplicationById failed:', error.message);
      throw error;
    }
    return data || null;
  } catch (err) {
    console.error('getITRApplicationById error:', err.message);
    throw err;
  }
}

export async function updateITRApplicationStatus(applicationId, updates = {}) {
  try {
    const { data, error } = await supabase
      .from('itr_applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', applicationId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('updateITRApplicationStatus error:', err.message);
    throw err;
  }
}

/* ========================================================================= */
/* Import Export Code (IEC) Registration Applications (DGFT)                */
/* ========================================================================= */

export async function submitIECApplication(appData) {
  const appId = `IEC-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const insertPayload = {
    application_id: appId,
    user_id: appData.userId || appData.user_id || 'guest_user',
    status: 'submitted',
    entity_type: appData.entityType || appData.entity_type || 'proprietorship',
    pan_details: appData.panDetails || appData.pan_details || {},
    business_details: appData.businessDetails || appData.business_details || {},
    trade_details: appData.tradeDetails || appData.trade_details || {},
    address_details: appData.addressDetails || appData.address_details || {},
    bank_details: appData.bankDetails || appData.bank_details || {},
    signatory_details: appData.signatoryDetails || appData.signatory_details || {},
    products: appData.products || [],
    countries: appData.countries || [],
    documents: appData.documents || {},
    declarations: appData.declarations || {},
    calculated_fees: appData.calculatedFees || appData.calculated_fees || {},
    amount_paid: Number(appData.amountPaid || appData.amount_paid || 4500),
    payment_status: appData.paymentStatus || appData.payment_status || 'successful',
  };

  try {
    const { data, error } = await supabase
      .from('iec_applications')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert failed:', error.message);
      throw error;
    }

    if (appData.userId && appData.userId !== 'guest_user') {
      try {
        await supabase.from('notifications').insert({
          user_id: appData.userId,
          title: 'IEC Application Submitted',
          description: `Your Import Export Code application (${appId}) has been successfully submitted to DGFT.`,
          type: 'info',
          read: false,
        });
      } catch (notifErr) {
        console.warn('Notification insert warning:', notifErr.message);
      }
    }

    return data;
  } catch (err) {
    console.error('Supabase insert failed:', err.message);
    throw err;
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
    if (error) {
      console.error('Supabase getIECApplications failed:', error.message);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('getIECApplications error:', err.message);
    throw err;
  }
}

export async function getIECApplicationById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('iec_applications')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (error) {
      console.error('Supabase getIECApplicationById failed:', error.message);
      throw error;
    }
    return data || null;
  } catch (err) {
    console.error('getIECApplicationById error:', err.message);
    throw err;
  }
}

export async function updateIECApplicationStatus(applicationId, updates = {}) {
  try {
    const { data, error } = await supabase
      .from('iec_applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', applicationId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('updateIECApplicationStatus error:', err.message);
    throw err;
  }
}

/* ========================================================================= */
/* Other Services Consultation & Requirement Requests                        */
/* ========================================================================= */

export async function submitOtherServiceRequest(requestData) {
  const appId = `OTHER-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const insertPayload = {
    application_id: appId,
    user_id: requestData.userId || requestData.user_id || 'guest_user',
    status: 'submitted',
    selected_service: requestData.selectedService || requestData.selected_service || {},
    is_uncertain_service: Boolean(requestData.isUncertainService || requestData.is_uncertain_service),
    applicant_details: requestData.applicantDetails || requestData.applicant_details || {},
    applicant_type: requestData.applicantType || requestData.applicant_type || 'individual',
    requirement_details: requestData.requirementDetails || requestData.requirement_details || {},
    department: requestData.department || 'gst',
    urgency: requestData.urgency || 'normal',
    deadline_date: requestData.deadlineDate || requestData.deadline_date || null,
    business_details: requestData.businessDetails || requestData.business_details || {},
    documents: requestData.documents || {},
    additional_info: requestData.additionalInfo || requestData.additional_info || {},
    custom_quote: requestData.customQuote || requestData.custom_quote || null,
    calculated_fees: requestData.calculatedFees || requestData.calculated_fees || {},
    amount_paid: Number(requestData.amountPaid || requestData.amount_paid || 0),
    payment_status: requestData.paymentStatus || requestData.payment_status || 'pending',
  };

  try {
    const { data, error } = await supabase
      .from('other_service_requests')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert failed:', error.message);
      throw error;
    }

    if (requestData.userId && requestData.userId !== 'guest_user') {
      try {
        await supabase.from('notifications').insert({
          user_id: requestData.userId,
          title: 'Consultation Request Submitted',
          description: `Your consultancy requirement (${appId}) has been received and assigned for review.`,
          type: 'info',
          read: false,
        });
      } catch (notifErr) {
        console.warn('Notification insert warning:', notifErr.message);
      }
    }

    return data;
  } catch (err) {
    console.error('Supabase insert failed:', err.message);
    throw err;
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
    if (error) {
      console.error('Supabase getOtherServiceRequests failed:', error.message);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('getOtherServiceRequests error:', err.message);
    throw err;
  }
}

export async function getOtherServiceRequestById(applicationId) {
  try {
    const { data, error } = await supabase
      .from('other_service_requests')
      .select('*')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (error) {
      console.error('Supabase getOtherServiceRequestById failed:', error.message);
      throw error;
    }
    return data || null;
  } catch (err) {
    console.error('getOtherServiceRequestById error:', err.message);
    throw err;
  }
}

export async function updateOtherServiceRequestStatus(applicationId, updates = {}) {
  try {
    const { data, error } = await supabase
      .from('other_service_requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('application_id', applicationId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('updateOtherServiceRequestStatus error:', err.message);
    throw err;
  }
}






