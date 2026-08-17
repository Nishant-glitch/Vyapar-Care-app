'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getGSTApplicationById, updateGSTStatus, updateGSTDocumentStatus, sendNotification } from '@/lib/adminDatabase';
import { maskPAN, maskBankAccount, maskAadhaar, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import DocumentViewer from '@/components/DocumentViewer';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function GSTDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Status & GSTIN
  const [status, setStatus] = useState('');
  const [officialGstin, setOfficialGstin] = useState('');
  const [updating, setUpdating] = useState(false);

  // Missing doc request
  const [missingDocType, setMissingDocType] = useState('electricity_bill');
  const [missingDocMsg, setMissingDocMsg] = useState('');
  const [requestingDoc, setRequestingDoc] = useState(false);
  const [reqSuccess, setReqSuccess] = useState(false);

  // Admin note
  const [adminNote, setAdminNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getGSTApplicationById(id);
        if (data) {
          setApp(data);
          setStatus(data.status || 'submitted');
          setOfficialGstin(data.official_gstin || '');
          setAdminNote(data.admin_notes || '');
        }
      } catch (err) {
        console.error('Failed to load GST details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await updateGSTStatus(app.id || id, status, officialGstin);
      setApp((prev) => ({ ...prev, status, official_gstin: officialGstin }));
    } finally {
      setUpdating(false);
    }
  };

  const handleRequestDocument = async (e) => {
    e?.preventDefault();
    if (!missingDocMsg.trim()) return;
    setRequestingDoc(true);
    try {
      await sendNotification(
        app.user_id || 'usr_001',
        `Document Required: ${missingDocType.replace(/_/g, ' ').toUpperCase()}`,
        missingDocMsg.trim(),
        'action'
      );
      setReqSuccess(true);
      setMissingDocMsg('');
      setTimeout(() => setReqSuccess(false), 4000);
    } finally {
      setRequestingDoc(false);
    }
  };

  const handleSaveNotes = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!app) {
    return (
      <div className="admin-card text-center py-12">
        <div className="text-4xl mb-2">🔍</div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Application Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">No GST application found with ID: {id}</p>
        <Link href="/dashboard/gst" className="px-4 py-2 bg-[#1B2B5E] text-white text-xs font-bold rounded-lg inline-block hover:bg-[#283E80] transition-colors">
          ← Back to GST Applications
        </Link>
      </div>
    );
  }

  const docEntries = Object.entries(app.documents || {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/gst"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            ←
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-mono">
                {app.application_id || app.id}
              </h2>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-xs text-slate-500">
              Form GST REG-01 • Submitted {formatDate(app.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Applicant Details */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>👤</span> Primary Applicant Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Full Legal Name</div>
                <div className="font-bold text-slate-900 text-sm">{app.applicant?.fullName || app.applicant_name}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Father / Spouse Name</div>
                <div className="font-medium text-slate-800">{app.applicant?.fatherName || '—'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">PAN Number</div>
                <div className="font-mono font-bold text-slate-800">{maskPAN(app.applicant?.pan)}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Aadhaar Number</div>
                <div className="font-mono font-semibold text-slate-800">{maskAadhaar(app.applicant?.aadhaar)}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Mobile Contact</div>
                <div className="font-semibold text-slate-800">{app.applicant?.mobile || app.mobile}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Email Address</div>
                <div className="font-semibold text-slate-800">{app.applicant?.email || app.email}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-slate-400 font-semibold mb-0.5">Residential Address</div>
                <div className="text-slate-800">{app.applicant?.residentialAddress || '—'}</div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🏢</span> Business Entity Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Trade Name</div>
                <div className="font-bold text-slate-900 text-sm">{app.business_details?.tradeName || app.business_name}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Legal Name</div>
                <div className="font-bold text-slate-900 text-sm">{app.business_details?.legalName || '—'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Constitution of Business</div>
                <div className="font-medium text-slate-800">{app.constitution || app.business_details?.constitution}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Commencement Date</div>
                <div className="font-medium text-slate-800">{app.business_details?.startDate || '—'}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-slate-400 font-semibold mb-0.5">Business Activities / Nature of Goods</div>
                <div className="font-medium text-slate-800">{app.business_details?.activity || app.business_type}</div>
              </div>
            </div>
          </div>

          {/* Promoters / Partners */}
          {app.promoters && app.promoters.length > 0 && (
            <div className="admin-card">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>👥</span> Promoters / Partners / Directors ({app.promoters.length})
              </h3>
              <div className="space-y-3">
                {app.promoters.map((p, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-slate-500">{p.designation} • Share: {p.share}</div>
                    </div>
                    <div className="text-right font-mono text-slate-600">
                      <div>PAN: {maskPAN(p.pan)}</div>
                      <div className="text-[11px] text-slate-400">{p.mobile}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Principal Place of Business Address */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>📍</span> Principal Place of Business Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Premises Possession Type</div>
                <div className="font-bold text-slate-800">{app.premises_details?.type || 'Rented / Leased'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Proof of Possession</div>
                <div className="font-medium text-slate-800">{app.premises_details?.natureOfPossession || 'Electricity Bill'}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-slate-400 font-semibold mb-0.5">Registered Address</div>
                <div className="font-medium text-slate-800">{app.premises_details?.address || '—'}</div>
              </div>
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🏦</span> Bank Account Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Account Number</div>
                <div className="font-mono font-bold text-slate-900">{maskBankAccount(app.bank_details?.accountNumber)}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">IFSC Code</div>
                <div className="font-mono font-bold text-[#1B2B5E]">{app.bank_details?.ifsc || '—'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Bank Name & Branch</div>
                <div className="font-medium text-slate-800">{app.bank_details?.bankName} ({app.bank_details?.branch})</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Account Type</div>
                <div className="font-medium text-slate-800">{app.bank_details?.accountType || 'Current'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Update & GSTIN Issuance */}
          <div className="admin-card bg-gradient-to-br from-[#1B2B5E] to-[#111C3E] text-white border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">GST Registration Status</span>
              <StatusBadge status={app.status} className="bg-white/20 text-white border-white/30" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/10 text-white text-xs font-semibold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                >
                  <option value="submitted" className="text-slate-900">Submitted</option>
                  <option value="under_scrutiny" className="text-slate-900">Under Scrutiny / Review</option>
                  <option value="clarification_needed" className="text-slate-900">Clarification Needed</option>
                  <option value="gstin_issued" className="text-slate-900">GSTIN Issued ✅</option>
                  <option value="rejected" className="text-slate-900">Rejected ❌</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Official GSTIN (15 Digits)</label>
                <input
                  type="text"
                  value={officialGstin}
                  onChange={(e) => setOfficialGstin(e.target.value.toUpperCase())}
                  placeholder="07AAAAA0000A1Z5"
                  className="w-full font-mono uppercase bg-white/10 text-white text-xs font-bold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full py-2.5 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-40"
              >
                {updating ? 'Updating...' : 'Save GST Status'}
              </button>
            </div>
          </div>

          {/* Documents Checklist & Review */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>📁</span> Document Checklist ({docEntries.length})
              </h3>
            </div>

            <div className="space-y-3">
              {docEntries.map(([key, doc]) => (
                <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800">{doc.name || key.replace(/_/g, ' ')}</div>
                    <StatusBadge status={doc.status} />
                  </div>
                  {doc.remarks && (
                    <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-100">
                      {doc.remarks}
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setSelectedDoc({ ...doc, key })}
                      className="px-2.5 py-1 bg-[#1B2B5E] text-white text-[11px] font-bold rounded hover:bg-[#283E80] transition-colors"
                    >
                      👁️ View & Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request Missing Document */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>⚠️</span> Request Missing / Clear Document
            </h3>

            <form onSubmit={handleRequestDocument} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Document Needed</label>
                <select
                  value={missingDocType}
                  onChange={(e) => setMissingDocType(e.target.value)}
                  className="admin-input text-xs"
                >
                  <option value="electricity_bill">Electricity Bill (Less than 2 months old)</option>
                  <option value="rent_agreement">Registered / Notarized Rent Agreement</option>
                  <option value="pan_card">Clear PAN Card Photo</option>
                  <option value="bank_proof">Bank Statement / Cancelled Cheque</option>
                  <option value="consent_letter">Landlord NOC / Consent Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Instructions for User</label>
                <textarea
                  value={missingDocMsg}
                  onChange={(e) => setMissingDocMsg(e.target.value)}
                  placeholder="Please upload high resolution electricity bill where address matches trade premise..."
                  rows={2}
                  className="admin-input text-xs"
                  required
                />
              </div>

              {reqSuccess && (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded font-semibold">
                  ✅ Request notification sent to applicant!
                </div>
              )}

              <button
                type="submit"
                disabled={requestingDoc || !missingDocMsg.trim()}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
              >
                {requestingDoc ? 'Requesting...' : 'Request Document from User'}
              </button>
            </form>
          </div>

          {/* Admin Notes */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📝</span> GST Scrutiny Notes
            </h3>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="ARN tracking notes, jurisdictional ward officer communication..."
              className="admin-input text-xs mb-2"
            />
            {noteSaved && <div className="text-xs text-emerald-600 font-semibold mb-2">Note saved!</div>}
            <button
              onClick={handleSaveNotes}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Save Internal Notes
            </button>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        onUpdateStatus={(docKey, newDocStatus, remarks) => {
          updateGSTDocumentStatus(app.id || id, docKey, newDocStatus, remarks);
          setApp((prev) => {
            const docs = { ...prev.documents };
            if (docs[docKey]) docs[docKey] = { ...docs[docKey], status: newDocStatus, remarks };
            return { ...prev, documents: docs };
          });
        }}
      />
    </div>
  );
}
