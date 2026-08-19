'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getUdyamApplicationById, updateUdyamStatus } from '@/lib/adminDatabase';
import { formatDate, safeRender } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import DocumentViewer from '@/components/DocumentViewer';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function UdyamDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [udyamNumber, setUdyamNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getUdyamApplicationById(id);
        if (data) {
          setApp(data);
          setStatus(data.status || 'submitted');
          setUdyamNumber(data.udyam_registration_number || '');
        }
      } catch (err) {
        console.error('Failed to load Udyam details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await updateUdyamStatus(app.id || id, status, udyamNumber);
      setApp((prev) => ({ ...prev, status, udyam_registration_number: udyamNumber }));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!app) {
    return (
      <div className="admin-card text-center py-12">
        <div className="text-4xl mb-2">🔍</div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Udyam Application Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">No Udyam application found with ID: {id}</p>
        <Link href="/dashboard/udyam" className="px-4 py-2 bg-[#1B2B5E] text-white text-xs font-bold rounded-lg inline-block hover:bg-[#283E80] transition-colors">
          ← Back to Udyam Applications
        </Link>
      </div>
    );
  }

  // Parse classification safely
  const classificationText = typeof app.msme_classification === 'object'
    ? app.msme_classification?.categoryLabel || app.msme_classification?.category || 'Micro Enterprise'
    : (app.msme_classification || 'Micro Enterprise');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/udyam"
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
              National MSME Portal • Submitted {formatDate(app.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Enterprise Profile */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🏭</span> Enterprise & Entrepreneur Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Enterprise Name</div>
                <div className="font-bold text-slate-900 text-sm">
                  {safeRender(app.enterprise_name || app.business_details?.enterpriseName || app.business_details?.businessName || '—')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Applicant / Entrepreneur</div>
                <div className="font-bold text-slate-900 text-sm">
                  {safeRender(app.applicant_name || app.aadhaar_details?.applicantName || app.applicant_details?.fullName || '—')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">MSME Classification</div>
                <div className="font-bold text-pink-700">
                  {classificationText}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Major Activity</div>
                <div className="font-semibold text-slate-800">
                  {safeRender(app.business_details?.majorActivity || 'Trading / Services')}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed JSONB: Business & Aadhaar Info */}
          {(app.business_details || app.aadhaar_details || app.bank_details) && (
            <div className="admin-card space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>📋</span> Submitted Application Details
              </h3>

              {app.aadhaar_details && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 mb-2">Aadhaar & Verification</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div><span className="text-slate-400">Name:</span> {safeRender(app.aadhaar_details.applicantName || app.aadhaar_details.name)}</div>
                    <div><span className="text-slate-400">Aadhaar No:</span> {safeRender(app.aadhaar_details.aadhaarNumber || app.aadhaar_details.aadhaarNo)}</div>
                    <div><span className="text-slate-400">Gender:</span> {safeRender(app.aadhaar_details.gender)}</div>
                    <div><span className="text-slate-400">Social Category:</span> {safeRender(app.aadhaar_details.socialCategory)}</div>
                  </div>
                </div>
              )}

              {app.business_details && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 mb-2">Business / Unit Information</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div><span className="text-slate-400">Org Type:</span> {safeRender(app.business_details.organisationType || app.business_details.type)}</div>
                    <div><span className="text-slate-400">PAN:</span> {safeRender(app.business_details.panNumber || app.business_details.pan)}</div>
                    <div><span className="text-slate-400">Email:</span> {safeRender(app.business_details.email || app.email)}</div>
                    <div><span className="text-slate-400">Mobile:</span> {safeRender(app.business_details.mobile || app.mobile)}</div>
                  </div>
                </div>
              )}

              {app.bank_details && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 mb-2">Bank Details</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div><span className="text-slate-400">Bank:</span> {safeRender(app.bank_details.bankName)}</div>
                    <div><span className="text-slate-400">IFSC:</span> {safeRender(app.bank_details.ifscCode)}</div>
                    <div><span className="text-slate-400">Account No:</span> {safeRender(app.bank_details.accountNumber)}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NIC Codes (National Industry Classification) */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🏷️</span> NIC 2008 Activity Codes
            </h3>
            <div className="space-y-2">
              {(Array.isArray(app.nic_codes) && app.nic_codes.length > 0
                ? app.nic_codes
                : [
                    { code: '4630', description: 'Wholesale of food, beverages and tobacco' },
                    { code: '4711', description: 'Retail sale in non-specialized stores' },
                  ]
              ).map((nic, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div className="font-mono font-bold text-[#1B2B5E] text-sm">{safeRender(typeof nic === 'object' ? nic.code : nic)}</div>
                  <div className="text-slate-700 max-w-md text-right font-medium">{safeRender(typeof nic === 'object' ? nic.description || nic.desc : '')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Financials & Plant Machinery Investment */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>💰</span> Financials & Machinery Investment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <div className="text-slate-500 font-semibold">Investment in Plant & Machinery</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {safeRender(app.financials?.investmentPlantMachinery || app.financials?.investmentCrores || '₹12,00,000')}
                </div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">Total Annual Turnover</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {safeRender(app.financials?.turnover || app.financials?.turnoverCrores || '₹45,00,000')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status & Udyam Registration Number */}
          <div className="admin-card bg-gradient-to-br from-pink-950 to-[#1B2B5E] text-white border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-200">Udyam Stage</span>
              <StatusBadge status={app.status} className="bg-white/20 text-white border-white/30" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/10 text-white text-xs font-semibold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                >
                  <option value="submitted" className="text-slate-900">Submitted</option>
                  <option value="under_review" className="text-slate-900">Under Review / Portal Verification</option>
                  <option value="clarification_required" className="text-slate-900">Clarification Required</option>
                  <option value="certificate_generated" className="text-slate-900">Certificate Generated ✅</option>
                  <option value="completed" className="text-slate-900">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1">Udyam Registration Number</label>
                <input
                  type="text"
                  value={udyamNumber}
                  onChange={(e) => setUdyamNumber(e.target.value.toUpperCase())}
                  placeholder="UDYAM-DL-08-0045612"
                  className="w-full font-mono uppercase bg-white/10 text-white text-xs font-bold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full py-2.5 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-40"
              >
                {updating ? 'Saving...' : 'Save Udyam Certificate'}
              </button>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📝</span> National MSME Registry Notes
            </h3>
            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {safeRender(app.admin_notes, 'Udyam e-certificate successfully generated from Government MSME portal.')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

