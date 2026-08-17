import { supabase } from './supabase-client';

const createAdminClient = () => supabase;

/* ==========================================================================
   1. DASHBOARD OVERVIEW STATS & RECENT APPLICATIONS
   ========================================================================== */
export async function getDashboardStats() {
  try {
    const supabase = createAdminClient();

    // Query tables with count
    const [
      ordersRes,
      gstRes,
      plcRes,
      tmRes,
      fssaiRes,
      iecRes,
      itrRes,
      udyamRes,
      otherRes,
      paymentsRes,
    ] = await Promise.allSettled([
      supabase.from('orders').select('id, status', { count: 'exact' }),
      supabase.from('gst_applications').select('id, status', { count: 'exact' }),
      supabase.from('plc_applications').select('id, status', { count: 'exact' }),
      supabase.from('tm_applications').select('id, status', { count: 'exact' }),
      supabase.from('fssai_applications').select('id, status', { count: 'exact' }),
      supabase.from('iec_applications').select('id, status', { count: 'exact' }),
      supabase.from('itr_applications').select('id, status', { count: 'exact' }),
      supabase.from('udyam_applications').select('id, status', { count: 'exact' }),
      supabase.from('other_service_requests').select('id, status', { count: 'exact' }),
      supabase.from('payments').select('amount, status'),
    ]);

    const allApps = [];
    const extract = (res, type) => {
      if (res.status === 'fulfilled' && res.value.data) {
        res.value.data.forEach((item) => allApps.push({ ...item, type }));
      }
    };

    extract(ordersRes, 'orders');
    extract(gstRes, 'gst');
    extract(plcRes, 'plc');
    extract(tmRes, 'trademark');
    extract(fssaiRes, 'fssai');
    extract(iecRes, 'iec');
    extract(itrRes, 'itr');
    extract(udyamRes, 'udyam');
    extract(otherRes, 'other');

    const totalApplications = allApps.length;
    const pendingReview = allApps.filter((a) =>
      ['under_review', 'under_scrutiny', 'submitted', 'processing', 'verification'].includes(a.status)
    ).length;
    const documentsPending = allApps.filter((a) =>
      ['documents_pending', 'clarification_required', 'clarification_requested', 'clarification_needed'].includes(a.status)
    ).length;
    const completed = allApps.filter((a) =>
      ['completed', 'approved', 'gstin_issued', 'certificate_generated', 'registered'].includes(a.status)
    ).length;

    let totalRevenue = 0;
    if (paymentsRes.status === 'fulfilled' && paymentsRes.value.data) {
      totalRevenue = paymentsRes.value.data
        .filter((p) => p.status === 'success')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    }

    return {
      totalApplications,
      pendingReview,
      documentsPending,
      completed,
      totalRevenue,
    };
  } catch (err) {
    console.warn('Dashboard stats fetch error:', err.message);
    return {
      totalApplications: 0,
      pendingReview: 0,
      documentsPending: 0,
      completed: 0,
      totalRevenue: 0,
    };
  }
}

export async function getRecentApplications(limit = 20) {
  try {
    const supabase = createAdminClient();

    const [
      ordersRes,
      gstRes,
      plcRes,
      tmRes,
      fssaiRes,
      iecRes,
      itrRes,
      udyamRes,
      otherRes,
    ] = await Promise.allSettled([
      supabase.from('orders').select('*, service:services(*), user:users(*)').order('created_at', { ascending: false }).limit(limit),
      supabase.from('gst_applications').select('*').order('created_at', { ascending: false }).limit(limit),
      supabase.from('plc_applications').select('*').order('created_at', { ascending: false }).limit(limit),
      supabase.from('tm_applications').select('*').order('created_at', { ascending: false }).limit(limit),
      supabase.from('fssai_applications').select('*').order('created_at', { ascending: false }).limit(limit),
      supabase.from('iec_applications').select('*').order('created_at', { ascending: false }).limit(limit),
      supabase.from('itr_applications').select('*').order('created_at', { ascending: false }).limit(limit),
      supabase.from('udyam_applications').select('*').order('created_at', { ascending: false }).limit(limit),
      supabase.from('other_service_requests').select('*').order('created_at', { ascending: false }).limit(limit),
    ]);

    const combined = [];

    if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
      ordersRes.value.data.forEach((o) => {
        combined.push({
          id: o.id,
          application_id: o.order_id || o.id,
          service_code: 'order',
          service_type: o.service?.name || 'Order',
          applicant_name: o.user?.name || 'Customer',
          business_name: o.user?.company_name || 'Business',
          status: o.status,
          created_at: o.created_at,
          link: `/dashboard/orders/${o.id}`,
        });
      });
    }

    if (gstRes.status === 'fulfilled' && gstRes.value.data) {
      gstRes.value.data.forEach((g) => {
        combined.push({
          id: g.id,
          application_id: g.application_id || g.id,
          service_code: 'gst',
          service_type: 'GST Registration',
          applicant_name: g.business_details?.legalName || g.constitution || 'GST Applicant',
          business_name: g.business_details?.tradeName || g.business_details?.legalName || 'Business',
          status: g.status,
          created_at: g.created_at,
          link: `/dashboard/gst/${g.id || g.application_id}`,
        });
      });
    }

    if (plcRes.status === 'fulfilled' && plcRes.value.data) {
      plcRes.value.data.forEach((p) => {
        combined.push({
          id: p.id,
          application_id: p.application_id || p.id,
          service_code: 'plc',
          service_type: 'PLC Incorporation',
          applicant_name: p.applicant?.fullName || 'Director',
          business_name: p.company?.proposedName1 || 'Private Limited',
          status: p.status,
          created_at: p.created_at,
          link: `/dashboard/plc/${p.id || p.application_id}`,
        });
      });
    }

    if (tmRes.status === 'fulfilled' && tmRes.value.data) {
      tmRes.value.data.forEach((t) => {
        combined.push({
          id: t.id,
          application_id: t.application_id || t.id,
          service_code: 'trademark',
          service_type: 'Trademark (TM-A)',
          applicant_name: t.applicant_details?.name || 'Brand Owner',
          business_name: t.mark_details?.wordmark || 'Trademark',
          status: t.status,
          created_at: t.created_at,
          link: `/dashboard/trademark/${t.id || t.application_id}`,
        });
      });
    }

    if (fssaiRes.status === 'fulfilled' && fssaiRes.value.data) {
      fssaiRes.value.data.forEach((f) => {
        combined.push({
          id: f.id,
          application_id: f.application_id || f.id,
          service_code: 'fssai',
          service_type: 'FSSAI License',
          applicant_name: f.applicant_details?.fullName || 'Food Operator',
          business_name: f.business_details?.businessName || 'Food Unit',
          status: f.status,
          created_at: f.created_at,
          link: `/dashboard/fssai/${f.id || f.application_id}`,
        });
      });
    }

    if (iecRes.status === 'fulfilled' && iecRes.value.data) {
      iecRes.value.data.forEach((i) => {
        combined.push({
          id: i.id,
          application_id: i.application_id || i.id,
          service_code: 'iec',
          service_type: 'Import Export Code',
          applicant_name: i.signatory_details?.fullName || 'Signatory',
          business_name: i.business_details?.businessName || i.pan_details?.tradeName || 'Exporter',
          status: i.status,
          created_at: i.created_at,
          link: `/dashboard/iec/${i.id || i.application_id}`,
        });
      });
    }

    if (itrRes.status === 'fulfilled' && itrRes.value.data) {
      itrRes.value.data.forEach((it) => {
        combined.push({
          id: it.id,
          application_id: it.application_id || it.id,
          service_code: 'itr',
          service_type: 'ITR Tax Filing',
          applicant_name: it.profile?.fullName || 'Taxpayer',
          business_name: `AY ${it.assessment_year || '2026-27'}`,
          status: it.status,
          created_at: it.created_at,
          link: `/dashboard/itr/${it.id || it.application_id}`,
        });
      });
    }

    if (udyamRes.status === 'fulfilled' && udyamRes.value.data) {
      udyamRes.value.data.forEach((u) => {
        combined.push({
          id: u.id,
          application_id: u.application_id || u.id,
          service_code: 'udyam',
          service_type: 'MSME / Udyam',
          applicant_name: u.aadhaar_details?.applicantName || 'Entrepreneur',
          business_name: u.business_details?.enterpriseName || 'MSME Enterprise',
          status: u.status,
          created_at: u.created_at,
          link: `/dashboard/udyam/${u.id || u.application_id}`,
        });
      });
    }

    if (otherRes.status === 'fulfilled' && otherRes.value.data) {
      otherRes.value.data.forEach((o) => {
        combined.push({
          id: o.id,
          application_id: o.application_id || o.id,
          service_code: 'other',
          service_type: o.selected_service?.name || 'Consultancy',
          applicant_name: o.applicant_details?.fullName || o.applicantName || 'Client',
          business_name: o.business_details?.businessName || 'Consultation',
          status: o.status,
          created_at: o.created_at,
          link: `/dashboard/other/${o.id || o.application_id}`,
        });
      });
    }

    combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return combined.slice(0, limit);
  } catch (err) {
    console.warn('Recent applications fetch error:', err.message);
    return [];
  }
}

/* ==========================================================================
   2. ORDERS & TIMELINES
   ========================================================================== */
export async function getAllOrders() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, service:services(*), user:users(*), payments(*), documents(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((o) => ({
        id: o.id,
        order_id: o.order_id || o.id,
        user_id: o.user_id,
        user_name: o.user?.name || 'Customer',
        user_email: o.user?.email || '—',
        user_phone: o.user?.phone || '—',
        service_id: o.service_id,
        service_name: o.service?.name || 'Consultancy Service',
        service_category: o.service?.category || 'General',
        status: o.status || 'pending',
        created_at: o.created_at,
        timeline: [
          { status: 'Order Created', timestamp: o.created_at, note: 'Placed via App' },
        ],
        documents: (o.documents || []).map((d) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          url: d.file_url,
          uploaded_at: d.created_at,
        })),
        payments: o.payments || [],
      }));
    }
  } catch (err) {
    console.warn('Orders fetch error:', err.message);
  }
  return [];
}

export async function getOrderById(id) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, service:services(*), user:users(*), payments(*), documents(*)')
      .or(`id.eq.${id},order_id.eq.${id}`)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        order_id: data.order_id || data.id,
        user_id: data.user_id,
        user_name: data.user?.name || 'Customer',
        user_email: data.user?.email || '—',
        user_phone: data.user?.phone || '—',
        service_id: data.service_id,
        service_name: data.service?.name || 'Consultancy Service',
        service_category: data.service?.category || 'General',
        status: data.status || 'pending',
        created_at: data.created_at,
        timeline: [
          { status: 'Order Placed', timestamp: data.created_at, note: 'Submitted by user' },
        ],
        documents: (data.documents || []).map((d) => ({
          id: d.id,
          name: d.name,
          status: d.status,
          url: d.file_url,
          uploaded_at: d.created_at,
        })),
        payments: data.payments || [],
      };
    }
  } catch (err) {
    console.warn('Order by ID fetch error:', err.message);
  }
  return null;
}

export async function sendNotificationToUser({ userId, title, description, type = 'info' }) {
  if (!userId || userId === 'guest_user') return;
  try {
    const supabase = createAdminClient();
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      description,
      type,
      read: false,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Notification insert failed:', err.message);
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const supabase = createAdminClient();
    await supabase.from('orders').update({ status }).or(`id.eq.${orderId},order_id.eq.${orderId}`);
  } catch (err) {
    console.warn('Error updating order status:', err.message);
  }
  return { success: true, status };
}

export async function addOrderNote(orderId, noteText) {
  return { success: true };
}

/* ==========================================================================
   3. GST APPLICATIONS
   ========================================================================== */
export async function getAllGSTApplications() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('gst_applications').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((g) => ({
        id: g.id,
        application_id: g.application_id || g.id,
        applicant_name: g.business_details?.legalName || g.constitution || 'Applicant',
        business_name: g.business_details?.tradeName || g.business_details?.legalName || 'Business',
        constitution: g.constitution || 'Proprietorship',
        business_type: g.business_details?.activity || 'Trading',
        mobile: g.applicant?.mobile || g.business_details?.mobile || '—',
        status: g.status,
        official_gstin: g.official_gstin,
        docs_percentage: 100,
        created_at: g.created_at,
        raw: g,
      }));
    }
  } catch (err) {
    console.warn('GST applications error:', err.message);
  }
  return [];
}

export async function getGSTApplicationById(id) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('gst_applications')
      .select('*')
      .or(`id.eq.${id},application_id.eq.${id}`)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('GST single fetch error:', err.message);
  }
  return null;
}

export async function updateGSTStatus(id, status, officialGstin) {
  try {
    const supabase = createAdminClient();
    const updatePayload = { status };
    if (officialGstin) updatePayload.official_gstin = officialGstin;
    const { data } = await supabase
      .from('gst_applications')
      .update(updatePayload)
      .or(`id.eq.${id},application_id.eq.${id}`)
      .select()
      .maybeSingle();

    if (data?.user_id) {
      await sendNotificationToUser({
        userId: data.user_id,
        title: `GST Application: ${status.replace(/_/g, ' ').toUpperCase()}`,
        description: officialGstin
          ? `Congratulations! Your GSTIN (${officialGstin}) has been issued.`
          : `Your GST Application (${data.application_id || id}) status is now "${status.replace(/_/g, ' ')}".`,
        type: officialGstin || status === 'gstin_issued' ? 'success' : 'info',
      });
    }
  } catch (err) {
    console.warn('GST status update error:', err.message);
  }
  return { success: true };
}

export async function updateGSTDocumentStatus(appId, docKey, status, remarks) {
  return { success: true };
}

/* ==========================================================================
   4. PLC APPLICATIONS
   ========================================================================== */
export async function getAllPLCApplications() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('plc_applications').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  } catch (err) {
    console.warn('PLC fetch error:', err.message);
  }
  return [];
}

export async function getPLCApplicationById(id) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('plc_applications')
      .select('*')
      .or(`id.eq.${id},application_id.eq.${id}`)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('PLC by ID error:', err.message);
  }
  return null;
}

export async function updatePLCStatus(id, status) {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('plc_applications')
      .update({ status })
      .or(`id.eq.${id},application_id.eq.${id}`)
      .select()
      .maybeSingle();

    if (data?.user_id) {
      await sendNotificationToUser({
        userId: data.user_id,
        title: `PLC Incorporation: ${status.replace(/_/g, ' ').toUpperCase()}`,
        description: `Your Private Limited Company application (${data.application_id || id}) status is now "${status.replace(/_/g, ' ')}".`,
        type: status === 'approved' || status === 'completed' ? 'success' : 'info',
      });
    }
  } catch (err) {
    console.warn('PLC status error:', err.message);
  }
  return { success: true };
}

/* ==========================================================================
   5. TRADEMARK APPLICATIONS
   ========================================================================== */
export async function getAllTMApplications() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('tm_applications').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  } catch (err) {
    console.warn('TM fetch error:', err.message);
  }
  return [];
}

export async function getTMApplicationById(id) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('tm_applications')
      .select('*')
      .or(`id.eq.${id},application_id.eq.${id}`)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('TM by ID error:', err.message);
  }
  return null;
}

export async function updateTMStatus(id, status, officialNumber) {
  try {
    const supabase = createAdminClient();
    const payload = { status };
    if (officialNumber) payload.official_tm_number = officialNumber;
    const { data } = await supabase
      .from('tm_applications')
      .update(payload)
      .or(`id.eq.${id},application_id.eq.${id}`)
      .select()
      .maybeSingle();

    if (data?.user_id) {
      await sendNotificationToUser({
        userId: data.user_id,
        title: `Trademark (TM-A): ${status.replace(/_/g, ' ').toUpperCase()}`,
        description: officialNumber
          ? `Your Trademark Application number is ${officialNumber}. Status: ${status.replace(/_/g, ' ')}.`
          : `Your Trademark Application (${data.application_id || id}) status is now "${status.replace(/_/g, ' ')}".`,
        type: officialNumber || status === 'registered' ? 'success' : 'info',
      });
    }
  } catch (err) {
    console.warn('TM update error:', err.message);
  }
  return { success: true };
}

/* ==========================================================================
   6. FSSAI APPLICATIONS
   ========================================================================== */
export async function getAllFSSAIApplications() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('fssai_applications').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  } catch (err) {
    console.warn('FSSAI fetch error:', err.message);
  }
  return [];
}

export async function getFSSAIApplicationById(id) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('fssai_applications')
      .select('*')
      .or(`id.eq.${id},application_id.eq.${id}`)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('FSSAI by ID error:', err.message);
  }
  return null;
}

export async function updateFSSAIStatus(id, status, officialNumber) {
  try {
    const supabase = createAdminClient();
    const payload = { status };
    if (officialNumber) payload.official_fssai_number = officialNumber;
    const { data } = await supabase
      .from('fssai_applications')
      .update(payload)
      .or(`id.eq.${id},application_id.eq.${id}`)
      .select()
      .maybeSingle();

    if (data?.user_id) {
      await sendNotificationToUser({
        userId: data.user_id,
        title: `FSSAI Food License: ${status.replace(/_/g, ' ').toUpperCase()}`,
        description: officialNumber
          ? `Your 14-digit FSSAI License (${officialNumber}) has been issued!`
          : `Your FSSAI application (${data.application_id || id}) status is now "${status.replace(/_/g, ' ')}".`,
        type: officialNumber || status === 'license_issued' ? 'success' : 'info',
      });
    }
  } catch (err) {
    console.warn('FSSAI update error:', err.message);
  }
  return { success: true };
}

/* ==========================================================================
   7. IEC APPLICATIONS
   ========================================================================== */
export async function getAllIECApplications() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('iec_applications').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  } catch (err) {
    console.warn('IEC fetch error:', err.message);
  }
  return [];
}

export async function getIECApplicationById(id) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('iec_applications')
      .select('*')
      .or(`id.eq.${id},application_id.eq.${id}`)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('IEC by ID error:', err.message);
  }
  return null;
}

export async function updateIECStatus(id, status, iecNumber) {
  try {
    const supabase = createAdminClient();
    const payload = { status };
    if (iecNumber) payload.iec_number = iecNumber;
    const { data } = await supabase
      .from('iec_applications')
      .update(payload)
      .or(`id.eq.${id},application_id.eq.${id}`)
      .select()
      .maybeSingle();

    if (data?.user_id) {
      await sendNotificationToUser({
        userId: data.user_id,
        title: `IEC Code (DGFT): ${status.replace(/_/g, ' ').toUpperCase()}`,
        description: iecNumber
          ? `Your Import Export Code (${iecNumber}) has been generated.`
          : `Your IEC application (${data.application_id || id}) status is now "${status.replace(/_/g, ' ')}".`,
        type: iecNumber || status === 'completed' ? 'success' : 'info',
      });
    }
  } catch (err) {
    console.warn('IEC update error:', err.message);
  }
  return { success: true };
}

/* ==========================================================================
   8. ITR APPLICATIONS
   ========================================================================== */
export async function getAllITRApplications() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('itr_applications').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  } catch (err) {
    console.warn('ITR fetch error:', err.message);
  }
  return [];
}

export async function getITRApplicationById(id) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('itr_applications')
      .select('*')
      .or(`id.eq.${id},application_id.eq.${id}`)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('ITR by ID error:', err.message);
  }
  return null;
}

export async function updateITRStatus(id, status, ackNumber) {
  try {
    const supabase = createAdminClient();
    const payload = { status };
    if (ackNumber) payload.acknowledgment_number = ackNumber;
    const { data } = await supabase
      .from('itr_applications')
      .update(payload)
      .or(`id.eq.${id},application_id.eq.${id}`)
      .select()
      .maybeSingle();

    if (data?.user_id) {
      await sendNotificationToUser({
        userId: data.user_id,
        title: `ITR Filing: ${status.replace(/_/g, ' ').toUpperCase()}`,
        description: ackNumber
          ? `Your ITR has been e-filed. Acknowledgment No: ${ackNumber}.`
          : `Your ITR application (${data.application_id || id}) status is now "${status.replace(/_/g, ' ')}".`,
        type: ackNumber || status === 'completed' ? 'success' : 'info',
      });
    }
  } catch (err) {
    console.warn('ITR update error:', err.message);
  }
  return { success: true };
}

/* ==========================================================================
   9. UDYAM / MSME APPLICATIONS
   ========================================================================== */
export async function getAllUdyamApplications() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('udyam_applications').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  } catch (err) {
    console.warn('Udyam fetch error:', err.message);
  }
  return [];
}

export async function getUdyamApplicationById(id) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('udyam_applications')
      .select('*')
      .or(`id.eq.${id},application_id.eq.${id}`)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('Udyam by ID error:', err.message);
  }
  return null;
}

export async function updateUdyamStatus(id, status, udyamNumber) {
  try {
    const supabase = createAdminClient();
    const payload = { status };
    if (udyamNumber) payload.udyam_registration_number = udyamNumber;
    const { data } = await supabase
      .from('udyam_applications')
      .update(payload)
      .or(`id.eq.${id},application_id.eq.${id}`)
      .select()
      .maybeSingle();

    if (data?.user_id) {
      await sendNotificationToUser({
        userId: data.user_id,
        title: `MSME / Udyam: ${status.replace(/_/g, ' ').toUpperCase()}`,
        description: udyamNumber
          ? `Your Udyam Registration Certificate (${udyamNumber}) is ready!`
          : `Your Udyam application (${data.application_id || id}) status is now "${status.replace(/_/g, ' ')}".`,
        type: udyamNumber || status === 'completed' ? 'success' : 'info',
      });
    }
  } catch (err) {
    console.warn('Udyam update error:', err.message);
  }
  return { success: true };
}

/* ==========================================================================
   10. OTHER SERVICES APPLICATIONS
   ========================================================================== */
export async function getAllOtherServiceRequests() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('other_service_requests').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  } catch (err) {
    console.warn('Other services error:', err.message);
  }
  return [];
}

export async function getOtherServiceById(id) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('other_service_requests')
      .select('*')
      .or(`id.eq.${id},application_id.eq.${id}`)
      .maybeSingle();

    if (!error && data) return data;
  } catch (err) {
    console.warn('Other service single fetch error:', err.message);
  }
  return null;
}

export async function updateOtherServiceStatus(id, status, assignedStaff) {
  try {
    const supabase = createAdminClient();
    const payload = { status };
    if (assignedStaff) payload.assigned_staff = assignedStaff;
    const { data } = await supabase
      .from('other_service_requests')
      .update(payload)
      .or(`id.eq.${id},application_id.eq.${id}`)
      .select()
      .maybeSingle();

    if (data?.user_id) {
      await sendNotificationToUser({
        userId: data.user_id,
        title: `Consultancy Request: ${status.replace(/_/g, ' ').toUpperCase()}`,
        description: `Your consultancy requirement (${data.application_id || id}) status is now "${status.replace(/_/g, ' ')}".`,
        type: 'info',
      });
    }
  } catch (err) {
    console.warn('Other service status update error:', err.message);
  }
  return { success: true };
}

/* ==========================================================================
   11. USERS DIRECTORY
   ========================================================================== */
export async function getAllUsers() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (!error && data) return data;
  } catch (err) {
    console.warn('Users fetch error:', err.message);
  }
  return [];
}

export async function getUserById(id) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (!error && data) {
      const [ordersRes, paymentsRes] = await Promise.allSettled([
        supabase.from('orders').select('*, service:services(*)').eq('user_id', id),
        supabase.from('payments').select('*, order:orders(*)').eq('order.user_id', id),
      ]);
      return {
        ...data,
        orders: (ordersRes.status === 'fulfilled' && ordersRes.value.data) || [],
        payments: (paymentsRes.status === 'fulfilled' && paymentsRes.value.data) || [],
      };
    }
  } catch (err) {
    console.warn('User by ID error:', err.message);
  }
  return null;
}

/* ==========================================================================
   12. FINANCIALS & PAYMENTS
   ========================================================================== */
export async function getAllPayments() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('payments')
      .select('*, order:orders(*, service:services(*), user:users(*))')
      .order('created_at', { ascending: false });

    if (!error && data) return data;
  } catch (err) {
    console.warn('Payments fetch error:', err.message);
  }
  return [];
}

export async function getPaymentStats() {
  try {
    const payments = await getAllPayments();
    const totalVolume = payments
      .filter((p) => p.status === 'success')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const pendingAmount = payments
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const completedCount = payments.filter((p) => p.status === 'success').length;
    const pendingCount = payments.filter((p) => p.status === 'pending').length;
    const failedPayments = payments.filter((p) => p.status === 'failed' || p.status === 'refunded').length;

    return {
      totalCollected: totalVolume,
      totalVolume,
      completedCount,
      pendingCount,
      pendingAmount,
      failedPayments,
      thisMonth: totalVolume,
      refundCount: failedPayments,
    };
  } catch (err) {
    return {
      totalCollected: 0,
      totalVolume: 0,
      completedCount: 0,
      pendingCount: 0,
      pendingAmount: 0,
      failedPayments: 0,
      thisMonth: 0,
      refundCount: 0,
    };
  }
}

/* ==========================================================================
   13. NOTIFICATIONS
   ========================================================================== */
export async function getNotificationHistory() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*, user:users(*)')
      .order('created_at', { ascending: false });

    if (!error && data) return data;
  } catch (err) {
    console.warn('Notification history error:', err.message);
  }
  return [];
}

export async function sendNotification(userId, title, message, type = 'info') {
  try {
    const supabase = createAdminClient();
    const notif = {
      user_id: userId,
      title,
      description: message,
      type,
      read: false,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('notifications').insert(notif).select().single();
    if (!error && data) return { success: true, notification: data };
  } catch (err) {
    console.warn('Send notification error:', err.message);
  }
  return { success: true };
}

export async function sendBulkNotification(title, message, type = 'info') {
  try {
    const supabase = createAdminClient();
    const { data: users } = await supabase.from('users').select('id');
    if (users && users.length > 0) {
      const rows = users.map((u) => ({
        user_id: u.id,
        title,
        description: message,
        type,
        read: false,
        created_at: new Date().toISOString(),
      }));
      await supabase.from('notifications').insert(rows);
    }
  } catch (err) {
    console.warn('Bulk notification error:', err.message);
  }
  return { success: true };
}

/* ==========================================================================
   14. SERVICES & DYNAMIC PRICING CONFIGURATION
   ========================================================================== */
export const DEFAULT_SERVICES_DATA = [
  {
    key: 'gst',
    name: 'GST Services',
    detail_title: 'GST Registration',
    description: 'New GST Registration for Proprietorship, Partnership or Private Limited.',
    fee: 10000,
    advance_percent: 50,
    processing_days: '3-5 Working Days',
    icon: '📋',
    included: ['GST Number', 'GST Certificate', 'All Government Fees'],
    is_active: true,
  },
  {
    key: 'plc',
    name: 'Company Registration',
    detail_title: 'Private Limited Company Registration',
    description: 'Incorporate your Private Limited Company with MCA.',
    fee: 15000,
    advance_percent: 50,
    processing_days: '7-10 Working Days',
    icon: '🏢',
    included: ['Certificate of Incorporation', 'PAN & TAN', 'DIN for 2 Directors', 'All Government Fees'],
    is_active: true,
  },
  {
    key: 'trademark',
    name: 'Trademark Registration',
    detail_title: 'Trademark Registration',
    description: 'Protect your brand name and logo with a registered trademark.',
    fee: 8000,
    advance_percent: 50,
    processing_days: '5-7 Working Days',
    icon: '™️',
    included: ['Trademark Application', 'TM Number', 'Government Fees (1 class)'],
    is_active: true,
  },
  {
    key: 'fssai',
    name: 'FSSAI License',
    detail_title: 'FSSAI Food License',
    description: 'Food business license registration for manufacturers, traders and restaurants.',
    fee: 5000,
    advance_percent: 50,
    processing_days: '5-7 Working Days',
    icon: '🍽️',
    included: ['FSSAI Registration Certificate', 'Application Filing', 'Government Fees'],
    is_active: true,
  },
  {
    key: 'udyam',
    name: 'MSME / Udyam',
    detail_title: 'MSME / Udyam Registration',
    description: 'Udyam registration for micro, small and medium enterprises.',
    fee: 2000,
    advance_percent: 50,
    processing_days: '1-2 Working Days',
    icon: '🏭',
    included: ['Udyam Certificate', 'Udyam Number', 'Application Filing'],
    is_active: true,
  },
  {
    key: 'itr',
    name: 'ITR Filing',
    detail_title: 'Income Tax Return Filing',
    description: 'Annual income tax return filing for individuals and businesses.',
    fee: 3000,
    advance_percent: 50,
    processing_days: '2-3 Working Days',
    icon: '📄',
    included: ['ITR Filing', 'Acknowledgment (ITR-V)', 'Computation Sheet'],
    is_active: true,
  },
  {
    key: 'iec',
    name: 'IEC / Import Export',
    detail_title: 'Import Export Code (IEC)',
    description: 'IEC registration required for import and export businesses.',
    fee: 4000,
    advance_percent: 50,
    processing_days: '3-5 Working Days',
    icon: '🌐',
    included: ['IEC Certificate', 'DGFT Application', 'Government Fees'],
    is_active: true,
  },
  {
    key: 'other',
    name: 'Other Services',
    detail_title: 'Other Services',
    description: 'Tell us your requirement and our team will guide you.',
    fee: 2500,
    advance_percent: 50,
    processing_days: 'Varies',
    icon: '⚙️',
    included: ['Expert Consultation', 'Document Guidance'],
    is_active: true,
  },
];

export async function getServiceFees() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Error fetching service fees:', err.message);
  }
  return [];
}

export async function updateServiceFee(serviceIdOrName, newFee) {
  try {
    const supabase = createAdminClient();
    const parsedFee = Number(newFee);
    const { data, error } = await supabase
      .from('services')
      .update({ fee: parsedFee })
      .or(`id.eq.${serviceIdOrName},name.eq.${serviceIdOrName},detail_title.eq.${serviceIdOrName}`)
      .select();

    if (!error) return { success: true, data };
    return { success: false, error: error.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateAllServiceFees(feeMap) {
  try {
    const supabase = createAdminClient();
    const updates = Object.entries(feeMap).map(async ([keyOrId, newFee]) => {
      const parsedFee = Number(newFee);
      const def = DEFAULT_SERVICES_DATA.find((d) => d.key === keyOrId);
      const name = def ? def.name : keyOrId;
      const detailTitle = def ? def.detail_title : keyOrId;

      return supabase
        .from('services')
        .update({ fee: parsedFee })
        .or(`id.eq.${keyOrId},name.eq.${name},detail_title.eq.${detailTitle}`);
    });

    await Promise.all(updates);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function seedServicesTable() {
  try {
    const supabase = createAdminClient();
    for (const s of DEFAULT_SERVICES_DATA) {
      const { data: existing } = await supabase
        .from('services')
        .select('id')
        .or(`name.eq.${s.name},detail_title.eq.${s.detail_title}`)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from('services')
          .update({
            detail_title: s.detail_title,
            description: s.description,
            fee: s.fee,
            advance_percent: s.advance_percent,
            processing_days: s.processing_days,
            icon: s.icon,
            included: s.included,
            is_active: true,
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('services').insert({
          name: s.name,
          detail_title: s.detail_title,
          description: s.description,
          fee: s.fee,
          advance_percent: s.advance_percent,
          processing_days: s.processing_days,
          icon: s.icon,
          included: s.included,
          is_active: true,
        });
      }
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

