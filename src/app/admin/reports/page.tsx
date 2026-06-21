'use client';

import { useState } from 'react';
import { ChartContainer, ListItem, Pagination, StatCard } from '../components/stat-card';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, Trash2, MessageSquare } from 'lucide-react';
import { Report, ReportStatus, ReportType } from '@/types/admin';

const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    reportedUserId: 'user_3',
    reporterUserId: 'user_1',
    type: ReportType.FRAUD,
    status: ReportStatus.OPEN,
    title: 'Arnaque potentielle',
    description: 'L\'utilisateur demande un paiement hors plateforme',
    evidence: ['https://example.com/screenshot1.png'],
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    reportedListingId: 'list_5',
    reporterUserId: 'user_2',
    type: ReportType.INAPPROPRIATE_CONTENT,
    status: ReportStatus.INVESTIGATING,
    title: 'Contenu inapproprié',
    description: 'Images non conformes aux directives',
    evidence: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    createdAt: new Date('2024-01-19'),
  },
  {
    id: '3',
    reportedUserId: 'user_4',
    reporterUserId: 'user_5',
    type: ReportType.FAKE_LISTING,
    status: ReportStatus.ACTION_TAKEN,
    title: 'Faux listing détecté',
    description: 'Véhicule ne correspond pas à la description',
    evidence: [],
    createdAt: new Date('2024-01-18'),
    resolvedAt: new Date('2024-01-19'),
    resolvedBy: 'admin_1',
    resolution: 'Listing supprimé, utilisateur averti',
    action: {
      type: 'listing_removal',
      reason: 'Listing ne correspond pas à la réalité',
    },
  },
];

const reportTypeLabels = {
  [ReportType.FRAUD]: 'Arnaque',
  [ReportType.INAPPROPRIATE_CONTENT]: 'Contenu inapproprié',
  [ReportType.SPAM]: 'Spam',
  [ReportType.HARASSMENT]: 'Harcèlement',
  [ReportType.SCAM]: 'Escroquerie',
  [ReportType.FAKE_LISTING]: 'Faux listing',
  [ReportType.OFFENSIVE_BEHAVIOR]: 'Comportement offensant',
  [ReportType.OTHER]: 'Autre',
};

const statusColors = {
  [ReportStatus.OPEN]: 'red',
  [ReportStatus.INVESTIGATING]: 'amber',
  [ReportStatus.RESOLVED]: 'green',
  [ReportStatus.DISMISSED]: 'blue',
  [ReportStatus.ACTION_TAKEN]: 'green',
};

export default function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [filteredReports, setFilteredReports] = useState<Report[]>(MOCK_REPORTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const itemsPerPage = 10;

  const handleCloseReport = (reportId: string) => {
    setReports(
      reports.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: ReportStatus.RESOLVED,
              resolvedAt: new Date(),
              resolvedBy: 'admin_current',
            }
          : r
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion des Signalements</h1>
        <p className="text-slate-400 mt-1">Examiner et traiter les signalements des utilisateurs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Signalements Ouverts"
          value={reports.filter((r) => r.status === ReportStatus.OPEN).length}
          icon={<AlertTriangle size={24} />}
          color="red"
        />
        <StatCard
          label="En Investigation"
          value={reports.filter((r) => r.status === ReportStatus.INVESTIGATING).length}
          icon={<Clock size={24} />}
          color="amber"
        />
        <StatCard
          label="Résolus"
          value={reports.filter((r) => r.status === ReportStatus.RESOLVED || r.status === ReportStatus.ACTION_TAKEN).length}
          icon={<CheckCircle size={24} />}
          color="green"
        />
        <StatCard
          label="Total"
          value={reports.length}
          icon={<AlertTriangle size={24} />}
          color="blue"
        />
      </div>

      {/* Filters */}
      <ChartContainer title="Recherche et Filtres">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher par titre, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Tous
            </button>
            {Object.values(ReportStatus).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </ChartContainer>

      {/* Reports List */}
      <ChartContainer title={`Signalements (${filteredReports.length})`}>
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-600 hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{report.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{report.description}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Signalé le {report.createdAt.toLocaleDateString('fr-FR')} par User #{report.reporterUserId}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    report.status === ReportStatus.OPEN
                      ? 'bg-red-500/20 text-red-400'
                      : report.status === ReportStatus.INVESTIGATING
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              {report.status === ReportStatus.OPEN && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseReport(report.id);
                    }}
                    className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <CheckCircle size={14} />
                    Résoudre
                  </button>
                  <button className="flex-1 px-3 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded hover:bg-amber-500/30 transition-colors text-sm flex items-center justify-center gap-1">
                    <MessageSquare size={14} />
                    Enquêter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ChartContainer>
    </div>
  );
}
