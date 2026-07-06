'use client';

import { collection } from 'firebase/firestore';
import { AlertCircle, CheckCircle, Database, Server, Users, Zap } from 'lucide-react';
import { ChartContainer, StatCard } from '../components/stat-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';

const collectionNames = ['users', 'vehicles', 'rentals', 'parts', 'businessProfiles', 'rentalBookings', 'reports', 'transactions', 'auditLogs', 'userSessions'];

function CollectionHealth({ name }: { name: string }) {
  const firestore = useFirestore();
  const ref = useMemoFirebase(() => firestore ? collection(firestore, name) : null, [firestore, name]);
  const { data, isLoading, error } = useCollection(ref);
  return (
    <div className={`rounded-lg border p-4 ${error ? 'border-red-500/20 bg-red-500/5' : 'border-green-500/20 bg-green-500/5'}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {error ? <AlertCircle size={20} className="text-red-400" /> : <CheckCircle size={20} className="text-green-400" />}
          <p className="font-semibold text-white">{name}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${error ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {error ? 'Erreur' : 'OK'}
        </span>
      </div>
      <p className="text-sm text-slate-400">{isLoading ? 'Chargement...' : `${data?.length || 0} document(s)`}</p>
    </div>
  );
}

export default function SystemMonitoring() {
  const firestore = useFirestore();
  const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const vehiclesRef = useMemoFirebase(() => firestore ? collection(firestore, 'vehicles') : null, [firestore]);
  const { data: users } = useCollection(usersRef);
  const { data: vehicles } = useCollection(vehiclesRef);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Monitoring système</h1>
        <p className="mt-1 text-slate-400">État réel des services accessibles depuis l’application</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Firebase" value={firestore ? 'OK' : 'OFF'} icon={<Zap size={24} />} color={firestore ? 'green' : 'red'} />
        <StatCard label="Collections suivies" value={collectionNames.length} icon={<Database size={24} />} color="blue" />
        <StatCard label="Utilisateurs" value={users?.length || 0} icon={<Users size={24} />} color="purple" />
        <StatCard label="Véhicules" value={vehicles?.length || 0} icon={<Server size={24} />} color="amber" />
      </div>
      <ChartContainer title="État des collections Firestore">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {collectionNames.map((name) => <CollectionHealth key={name} name={name} />)}
        </div>
      </ChartContainer>
      <ChartContainer title="Alertes système">
        <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-6 text-slate-400">
          Aucune alerte système réelle configurée. Les alertes apparaîtront ici quand une collection `systemAlerts` sera ajoutée.
        </div>
      </ChartContainer>
    </div>
  );
}
