'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getUserById, getAllOrders, getAllPayments, getNotificationHistory } from '@/lib/adminDatabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import LoadingSkeleton from '@/components/LoadingSkeleton';

export default function UserDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    async function load() {
      try {
        const [uData, oData, pData, nData] = await Promise.all([
          getUserById(id),
          getAllOrders(),
          getAllPayments(),
          getNotificationHistory(),
        ]);
        setUser(uData);
        setOrders(oData.filter((o) => o.user_id === uData?.id || o.customer_id === uData?.customer_id));
        setPayments(pData.filter((p) => p.customer_id === uData?.customer_id || p.user_name === uData?.name));
        setNotifs(nData.filter((n) => n.user_id === uData?.id || n.user_id === 'all'));
      } catch (err) {
        console.error('Failed to load user details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!user) {
    return (
      <div className="admin-card text-center py-12">
        <div className="text-4xl mb-2">👤</div>
        <h3 className="text-base font-bold text-slate-800 mb-1">User Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">No client user found with ID: {id}</p>
        <Link href="/dashboard/users" className="px-4 py-2 bg-[#1B2B5E] text-white text-xs font-bold rounded-lg inline-block hover:bg-[#283E80] transition-colors">
          ← Back to Users Directory
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
            href="/dashboard/users"
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            ←
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-[#1B2B5E] font-bold rounded">
                {user.customer_id}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Registered client since {formatDate(user.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* User Overview Profile Card */}
      <div className="admin-card">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-400 font-semibold mb-0.5">Primary Mobile</div>
            <div className="font-bold text-slate-900 text-sm">{user.phone}</div>
          </div>
          <div>
            <div className="text-slate-400 font-semibold mb-0.5">Email Address</div>
            <div className="font-semibold text-slate-800">{user.email || '—'}</div>
          </div>
          <div>
            <div className="text-slate-400 font-semibold mb-0.5">Total Services Ordered</div>
            <div className="font-bold text-[#1B2B5E] text-sm">{orders.length || 1} Services</div>
          </div>
          <div>
            <div className="text-slate-400 font-semibold mb-0.5">Account Status</div>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
              ● Active Client
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Tabs: Orders, Payments, Notifications */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-[#1B2B5E] text-[#1B2B5E]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            📋 Booked Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'payments'
                ? 'border-[#1B2B5E] text-[#1B2B5E]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            💳 Payments ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('notifs')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'notifs'
                ? 'border-[#1B2B5E] text-[#1B2B5E]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            🔔 Sent Notifications ({notifs.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' && (
          <div className="admin-table-container">
            <table className="admin-table text-xs">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Service</th>
                  <th>Total Fee</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id || o.order_id}>
                    <td className="font-mono font-bold text-[#1B2B5E]">{o.order_id}</td>
                    <td className="font-semibold">{o.service_name}</td>
                    <td>{formatCurrency(o.fee)}</td>
                    <td className="font-bold text-emerald-600">{formatCurrency(o.paid)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td>{formatDate(o.created_at)}</td>
                    <td className="text-right">
                      <Link
                        href={`/dashboard/orders/${o.id || o.order_id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#1B2B5E] hover:text-white rounded text-[11px] font-bold"
                      >
                        View ➔
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="admin-table-container">
            <table className="admin-table text-xs">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id || p.transaction_id}>
                    <td className="font-mono text-slate-600">{p.transaction_id}</td>
                    <td className="font-semibold">{p.service_name}</td>
                    <td className="font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                    <td className="capitalize">{p.type}</td>
                    <td>{p.method}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'notifs' && (
          <div className="space-y-3">
            {notifs.map((n) => (
              <div key={n.id} className="p-4 bg-white rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-slate-900 text-sm">{n.title}</div>
                  <span className="text-[10px] text-slate-400">{formatDate(n.created_at)}</span>
                </div>
                <div className="text-slate-600 leading-relaxed">{n.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
