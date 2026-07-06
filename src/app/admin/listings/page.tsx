'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Building, Check, Eye, Home, Search, Trash2, Wrench, Zap } from 'lucide-react';
import { ChartContainer, Pagination, StatCard } from '../components/stat-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';

type ListingDoc = {
  id: string;
  title?: string;
  make?: string;
  model?: string;
  name?: string;
  userId?: string;
  price?: number;
  pricePerDay?: number;
  status?: string;
  views?: number;
  favorites?: number;
  createdAt?: any;
  location?: string;
  category?: string;
};

type AdminListing = ListingDoc & {
  listingType: 'car' | 'rental' | 'parts';
  href: string;
};

const categoryIcons = {
  car: <Home size={16} />,
  rental: <Building size={16} />,
  parts: <Wrench size={16} />,
};

const categoryLabels = {
  car: 'Vente voiture',
  rental: 'Location',
  parts: 'Pièces',
};

const statusBadges: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-amber-500/20 text-amber-400',
  flagged: 'bg-red-500/20 text-red-400',
  archived: 'bg-slate-500/20 text-slate-400',
  sold: 'bg-blue-500/20 text-blue-400',
};

function titleOf(listing: AdminListing) {
  return listing.title || listing.name || `${listing.make || ''} ${listing.model || ''}`.trim() || 'Annonce';
}

function statusOf(listing: AdminListing) {
  return listing.status || 'active';
}

function priceOf(listing: AdminListing) {
  return Number(listing.price || listing.pricePerDay || 0);
}

export default function ListingsManagement() {
  const firestore = useFirestore();
  const vehiclesRef = useMemoFirebase(() => firestore ? collection(firestore, 'vehicles') : null, [firestore]);
  const rentalsRef = useMemoFirebase(() => firestore ? collection(firestore, 'rentals') : null, [firestore]);
  const partsRef = useMemoFirebase(() => firestore ? collection(firestore, 'parts') : null, [firestore]);
  const { data: vehicles, isLoading: vehiclesLoading } = useCollection<ListingDoc>(vehiclesRef);
  const { data: rentals, isLoading: rentalsLoading } = useCollection<ListingDoc>(rentalsRef);
  const { data: parts, isLoading: partsLoading } = useCollection<ListingDoc>(partsRef);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const listings = useMemo<AdminListing[]>(() => [
    ...(vehicles || []).map((item) => ({ ...item, listingType: 'car' as const, href: `/vehicles/${item.id}` })),
    ...(rentals || []).map((item) => ({ ...item, listingType: 'rental' as const, href: `/vehicleRentalListings/${item.id}` })),
    ...(parts || []).map((item) => ({ ...item, listingType: 'parts' as const, href: `/parts/${item.id}` })),
  ], [parts, rentals, vehicles]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const text = `${titleOf(listing)} ${listing.userId || ''} ${listing.location || ''}`.toLowerCase();
      const matchesSearch = !searchTerm || text.includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || listing.listingType === categoryFilter;
      const matchesStatus = statusFilter === 'all' || statusOf(listing) === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryFilter, listings, searchTerm, statusFilter]);

  const paginatedListings = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / itemsPerPage));
  const isLoading = vehiclesLoading || rentalsLoading || partsLoading;

  const updateListingStatus = async (listing: AdminListing, status: string) => {
    if (!firestore) return;
    const collectionName = listing.listingType === 'car' ? 'vehicles' : listing.listingType === 'rental' ? 'rentals' : 'parts';
    setUpdatingId(`${listing.listingType}:${listing.id}`);
    try {
      await updateDoc(doc(firestore, collectionName, listing.id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Chargement des annonces Firebase...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion des listings</h1>
        <p className="mt-1 text-slate-400">Ventes, locations et pièces depuis Firestore</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Actifs" value={listings.filter((l) => statusOf(l) === 'active').length} icon={<Check size={24} />} color="green" />
        <StatCard label="En attente" value={listings.filter((l) => statusOf(l) === 'pending').length} icon={<Zap size={24} />} color="amber" />
        <StatCard label="Signalés" value={listings.filter((l) => statusOf(l) === 'flagged').length} icon={<Search size={24} />} color="red" />
        <StatCard label="Total" value={listings.length} icon={<Home size={24} />} color="blue" />
      </div>

      <ChartContainer title="Recherche et filtres">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher par titre, propriétaire, ville..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <p className="flex items-center text-sm text-slate-400">Catégorie:</p>
            {['all', 'car', 'rental', 'parts'].map((category) => (
              <button
                key={category}
                onClick={() => {
                  setCategoryFilter(category);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1 rounded px-3 py-1 text-sm transition-colors ${
                  categoryFilter === category ? 'bg-amber-500 text-white' : 'border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {category !== 'all' && categoryIcons[category as keyof typeof categoryIcons]}
                {category === 'all' ? 'Tous' : categoryLabels[category as keyof typeof categoryLabels]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <p className="flex items-center text-sm text-slate-400">Statut:</p>
            {['all', 'active', 'pending', 'flagged', 'archived', 'sold'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  statusFilter === status ? 'bg-amber-500 text-white' : 'border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {status === 'all' ? 'Tous' : status}
              </button>
            ))}
          </div>
        </div>
      </ChartContainer>

      <ChartContainer title={`Listings (${filteredListings.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Titre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Propriétaire</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Catégorie</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Prix</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-400">Statut</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedListings.map((listing) => {
                const status = statusOf(listing);
                const key = `${listing.listingType}:${listing.id}`;
                return (
                  <tr key={key} className="border-b border-slate-700/50 transition-colors hover:bg-slate-800/30">
                    <td className="max-w-xs truncate px-4 py-3 font-medium text-white">{titleOf(listing)}</td>
                    <td className="px-4 py-3 text-slate-400">{listing.userId || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-sm text-slate-400">
                        {categoryIcons[listing.listingType]}
                        {categoryLabels[listing.listingType]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">${priceOf(listing).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${statusBadges[status] || 'bg-slate-500/20 text-slate-400'}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={listing.href} className="rounded p-2 transition-colors hover:bg-slate-700/50" title="Voir">
                          <Eye size={16} className="text-blue-400" />
                        </Link>
                        <button
                          disabled={updatingId === key}
                          onClick={() => updateListingStatus(listing, status === 'archived' ? 'active' : 'archived')}
                          className="rounded p-2 transition-colors hover:bg-slate-700/50 disabled:opacity-60"
                          title={status === 'archived' ? 'Réactiver' : 'Archiver'}
                        >
                          <Trash2 size={16} className={status === 'archived' ? 'text-green-400' : 'text-red-400'} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </ChartContainer>
    </div>
  );
}
