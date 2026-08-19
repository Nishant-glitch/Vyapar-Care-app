'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getOtherServiceById, updateOtherServiceStatus } from '@/lib/adminDatabase';
import { formatDate, safeRender } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import DocumentViewer from '@/components/DocumentViewer';
import ApplicationPrintView from '@/components/ApplicationPrintView';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function OtherServiceDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showFullApp, setShowFullApp] = useState(false);
  const [autoPrintApp, setAutoPrintApp] = useState(false);
  const [status, setStatus] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getOtherServiceById(id);
        if (data) {
          setApp(data);
          setStatus(data.status || 'submitted');
          setAssignedStaff(data.assigned_staff || 'Adv. Suresh Kulkarni (Senior Consultant)');
        }
      } catch (err) {
        console.error('Failed to load other service details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await updateOtherServiceStatus(app.id || id, status, assignedStaff);
      setApp((prev) => ({ ...prev, status, assigned_staff: assignedStaff }));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!app) {
    return (
      <div className="admin-card text-center py-12">
        <div className="text-4xl mb-2">🔍</div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Request Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">No consultancy request found with ID: {id}</p>
        <Link href="/dashboard/other" className="px-4 py-2 bg-[#1B2B5E] text-white text-xs font-bold rounded-lg inline-block hover:bg-[#283E80] transition-colors">
          ← Back to Other Requests
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/other"
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
              Custom Consultancy Requirement • Submitted {formatDate(app.created_at)}
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
          {/* Requirement Summary */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>📋</span> Requirement Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Service Requested</div>
                <div className="font-bold text-slate-900 text-sm">
                  {safeRender(app.service_name || app.selected_service?.title || 'Custom Advisory')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Assigned Department</div>
                <div className="font-semibold text-slate-800 capitalize">
                  {safeRender(app.department || app.selected_service?.category || 'Corporate Legal Desk')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Applicant / Contact Person</div>
                <div className="font-bold text-slate-900">
                  {safeRender(app.applicant_name || app.contact_person || '—')}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">Urgency Level</div>
                <div className="font-bold text-amber-700 uppercase">
                  {safeRender(app.urgency || 'Normal (Standard TAT)')}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-slate-400 font-semibold mb-1">Detailed Requirement Description</div>
                <div className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-medium">
                  {safeRender(app.requirement_details?.description || app.description, 'Require specialized regulatory assistance and documentation.')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status & Staff Assignment */}
          <div className="admin-card bg-gradient-to-br from-slate-900 to-[#1B2B5E] text-white border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Request Progress</span>
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
                  <option value="under_review" className="text-slate-900">Under Review / Assessing Scope</option>
                  <option value="documents_required" className="text-slate-900">Documents Required</option>
                  <option value="quote_generated" className="text-slate-900">Custom Quote Generated</option>
                  <option value="in_progress" className="text-slate-900">In Progress</option>
                  <option value="completed" className="text-slate-900">Completed ✅</option>
                  <option value="closed" className="text-slate-900">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Assigned Legal / Tax Specialist</label>
                <input
                  type="text"
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  placeholder="Adv. Suresh Kulkarni"
                  className="w-full bg-white/10 text-white text-xs font-semibold rounded-lg p-2.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C5991A]"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full py-2.5 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md disabled:opacity-40"
              >
                {updating ? 'Saving...' : 'Update Assignment & Status'}
              </button>
            </div>
          </div>

          {/* Documents Checklist */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📁</span> Attached Files ({docList.length})
            </h3>
            {docList.length > 0 ? (
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
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-lg border border-slate-100">
                No attachments uploaded with request.
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📝</span> Staff Notes
            </h3>
            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {safeRender(app.admin_notes, 'Assigned to senior environmental compliance consultant. Site inspection documentation requested from client.')}
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

      {/* Full Application Print / View Modal */}
      {showFullApp && (
        <ApplicationPrintView
          isOpen={showFullApp}
          onClose={() => {
            setShowFullApp(false);
            setAutoPrintApp(false);
          }}
          application={app}
          serviceType="other"
          autoPrint={autoPrintApp}
        />
      )}
    </div>
  );
}
