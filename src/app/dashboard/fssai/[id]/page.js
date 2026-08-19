'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getFSSAIApplicationById, updateFSSAIStatus } from '@/lib/adminDatabase';
import { formatDate, safeRender } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import DocumentViewer from '@/components/DocumentViewer';
import ApplicationPrintView from '@/components/ApplicationPrintView';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function FSSAIDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showFullApp, setShowFullApp] = useState(false);
  const [autoPrintApp, setAutoPrintApp] = useState(false);
  const [status, setStatus] = useState('');
  const [officialNumber, setOfficialNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getFSSAIApplicationById(id);
        if (data) {
          setApp(data);
          setStatus(data.status || 'submitted');
          setOfficialNumber(data.official_fssai_number || '');
        }
      } catch (err) {
        console.error('Failed to load FSSAI details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await updateFSSAIStatus(app.id || id, status, officialNumber);
      setApp((prev) => ({ ...prev, status, official_fssai_number: officialNumber }));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!app) {
    return (
      <div className="admin-card text-center py-12">
        <div className="text-4xl mb-2">🔍</div>
        <h3 className="text-base font-bold text-slate-800 mb-1">FSSAI Application Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">No FSSAI application found with ID: {id}</p>
        <Link href="/dashboard/fssai" className="px-4 py-2 bg-[#1B2B5E] text-white text-xs font-bold rounded-lg inline-block hover:bg-[#283E80] transition-colors">
          ← Back to FSSAI Applications
        </Link>
      </div>
    );
  }

  const rawDocs = app.documents || {};
  const docList = Array.isArray(rawDocs)
    ? rawDocs
    : Object.entries(rawDocs).map(([key, val]) => ({
        label: key.replace(/_/g, ' '),
        name: typeof val === 'object' ? val.name || key : key,
        file_url: typeof val === 'object' ? val.file_url || val.url : val,
        status: typeof val === 'object' ? val.status || 'pending' : 'pending',
      }));

  const productsList = Array.isArray(app.products) ? app.products : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/fssai"
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
              FSSAI FoSCoS • Submitted {formatDate(app.created_at)}
            </p>
          </div>
        </div>

        {/* Full Application Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setShowFullApp(true);
              setAutoPrintApp(false);
            }}
            className="px-3.5 py-2 bg-[#1B2B5E] hover:bg-[#283E80] text-white text-xs font-bold rounded-lg transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
          >
            👁️ View Full Application
          </button>
          <button
            onClick={() => {
              setShowFullApp(true);
              setAutoPrintApp(true);
            }}
            className="px-3.5 py-2 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-lg transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
          >
            🖨️ Print Application
          </button>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* FBO Business Details */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🍽️</span> Food Business Operator (FBO) Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Food Business Name</div>
                <div className="font-bold text-slate-900 text-sm">
                  {safeRender(app.business_details?.foodBusinessName || app.business_details?.businessName || app.business_name || '—')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">License Tier / Validity</div>
                <div className="font-bold text-emerald-700">
                  {safeRender(app.license_type || app.license_category || 'State License')} ({safeRender(app.validity_years || 1)} Years)
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Kind of Business (KOB)</div>
                <div className="font-semibold text-slate-800">
                  {safeRender(app.kob || app.business_type || 'Restaurant & Bakery')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Annual Turnover Estimate</div>
                <div className="font-semibold text-slate-800">
                  {safeRender(app.business_details?.turnover || app.turnover || '₹35 Lakhs / yr')}
                </div>
              </div>
            </div>
          </div>

          {/* Products & Food Categories */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🥦</span> Food Products & Manufacturing Capacity ({productsList.length})
            </h3>
            <div className="space-y-2">
              {(productsList.length > 0 ? productsList : [
                { name: 'Prepared Food & Beverages', category: 'Category 16 (Food Services)', capacity: '100 kg/day' }
              ]).map((prod, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{safeRender(prod.name || prod.productName)}</div>
                    <div className="text-slate-500">Category: {safeRender(prod.category || prod.foodCategory || '—')}</div>
                  </div>
                  <div className="font-semibold text-[#1B2B5E]">{safeRender(prod.capacity || prod.productionCapacity || '—')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Food Premises Details */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>📍</span> Food Establishment Premises
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Premises Name</div>
                <div className="font-bold text-slate-800">{safeRender(app.premises_details?.premisesName || 'Store Premise')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Premises Type</div>
                <div className="font-medium text-slate-800">{safeRender(app.premises_details?.premisesType || 'Commercial Rented')}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-slate-400 font-semibold mb-0.5">Premises Address</div>
                <div className="text-slate-800">{safeRender(app.premises_details?.address || app.premises_address || 'Plot 108, Hill Road, Bandra West, Mumbai - 400050')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status & 14-Digit FSSAI Registration Number */}
          <div className="admin-card bg-gradient-to-br from-emerald-950 to-[#1B2B5E] text-white border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">FSSAI Status</span>
              <StatusBadge status={app.status} className="bg-white/20 text-white border-white/30" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/10 text-white text-xs font-semibold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                >
                  <option value="submitted" className="text-slate-900">Submitted</option>
                  <option value="under_review" className="text-slate-900">Under Review (Scrutiny)</option>
                  <option value="clarification_required" className="text-slate-900">Clarification Required</option>
                  <option value="inspection_scheduled" className="text-slate-900">Food Safety Officer Inspection</option>
                  <option value="approved" className="text-slate-900">License Issued ✅</option>
                  <option value="rejected" className="text-slate-900">Rejected ❌</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1">14-Digit FSSAI License Number</label>
                <input
                  type="text"
                  maxLength={14}
                  value={officialNumber}
                  onChange={(e) => setOfficialNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="10022022001234"
                  className="w-full font-mono bg-white/10 text-white text-xs font-bold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full py-2.5 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-40"
              >
                {updating ? 'Saving...' : 'Save FSSAI Details'}
              </button>
            </div>
          </div>

          {/* FSSAI Documents Checklist */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📁</span> FSSAI Compliance Documents ({docList.length})
            </h3>
            <div className="space-y-3">
              {docList.map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900">{safeRender(doc.name || doc.label)}</div>
                    <StatusBadge status={doc.status || 'uploaded'} />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className="px-2.5 py-1 bg-[#1B2B5E] text-white text-[11px] font-bold rounded hover:bg-[#283E80] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      👁️ View
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded transition-colors inline-flex items-center gap-1 border border-slate-300 cursor-pointer"
                    >
                      🖨️ Print
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📝</span> FoSCoS Scrutiny Notes
            </h3>
            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {safeRender(app.admin_notes, 'Application initiated on National FoSCoS portal with designated Food Safety Officer review.')}
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <DocumentViewer
          isOpen={Boolean(selectedDoc)}
          onClose={() => setSelectedDoc(null)}
          document={selectedDoc}
          onUpdateStatus={(docName, newDocStatus, remarks) => {
            setApp((prev) => ({
              ...prev,
              documents: docList.map((d) =>
                d.name === docName || d.label === docName ? { ...d, status: newDocStatus, remarks } : d
              ),
            }));
          }}
        />
      )}

      {/* Full Application Print / View Modal */}
      {showFullApp && (
        <ApplicationPrintView
          isOpen={showFullApp}
          onClose={() => {
            setShowFullApp(false);
            setAutoPrintApp(false);
          }}
          application={app}
          serviceType="fssai"
          autoPrint={autoPrintApp}
        />
      )}
    </div>
  );
}

