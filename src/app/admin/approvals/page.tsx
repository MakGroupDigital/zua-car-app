'use client';

import { useState } from 'react';
import { ChartContainer, ListItem, Pagination } from '../components/stat-card';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { ListingApproval, ListingStatus } from '@/types/admin';

const MOCK_LISTINGS: ListingApproval[] = [
  {
    id: '1',
    listingId: 'list_1',
    userId: 'user_1',
    status: ListingStatus.PENDING,
    appliedAt: new Date('2024-01-20'),
    requiredDocuments: [
      {
        id: 'doc_1',
        type: 'registration_document',
        url: 'https://example.com/doc1.pdf',
        uploadedAt: new Date('2024-01-20'),
        status: 'approved',
      },
    ],
    comments: 'Toyota Camry 2023 - Premium Listing',
  },
  {
    id: '2',
    listingId: 'list_2',
    userId: 'user_2',
    status: ListingStatus.PENDING,
    appliedAt: new Date('2024-01-19'),
    requiredDocuments: [
      {
        id: 'doc_2',
        type: 'vehicle_inspection',
        url: 'https://example.com/doc2.pdf',
        uploadedAt: new Date('2024-01-19'),
        status: 'pending',
      },
    ],
    comments: 'BMW X5 - Documents en attente de vérification',
  },
  {
    id: '3',
    listingId: 'list_3',
    userId: 'user_3',
    status: ListingStatus.REJECTED,
    appliedAt: new Date('2024-01-18'),
    reviewedAt: new Date('2024-01-18'),
    reviewedBy: 'admin_1',
    reason: 'Images non conformes aux directives',
    requiredDocuments: [],
  },
];

const statusBadges = {
  [ListingStatus.PENDING]: { color: 'amber', label: 'En attente' },
  [ListingStatus.APPROVED]: { color: 'green', label: 'Approuvé' },
  [ListingStatus.REJECTED]: { color: 'red', label: 'Rejeté' },
  [ListingStatus.DRAFT]: { color: 'blue', label: 'Brouillon' },
  [ListingStatus.ARCHIVED]: { color: 'slate', label: 'Archivé' },
  [ListingStatus.FLAGGED]: { color: 'red', label: 'Signalé' },
  [ListingStatus.SOLD]: { color: 'green', label: 'Vendu' },
  [ListingStatus.EXPIRED]: { color: 'slate', label: 'Expiré' },
};

export default function ListingsApproval() {
  const [listings, setListings] = useState<ListingApproval[]>(MOCK_LISTINGS);
  const [filteredListings, setFilteredListings] = useState<ListingApproval[]>(MOCK_LISTINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState<ListingApproval | null>(null);

  const itemsPerPage = 10;

  const handleApprove = (listingId: string) => {
    setListings(
      listings.map((l) =>
        l.id === listingId
          ? {
              ...l,
              status: ListingStatus.APPROVED,
              reviewedAt: new Date(),
              reviewedBy: 'admin_current',
            }
          : l
      )
    );
  };

  const handleReject = (listingId: string) => {
    setListings(
      listings.map((l) =>
        l.id === listingId
          ? {
              ...l,
              status: ListingStatus.REJECTED,
              reviewedAt: new Date(),
              reviewedBy: 'admin_current',
              reason: 'Rejeté par l\'administrateur',
            }
          : l
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Approbations de Listings</h1>
        <p className="text-slate-400 mt-1">Examiner et approuver les nouvelles offres</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">En Attente</p>
              <p className="text-3xl font-bold text-white">{listings.filter((l) => l.status === ListingStatus.PENDING).length}</p>
            </div>
            <Clock size={24} className="text-amber-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Approuvés</p>
              <p className="text-3xl font-bold text-white">{listings.filter((l) => l.status === ListingStatus.APPROVED).length}</p>
            </div>
            <CheckCircle size={24} className="text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Rejetés</p>
              <p className="text-3xl font-bold text-white">{listings.filter((l) => l.status === ListingStatus.REJECTED).length}</p>
            </div>
            <XCircle size={24} className="text-red-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-2">Total</p>
              <p className="text-3xl font-bold text-white">{listings.length}</p>
            </div>
            <AlertCircle size={24} className="text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <ChartContainer title="Recherche et Filtres">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher par ID listing, utilisateur..."
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
            {Object.entries(ListingStatus).map(([key, status]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as ListingStatus)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {statusBadges[status as ListingStatus]?.label || key}
              </button>
            ))}
          </div>
        </div>
      </ChartContainer>

      {/* Listings Table */}
      <ChartContainer title={`Listings (${filteredListings.length})`}>
        <div className="space-y-3">
          {filteredListings.map((listing) => {
            const badge = statusBadges[listing.status as ListingStatus] || { color: 'slate', label: 'Inconnu' };
            return (
              <div key={listing.id} className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-600 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-medium text-white">Listing #{listing.listingId}</p>
                    <p className="text-sm text-slate-400">{listing.comments}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      badge.color === 'amber'
                        ? 'bg-amber-500/20 text-amber-400'
                        : badge.color === 'green'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {badge.label}
                  </span>
                </div>

                {listing.status === ListingStatus.PENDING && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(listing.id)}
                      className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(listing.id)}
                      className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} />
                      Rejeter
                    </button>
                  </div>
                )}

                {listing.status === ListingStatus.REJECTED && listing.reason && (
                  <p className="text-sm text-red-400 mt-3">Raison: {listing.reason}</p>
                )}
              </div>
            );
          })}
        </div>
      </ChartContainer>
    </div>
  );
}
