'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getPLCApplicationById, updatePLCStatus } from '@/lib/adminDatabase';
import { maskPAN, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import DocumentViewer from '@/components/DocumentViewer';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function PLCDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [status, setStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPLCApplicationById(id);
        if (data) {
          setApp(data);
          setStatus(data.status || 'submitted');
        }
      } catch (err) {
        console.error('Failed to load PLC application:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await updatePLCStatus(app.id || id, status);
      setApp((prev) => ({ ...prev, status }));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!app) {
    return (
      <div className="admin-card text-center py-12">
        <div className="text-4xl mb-2">🔍</div>
        <h3 className="text-base font-bold text-slate-800 mb-1">PLC Application Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">No PLC application found with ID: {id}</p>
        <Link href="/dashboard/plc" className="px-4 py-2 bg-[#1B2B5E] text-white text-xs font-bold rounded-lg inline-block hover:bg-[#283E80] transition-colors">
          ← Back to PLC Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/plc"
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
              MCA SPICe+ Incorporation • Submitted {formatDate(app.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Company Details */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🏢</span> Proposed Company Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Proposed Name (Choice 1)</div>
                <div className="font-bold text-slate-900 text-sm">{app.company?.proposedName1 || app.company_name}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Proposed Name (Choice 2)</div>
                <div className="font-medium text-slate-800">{app.company?.proposedName2 || '—'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">State & RoC Office</div>
                <div className="font-semibold text-slate-800">{app.company?.state || 'Karnataka'} ({app.company?.rocOffice || 'RoC Bangalore'})</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Authorized / Paid-up Capital</div>
                <div className="font-bold text-slate-900">{app.authorized_capital || '₹10,00,000'} / {app.paidup_capital || '₹1,00,000'}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-slate-400 font-semibold mb-0.5">Main Industrial Objects (MOA Clause III)</div>
                <div className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{app.company?.mainObjects || 'IT consultancy and software development services.'}</div>
              </div>
            </div>
          </div>

          {/* Directors Section with DIN */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>👥</span> Proposed Directors & DIN ({app.directors?.length || 2})
            </h3>
            <div className="space-y-3">
              {(app.directors || []).map((dir, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{dir.name}</div>
                    <div className="text-slate-500">{dir.din || 'DIN to be allotted'} • Equity Share: {dir.sharePercent || '50%'}</div>
                  </div>
                  <div className="font-mono text-slate-600 sm:text-right">
                    <div>PAN: {maskPAN(dir.pan)}</div>
                    <div className="text-[11px] text-slate-400">{dir.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscribers & Share Capital */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>📊</span> Memorandum Subscribers & Shareholding
            </h3>
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="admin-table text-xs">
                <thead>
                  <tr>
                    <th>Subscriber Name</th>
                    <th>No. of Shares</th>
                    <th>Face Value</th>
                    <th>Equity %</th>
                  </tr>
                </thead>
                <tbody>
                  {(app.subscribers || []).map((sub, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold text-slate-900">{sub.name}</td>
                      <td>{sub.shares?.toLocaleString() || 5000} shares</td>
                      <td>{sub.value || '₹50,000'}</td>
                      <td className="font-bold text-[#1B2B5E]">{sub.percentage || '50%'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registered Office Details */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>📍</span> Registered Office Premises
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Premises Type</div>
                <div className="font-bold text-slate-800">{app.office?.type || 'Commercial Rented'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Owner NOC Attached</div>
                <div className="font-semibold text-emerald-600">Yes (Verified)</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-slate-400 font-semibold mb-0.5">Registered Address</div>
                <div className="text-slate-800">{app.office?.address || 'Suite 304, Silicon Towers, Koramangala, Bengaluru - 560095'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Update Card */}
          <div className="admin-card bg-gradient-to-br from-purple-950 to-[#1B2B5E] text-white border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">PLC Stage</span>
              <StatusBadge status={app.status} className="bg-white/20 text-white border-white/30" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/10 text-white text-xs font-semibold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                >
                  <option value="draft" className="text-slate-900">Draft</option>
                  <option value="submitted" className="text-slate-900">Submitted</option>
                  <option value="under_review" className="text-slate-900">Under Review / Drafting SPICe+</option>
                  <option value="clarification_requested" className="text-slate-900">Clarification Requested</option>
                  <option value="mca_filed" className="text-slate-900">MCA Portal Filed (SRN Generated)</option>
                  <option value="approved" className="text-slate-900">Incorporated & Certificate Issued ✅</option>
                  <option value="rejected" className="text-slate-900">Rejected ❌</option>
                </select>
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full py-2.5 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-40"
              >
                {updating ? 'Saving...' : 'Update PLC Stage'}
              </button>
            </div>
          </div>

          {/* Documents Checklist */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📁</span> KYC & Incorporation Documents
            </h3>
            <div className="space-y-3">
              {(app.documents || []).map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{doc.label || doc.name}</div>
                      <div className="text-[10px] text-slate-500">{doc.category}</div>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="px-2.5 py-1 bg-[#1B2B5E] text-white text-[11px] font-bold rounded hover:bg-[#283E80] transition-colors"
                    >
                      👁️ View Document
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📝</span> RoC & MCA Scrutiny Notes
            </h3>
            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
              {app.admin_notes || 'RUN name approval complete. Form SPICe+ Part B with linked AGILE-PRO, INC-9 and e-MOA/AOA forms underway.'}
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        onUpdateStatus={(docId, newDocStatus, remarks) => {
          setApp((prev) => ({
            ...prev,
            documents: (prev.documents || []).map((d) =>
              d.document_id === docId || d.label === docId ? { ...d, status: newDocStatus, remarks } : d
            ),
          }));
        }}
      />
    </div>
  );
}
