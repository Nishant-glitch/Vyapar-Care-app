'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getUdyamApplicationById, updateUdyamStatus } from '@/lib/adminDatabase';
import { formatDate, formatCurrency, maskAadhaar, maskPAN, maskBankAccount, safeRender } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import DocumentViewer from '@/components/DocumentViewer';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function UdyamDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
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

  // Address formatting helper
  const addr = app.official_address || {};
  const formattedAddress = [
    addr.flatDoorBlock,
    addr.roadStreet,
    addr.locality,
    addr.city,
    addr.district,
    addr.state,
    addr.pinCode ? `PIN: ${addr.pinCode}` : '',
  ].filter(Boolean).join(', ') || '—';

  // Plant units array
  const plantUnits = Array.isArray(app.plant_units) ? app.plant_units : [];

  // NIC codes array
  const nicCodes = Array.isArray(app.selected_nic_codes) && app.selected_nic_codes.length > 0
    ? app.selected_nic_codes
    : (Array.isArray(app.nic_codes) ? app.nic_codes : []);

  // Parse optional documents
  const rawDocs = app.optional_documents || app.documents || {};
  const docList = Array.isArray(rawDocs)
    ? rawDocs
    : Object.entries(rawDocs).map(([key, val]) => {
        const docNameMap = {
          opt_pan_card: 'PAN Card Proof',
          opt_aadhaar_card: 'Aadhaar Card Copy',
          opt_bank_proof: 'Bank Proof (Cancelled Cheque / Passbook)',
          opt_gst_cert: 'GST Certificate',
          opt_uam_cert: 'Previous UAM Certificate',
          opt_entity_proof: 'Entity Registration Proof',
        };
        const title = docNameMap[key] || key.replace(/^(opt_|doc_)/, '').replace(/_/g, ' ').toUpperCase();
        if (typeof val === 'object' && val !== null) {
          return {
            id: key,
            name: title,
            fileName: val.name || val.fileName || `${key}.pdf`,
            url: val.url || val.file_url || null,
            size: val.size || 'Attached',
            status: val.status || 'uploaded',
          };
        }
        return {
          id: key,
          name: title,
          fileName: typeof val === 'string' && val.length > 0 ? (val.split('/').pop() || `${key}.pdf`) : 'Uploaded Document',
          url: typeof val === 'string' ? val : null,
          size: 'Attached',
          status: 'uploaded',
        };
      });

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
              National MSME / Udyam Registration • Submitted {formatDate(app.created_at)}
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
              <span>🏭</span> Enterprise Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Enterprise Name</div>
                <div className="font-bold text-slate-900 text-sm">
                  {safeRender(app.business_details?.enterpriseName || app.enterprise_name || '—')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Trade Name</div>
                <div className="font-bold text-slate-800 text-sm">
                  {safeRender(app.business_details?.tradeName || app.business_details?.enterpriseName || '—')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Applicant / Entrepreneur</div>
                <div className="font-bold text-slate-900 text-sm">
                  {safeRender(app.aadhaar_details?.nameAsPerAadhaar || app.applicant_name || '—')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">MSME Classification</div>
                <div className="font-bold text-pink-700">
                  {safeRender(app.msme_classification?.categoryLabel || app.msme_classification?.category || 'Micro Enterprise')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Major Activity</div>
                <div className="font-semibold text-slate-800 capitalize">
                  {safeRender(app.business_details?.majorActivity || 'Manufacturing & Services')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Organisation Type</div>
                <div className="font-semibold text-slate-800 capitalize">
                  {safeRender(app.business_details?.organisationType || 'Proprietorship')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Commencement Date</div>
                <div className="font-semibold text-slate-800">
                  {formatDate(app.business_details?.commencementDate) || safeRender(app.business_details?.commencementDate || '—')}
                </div>
              </div>
            </div>
          </div>

          {/* Aadhaar & Verification Details */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🪪</span> Aadhaar & Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Name as per Aadhaar</div>
                <div className="font-bold text-slate-900">{safeRender(app.aadhaar_details?.nameAsPerAadhaar || '—')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Aadhaar Number</div>
                <div className="font-mono font-bold text-slate-900">{maskAadhaar(app.aadhaar_details?.aadhaarNumber)}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Linked Mobile</div>
                <div className="font-semibold text-slate-800">{safeRender(app.aadhaar_details?.mobile || '—')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Email Address</div>
                <div className="font-semibold text-slate-800">{safeRender(app.aadhaar_details?.email || '—')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Aadhaar Holder Type</div>
                <div className="font-semibold text-slate-800 capitalize">{safeRender(app.aadhaar_details?.aadhaarHolderType || 'Proprietor')}</div>
              </div>
            </div>
          </div>

          {/* PAN & Tax Details */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>💳</span> PAN & Tax Registration Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">PAN Number</div>
                <div className="font-mono font-bold text-[#1B2B5E] text-sm">{safeRender(app.pan_details?.panNumber || '—')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Name as per PAN</div>
                <div className="font-bold text-slate-900">{safeRender(app.pan_details?.nameAsPerPAN || '—')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">GSTIN Status / No.</div>
                <div className="font-semibold text-slate-800">
                  {safeRender(app.pan_details?.gstin || (app.pan_details?.hasGSTIN ? 'Registered (GSTIN)' : 'Not registered'))}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Previous UAM Registration</div>
                <div className="font-semibold text-slate-800">
                  {app.pan_details?.hasPreviousUAM ? safeRender(app.pan_details?.uamNumber || 'Yes') : 'No'}
                </div>
              </div>
            </div>
          </div>

          {/* Official Address */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📍</span> Official Enterprise Address
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium leading-relaxed">
              {formattedAddress}
            </div>
          </div>

          {/* Plant Units */}
          {plantUnits.length > 0 && (
            <div className="admin-card">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>🏭</span> Plant / Factory Units ({plantUnits.length})
              </h3>
              <div className="space-y-3">
                {plantUnits.map((unit, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm">
                        {safeRender(unit.unitName || `Unit #${idx + 1}`)}
                      </div>
                      <span className="px-2 py-0.5 rounded bg-pink-100 text-pink-800 font-bold text-[10px] uppercase">
                        {safeRender(unit.activity || 'Manufacturing')}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      {[unit.flatDoorBlock, unit.roadStreet, unit.city, unit.state, unit.pinCode ? `PIN: ${unit.pinCode}` : ''].filter(Boolean).join(', ')}
                    </div>
                    {unit.mainProduct && (
                      <div className="text-slate-500 font-medium">
                        <span className="text-slate-400 font-semibold">Main Product/Service:</span> {safeRender(unit.mainProduct)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bank Details */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🏦</span> Bank Account Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Bank Name</div>
                <div className="font-bold text-slate-900">{safeRender(app.bank_details?.bankName || '—')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Account Number</div>
                <div className="font-mono font-bold text-slate-900">{safeRender(app.bank_details?.accountNumber || '—')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">IFSC Code</div>
                <div className="font-mono font-bold text-[#1B2B5E]">{safeRender(app.bank_details?.ifsc || app.bank_details?.ifscCode || '—')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Account Type</div>
                <div className="font-semibold text-slate-800 capitalize">{safeRender(app.bank_details?.accountType || 'Current Account')}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-slate-400 font-semibold mb-0.5">Account Holder Name</div>
                <div className="font-semibold text-slate-900">{safeRender(app.bank_details?.accountHolderName || app.aadhaar_details?.nameAsPerAadhaar || '—')}</div>
              </div>
            </div>
          </div>

          {/* Financial Details (NEW Section) */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>💰</span> Financial Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <div className="text-slate-500 font-semibold">Plant & Machinery Investment</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {formatCurrency(app.financial_details?.investmentAmount || 0)}
                </div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">Domestic Turnover</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {formatCurrency(app.financial_details?.domesticTurnover || 0)}
                </div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">Export Turnover</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {formatCurrency(app.financial_details?.exportTurnover || 0)}
                </div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">Total Annual Turnover</div>
                <div className="font-bold text-pink-800 text-sm mt-0.5">
                  {formatCurrency(app.financial_details?.totalTurnover || 0)}
                </div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">Financial Year</div>
                <div className="font-semibold text-slate-800 text-sm mt-0.5">
                  {safeRender(app.financial_details?.financialYear || '2025-2026')}
                </div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold">ITR Filed</div>
                <div className="font-semibold text-slate-800 text-sm mt-0.5">
                  {app.financial_details?.hasITR ? 'Yes ✅' : 'No ❌'}
                </div>
              </div>
            </div>
          </div>

          {/* MSME Classification (NEW Section) */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🎯</span> MSME Classification & Eligibility
            </h3>
            <div className="p-4 bg-pink-50/60 rounded-xl border border-pink-200/80 text-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="text-pink-950/70 font-semibold">Determined Category</div>
                  <div className="font-bold text-pink-900 text-sm mt-0.5">
                    {safeRender(app.msme_classification?.categoryLabel || app.msme_classification?.category || 'Micro Enterprise')}
                  </div>
                </div>
                <div>
                  <div className="text-pink-950/70 font-semibold">Investment (Crores)</div>
                  <div className="font-bold text-pink-900 text-sm mt-0.5">
                    {app.msme_classification?.investmentCrores !== undefined ? `₹ ${app.msme_classification?.investmentCrores} Cr` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-pink-950/70 font-semibold">Turnover (Crores)</div>
                  <div className="font-bold text-pink-900 text-sm mt-0.5">
                    {app.msme_classification?.turnoverCrores !== undefined ? `₹ ${app.msme_classification?.turnoverCrores} Cr` : '—'}
                  </div>
                </div>
              </div>
              {app.msme_classification?.reason && (
                <div className="pt-2 border-t border-pink-200/60 text-slate-700">
                  <span className="font-bold text-pink-900">Classification Basis:</span> {safeRender(app.msme_classification?.reason)}
                </div>
              )}
            </div>
          </div>

          {/* NIC Codes */}
          {nicCodes.length > 0 && (
            <div className="admin-card">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>🏷️</span> NIC 2008 Activity Codes
              </h3>
              <div className="space-y-2">
                {nicCodes.map((nic, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div className="font-mono font-bold text-[#1B2B5E] text-sm">{safeRender(typeof nic === 'object' ? nic.code : nic)}</div>
                    <div className="text-slate-700 max-w-md text-right font-medium">{safeRender(typeof nic === 'object' ? nic.description || nic.desc : '')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents (NEW Section) */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📁</span> Submitted Verification Documents
            </h3>
            {docList.length > 0 ? (
              <div className="space-y-2">
                {docList.map((doc, idx) => (
                  <div key={doc.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">📄</span>
                      <div>
                        <div className="font-bold text-slate-800">{doc.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{doc.fileName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={doc.status || 'uploaded'} />
                      {doc.url && (
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="px-2.5 py-1 bg-[#1B2B5E] text-white text-[11px] font-bold rounded hover:bg-[#283E80] transition-colors"
                        >
                          View 👁️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-lg border border-slate-100">
                No optional attachments uploaded.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status & Udyam Registration Number */}
          <div className="admin-card bg-gradient-to-br from-pink-950 to-[#1B2B5E] text-white border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-200">Udyam Processing Stage</span>
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
                {updating ? 'Saving...' : 'Save Udyam Application'}
              </button>
            </div>
          </div>

          {/* Payment & Fee Summary */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>💳</span> Payment & Fee Summary
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Service Assistance Fee</span>
                <span className="font-semibold text-slate-900">{formatCurrency(app.calculated_fees?.serviceFee || 2000)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Government Portal Fee</span>
                <span className="font-semibold text-slate-900">{formatCurrency(app.calculated_fees?.governmentFee || 0)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-800">Total Payable</span>
                <span className="font-bold text-slate-900">{formatCurrency(app.calculated_fees?.totalPayable || app.amount_paid || 2000)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-bold text-emerald-700">Amount Paid</span>
                <span className="font-bold text-emerald-700">{formatCurrency(app.amount_paid || 2000)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Payment Status</span>
                <StatusBadge status={app.payment_status || 'successful'} />
              </div>
              <div className="pt-2 text-[11px] text-slate-500">
                Declaration: {app.declaration_accepted ? '✅ Accepted by Applicant' : 'Pending'}
              </div>
            </div>
          </div>

          {/* Admin Remarks */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📝</span> Processing Remarks
            </h3>
            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
              {safeRender(app.admin_remarks || app.admin_notes, 'Application verified against MSME portal guidelines. Ready for issuance.')}
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
        />
      )}
    </div>
  );
}
