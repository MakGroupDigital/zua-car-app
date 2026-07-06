'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChartContainer, ListItem, Pagination } from '../components/stat-card';
import { Search, CheckCircle, XCircle, Clock, AlertCircle, BriefcaseBusiness, ExternalLink } from 'lucide-react';
import { ListingApproval, ListingStatus } from '@/types/admin';
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

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

type BusinessProfile = {
  id: string;
  userId?: string;
  businessType?: 'vehicle_company' | 'insurance_company';
  businessLabel?: string;
  companyName?: string;
  representativeName?: string;
  address?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string | null;
  logoUrl?: string | null;
  legalDocumentUrls?: string[];
  legalDocumentNames?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
};

export default function ListingsApproval() {
  const firestore = useFirestore();
  const [listings, setListings] = useState<ListingApproval[]>(MOCK_LISTINGS);
  const [filteredListings, setFilteredListings] = useState<ListingApproval[]>(MOCK_LISTINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState<ListingApproval | null>(null);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [businessSearch, setBusinessSearch] = useState('');
  const [businessStatusFilter, setBusinessStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [updatingBusinessId, setUpdatingBusinessId] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    if (!firestore) return;

    const q = query(collection(firestore, 'businessProfiles'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBusinessProfiles(snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as BusinessProfile)));
    });

    return () => unsubscribe();
  }, [firestore]);

  const filteredBusinessProfiles = useMemo(() => {
    return businessProfiles.filter((profile) => {
      const searchText = `${profile.companyName || ''} ${profile.representativeName || ''} ${profile.email || ''} ${profile.phone || ''} ${profile.businessLabel || ''}`.toLowerCase();
      const matchesSearch = !businessSearch || searchText.includes(businessSearch.toLowerCase());
      const matchesStatus = businessStatusFilter === 'all' || profile.status === businessStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [businessProfiles, businessSearch, businessStatusFilter]);

  const updateBusinessProfileStatus = async (profile: BusinessProfile, status: 'approved' | 'rejected') => {
    if (!firestore) return;

    const rejectionReason = status === 'rejected'
      ? window.prompt('Motif du rejet', 'Documents ou informations à corriger') || 'Documents ou informations à corriger'
      : null;

    setUpdatingBusinessId(profile.id);
    try {
      await updateDoc(doc(firestore, 'businessProfiles', profile.id), {
        status,
        rejectionReason,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } finally {
      setUpdatingBusinessId(null);
    }
  };

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
        <p className="text-slate-400 mt-1">Examiner les offres et les profils partenaires</p>
      </div>

      <ChartContainer title={`Profils partenaires (${filteredBusinessProfiles.length})`}>
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Rechercher une entreprise, représentant, mail..."
                value={businessSearch}
                onChange={(e) => setBusinessSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <select
              value={businessStatusFilter}
              onChange={(event) => setBusinessStatusFilter(event.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
              className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-white"
            >
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="rejected">Rejetés</option>
              <option value="all">Tous</option>
            </select>
          </div>

          <div className="grid gap-3">
            {filteredBusinessProfiles.length === 0 ? (
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6 text-center text-slate-400">
                Aucun profil partenaire trouvé.
              </div>
            ) : (
              filteredBusinessProfiles.map((profile) => (
                <div key={profile.id} className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                          <BriefcaseBusiness size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-lg font-bold text-white">{profile.companyName || 'Entreprise sans nom'}</p>
                          <p className="text-sm text-slate-400">{profile.businessLabel || profile.businessType}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                        <p><span className="text-slate-500">Représentant :</span> {profile.representativeName || '—'}</p>
                        <p><span className="text-slate-500">Téléphone :</span> {profile.phone || '—'}</p>
                        <p><span className="text-slate-500">Mail :</span> {profile.email || '—'}</p>
                        <p><span className="text-slate-500">Adresse :</span> {profile.address || '—'}</p>
                      </div>
                      {profile.description && <p className="mt-3 text-sm text-slate-400">{profile.description}</p>}
                      {profile.legalDocumentUrls && profile.legalDocumentUrls.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {profile.legalDocumentUrls.map((url, index) => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-amber-400 hover:border-amber-500/60"
                            >
                              Document {index + 1}
                              <ExternalLink size={12} />
                            </a>
                          ))}
                        </div>
                      )}
                      {profile.status === 'rejected' && profile.rejectionReason && (
                        <p className="mt-3 text-sm text-red-400">Motif : {profile.rejectionReason}</p>
                      )}
                    </div>

                    <div className="flex min-w-[220px] flex-col gap-2">
                      <span className={`rounded-full px-3 py-1 text-center text-xs font-bold ${
                        profile.status === 'approved'
                          ? 'bg-green-500/20 text-green-400'
                          : profile.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {profile.status === 'approved' ? 'Approuvé' : profile.status === 'rejected' ? 'Rejeté' : 'En attente'}
                      </span>
                      {profile.status !== 'approved' && (
                        <button
                          onClick={() => updateBusinessProfileStatus(profile, 'approved')}
                          disabled={updatingBusinessId === profile.id}
                          className="rounded-lg border border-green-500/30 bg-green-500/20 px-4 py-2 text-green-400 transition-colors hover:bg-green-500/30 disabled:opacity-60"
                        >
                          Approuver
                        </button>
                      )}
                      {profile.status !== 'rejected' && (
                        <button
                          onClick={() => updateBusinessProfileStatus(profile, 'rejected')}
                          disabled={updatingBusinessId === profile.id}
                          className="rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-2 text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-60"
                        >
                          Rejeter
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </ChartContainer>

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
