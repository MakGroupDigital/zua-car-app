'use client';

import { collection } from 'firebase/firestore';
import { Activity, Clock, Monitor, Users } from 'lucide-react';
import { ChartContainer, StatCard } from '../components/stat-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';

type SessionRow = { id: string; userId?: string; isActive?: boolean; loginTime?: any; lastActivityTime?: any; userAgent?: string; ipAddress?: string };

function format(value: any) {
  const date = value?.toDate?.();
  return date ? date.toLocaleString('fr-FR') : '—';
}

export default function SessionsPage() {
  const firestore = useFirestore();
  const sessionsRef = useMemoFirebase(() => firestore ? collection(firestore, 'userSessions') : null, [firestore]);
  const { data: sessions, isLoading } = useCollection<SessionRow>(sessionsRef);
  const rows = sessions || [];

  if (isLoading) return <div className="p-8 text-center text-slate-400">Chargement connexions...</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-white">Connexions</h1><p className="mt-1 text-slate-400">Sessions depuis `userSessions`</p></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Sessions" value={rows.length} icon={<Monitor size={24} />} color="blue" />
        <StatCard label="Actives" value={rows.filter((s) => s.isActive).length} icon={<Activity size={24} />} color="green" />
        <StatCard label="Utilisateurs uniques" value={new Set(rows.map((s) => s.userId).filter(Boolean)).size} icon={<Users size={24} />} color="purple" />
        <StatCard label="Inactives" value={rows.filter((s) => !s.isActive).length} icon={<Clock size={24} />} color="amber" />
      </div>
      <ChartContainer title={`Sessions (${rows.length})`}>
        {rows.length === 0 ? <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-6 text-center text-slate-400">Aucune session réelle trouvée.</div> : (
          <div className="space-y-3">{rows.map((s) => <div key={s.id} className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-4"><p className="font-semibold text-white">{s.userId || 'Utilisateur inconnu'}</p><p className="text-sm text-slate-400">{s.ipAddress || 'IP inconnue'} · {s.userAgent || 'Agent inconnu'}</p><p className="mt-2 text-xs text-slate-500">Connexion: {format(s.loginTime)} · Activité: {format(s.lastActivityTime)}</p></div>)}</div>
        )}
      </ChartContainer>
    </div>
  );
}
