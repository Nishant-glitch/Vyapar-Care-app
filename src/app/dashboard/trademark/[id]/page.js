'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getTMApplicationById, updateTMStatus } from '@/lib/adminDatabase';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import DocumentViewer from '@/components/DocumentViewer';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function TrademarkDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [status, setStatus] = useState('');
  const [officialNumber, setOfficialNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTMApplicationById(id);
        if (data) {
          setApp(data);
          setStatus(data.status || 'submitted');
          setOfficialNumber(data.official_tm_number || '');
        }
      } catch (err) {
        console.error('Failed to load TM application:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await updateTMStatus(app.id || id, status, officialNumber);
      setApp((prev) => ({ ...prev, status, official_tm_number: officialNumber }));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!app) return <div>Application not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/trademark"
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
              Form TM-A Filing • Submitted {formatDate(app.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Trademark Mark Details & Image Preview */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>™️</span> Trademark & Device Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div className="sm:col-span-2 space-y-3 text-xs">
                <div>
                  <div className="text-slate-400 font-semibold mb-0.5">Brand / Trademark Name</div>
                  <div className="text-xl font-black text-slate-900 tracking-wide">{app.mark_details?.trademarkName || app.trademark_name}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-semibold mb-0.5">Mark Type</div>
                  <div className="font-semibold text-slate-800">{app.mark_details?.markType || 'Word & Device Logo'}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-semibold mb-0.5">Colour / Visual Claim</div>
                  <div className="text-slate-700">{app.mark_details?.colourClaim || 'Standard Colors Claimed'}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-semibold mb-0.5">Applicant Category</div>
                  <div className="font-semibold text-amber-700">{app.applicant_type || 'Individual / Small Enterprise'}</div>
                </div>
              </div>

              {/* Logo / Device Preview */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Device Logo</div>
                <img
                  src={app.mark_details?.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
                  alt="Trademark Logo"
                  className="w-28 h-28 object-cover rounded-lg shadow-sm border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Classes & Goods/Services Descriptions */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>📚</span> NICE Classification & Goods/Services Specification
            </h3>

            <div className="space-y-3">
              {Object.entries(app.class_descriptions || { 'Class 9': 'Computer software', 'Class 42': 'SaaS & cloud computing' }).map(([clsKey, desc]) => (
                <div key={clsKey} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-[#1B2B5E] mb-1">{clsKey}</div>
                  <div className="text-slate-700 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage & Attorney Authorization */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>⚖️</span> User Claim & Form TM-48 Attorney Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Usage Claim</div>
                <div className="font-bold text-slate-800">{app.usage_details?.usageType || 'Proposed to be used'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Territory</div>
                <div className="font-medium text-slate-800">{app.usage_details?.territory || 'India'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Authorised TM Attorney</div>
                <div className="font-medium text-slate-800">{app.agent_details?.attorneyName || 'Vyapar Care TM Legal Cell'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Power of Attorney (TM-48)</div>
                <div className="font-bold text-emerald-600">Signed & Executed ✅</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Update Card */}
          <div className="admin-card bg-gradient-to-br from-amber-950 to-[#1B2B5E] text-white border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-200">TM Stage</span>
              <StatusBadge status={app.status} className="bg-white/20 text-white border-white/30" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/10 text-white text-xs font-semibold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                >
                  <option value="submitted" className="text-slate-900">Submitted</option>
                  <option value="under_review" className="text-slate-900">Under Review / Drafting TM-A</option>
                  <option value="clarification_required" className="text-slate-900">Clarification Required</option>
                  <option value="examination" className="text-slate-900">Formally Examined / Pending Report</option>
                  <option value="published" className="text-slate-900">Advertised in TM Journal</option>
                  <option value="registered" className="text-slate-900">Registered & TM Certificate Issued ✅</option>
                  <option value="rejected" className="text-slate-900">Rejected / Refused ❌</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1">Official IP India Application No.</label>
                <input
                  type="text"
                  value={officialNumber}
                  onChange={(e) => setOfficialNumber(e.target.value)}
                  placeholder="TM-APP-6543210"
                  className="w-full font-mono uppercase bg-white/10 text-white text-xs font-bold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full py-2.5 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-40"
              >
                {updating ? 'Saving...' : 'Update Trademark Status'}
              </button>
            </div>
          </div>

          {/* Trademark Documents Checklist */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📁</span> TM Evidence & Legal Proofs
            </h3>
            <div className="space-y-3">
              {(app.documents || []).map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900">{doc.name}</div>
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="px-2.5 py-1 bg-[#1B2B5E] text-white text-[11px] font-bold rounded hover:bg-[#283E80] transition-colors"
                    >
                      👁️ View Proof
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📝</span> Trademark Registry Notes
            </h3>
            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {app.admin_notes || 'Form TM-A draft prepared with NICE Classification specifications.'}
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        onUpdateStatus={(docName, newDocStatus, remarks) => {
          setApp((prev) => ({
            ...prev,
            documents: (prev.documents || []).map((d) =>
              d.name === docName ? { ...d, status: newDocStatus, remarks } : d
            ),
          }));
        }}
      />
    </div>
  );
}
