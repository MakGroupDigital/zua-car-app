'use client';

import { useState } from 'react';
import { ChartContainer, StatCard, Pagination } from '../components/stat-card';
import { Search, Filter, FileText, User, Shield } from 'lucide-react';
import { AuditLog } from '@/types/admin';

const MOCK_LOGS: AuditLog[] = [
  {
    id: '1',
    timestamp: new Date('2024-01-20T14:30:00'),
    adminId: 'admin_1',
    adminEmail: 'admin@autonex.com',
    action: 'User Suspended',
    resourceType: 'User',
    resourceId: 'user_3',
    changes: {
      before: { status: 'active' },
      after: { status: 'suspended', reason: 'Suspicious Activity' },
    },
    ipAddress: '192.168.1.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
  },
  {
    id: '2',
    timestamp: new Date('2024-01-20T13:15:00'),
    adminId: 'admin_2',
    adminEmail: 'moderator@autonex.com',
    action: 'Listing Approved',
    resourceType: 'Listing',
    resourceId: 'list_1',
    changes: {
      before: { status: 'pending' },
      after: { status: 'approved' },
    },
    ipAddress: '192.168.1.51',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
  },
  {
    id: '3',
    timestamp: new Date('2024-01-20T12:00:00'),
    adminId: 'admin_1',
    adminEmail: 'admin@autonex.com',
    action: 'Admin Created',
    resourceType: 'Admin',
    resourceId: 'admin_new',
    changes: {
      before: {},
      after: { role: 'moderator', email: 'new_mod@autonex.com' },
    },
    ipAddress: '192.168.1.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
  },
  {
    id: '4',
    timestamp: new Date('2024-01-20T11:30:00'),
    adminId: 'admin_3',
    adminEmail: 'support@autonex.com',
    action: 'Permission Revoked',
    resourceType: 'Admin',
    resourceId: 'admin_2',
    changes: {
      before: { permissions: ['manage_users', 'view_reports'] },
      after: { permissions: ['view_reports'] },
    },
    ipAddress: '192.168.1.52',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    status: 'success',
  },
  {
    id: '5',
    timestamp: new Date('2024-01-20T10:00:00'),
    adminId: 'admin_1',
    adminEmail: 'admin@autonex.com',
    action: 'Payout Processed',
    resourceType: 'Transaction',
    resourceId: 'trans_5000',
    changes: {
      before: { status: 'pending', amount: 5000 },
      after: { status: 'completed', amount: 5000, processedAt: '2024-01-20T10:00:00' },
    },
    ipAddress: '192.168.1.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'success',
  },
];

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_LOGS);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(MOCK_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const itemsPerPage = 10;

  const actions = Array.from(new Set(logs.map((log) => log.action)));

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const handleFilterChange = (term: string, action: string) => {
    let result = logs;

    if (term) {
      result = result.filter(
        (log) =>
          log.adminEmail.includes(term) ||
          log.resourceId.includes(term) ||
          log.action.includes(term) ||
          log.ipAddress.includes(term)
      );
    }

    if (action !== 'all') {
      result = result.filter((log) => log.action === action);
    }

    setFilteredLogs(result);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Audit Trail</h1>
        <p className="text-slate-400 mt-1">Historique complet de toutes les actions administrateur</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Actions Totales"
          value={logs.length}
          icon={<FileText size={24} />}
          color="blue"
        />
        <StatCard
          label="Admins Actifs"
          value={new Set(logs.map((l) => l.adminId)).size}
          icon={<Shield size={24} />}
          color="green"
        />
        <StatCard
          label="Succès"
          value={`${Math.round((logs.filter((l) => l.status === 'success').length / logs.length) * 100)}%`}
          icon={<User size={24} />}
          color="amber"
        />
      </div>

      {/* Filters */}
      <ChartContainer title="Recherche et Filtres">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher par email, ID, IP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange(e.target.value, actionFilter);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex flex-wrap gap-2 overflow-x-auto">
            <button
              onClick={() => {
                setActionFilter('all');
                handleFilterChange(searchTerm, 'all');
              }}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                actionFilter === 'all'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Toutes Actions
            </button>
            {actions.map((action) => (
              <button
                key={action}
                onClick={() => {
                  setActionFilter(action);
                  handleFilterChange(searchTerm, action);
                }}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  actionFilter === action
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </ChartContainer>

      {/* Logs Table */}
      <ChartContainer title={`Logs (${filteredLogs.length})`}>
        <div className="space-y-3">
          {paginatedLogs.map((log) => (
            <div key={log.id} className="rounded-lg border border-slate-700/30 overflow-hidden">
              <button
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                className="w-full p-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                      {log.adminEmail[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{log.action}</p>
                      <p className="text-xs text-slate-500">{log.adminEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span>Resource: {log.resourceType} #{log.resourceId}</span>
                    <span>•</span>
                    <span>{log.timestamp.toLocaleString('fr-FR')}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    log.status === 'success'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {log.status === 'success' ? 'Succès' : 'Échoué'}
                </span>
              </button>

              {expandedLog === log.id && (
                <div className="p-4 border-t border-slate-700/30 bg-slate-800/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">IP Address</p>
                      <p className="font-mono text-sm text-slate-300">{log.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                      <p className="text-sm text-slate-300">{log.timestamp.toISOString()}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">User Agent</p>
                    <p className="font-mono text-xs text-slate-400 break-all">{log.userAgent}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50">
                      <p className="text-xs text-slate-500 mb-2">Avant</p>
                      <pre className="text-xs text-slate-300 overflow-auto max-h-40">
                        {JSON.stringify(log.changes.before, null, 2)}
                      </pre>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50">
                      <p className="text-xs text-slate-500 mb-2">Après</p>
                      <pre className="text-xs text-slate-300 overflow-auto max-h-40">
                        {JSON.stringify(log.changes.after, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </ChartContainer>
    </div>
  );
}
