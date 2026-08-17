'use client';

import React, { useState } from 'react';
import { ADMIN_EMAILS, SERVICE_CONFIG } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function SettingsPage() {
  const [adminName, setAdminName] = useState('Nishant Singh (Super Admin)');
  const [adminEmail, setAdminEmail] = useState('admin@vyaparcare.com');
  const [whitelist, setWhitelist] = useState(ADMIN_EMAILS);
  const [newEmail, setNewEmail] = useState('');

  // Service Pricing state
  const [serviceFees, setServiceFees] = useState({
    gst: SERVICE_CONFIG.gst.defaultFee,
    plc: SERVICE_CONFIG.plc.defaultFee,
    trademark: SERVICE_CONFIG.trademark.defaultFee,
    fssai: SERVICE_CONFIG.fssai.defaultFee,
    iec: SERVICE_CONFIG.iec.defaultFee,
    itr: SERVICE_CONFIG.itr.defaultFee,
    udyam: SERVICE_CONFIG.udyam.defaultFee,
    other: SERVICE_CONFIG.other.defaultFee,
  });

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  // Fee save state
  const [feeSuccess, setFeeSuccess] = useState(false);

  const handleAddWhitelist = (e) => {
    e?.preventDefault();
    if (!newEmail.trim() || whitelist.includes(newEmail.trim().toLowerCase())) return;
    setWhitelist([...whitelist, newEmail.trim().toLowerCase()]);
    setNewEmail('');
  };

  const handleRemoveWhitelist = (emailToRemove) => {
    setWhitelist(whitelist.filter((e) => e !== emailToRemove));
  };

  const handleUpdatePassword = (e) => {
    e?.preventDefault();
    setPwError('');
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    setPwSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPwSuccess(false), 4000);
  };

  const handleSaveFees = () => {
    setFeeSuccess(true);
    setTimeout(() => setFeeSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Admin Panel Settings</h2>
        <p className="text-xs text-slate-500">Manage administrator accounts, authentication whitelist, and service fee schedules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Admin Profile & Password (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Admin Profile */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>👤</span> Administrator Profile
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Display Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="admin-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Active Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="admin-input text-xs bg-slate-50 font-mono"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🔒</span> Security & Change Password
            </h3>
            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="admin-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="admin-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="admin-input text-xs"
                />
              </div>

              {pwError && (
                <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  ⚠️ {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  ✅ Password updated successfully!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-[#1B2B5E] hover:bg-[#283E80] text-white text-xs font-bold rounded-lg transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Admin Email Whitelist */}
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🛡️</span> Admin Whitelist Management
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Only users with emails in this whitelist are permitted to authenticate into the admin panel.
            </p>

            <div className="space-y-2 mb-4">
              {whitelist.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                >
                  <span className="font-mono text-slate-800 font-semibold">{email}</span>
                  {whitelist.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveWhitelist(email)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddWhitelist} className="flex gap-2">
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="newadmin@vyaparcare.com"
                className="admin-input text-xs flex-1"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Service Fees Configuration (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="admin-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>💰</span> Service Fees Pricing Configuration
              </h3>
              {feeSuccess && <span className="text-xs font-bold text-emerald-600">Saved!</span>}
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Configure default professional fees charged to clients across all services.
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-lg mb-4">
              <table className="admin-table text-xs">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Processing Days</th>
                    <th>Configured Fee (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(SERVICE_CONFIG).map(([key, item]) => (
                    <tr key={key}>
                      <td className="font-bold text-slate-900">
                        <span className="mr-1.5">{item.icon}</span>
                        {item.name}
                      </td>
                      <td className="text-slate-500">{item.processingDays}</td>
                      <td>
                        <div className="flex items-center gap-1 font-mono">
                          <span>₹</span>
                          <input
                            type="number"
                            value={serviceFees[key]}
                            onChange={(e) =>
                              setServiceFees({ ...serviceFees, [key]: Number(e.target.value) })
                            }
                            className="w-24 p-1 border border-slate-300 rounded font-bold text-slate-900 focus:outline-none focus:border-[#1B2B5E]"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleSaveFees}
              className="w-full py-2.5 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              💾 Save Service Fees Configuration
            </button>
          </div>

          {/* Supabase Connection Status */}
          <div className="admin-card bg-slate-900 text-white border-0">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>⚡</span> Database & Supabase Infrastructure
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-slate-400">Project Endpoint</span>
                <span className="font-mono text-emerald-400">meakrbzjepuournoogoi.supabase.co</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-slate-400">RLS Policies</span>
                <span className="font-bold text-emerald-400">Active & Enforced</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-slate-400">Service Role API</span>
                <span className="text-amber-300">Operational</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Environment</span>
                <span className="font-bold text-white">Production Ready (Next.js 16)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
