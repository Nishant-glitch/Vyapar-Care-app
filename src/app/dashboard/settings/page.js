'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ADMIN_EMAILS, SERVICE_CONFIG } from '@/lib/constants';
import { supabase } from '@/lib/supabase-client';
import {
  getServiceFees,
  updateAllServiceFees,
  seedServicesTable,
  DEFAULT_SERVICES_DATA,
} from '@/lib/adminDatabase';

export default function SettingsPage() {
  const [adminName, setAdminName] = useState('Super Administrator');
  const [adminEmail, setAdminEmail] = useState('vyaparcareconsultancy@gmail.com');
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
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeSuccess, setFeeSuccess] = useState(false);
  const [feeError, setFeeError] = useState('');
  const [seedingLoading, setSeedingLoading] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Load session & live service fees
  const loadServiceFees = useCallback(async () => {
    try {
      const liveServices = await getServiceFees();
      if (liveServices && liveServices.length > 0) {
        const mapped = {};
        liveServices.forEach((s) => {
          const nameLower = (s.name || '').toLowerCase();
          const detailLower = (s.detail_title || '').toLowerCase();

          if (nameLower.includes('gst') || detailLower.includes('gst')) {
            mapped.gst = s.fee;
          } else if (nameLower.includes('company') || nameLower.includes('plc') || detailLower.includes('private limited')) {
            mapped.plc = s.fee;
          } else if (nameLower.includes('trademark') || detailLower.includes('trademark') || nameLower.includes('tm')) {
            mapped.trademark = s.fee;
          } else if (nameLower.includes('fssai') || detailLower.includes('fssai') || nameLower.includes('food')) {
            mapped.fssai = s.fee;
          } else if (nameLower.includes('msme') || nameLower.includes('udyam') || detailLower.includes('udyam')) {
            mapped.udyam = s.fee;
          } else if (nameLower.includes('itr') || nameLower.includes('income tax') || detailLower.includes('income tax')) {
            mapped.itr = s.fee;
          } else if (nameLower.includes('iec') || nameLower.includes('import export') || detailLower.includes('iec')) {
            mapped.iec = s.fee;
          } else if (nameLower.includes('other') || detailLower.includes('other')) {
            mapped.other = s.fee;
          }
        });

        setServiceFees((prev) => ({
          ...prev,
          ...mapped,
        }));
      }
    } catch (err) {
      console.warn('Failed to load service fees from Supabase:', err);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vyapar_admin_session');
      if (stored) {
        const session = JSON.parse(stored);
        if (session?.email) {
          setAdminEmail(session.email);
          setAdminName(session.email.split('@')[0]);
        }
      }
    } catch {
      // ignore
    }

    loadServiceFees();
  }, [loadServiceFees]);

  const handleAddWhitelist = (e) => {
    e?.preventDefault();
    if (!newEmail.trim() || whitelist.includes(newEmail.trim().toLowerCase())) return;
    setWhitelist([...whitelist, newEmail.trim().toLowerCase()]);
    setNewEmail('');
  };

  const handleRemoveWhitelist = (emailToRemove) => {
    if (whitelist.length <= 1) {
      alert('At least one administrator email must remain in the whitelist.');
      return;
    }
    setWhitelist(whitelist.filter((e) => e !== emailToRemove));
  };

  // FEATURE 1: Secure Password Update
  const handleUpdatePassword = async (e) => {
    e?.preventDefault();
    setPwError('');
    setPwSuccess(false);

    // 1. Minimum 8 characters validation
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters long.');
      return;
    }

    // 2. Confirm password match check
    if (newPassword !== confirmPassword) {
      setPwError('New password and confirm password do not match.');
      return;
    }

    setPwLoading(true);

    try {
      // 3. Verify Current Password by signing in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: currentPassword,
      });

      if (verifyError) {
        setPwError('Current password is incorrect. Please verify and try again.');
        setPwLoading(false);
        return;
      }

      // 4. Update Password in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPwError(updateError.message || 'Failed to update password.');
        setPwLoading(false);
        return;
      }

      // 5. Success
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 5000);
    } catch (err) {
      setPwError('An unexpected error occurred while updating password.');
    } finally {
      setPwLoading(false);
    }
  };

  // FEATURE 2: Save Service Fees to Supabase
  const handleSaveFees = async () => {
    setFeeLoading(true);
    setFeeSuccess(false);
    setFeeError('');

    try {
      const res = await updateAllServiceFees(serviceFees);
      if (res.success) {
        setFeeSuccess(true);
        setTimeout(() => setFeeSuccess(false), 4000);
      } else {
        setFeeError(res.error || 'Failed to update service fees in database.');
      }
    } catch (err) {
      setFeeError('Error saving service fees. Please try again.');
    } finally {
      setFeeLoading(false);
    }
  };

  // Seed / Sync Default Services in Supabase
  const handleSeedServices = async () => {
    setSeedingLoading(true);
    try {
      const res = await seedServicesTable();
      if (res.success) {
        await loadServiceFees();
        setFeeSuccess(true);
        setTimeout(() => setFeeSuccess(false), 4000);
      }
    } catch (err) {
      setFeeError('Failed to seed services table.');
    } finally {
      setSeedingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Admin Panel Settings</h2>
        <p className="text-xs text-slate-500">
          Manage administrator accounts, security credentials, authentication whitelist, and live service fee schedules
        </p>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Active Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  className="admin-input text-xs bg-slate-50 font-mono text-slate-600"
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
                  placeholder="Enter your current password"
                  className="admin-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password <span className="text-slate-400 font-normal">(Min. 8 characters)</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
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
                  placeholder="Re-enter new password"
                  className="admin-input text-xs"
                />
              </div>

              {pwError && (
                <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{pwError}</span>
                </div>
              )}
              {pwSuccess && (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-2">
                  <span>✅</span>
                  <span>Password updated successfully!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-2.5 bg-[#1B2B5E] hover:bg-[#283E80] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {pwLoading ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Verifying & Updating...</span>
                  </>
                ) : (
                  'Update Password'
                )}
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
                placeholder="admin@example.com"
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>💰</span> Dynamic Service Pricing
              </h3>
              <button
                onClick={handleSeedServices}
                disabled={seedingLoading}
                className="text-[11px] font-bold text-[#1B2B5E] hover:text-[#C5991A] hover:underline"
                title="Ensure all 8 default services exist in the database"
              >
                {seedingLoading ? 'Syncing...' : '🔄 Sync / Seed Services'}
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Updates made here immediately sync to the Supabase database and update prices in the Vyapar Care mobile app.
            </p>

            {feeSuccess && (
              <div className="mb-4 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-2">
                <span>✅</span>
                <span>Service fees updated successfully in database!</span>
              </div>
            )}

            {feeError && (
              <div className="mb-4 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-center gap-2">
                <span>⚠️</span>
                <span>{feeError}</span>
              </div>
            )}

            <div className="overflow-x-auto border border-slate-200 rounded-lg mb-4">
              <table className="admin-table text-xs">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Processing</th>
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
                          <span className="text-slate-500 font-bold">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={serviceFees[key] ?? item.defaultFee}
                            onChange={(e) =>
                              setServiceFees({ ...serviceFees, [key]: Number(e.target.value) })
                            }
                            className="w-28 p-1.5 border border-slate-300 rounded-md font-bold text-slate-900 focus:outline-none focus:border-[#1B2B5E] focus:ring-1 focus:ring-[#1B2B5E]"
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
              disabled={feeLoading}
              className="w-full py-3 bg-[#C5991A] hover:bg-[#DFB53B] text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-[#C5991A]/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {feeLoading ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></span>
                  <span>Saving to Database...</span>
                </>
              ) : (
                '💾 Save Service Fees Configuration'
              )}
            </button>
          </div>

          {/* Supabase Connection Status */}
          <div className="admin-card bg-slate-900 text-white border-0">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>⚡</span> Database & Pricing Infrastructure
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-slate-400">Services Table</span>
                <span className="font-mono text-emerald-400">public.services</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-slate-400">App Sync Mode</span>
                <span className="font-bold text-emerald-400">Live Dynamic Queries</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-slate-400">Advance Collection</span>
                <span className="text-amber-300">50% Standard</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Project Endpoint</span>
                <span className="font-mono text-slate-300">meakrbzjepuournoogoi.supabase.co</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
