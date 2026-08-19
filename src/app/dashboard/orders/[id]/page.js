'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOrderById, updateOrderStatus, addOrderNote, sendNotification } from '@/lib/adminDatabase';
import { formatCurrency, formatDate, formatRelativeTime, safeRender } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import DocumentViewer from '@/components/DocumentViewer';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function OrderDetailPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Admin note state
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Notification state
  const [notifTitle, setNotifTitle] = useState('Order Status Update');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState('info');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrderById(id);
        if (data) {
          setOrder(data);
          setNewStatus(data.status || 'pending');
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setStatusUpdating(true);
    try {
      await updateOrderStatus(order.id || id, newStatus);
      setOrder((prev) => ({
        ...prev,
        status: newStatus,
        timeline: [
          ...(prev.timeline || []),
          {
            status: `Status updated to ${newStatus}`,
            timestamp: new Date().toISOString(),
            note: 'Updated by Admin',
          },
        ],
      }));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e?.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      await addOrderNote(order.id || id, noteText.trim());
      setOrder((prev) => ({
        ...prev,
        notes: [
          ...(prev.notes || []),
          {
            id: `n_${Date.now()}`,
            text: noteText.trim(),
            created_at: new Date().toISOString(),
          },
        ],
      }));
      setNoteText('');
    } finally {
      setAddingNote(false);
    }
  };

  const handleSendNotification = async (e) => {
    e?.preventDefault();
    if (!notifMsg.trim()) return;
    setSendingNotif(true);
    try {
      if (order?.user_id) {
        await sendNotification(order.user_id, notifTitle, notifMsg.trim(), notifType);
      }
      setNotifSuccess(true);
      setNotifMsg('');
      setTimeout(() => setNotifSuccess(false), 4000);
    } finally {
      setSendingNotif(false);
    }
  };

  const handleDocStatusUpdate = (docId, updatedStatus, remarks) => {
    setOrder((prev) => {
      const updatedDocs = (prev.documents || []).map((doc) => {
        if (doc.id === docId || doc.name === docId) {
          return { ...doc, status: updatedStatus, remarks };
        }
        return doc;
      });
      return { ...prev, documents: updatedDocs };
    });
  };

  if (loading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (!order) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Order not found</h3>
        <Link href="/dashboard/orders" className="mt-4 inline-block text-sm font-semibold text-[#1B2B5E]">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            ←
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-mono">
                Order #{safeRender(order.order_id || order.id)}
              </h2>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-500">
              Placed on {formatDate(order.created_at, 'dd MMMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (60% -> 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Info Card */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>👤</span> Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Customer Name</div>
                <div className="font-bold text-slate-800 text-sm">{safeRender(order.user_name || order.applicant_name || '—')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Customer ID</div>
                <div className="font-mono font-bold text-[#1B2B5E] text-sm">{safeRender(order.customer_id || order.user_id || '—')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Phone Number</div>
                <div className="font-semibold text-slate-800">{safeRender(order.user_phone || order.phone || '—')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Email Address</div>
                <div className="font-semibold text-slate-800">{safeRender(order.user_email || order.email || '—')}</div>
              </div>
            </div>
          </div>

          {/* Service Info & Financial Schedule */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>💼</span> Service & Fee Schedule
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
              <div>
                <div className="text-[11px] text-slate-500 font-semibold">Service</div>
                <div className="font-bold text-slate-900 text-xs mt-0.5">{safeRender(order.service_name || order.service_type || 'Service')}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-semibold">Total Fee</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{formatCurrency(order.fee)}</div>
              </div>
              <div>
                <div className="text-[11px] text-emerald-600 font-semibold">Total Paid</div>
                <div className="font-bold text-emerald-700 text-sm mt-0.5">{formatCurrency(order.paid)}</div>
              </div>
              <div>
                <div className="text-[11px] text-amber-600 font-semibold">Balance Due</div>
                <div className="font-bold text-amber-700 text-sm mt-0.5">{formatCurrency(order.remaining)}</div>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>💳</span> Payment History
            </h3>
            {Array.isArray(order.payments) && order.payments.length > 0 ? (
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="admin-table text-xs">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Method</th>
                      <th>Transaction ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.payments.map((pay) => (
                      <tr key={pay.id || pay.transaction_id}>
                        <td>{formatDate(pay.created_at)}</td>
                        <td className="capitalize font-semibold">{safeRender(pay.type)}</td>
                        <td>{safeRender(pay.method, 'Online')}</td>
                        <td className="font-mono text-slate-500">{safeRender(pay.transaction_id)}</td>
                        <td className="font-bold text-slate-900">{formatCurrency(pay.amount)}</td>
                        <td><StatusBadge status={pay.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">No payment transactions recorded yet.</div>
            )}
          </div>

          {/* Order Timeline */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>⏱️</span> Order Progression Timeline
            </h3>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {(Array.isArray(order.timeline) ? order.timeline : []).map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 relative pl-8">
                  <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[#1B2B5E] border-2 border-white shadow-sm" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">{safeRender(step.status)}</div>
                    {step.note && <div className="text-xs text-slate-500 mt-0.5">{safeRender(step.note)}</div>}
                    <div className="text-[10px] text-slate-400 mt-1">{formatRelativeTime(step.timestamp)} • {formatDate(step.timestamp, 'dd MMM yyyy, hh:mm a')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (40% -> 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Update Card */}
          <div className="admin-card bg-gradient-to-br from-slate-900 to-[#1B2B5E] text-white border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Application Lifecycle
              </span>
              <StatusBadge status={order.status} className="bg-white/20 text-white border-white/30" />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-200">Update Processing Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-white/10 text-white text-xs font-semibold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
              >
                <option value="pending" className="text-slate-900">Pending</option>
                <option value="processing" className="text-slate-900">Processing / Under Scrutiny</option>
                <option value="verification" className="text-slate-900">Verification</option>
                <option value="completed" className="text-slate-900">Completed & Issued</option>
              </select>

              <button
                onClick={handleUpdateStatus}
                disabled={statusUpdating || newStatus === order.status}
                className="w-full py-2.5 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-40"
              >
                {statusUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Uploaded Documents Card */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>📁</span> Uploaded Documents
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {order.documents?.length || 0} Files
              </span>
            </div>

            <div className="space-y-3">
              {order.documents && order.documents.length > 0 ? (
                order.documents.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">📑</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">{doc.name}</div>
                          <div className="text-[10px] text-slate-500">{doc.size || 'Attached'}</div>
                        </div>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>

                    {doc.remarks && (
                      <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-100">
                        💬 {doc.remarks}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-2.5 py-1 bg-[#1B2B5E] text-white text-[11px] font-bold rounded hover:bg-[#283E80] transition-colors"
                      >
                        👁️ View & Verify
                      </button>
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[11px] font-semibold rounded hover:bg-slate-300 transition-colors"
                        >
                          📥 Download
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-4 text-center">
                  No documents uploaded by user yet.
                </div>
              )}
            </div>
          </div>

          {/* Admin Internal Notes */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📝</span> Internal Admin Notes
            </h3>

            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {(order.notes || []).map((note, idx) => (
                <div key={note.id || idx} className="p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100">
                  <div className="text-slate-800">{note.text}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{formatRelativeTime(note.created_at)}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add private staff note (e.g. ARN query replied, department followed up)..."
                rows={2}
                className="admin-input text-xs"
              />
              <button
                type="submit"
                disabled={addingNote || !noteText.trim()}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
              >
                {addingNote ? 'Saving...' : 'Add Note'}
              </button>
            </form>
          </div>

          {/* Send Direct Notification to User */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🔔</span> Send Notification to Client
            </h3>

            <form onSubmit={handleSendNotification} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Notification Title</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="admin-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Message Body</label>
                <textarea
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  placeholder="Type alert or request details for user mobile app..."
                  rows={2}
                  className="admin-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Notification Type</label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="admin-input text-xs"
                >
                  <option value="info">Info Notice</option>
                  <option value="payment">Payment Alert</option>
                  <option value="action">Action / Document Required</option>
                  <option value="success">Success / Certificate Issued</option>
                </select>
              </div>

              {notifSuccess && (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded font-semibold">
                  ✅ Notification dispatched to user account!
                </div>
              )}

              <button
                type="submit"
                disabled={sendingNotif || !notifMsg.trim()}
                className="w-full py-2 bg-[#1B2B5E] hover:bg-[#283E80] text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-40"
              >
                {sendingNotif ? 'Sending...' : 'Send to User'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        onUpdateStatus={handleDocStatusUpdate}
      />
    </div>
  );
}
