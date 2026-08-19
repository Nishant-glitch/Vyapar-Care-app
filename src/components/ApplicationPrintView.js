'use client';

import React, { useEffect, useRef } from 'react';
import { formatDate, formatCurrency, maskAadhaar, maskPAN, maskBankAccount, safeRender } from '@/lib/utils';
import StatusBadge from './StatusBadge';

export default function ApplicationPrintView({
  isOpen,
  onClose,
  application,
  serviceType = 'udyam',
  autoPrint = false,
}) {
  const printRef = useRef(null);

  useEffect(() => {
    if (isOpen && autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint]);

  if (!isOpen || !application) return null;

  const handlePrint = () => {
    window.print();
  };

  const appId = application.application_id || application.id || 'APP-2026';
  const createdDate = formatDate(application.created_at, 'dd MMMM yyyy, hh:mm a');

  // Service title map
  const serviceTitleMap = {
    udyam: 'MSME / Udyam Registration Dossier',
    gst: 'Form GST REG-01 Registration Dossier',
    plc: 'MCA SPICe+ Private Limited Company Incorporation Dossier',
    trademark: 'Form TM-A Trademark Registration Dossier',
    fssai: 'FSSAI FoSCoS Food License / Registration Dossier',
    iec: 'DGFT Import Export Code (IEC) Dossier',
    itr: 'Income Tax Return (ITR) Computation & Filing Dossier',
    other: 'Specialized Legal & Compliance Consultation Dossier',
    order: 'Vyapar Care Order & Service Fulfillment Dossier',
  };

  const serviceTitle = serviceTitleMap[serviceType] || 'Application Verification Dossier';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 print:p-0 print:static print:bg-white print:overflow-visible no-print-bg">
      <div
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:rounded-none print:border-none print:w-full border border-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-700 print:hidden shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl shrink-0">📄</span>
            <div className="min-w-0">
              <div className="font-bold text-sm text-white truncate">
                Full Application Dossier: <span className="font-mono text-[#DFB53B]">{appId}</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">Vyapar Care Regulatory Compliance Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer"
            >
              🖨️ Print Application
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors font-bold text-lg cursor-pointer"
              title="Close View"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Printable Container */}
        <div ref={printRef} className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-slate-900 print:p-6 print:overflow-visible font-sans space-y-6">
          {/* Letterhead Header */}
          <div className="border-b-2 border-[#1B2B5E] pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚖️</span>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#1B2B5E] uppercase">
                    VYAPAR CARE CONSULTANCY
                  </h1>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Business Registration, Tax Compliance & Regulatory Advisory Services
                </p>
                <div className="text-[11px] text-slate-400 mt-1">
                  Portal: vyaparcareconsultancy.com • Helpline: +91 800-VYAPAR • Email: compliance@vyaparcare.com
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <div className="inline-block px-3 py-1 bg-[#1B2B5E]/5 border border-[#1B2B5E]/20 rounded text-xs font-mono font-bold text-[#1B2B5E]">
                  {appId}
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5">Filing Date: {createdDate}</div>
                <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                  Status: <span className="capitalize">{safeRender(application.status, 'Submitted')}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 p-2.5 rounded-lg">
              <span className="font-bold text-[#1B2B5E] uppercase tracking-wide">{serviceTitle}</span>
              <span className="text-slate-500 font-mono text-[11px]">System Ref: {application.id || appId}</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* UDYAM APPLICATION DOSSIER CONTENT                                         */}
          {/* ========================================================================= */}
          {serviceType === 'udyam' && (
            <div className="space-y-6">
              {/* 1. Enterprise Profile */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                  1. Enterprise Profile & Legal Constitution
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Enterprise Name</div>
                    <div className="font-bold text-slate-900">
                      {safeRender(application.business_details?.enterpriseName || application.enterprise_name || '—')}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Trade Name</div>
                    <div className="font-semibold text-slate-800">
                      {safeRender(application.business_details?.tradeName || application.business_details?.enterpriseName || '—')}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Applicant / Entrepreneur</div>
                    <div className="font-bold text-slate-900">
                      {safeRender(application.aadhaar_details?.nameAsPerAadhaar || application.applicant_name || '—')}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">MSME Classification</div>
                    <div className="font-bold text-pink-700">
                      {safeRender(application.msme_classification?.categoryLabel || application.msme_classification?.category || 'Micro Enterprise')}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Major Activity</div>
                    <div className="font-semibold text-slate-800 capitalize">
                      {safeRender(application.business_details?.majorActivity || 'Manufacturing & Services')}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Organisation Type</div>
                    <div className="font-semibold text-slate-800 capitalize">
                      {safeRender(application.business_details?.organisationType || 'Proprietorship')}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Commencement Date</div>
                    <div className="font-semibold text-slate-800">
                      {formatDate(application.business_details?.commencementDate) || safeRender(application.business_details?.commencementDate || '—')}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Official Udyam Reg Number</div>
                    <div className="font-mono font-bold text-[#1B2B5E]">
                      {safeRender(application.udyam_registration_number || 'Pending Official Allotment')}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Aadhaar & PAN Details */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                  2. Identity & Tax Verification (Aadhaar & PAN)
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Name as per Aadhaar</div>
                    <div className="font-bold text-slate-900">{safeRender(application.aadhaar_details?.nameAsPerAadhaar || '—')}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Aadhaar Number</div>
                    <div className="font-mono font-bold text-slate-900">{maskAadhaar(application.aadhaar_details?.aadhaarNumber)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Linked Mobile</div>
                    <div className="font-semibold text-slate-800">{safeRender(application.aadhaar_details?.mobile || '—')}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Email Address</div>
                    <div className="font-semibold text-slate-800">{safeRender(application.aadhaar_details?.email || '—')}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Permanent Account Number (PAN)</div>
                    <div className="font-mono font-bold text-[#1B2B5E]">{safeRender(application.pan_details?.panNumber || '—')}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Name as per PAN</div>
                    <div className="font-bold text-slate-900">{safeRender(application.pan_details?.nameAsPerPAN || '—')}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">GSTIN Registration</div>
                    <div className="font-semibold text-slate-800">
                      {safeRender(application.pan_details?.gstin || (application.pan_details?.hasGSTIN ? 'Yes' : 'Not registered'))}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold mb-0.5">Previous UAM No.</div>
                    <div className="font-semibold text-slate-800">
                      {application.pan_details?.hasPreviousUAM ? safeRender(application.pan_details?.uamNumber || 'Yes') : 'No'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Official Address */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                  3. Official Enterprise Location Address
                </h2>
                <div className="text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50/50 text-slate-800 leading-relaxed font-medium">
                  {[
                    application.official_address?.flatDoorBlock,
                    application.official_address?.roadStreet,
                    application.official_address?.locality,
                    application.official_address?.city,
                    application.official_address?.district,
                    application.official_address?.state,
                    application.official_address?.pinCode ? `PIN: ${application.official_address?.pinCode}` : '',
                  ].filter(Boolean).join(', ') || 'Address details recorded in application database.'}
                </div>
              </div>

              {/* 4. Plant / Factory Units */}
              {Array.isArray(application.plant_units) && application.plant_units.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                    4. Operational Plant / Factory Units ({application.plant_units.length})
                  </h2>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px]">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Unit Name</th>
                          <th className="p-2.5">Unit Address</th>
                          <th className="p-2.5">Activity</th>
                          <th className="p-2.5">Main Product</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {application.plant_units.map((unit, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-900">{safeRender(unit.unitName || `Unit ${idx + 1}`)}</td>
                            <td className="p-2.5 text-slate-700">
                              {[unit.flatDoorBlock, unit.roadStreet, unit.city, unit.state, unit.pinCode ? `PIN: ${unit.pinCode}` : ''].filter(Boolean).join(', ')}
                            </td>
                            <td className="p-2.5 capitalize">{safeRender(unit.activity || 'Manufacturing')}</td>
                            <td className="p-2.5 text-slate-600">{safeRender(unit.mainProduct || '—')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. Bank Details & Financials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                    5. Bank Account Details
                  </h2>
                  <div className="space-y-2 text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                    <div className="flex justify-between"><span className="text-slate-500">Bank Name:</span> <span className="font-bold text-slate-900">{safeRender(application.bank_details?.bankName || '—')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Account Number:</span> <span className="font-mono font-bold text-slate-900">{safeRender(application.bank_details?.accountNumber || '—')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">IFSC Code:</span> <span className="font-mono font-bold text-[#1B2B5E]">{safeRender(application.bank_details?.ifsc || application.bank_details?.ifscCode || '—')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Account Type:</span> <span className="font-medium text-slate-800 capitalize">{safeRender(application.bank_details?.accountType || 'Current Account')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Holder Name:</span> <span className="font-semibold text-slate-900">{safeRender(application.bank_details?.accountHolderName || application.aadhaar_details?.nameAsPerAadhaar || '—')}</span></div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                    6. Financial & Turnover Details
                  </h2>
                  <div className="space-y-2 text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                    <div className="flex justify-between"><span className="text-slate-500">Plant & Machinery Investment:</span> <span className="font-bold text-slate-900">{formatCurrency(application.financial_details?.investmentAmount || 0)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Domestic Turnover:</span> <span className="font-semibold text-slate-900">{formatCurrency(application.financial_details?.domesticTurnover || 0)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Export Turnover:</span> <span className="font-semibold text-slate-900">{formatCurrency(application.financial_details?.exportTurnover || 0)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 font-bold">Total Annual Turnover:</span> <span className="font-bold text-pink-700">{formatCurrency(application.financial_details?.totalTurnover || 0)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Financial Year:</span> <span className="font-medium text-slate-800">{safeRender(application.financial_details?.financialYear || '2025-26')}</span></div>
                  </div>
                </div>
              </div>

              {/* 7. NIC Codes & MSME Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                    7. NIC 2008 Activity Codes
                  </h2>
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 text-xs space-y-2">
                    {(Array.isArray(application.selected_nic_codes) && application.selected_nic_codes.length > 0 ? application.selected_nic_codes : [{ code: '4630', description: 'Wholesale of food and beverages' }]).map((nic, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-1.5 border-b border-slate-100 last:border-0 last:pb-0">
                        <span className="font-mono font-bold text-[#1B2B5E]">{safeRender(typeof nic === 'object' ? nic.code : nic)}</span>
                        <span className="text-slate-700 font-medium text-[11px] text-right">{safeRender(typeof nic === 'object' ? nic.description || nic.desc : '')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                    8. MSME Category & Eligibility Summary
                  </h2>
                  <div className="border border-slate-200 rounded-lg p-3.5 bg-pink-50/40 text-xs space-y-2">
                    <div className="flex justify-between"><span className="text-slate-600 font-semibold">Category:</span> <span className="font-bold text-pink-900">{safeRender(application.msme_classification?.categoryLabel || 'Micro Enterprise')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Investment (Cr):</span> <span className="font-bold text-slate-800">{application.msme_classification?.investmentCrores !== undefined ? `₹ ${application.msme_classification.investmentCrores} Cr` : '—'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Turnover (Cr):</span> <span className="font-bold text-slate-800">{application.msme_classification?.turnoverCrores !== undefined ? `₹ ${application.msme_classification.turnoverCrores} Cr` : '—'}</span></div>
                    <div className="pt-1.5 border-t border-pink-200/50 text-[11px] text-slate-600">
                      <span className="font-semibold text-pink-950">Classification Reason:</span> {safeRender(application.msme_classification?.reason || 'Verified as per MSMED Act criteria.')}
                    </div>
                  </div>
                </div>
              </div>

              {/* 9. Payment & Billing Details */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                  9. Payment & Statutory Filing Summary
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                  <div><span className="text-slate-500">Service Fee:</span> <div className="font-bold text-slate-900">{formatCurrency(application.calculated_fees?.serviceFee || 2000)}</div></div>
                  <div><span className="text-slate-500">Government Portal Fee:</span> <div className="font-bold text-slate-900">{formatCurrency(application.calculated_fees?.governmentFee || 0)}</div></div>
                  <div><span className="text-slate-500">Total Payable:</span> <div className="font-bold text-slate-900">{formatCurrency(application.calculated_fees?.totalPayable || application.amount_paid || 2000)}</div></div>
                  <div><span className="text-slate-500">Payment Status:</span> <div className="font-bold text-emerald-700 uppercase">{safeRender(application.payment_status, 'Successful')} ✅</div></div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* GST APPLICATION DOSSIER CONTENT                                           */}
          {/* ========================================================================= */}
          {serviceType === 'gst' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                  1. Business Entity & Applicant Details
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                  <div><span className="text-slate-400 font-semibold">Trade Name</span><div className="font-bold text-slate-900">{safeRender(application.business_details?.tradeName || application.business_name || '—')}</div></div>
                  <div><span className="text-slate-400 font-semibold">Legal Name</span><div className="font-bold text-slate-900">{safeRender(application.business_details?.legalName || '—')}</div></div>
                  <div><span className="text-slate-400 font-semibold">Constitution</span><div className="font-semibold text-slate-800 capitalize">{safeRender(application.constitution || 'Proprietorship')}</div></div>
                  <div><span className="text-slate-400 font-semibold">PAN</span><div className="font-mono font-bold text-slate-900">{maskPAN(application.pan || application.applicant?.pan || '')}</div></div>
                </div>
              </div>

              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                  2. Registered Premises & Bank Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                  <div>
                    <span className="text-slate-400 font-semibold">Principal Place of Business:</span>
                    <div className="font-medium text-slate-800 mt-1">{safeRender(application.premises_details?.address || application.premises_details?.completeAddress || 'Principal address recorded in application.')}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Bank Account:</span>
                    <div className="font-medium text-slate-800 mt-1">{safeRender(application.bank_details?.bankName)} — A/C {safeRender(application.bank_details?.accountNumber)} (IFSC: {safeRender(application.bank_details?.ifsc || application.bank_details?.ifscCode)})</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PLC APPLICATION DOSSIER CONTENT                                           */}
          {/* ========================================================================= */}
          {serviceType === 'plc' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                  1. Company Details & Capital Structure
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                  <div><span className="text-slate-400 font-semibold">Proposed Name (Choice 1)</span><div className="font-bold text-slate-900">{safeRender(application.company?.proposedName1 || application.company?.name || application.company_name || '—')}</div></div>
                  <div><span className="text-slate-400 font-semibold">Proposed Name (Choice 2)</span><div className="font-medium text-slate-800">{safeRender(application.company?.proposedName2 || '—')}</div></div>
                  <div><span className="text-slate-400 font-semibold">State / RoC</span><div className="font-semibold text-slate-800">{safeRender(application.company?.state || 'Maharashtra')}</div></div>
                  <div><span className="text-slate-400 font-semibold">Authorized Capital</span><div className="font-bold text-slate-900">{safeRender(application.authorized_capital || application.company?.capital || '₹10,00,000')}</div></div>
                  <div><span className="text-slate-400 font-semibold">Paid-up Capital</span><div className="font-bold text-slate-900">{safeRender(application.paidup_capital || '₹1,00,000')}</div></div>
                  <div><span className="text-slate-400 font-semibold">Directors Count</span><div className="font-bold text-slate-900">{Array.isArray(application.directors) ? application.directors.length : 2} Directors</div></div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TRADEMARK APPLICATION DOSSIER CONTENT                                     */}
          {/* ========================================================================= */}
          {serviceType === 'trademark' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                  1. Trademark Details & Classification
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                  <div><span className="text-slate-400 font-semibold">Brand / Wordmark</span><div className="font-bold text-slate-900 text-sm">{safeRender(application.mark_details?.trademarkName || application.mark_details?.wordmark || application.trademark_name || 'Brand Mark')}</div></div>
                  <div><span className="text-slate-400 font-semibold">Mark Type</span><div className="font-semibold text-slate-800">{safeRender(application.mark_details?.markType || 'Word & Device Logo')}</div></div>
                  <div><span className="text-slate-400 font-semibold">Applicant Category</span><div className="font-semibold text-slate-800">{safeRender(application.applicant_type || 'Small Enterprise')}</div></div>
                  <div><span className="text-slate-400 font-semibold">TM Application No.</span><div className="font-mono font-bold text-[#1B2B5E]">{safeRender(application.official_tm_number || 'Pending')}</div></div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FSSAI APPLICATION DOSSIER CONTENT                                         */}
          {/* ========================================================================= */}
          {serviceType === 'fssai' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                  1. Food Business Operator (FBO) Details
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                  <div><span className="text-slate-400 font-semibold">Food Business Name</span><div className="font-bold text-slate-900">{safeRender(application.business_details?.foodBusinessName || application.business_details?.businessName || application.business_name || '—')}</div></div>
                  <div><span className="text-slate-400 font-semibold">License Tier</span><div className="font-semibold text-slate-800">{safeRender(application.license_type || 'State License')}</div></div>
                  <div><span className="text-slate-400 font-semibold">Kind of Business (KOB)</span><div className="font-semibold text-slate-800">{safeRender(application.kob || 'Restaurant & Food Retail')}</div></div>
                  <div><span className="text-slate-400 font-semibold">Validity</span><div className="font-bold text-emerald-700">{safeRender(application.validity_years || 1)} Years</div></div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* IEC / ITR / OTHER / ORDER DOSSIER CONTENT                                 */}
          {/* ========================================================================= */}
          {!['udyam', 'gst', 'plc', 'trademark', 'fssai'].includes(serviceType) && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1B2B5E] bg-slate-100 px-3 py-1.5 rounded mb-3 border-l-4 border-[#1B2B5E]">
                  1. Application Overview
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border border-slate-200 rounded-lg p-3.5 bg-slate-50/50">
                  <div><span className="text-slate-400 font-semibold">Service Type</span><div className="font-bold text-slate-900">{serviceTitle}</div></div>
                  <div><span className="text-slate-400 font-semibold">Applicant</span><div className="font-bold text-slate-900">{safeRender(application.applicant_name || application.applicant?.name || application.user_name || 'Client')}</div></div>
                  <div><span className="text-slate-400 font-semibold">Processing Stage</span><div className="font-semibold text-slate-800 capitalize">{safeRender(application.status, 'Submitted')}</div></div>
                  <div><span className="text-slate-400 font-semibold">Filing ID</span><div className="font-mono font-bold text-[#1B2B5E]">{appId}</div></div>
                </div>
              </div>
            </div>
          )}

          {/* Verification & Legal Footer */}
          <div className="pt-6 border-t-2 border-slate-200 mt-8 space-y-4 page-break-avoid">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div>
                <div className="font-bold text-slate-800">Vyapar Care Consultancy Services</div>
                <div className="text-[11px] text-slate-500">Government Portal E-Filing & Documentation Support Desk</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Verification ID: {appId} • Generated via Secure Admin Gateway</div>
              </div>

              <div className="text-right sm:border-l sm:pl-6 border-slate-200">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Authorized Verification</div>
                <div className="text-sm font-black text-[#1B2B5E] mt-0.5">VYAPAR CARE VERIFIED ✅</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
              Confidential Regulatory Filing Dossier. Generated for official processing and record-keeping by Vyapar Care Consultancy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
