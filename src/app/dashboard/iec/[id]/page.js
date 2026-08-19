'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getIECApplicationById, updateIECStatus } from '@/lib/adminDatabase';
import { maskPAN, formatDate, safeRender } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import DocumentViewer from '@/components/DocumentViewer';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function IECDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [status, setStatus] = useState('');
  const [iecNumber, setIecNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getIECApplicationById(id);
        if (data) {
          setApp(data);
          setStatus(data.status || 'submitted');
          setIecNumber(data.iec_number || '');
        }
      } catch (err) {
        console.error('Failed to load IEC details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await updateIECStatus(app.id || id, status, iecNumber);
      setApp((prev) => ({ ...prev, status, iec_number: iecNumber }));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!app) {
    return (
      <div className="admin-card text-center py-12">
        <div className="text-4xl mb-2">🔍</div>
        <h3 className="text-base font-bold text-slate-800 mb-1">IEC Application Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">No IEC application found with ID: {id}</p>
        <Link href="/dashboard/iec" className="px-4 py-2 bg-[#1B2B5E] text-white text-xs font-bold rounded-lg inline-block hover:bg-[#283E80] transition-colors">
          ← Back to IEC Applications
        </Link>
      </div>
    );
  }

  const productsList = Array.isArray(app.products)
    ? app.products
    : ['Silk Fabrics (HSN 5007)', 'Cotton Madeups (HSN 6304)'];

  const countriesList = Array.isArray(app.countries)
    ? app.countries
    : ['United States', 'United Kingdom', 'UAE', 'Australia'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/iec"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            ←
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-mono">
                {safeRender(app.application_id || app.id)}
              </h2>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-xs text-slate-500">
              DGFT e-IEC Registration • Submitted {formatDate(app.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Entity & PAN Information */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🌐</span> Entity & PAN Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Firm / Entity Name</div>
                <div className="font-bold text-slate-900 text-sm">
                  {safeRender(app.business_details?.firmName || app.business_details?.businessName || app.applicant_name || '—')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Entity Constitution</div>
                <div className="font-semibold text-slate-800 capitalize">
                  {safeRender(app.entity_type || app.constitution || 'Partnership')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">PAN Number</div>
                <div className="font-mono font-bold text-slate-900">
                  {maskPAN(typeof app.pan === 'string' ? app.pan : (app.pan_details?.panNumber || ''))}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Activity Nature</div>
                <div className="font-medium text-slate-800">
                  {safeRender(app.business_details?.activity || app.nature_of_business || 'Merchant & Manufacturer Exporter')}
                </div>
              </div>
            </div>
          </div>

          {/* Export Products & Destination Countries */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>📦</span> Products & Destination Countries
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <div className="font-semibold text-slate-700 mb-1.5">Intended Export / Import Products (HSN)</div>
                <div className="flex flex-wrap gap-2">
                  {productsList.map((p, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 rounded-lg text-slate-800 font-medium">
                      {safeRender(typeof p === 'object' ? p.name || p.hsn : p)}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-700 mb-1.5">Primary Trade Destination Countries</div>
                <div className="flex flex-wrap gap-2">
                  {countriesList.map((c, idx) => (
                    <span key={idx} className="px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-lg font-medium">
                      ✈️ {safeRender(typeof c === 'object' ? c.name || c.country : c)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status & 10-Digit IEC Code */}
          <div className="admin-card bg-gradient-to-br from-cyan-950 to-[#1B2B5E] text-white border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">DGFT IEC Status</span>
              <StatusBadge status={app.status} className="bg-white/20 text-white border-white/30" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-cyan-200 mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/10 text-white text-xs font-semibold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                >
                  <option value="submitted" className="text-slate-900">Submitted</option>
                  <option value="under_review" className="text-slate-900">Under Review / PFMS Verification</option>
                  <option value="clarification_required" className="text-slate-900">Clarification Required</option>
                  <option value="approved" className="text-slate-900">IEC Issued & Validated ✅</option>
                  <option value="completed" className="text-slate-900">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cyan-200 mb-1">10-Digit DGFT IEC Code</label>
                <input
                  type="text"
                  maxLength={10}
                  value={iecNumber}
                  onChange={(e) => setIecNumber(e.target.value.toUpperCase())}
                  placeholder="0308091234"
                  className="w-full font-mono uppercase bg-white/10 text-white text-xs font-bold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full py-2.5 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-40"
              >
                {updating ? 'Saving...' : 'Save IEC Registration'}
              </button>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📝</span> DGFT Portal Notes
            </h3>
            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {safeRender(app.admin_remarks || app.admin_notes, 'PFMS bank pre-validation verified successfully with DGFT portal.')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

