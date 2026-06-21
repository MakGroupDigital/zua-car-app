'use client';

import { useState } from 'react';
import { ChartContainer, StatCard, Pagination } from '../components/stat-card';
import { Search, Filter, Eye, Trash2, Home, Building, Wrench, Check, Zap } from 'lucide-react';

const MOCK_LISTINGS = [
  {
    id: '1',
    title: 'Toyota Camry 2023',
    owner: 'Ahmed Mohammed',
    category: 'car',
    price: 25000,
    status: 'active',
    views: 234,
    favorites: 42,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'BMW X5 2022',
    owner: 'Fatima Hassan',
    category: 'car',
    price: 45000,
    status: 'pending',
    views: 0,
    favorites: 0,
    createdAt: new Date('2024-01-19'),
  },
  {
    id: '3',
    title: 'Kit Moteur Complet',
    owner: 'Mohamed Ali',
    category: 'parts',
    price: 1200,
    status: 'active',
    views: 87,
    favorites: 12,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    title: 'Location Mercedes Classe E',
    owner: 'Aisha Khalid',
    category: 'rental',
    price: 250,
    status: 'active',
    views: 567,
    favorites: 89,
    createdAt: new Date('2024-01-05'),
  },
];

const categoryIcons = {
  car: <Home size={16} />,
  rental: <Building size={16} />,
  parts: <Wrench size={16} />,
  service: <Zap size={16} />,
};

const categoryLabels = {
  car: 'Vente Voiture',
  rental: 'Location',
  parts: 'Pièces',
  service: 'Service',
};

const statusBadges = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-amber-500/20 text-amber-400',
  flagged: 'bg-red-500/20 text-red-400',
  archived: 'bg-slate-500/20 text-slate-400',
};

export default function ListingsManagement() {
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [filteredListings, setFilteredListings] = useState(MOCK_LISTINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const handleSearch = (term: string, category: string, status: string) => {
    let result = listings;

    if (term) {
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(term.toLowerCase()) ||
          l.owner.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (category !== 'all') {
      result = result.filter((l) => l.category === category);
    }

    if (status !== 'all') {
      result = result.filter((l) => l.status === status);
    }

    setFilteredListings(result);
    setCurrentPage(1);
  };

  const paginatedListings = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion des Listings</h1>
        <p className="text-slate-400 mt-1">Gérer tous les annonces et listings de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Listings Actifs"
          value={listings.filter((l) => l.status === 'active').length}
          icon={<Check size={24} />}
          color="green"
        />
        <StatCard
          label="En Attente"
          value={listings.filter((l) => l.status === 'pending').length}
          icon={<Zap size={24} />}
          color="amber"
        />
        <StatCard
          label="Signalés"
          value={listings.filter((l) => l.status === 'flagged').length}
          icon={<Search size={24} />}
          color="red"
        />
        <StatCard
          label="Total"
          value={listings.length}
          icon={<Home size={24} />}
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
              placeholder="Rechercher par titre, propriétaire..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value, categoryFilter, statusFilter);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2 flex-wrap">
              <p className="text-sm text-slate-400 flex items-center">Catégorie:</p>
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  handleSearch(searchTerm, 'all', statusFilter);
                }}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                Tous
              </button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setCategoryFilter(key);
                    handleSearch(searchTerm, key, statusFilter);
                  }}
                  className={`px-3 py-1 rounded text-sm transition-colors flex items-center gap-1 ${
                    categoryFilter === key
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {categoryIcons[key as keyof typeof categoryIcons]}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <p className="text-sm text-slate-400 flex items-center">Statut:</p>
            {['all', 'active', 'pending', 'flagged', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  handleSearch(searchTerm, categoryFilter, status);
                }}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  statusFilter === status
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {status === 'all' ? 'Tous' : status === 'active' ? 'Actif' : status === 'pending' ? 'Attente' : status === 'flagged' ? 'Signalé' : 'Archivé'}
              </button>
            ))}
          </div>
        </div>
      </ChartContainer>

      {/* Listings Table */}
      <ChartContainer title={`Listings (${filteredListings.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Titre</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Propriétaire</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Catégorie</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Prix</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Vues</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Statut</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedListings.map((listing) => (
                <tr key={listing.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-white max-w-xs truncate">{listing.title}</td>
                  <td className="px-4 py-3 text-slate-400">{listing.owner}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm text-slate-400">
                      {categoryIcons[listing.category as keyof typeof categoryIcons]}
                      {categoryLabels[listing.category as keyof typeof categoryLabels]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">${listing.price}</td>
                  <td className="px-4 py-3 text-slate-400">
                    <span className="text-sm">{listing.views} vues</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        statusBadges[listing.status as keyof typeof statusBadges] || 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {listing.status === 'active' ? 'Actif' : listing.status === 'pending' ? 'Attente' : listing.status === 'flagged' ? 'Signalé' : 'Archivé'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-slate-700/50 rounded transition-colors" title="Voir">
                        <Eye size={16} className="text-blue-400" />
                      </button>
                      <button className="p-2 hover:bg-slate-700/50 rounded transition-colors" title="Supprimer">
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </ChartContainer>
    </div>
  );
}
