'use client';

import { useMemo, useState } from 'react';
import { collection } from 'firebase/firestore';
import { Activity, Search, Shield, UserCheck } from 'lucide-react';
import { ChartContainer, StatCard } from '../components/stat-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';

type LogRow = { id: string; adminId?: string; adminEmail?: string; action?: string; resourceType?: string; resourceId?: string; timestamp?: any; details?: any };

function format(value: any) {
  const date = value?.toDate?.();
  return date ? date.toLocaleString('fr-FR') : '—';
}

export default function LogsPage() {
  const firestore = useFirestore();
  const logsRef = useMemoFirebase(() => firestore ? collection(firestore, 'auditLogs') : null, [firestore]);
  const { data: logs, isLoading } = useCollection<LogRow>(logsRef);
  const [search, setSearch] = useState('');
  const rows = logs || [];
  const filtered = useMemo(() => rows.filter((log) => `${log.adminEmail || ''} ${log.action || ''} ${log.resourceType || ''} ${log.resourceId || ''}`.toLowerCase().includes(search.toLowerCase())), [rows, search]);

  if (isLoading) return <div className="p-8 text-center text-slate-400">Chargement audit logs...</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-white">Audit Logs</h1><p className="mt-1 text-slate-400">Logs réels depuis `auditLogs`</p></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Logs" value={rows.length} icon={<Activity size={24} />} color="blue" />
        <StatCard label="Admins uniques" value={new Set(rows.map((l) => l.adminId).filter(Boolean)).size} icon={<Shield size={24} />} color="green" />
        <StatCard label="Actions" value={new Set(rows.map((l) => l.action).filter(Boolean)).size} icon={<UserCheck size={24} />} color="amber" />
      </div>
      <ChartContainer title="Recherche">
        <div className="relative"><Search className="absolute left-3 top-3 text-slate-500" size={20} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher logs..." className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-10 pr-4 text-white placeholder-slate-500" /></div>
      </ChartContainer>
      <ChartContainer title={`Logs (${filtered.length})`}>
        {filtered.length === 0 ? <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-6 text-center text-slate-400">Aucun audit log réel trouvé.</div> : (
          <div className="space-y-3">{filtered.map((log) => <div key={log.id} className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-4"><p className="font-semibold text-white">{log.action || 'Action'}</p><p className="text-sm text-slate-400">{log.adminEmail || log.adminId || 'Admin inconnu'} · {log.resourceType || 'ressource'} {log.resourceId || ''}</p><p className="mt-2 text-xs text-slate-500">{format(log.timestamp)}</p></div>)}</div>
        )}
      </ChartContainer>
    </div>
  );
}
