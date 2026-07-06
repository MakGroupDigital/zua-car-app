'use client';

import { collection } from 'firebase/firestore';
import { BarChart3, Eye, MessageSquare, Percent, Users } from 'lucide-react';
import { ChartContainer, StatCard } from '../components/stat-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';

type Row = { id: string; views?: number; userId?: string; status?: string };

export default function AnalyticsPage() {
  const firestore = useFirestore();
  const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const vehiclesRef = useMemoFirebase(() => firestore ? collection(firestore, 'vehicles') : null, [firestore]);
  const rentalsRef = useMemoFirebase(() => firestore ? collection(firestore, 'rentals') : null, [firestore]);
  const bookingsRef = useMemoFirebase(() => firestore ? collection(firestore, 'rentalBookings') : null, [firestore]);
  const messagesRef = useMemoFirebase(() => firestore ? collection(firestore, 'messages') : null, [firestore]);
  const { data: users, isLoading: a } = useCollection<Row>(usersRef);
  const { data: vehicles, isLoading: b } = useCollection<Row>(vehiclesRef);
  const { data: rentals, isLoading: c } = useCollection<Row>(rentalsRef);
  const { data: bookings, isLoading: d } = useCollection<Row>(bookingsRef);
  const { data: messages, isLoading: e } = useCollection<Row>(messagesRef);

  const listings = [...(vehicles || []), ...(rentals || [])];
  const totalViews = listings.reduce((sum, item) => sum + Number(item.views || 0), 0);
  const leads = (bookings?.length || 0) + (messages?.length || 0);
  const conversion = totalViews > 0 ? Math.round((leads / totalViews) * 100) : 0;

  if (a || b || c || d || e) return <div className="p-8 text-center text-slate-400">Chargement analytics...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-slate-400">Indicateurs réels calculés depuis Firebase</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <StatCard label="Utilisateurs" value={users?.length || 0} icon={<Users size={24} />} color="blue" />
        <StatCard label="Listings" value={listings.length} icon={<BarChart3 size={24} />} color="green" />
        <StatCard label="Nombre de vues" value={totalViews} icon={<Eye size={24} />} color="purple" />
        <StatCard label="Leads générés" value={leads} icon={<MessageSquare size={24} />} color="amber" />
        <StatCard label="Conversion" value={`${conversion}%`} icon={<Percent size={24} />} color="red" />
      </div>
      <ChartContainer title="État analytics">
        <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-6 text-slate-400">
          Les graphiques avancés dépendront des événements tracking (`analyticsEvents`). Actuellement, cette page n’affiche que les agrégats réels disponibles.
        </div>
      </ChartContainer>
    </div>
  );
}
