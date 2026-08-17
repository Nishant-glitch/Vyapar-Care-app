'use client';

import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';

export default function DocumentViewer({
  isOpen,
  onClose,
  document,
  onUpdateStatus,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentStatus, setCurrentStatus] = useState('verified');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (document) {
      setCurrentStatus(document.status || 'verified');
      setRemarks(document.remarks || '');
      setZoomLevel(1);
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const isImage = (document.file_url || document.url || '').match(/\.(jpeg|jpg|gif|png|webp)/i) ||
    (document.file_url || document.url || '').includes('images.unsplash.com') ||
    document.type?.includes('image');

  const fileUrl = document.file_url || document.url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';

  const handleSave = async () => {
    setSaving(true);
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(document.id || document.key || document.name, currentStatus, remarks);
      }
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1B2B5E]/10 text-[#1B2B5E] flex items-center justify-center text-lg">
              📄
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{document.name || document.label || 'Document Preview'}</h3>
              <p className="text-xs text-slate-500">
                {document.size ? `${document.size} • ` : ''}
                Uploaded on {document.uploaded_at ? new Date(document.uploaded_at).toLocaleDateString() : 'Recent'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={document.status || 'pending'} />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors ml-2"
              title="Close Preview"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body: Preview Area */}
        <div className="flex-1 bg-slate-900/5 relative overflow-hidden flex items-center justify-center min-h-[360px] max-h-[55vh] p-4">
          {isImage ? (
            <div className="overflow-auto max-h-full max-w-full flex items-center justify-center p-2">
              <img
                src={fileUrl}
                alt={document.name || 'Document'}
                className="max-h-[48vh] max-w-full object-contain rounded-lg shadow-md transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="text-5xl mb-3">📑</div>
              <h4 className="font-semibold text-slate-800 text-sm mb-1">{document.name}</h4>
              <p className="text-xs text-slate-500 mb-4">PDF Document file preview available</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#1B2B5E] text-white rounded-lg text-xs font-semibold hover:bg-[#283E80] transition-colors"
              >
                Open Full Document in New Tab ↗
              </a>
            </div>
          )}

          {/* Zoom Controls for Images */}
          {isImage && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-bold text-sm"
                title="Zoom Out"
              >
                −
              </button>
              <span className="text-xs font-semibold px-2 text-slate-600">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-700 font-bold text-sm"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="text-[11px] px-1.5 py-0.5 rounded text-slate-500 hover:text-slate-800 ml-1 border-l border-slate-200"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer: Status Update & Actions */}
        <div className="p-6 bg-white border-t border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Verification Status</label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="admin-input text-xs py-2 bg-slate-50 font-medium"
              >
                <option value="uploaded">Uploaded / Pending Verification</option>
                <option value="verified">Verified & Approved ✅</option>
                <option value="rejected">Rejected (Needs Re-upload) ❌</option>
                <option value="under_review">Under Scrutiny 🔍</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Remarks / Note to User</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Approved copy or explain rejection reason"
                className="admin-input text-xs py-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 md:pt-0">
            <a
              href={fileUrl}
              download={document.name || 'document'}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
            >
              📥 Download
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-lg transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
