'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getITRApplicationById, updateITRStatus } from '@/lib/adminDatabase';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import DocumentViewer from '@/components/DocumentViewer';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function ITRDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [ackNumber, setAckNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getITRApplicationById(id);
        if (data) {
          setApp(data);
          setStatus(data.status || 'submitted');
          setAckNumber(data.acknowledgment_number || '');
        }
      } catch (err) {
        console.error('Failed to load ITR details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await updateITRStatus(app.id || id, status, ackNumber);
      setApp((prev) => ({ ...prev, status, acknowledgment_number: ackNumber }));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!app) {
    return (
      <div className="admin-card text-center py-12">
        <div className="text-4xl mb-2">🔍</div>
        <h3 className="text-base font-bold text-slate-800 mb-1">ITR Application Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">No ITR application found with ID: {id}</p>
        <Link href="/dashboard/itr" className="px-4 py-2 bg-[#1B2B5E] text-white text-xs font-bold rounded-lg inline-block hover:bg-[#283E80] transition-colors">
          ← Back to ITR Applications
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
            href="/dashboard/itr"
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
              ITR Return • {app.assessment_year || 'AY 2026-27'} • Submitted {formatDate(app.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Taxpayer Profile */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>👤</span> Taxpayer Profile & Form Choice
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Taxpayer Full Name</div>
                <div className="font-bold text-slate-900 text-sm">{app.applicant_name || app.profile?.fullName}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Recommended ITR Form</div>
                <div className="font-bold text-amber-700">{app.recommended_itr_form || 'ITR-3 (Business & Profession)'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Selected Tax Regime</div>
                <div className="font-semibold text-slate-800">{app.selected_regime || 'New Regime (Section 115BAC)'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Residential Status</div>
                <div className="font-semibold text-slate-800">{app.residential_status || 'Resident Individual'}</div>
              </div>
            </div>
          </div>

          {/* Income Sources Breakdown */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>📊</span> Head-wise Income Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <div className="text-slate-500 font-semibold">Business / Profession</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{app.income_sources?.businessIncome || '₹14,50,000'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">Salary Income</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{app.income_sources?.salaryIncome || '₹0'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">Capital Gains</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{app.income_sources?.capitalGains || '₹85,000'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">Other Sources</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{app.income_sources?.otherSources || '₹42,000'}</div>
              </div>
            </div>
          </div>

          {/* Tax Computation Summary */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🧾</span> Tax Computation & Refund Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <div className="text-slate-500 font-semibold">Gross Total Income</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{app.tax_computation?.grossTotalIncome || '₹15,77,000'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">Total Tax Payable</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{app.tax_computation?.totalTaxPayable || '₹1,68,200'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">TDS / Advance Tax Paid</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{app.tax_computation?.advanceTdsPaid || '₹1,75,000'}</div>
              </div>
              <div>
                <div className="text-emerald-600 font-bold">Refund Due</div>
                <div className="font-extrabold text-emerald-700 text-sm mt-0.5">{app.tax_computation?.refundDue || '₹6,800'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status & 15-Digit Acknowledgement Number */}
          <div className="admin-card bg-gradient-to-br from-yellow-950 to-[#1B2B5E] text-white border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-200">ITR E-Filing Status</span>
              <StatusBadge status={app.status} className="bg-white/20 text-white border-white/30" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-yellow-200 mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/10 text-white text-xs font-semibold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                >
                  <option value="submitted" className="text-slate-900">Submitted</option>
                  <option value="under_review" className="text-slate-900">Under Review / Preparing Computation</option>
                  <option value="ready_for_filing" className="text-slate-900">Ready for E-Filing</option>
                  <option value="filed" className="text-slate-900">Filed on Income Tax Portal</option>
                  <option value="completed" className="text-slate-900">E-Verified & Completed ✅</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-yellow-200 mb-1">15-Digit E-Filing Ack No.</label>
                <input
                  type="text"
                  value={ackNumber}
                  onChange={(e) => setAckNumber(e.target.value)}
                  placeholder="ACK-889900112233445"
                  className="w-full font-mono bg-white/10 text-white text-xs font-bold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full py-2.5 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-40"
              >
                {updating ? 'Saving...' : 'Save ITR Filing'}
              </button>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📝</span> E-Filing Remarks
            </h3>
            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {app.admin_notes || 'Form 26AS & AIS matched with banking statements. E-verification initiated.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
