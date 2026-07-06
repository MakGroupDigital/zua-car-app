'use client';

import { useMemo, useState } from 'react';
import { collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { AlertTriangle, CheckCircle, Clock, MessageSquare, Search } from 'lucide-react';
import { ChartContainer, StatCard } from '../components/stat-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';

type ReportRow = {
  id: string;
  title?: string;
  description?: string;
  type?: string;
  status?: string;
  reporterUserId?: string;
  reportedUserId?: string;
  reportedListingId?: string;
  createdAt?: any;
};

const statusClass: Record<string, string> = {
  open: 'bg-red-500/20 text-red-400',
  pending: 'bg-red-500/20 text-red-400',
  investigating: 'bg-amber-500/20 text-amber-400',
  resolved: 'bg-green-500/20 text-green-400',
  action_taken: 'bg-green-500/20 text-green-400',
  dismissed: 'bg-blue-500/20 text-blue-400',
};

function formatDate(value: any) {
  const date = value?.toDate?.() || null;
  return date ? date.toLocaleDateString('fr-FR') : '—';
}

export default function ReportsManagement() {
  const firestore = useFirestore();
  const reportsRef = useMemoFirebase(() => firestore ? collection(firestore, 'reports') : null, [firestore]);
  const { data: reports, isLoading } = useCollection<ReportRow>(reportsRef);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const rows = reports || [];
  const filteredReports = useMemo(() => rows.filter((report) => {
    const status = report.status || 'open';
    const text = `${report.title || ''} ${report.description || ''} ${report.type || ''}`.toLowerCase();
    return (!searchTerm || text.includes(searchTerm.toLowerCase())) && (statusFilter === 'all' || status === statusFilter);
  }), [rows, searchTerm, statusFilter]);

  const updateStatus = async (report: ReportRow, status: string) => {
    if (!firestore) return;
    setUpdatingId(report.id);
    try {
      await updateDoc(doc(firestore, 'reports', report.id), {
        status,
        resolvedAt: ['resolved', 'dismissed', 'action_taken'].includes(status) ? serverTimestamp() : null,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-400">Chargement des signalements...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion des signalements</h1>
        <p className="mt-1 text-slate-400">Signalements réels depuis Firestore `reports`</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Ouverts" value={rows.filter((r) => ['open', 'pending', undefined].includes(r.status as any)).length} icon={<AlertTriangle size={24} />} color="red" />
        <StatCard label="Investigation" value={rows.filter((r) => r.status === 'investigating').length} icon={<Clock size={24} />} color="amber" />
        <StatCard label="Résolus" value={rows.filter((r) => ['resolved', 'action_taken'].includes(r.status || '')).length} icon={<CheckCircle size={24} />} color="green" />
        <StatCard label="Total" value={rows.length} icon={<MessageSquare size={24} />} color="blue" />
      </div>

      <ChartContainer title="Recherche et filtres">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={20} />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher un signalement..." className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-10 pr-4 text-white placeholder-slate-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'open', 'investigating', 'resolved', 'dismissed', 'action_taken'].map((status) => (
              <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-lg px-4 py-2 ${statusFilter === status ? 'bg-amber-500 text-white' : 'border border-slate-700 bg-slate-800/50 text-slate-400'}`}>
                {status === 'all' ? 'Tous' : status}
              </button>
            ))}
          </div>
        </div>
      </ChartContainer>

      <ChartContainer title={`Signalements (${filteredReports.length})`}>
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-6 text-center text-slate-400">Aucun signalement réel trouvé.</div>
          ) : filteredReports.map((report) => {
            const status = report.status || 'open';
            return (
              <div key={report.id} className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white">{report.title || report.type || 'Signalement'}</h4>
                    <p className="mt-1 text-sm text-slate-400">{report.description || 'Aucune description.'}</p>
                    <p className="mt-2 text-xs text-slate-500">Créé le {formatDate(report.createdAt)} · Reporter: {report.reporterUserId || '—'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass[status] || 'bg-slate-500/20 text-slate-400'}`}>{status}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-700/50 pt-3">
                  <button disabled={updatingId === report.id} onClick={() => updateStatus(report, 'investigating')} className="rounded border border-amber-500/30 px-3 py-2 text-sm text-amber-400">Enquêter</button>
                  <button disabled={updatingId === report.id} onClick={() => updateStatus(report, 'resolved')} className="rounded border border-green-500/30 px-3 py-2 text-sm text-green-400">Résoudre</button>
                  <button disabled={updatingId === report.id} onClick={() => updateStatus(report, 'dismissed')} className="rounded border border-slate-500/30 px-3 py-2 text-sm text-slate-300">Rejeter</button>
                </div>
              </div>
            );
          })}
        </div>
      </ChartContainer>
    </div>
  );
}
