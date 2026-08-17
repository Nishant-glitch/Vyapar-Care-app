'use client';

import React, { useState, useMemo } from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  filterTabs = [],
  activeTab = 'all',
  onTabChange,
  searchPlaceholder = 'Search records...',
  loading = false,
  onRowClick,
  pageSize = 20,
  actionButton,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // Filter by tab if internal or pass to external handler
  const filteredByTab = useMemo(() => {
    if (!filterTabs.length || activeTab === 'all') return data;
    return data.filter((item) => {
      const itemStatus = (item.status || '').toLowerCase();
      const tabKey = activeTab.toLowerCase();
      if (tabKey === 'pending') {
        return ['pending', 'documents_pending', 'payment_pending'].includes(itemStatus);
      }
      if (tabKey === 'review') {
        return ['under_review', 'under_scrutiny', 'submitted', 'processing'].includes(itemStatus);
      }
      if (tabKey === 'completed') {
        return ['completed', 'approved', 'gstin_issued', 'certificate_generated', 'success'].includes(itemStatus);
      }
      if (tabKey === 'failed') {
        return ['failed', 'rejected'].includes(itemStatus);
      }
      return itemStatus === tabKey;
    });
  }, [data, activeTab, filterTabs]);

  // Search filtering across visible fields
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return filteredByTab;
    const term = searchTerm.toLowerCase();
    return filteredByTab.filter((item) => {
      return columns.some((col) => {
        const val = item[col.key];
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(term);
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [filteredByTab, searchTerm, columns]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      if (typeof aVal === 'string') {
        const res = aVal.localeCompare(String(bVal));
        return sortDirection === 'asc' ? res : -res;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar, Filter Tabs, and Action Button Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.length > 0 && (
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (onTabChange) onTabChange(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-[#1B2B5E] shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#1B2B5E] focus:ring-2 focus:ring-[#1B2B5E]/10 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {actionButton}
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-table-container shadow-sm">
        {loading ? (
          <LoadingSkeleton rows={pageSize > 10 ? 10 : pageSize} cols={columns.length} />
        ) : paginatedData.length === 0 ? (
          <EmptyState
            title="No records found"
            description={searchTerm ? `No results matching "${searchTerm}"` : 'No data available.'}
            icon="📋"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable !== false && handleSort(col.key)}
                      className={`${
                        col.sortable !== false ? 'cursor-pointer select-none hover:bg-slate-100 transition-colors' : ''
                      } ${col.headerClassName || ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.label}</span>
                        {col.sortable !== false && (
                          <span className="text-slate-400 text-xs">
                            {sortKey === col.key ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => (
                  <tr
                    key={row.id || row.order_id || row.application_id || index}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`${
                      onRowClick ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''
                    }`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={col.className || ''}>
                        {col.render ? col.render(row[col.key], row, index) : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1 text-sm text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{sortedData.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold shadow-sm transition-all"
            >
              ◀ Previous
            </button>
            <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-[#1B2B5E]">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold shadow-sm transition-all"
            >
              Next ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
