'use client';

import React, { useEffect, useState } from 'react';
import { getNotificationHistory, getAllUsers, sendNotification } from '@/lib/adminDatabase';
import { NOTIFICATION_TEMPLATES } from '@/lib/constants';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function NotificationsPage() {
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [targetUser, setTargetUser] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [nData, uData] = await Promise.all([
          getNotificationHistory(),
          getAllUsers(),
        ]);
        setHistory(nData);
        setUsers(uData);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setType(tpl.type);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);

    try {
      const res = await sendNotification(targetUser, title.trim(), message.trim(), type);
      if (res.notification) {
        setHistory((prev) => [res.notification, ...prev]);
      }
      setSuccessMsg(true);
      setTitle('');
      setMessage('');
      setTimeout(() => setSuccessMsg(false), 4000);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSkeleton type="table" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Notification Dispatch Center</h2>
        <p className="text-xs text-slate-500">Send push announcements, action alerts, and payment reminders to clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Send Notification Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>📢</span> Compose New Notification
            </h3>

            {/* Quick Template Buttons */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Quick Presets:</label>
              <div className="flex flex-wrap gap-1.5">
                {NOTIFICATION_TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors"
                  >
                    + {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  className="admin-input text-xs font-medium"
                >
                  <option value="all">📢 All Users (Broadcast Notification)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      👤 {u.name} ({u.customer_id} - {u.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Payment Reminder or Document Request"
                  className="admin-input text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type clear notification description for the customer..."
                  className="admin-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="admin-input text-xs font-medium"
                >
                  <option value="info">Info Notice</option>
                  <option value="payment">Payment Alert</option>
                  <option value="action">Action / Document Upload Required</option>
                  <option value="success">Success / Certificate Issued</option>
                </select>
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
                  <span>✅</span> Notification successfully broadcasted!
                </div>
              )}

              <button
                type="submit"
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full py-2.5 bg-[#1B2B5E] hover:bg-[#283E80] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#1B2B5E]/20 disabled:opacity-40"
              >
                {sending ? 'Dispatching...' : '🚀 Send Notification'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Sent Notifications History (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="admin-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>📜</span> Sent Notifications History ({history.length})
            </h3>

            {history.length === 0 ? (
              <div className="text-center py-12 border-dashed border-2 border-slate-200 rounded-xl bg-slate-50/50">
                <div className="text-3xl mb-1.5">📭</div>
                <h4 className="text-xs font-bold text-slate-700">No Notifications Sent Yet</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the form on the left to broadcast alerts or notifications to clients.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                        <StatusBadge status={item.type} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed font-normal">{item.description}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <div>
                        Recipient: <span className="font-bold text-slate-800">{item.user?.name || item.user_name || 'All Users'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{formatDate(item.created_at, 'dd MMM yyyy, hh:mm a')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
