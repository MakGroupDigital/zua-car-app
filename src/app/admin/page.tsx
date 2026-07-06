'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { Activity, AlertCircle, BriefcaseBusiness, Car, Clock, FileText, ShoppingCart, Users } from 'lucide-react';
import { StatCard, ChartContainer, ListItem } from './components/stat-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';

type AdminDoc = {
  createdAt?: any;
  status?: string;
  title?: string;
  companyName?: string;
  businessLabel?: string;
  description?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  name?: string;
};

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000);
  return null;
}

function isLastDays(value: any, days: number) {
  const date = toDate(value);
  if (!date) return false;
  return date.getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;
}

export default function AdminDashboard() {
  const firestore = useFirestore();
  const usersRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const vehiclesRef = useMemoFirebase(() => firestore ? collection(firestore, 'vehicles') : null, [firestore]);
  const rentalsRef = useMemoFirebase(() => firestore ? collection(firestore, 'rentals') : null, [firestore]);
  const partsRef = useMemoFirebase(() => firestore ? collection(firestore, 'parts') : null, [firestore]);
  const businessProfilesRef = useMemoFirebase(() => firestore ? collection(firestore, 'businessProfiles') : null, [firestore]);
  const reportsRef = useMemoFirebase(() => firestore ? collection(firestore, 'reports') : null, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<AdminDoc>(usersRef);
  const { data: vehicles, isLoading: vehiclesLoading } = useCollection<AdminDoc>(vehiclesRef);
  const { data: rentals, isLoading: rentalsLoading } = useCollection<AdminDoc>(rentalsRef);
  const { data: parts, isLoading: partsLoading } = useCollection<AdminDoc>(partsRef);
  const { data: businessProfiles, isLoading: businessLoading } = useCollection<AdminDoc>(businessProfilesRef);
  const { data: reports, isLoading: reportsLoading } = useCollection<AdminDoc>(reportsRef);

  const isLoading = usersLoading || vehiclesLoading || rentalsLoading || partsLoading || businessLoading || reportsLoading;

  const listingTypeData = useMemo(() => [
    { name: 'Vente', value: vehicles?.length || 0 },
    { name: 'Location', value: rentals?.length || 0 },
    { name: 'Pièces', value: parts?.length || 0 },
    { name: 'Partenaires', value: businessProfiles?.length || 0 },
  ], [businessProfiles?.length, parts?.length, rentals?.length, vehicles?.length]);

  const usersChartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const label = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      const newUsers = (users || []).filter((user) => {
        const createdAt = toDate(user.createdAt);
        return createdAt?.toDateString() === date.toDateString();
      }).length;
      return { date: label, newUsers };
    });
  }, [users]);

  const pendingPartners = (businessProfiles || []).filter((profile) => profile.status === 'pending');
  const openReports = (reports || []).filter((report) => !report.status || ['open', 'pending', 'investigating'].includes(report.status));
  const totalListings = (vehicles?.length || 0) + (rentals?.length || 0) + (parts?.length || 0);
  const newUsers7d = (users || []).filter((user) => isLastDays(user.createdAt, 7)).length;
  const newListings7d = [...(vehicles || []), ...(rentals || []), ...(parts || [])].filter((listing) => isLastDays(listing.createdAt, 7)).length;

  const recentActivity = [
    { id: 'users', title: `${newUsers7d} nouveaux utilisateurs`, description: 'Sur les 7 derniers jours', badge: { label: 'Utilisateurs', color: 'blue' as const } },
    { id: 'listings', title: `${newListings7d} nouvelles annonces`, description: 'Vente, location et pièces', badge: { label: 'Annonces', color: 'green' as const } },
    { id: 'partners', title: `${pendingPartners.length} partenaires en attente`, description: 'Demandes business à valider', badge: { label: 'Validation', color: 'amber' as const } },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500" />
          <p className="text-slate-400">Chargement des données Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">Tableau de bord admin</h1>
        <p className="text-slate-400">Vue temps réel des données AUTONEX depuis Firebase</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Utilisateurs" value={users?.length || 0} icon={<Users size={24} />} color="blue" />
        <StatCard label="Listings" value={totalListings} icon={<ShoppingCart size={24} />} color="green" />
        <StatCard label="Partenaires attente" value={pendingPartners.length} icon={<BriefcaseBusiness size={24} />} color="amber" />
        <StatCard label="Signalements ouverts" value={openReports.length} icon={<AlertCircle size={24} />} color="red" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Véhicules vente" value={vehicles?.length || 0} icon={<Car size={24} />} color="blue" />
        <StatCard label="Véhicules location" value={rentals?.length || 0} icon={<Clock size={24} />} color="purple" />
        <StatCard label="Pièces" value={parts?.length || 0} icon={<FileText size={24} />} color="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer title="Nouveaux utilisateurs" description="7 derniers jours">
          <div className="space-y-3">
            {usersChartData.map((item) => {
              const max = Math.max(...usersChartData.map((entry) => entry.newUsers), 1);
              return (
                <div key={item.date}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-400">{item.date}</span>
                    <span className="font-semibold text-white">{item.newUsers}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${Math.max(4, (item.newUsers / max) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartContainer>

        <ChartContainer title="Distribution des contenus">
          <div className="space-y-3">
            {listingTypeData.map((item) => {
              const max = Math.max(...listingTypeData.map((entry) => entry.value), 1);
              return (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-400">{item.name}</span>
                    <span className="font-semibold text-white">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer title="Activité récente">
          <div className="space-y-3">
            {recentActivity.map((activity) => <ListItem key={activity.id} {...activity} />)}
          </div>
        </ChartContainer>

        <ChartContainer title="Partenaires en attente" description={`${pendingPartners.length} dossier(s) à valider`}>
          <div className="space-y-3">
            {pendingPartners.length === 0 ? (
              <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-4 text-slate-400">Aucune demande partenaire en attente.</div>
            ) : (
              pendingPartners.slice(0, 5).map((profile) => (
                <ListItem
                  key={profile.id}
                  title={profile.companyName || 'Entreprise'}
                  description={profile.businessLabel || profile.description || 'Profil partenaire'}
                  badge={{ label: 'Attente', color: 'amber' }}
                />
              ))
            )}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
