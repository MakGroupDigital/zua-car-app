'use client';

import { useEffect, useState } from 'react';
import { StatCard, ChartContainer, ListItem, Pagination } from '../components/stat-card';
import { Search, Filter, Download, MoreVertical, Lock, Trash2, Eye, Shield, Ban } from 'lucide-react';
import { PublicUser, UserStatus } from '@/types/admin';

const MOCK_USERS: PublicUser[] = [
  {
    id: '1',
    uid: 'user_1',
    email: 'ahmed.mohammed@example.com',
    firstName: 'Ahmed',
    lastName: 'Mohammed',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    phone: '+212612345678',
    status: UserStatus.ACTIVE,
    isSeller: true,
    sellerRating: 4.8,
    sellerListingsCount: 15,
    createdAt: new Date('2024-01-15'),
    lastActivityDate: new Date('2024-01-20'),
    suspiciousActivity: false,
    verificationStatus: 'verified',
  },
  {
    id: '2',
    uid: 'user_2',
    email: 'fatima.hassan@example.com',
    firstName: 'Fatima',
    lastName: 'Hassan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    phone: '+212612345679',
    status: UserStatus.ACTIVE,
    isSeller: false,
    sellerRating: undefined,
    sellerListingsCount: 0,
    createdAt: new Date('2024-01-10'),
    lastActivityDate: new Date('2024-01-20'),
    suspiciousActivity: false,
    verificationStatus: 'verified',
  },
  {
    id: '3',
    uid: 'user_3',
    email: 'suspicious.user@example.com',
    firstName: 'Suspect',
    lastName: 'User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suspect',
    phone: '+212612345680',
    status: UserStatus.SUSPENDED,
    isSeller: true,
    sellerRating: 2.1,
    sellerListingsCount: 5,
    createdAt: new Date('2024-01-05'),
    lastActivityDate: new Date('2024-01-19'),
    suspiciousActivity: true,
    verificationStatus: 'unverified',
  },
  {
    id: '4',
    uid: 'user_4',
    email: 'banned.user@example.com',
    firstName: 'Banned',
    lastName: 'User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Banned',
    phone: '+212612345681',
    status: UserStatus.BANNED,
    isSeller: false,
    sellerRating: undefined,
    sellerListingsCount: 0,
    createdAt: new Date('2023-12-01'),
    lastActivityDate: new Date('2024-01-01'),
    suspiciousActivity: true,
    verificationStatus: 'rejected',
  },
];

const statusColors = {
  [UserStatus.ACTIVE]: 'green',
  [UserStatus.SUSPENDED]: 'amber',
  [UserStatus.BANNED]: 'red',
  [UserStatus.PENDING_VERIFICATION]: 'blue',
  [UserStatus.INACTIVE]: 'slate',
} as const;

const statusLabels = {
  [UserStatus.ACTIVE]: 'Actif',
  [UserStatus.SUSPENDED]: 'Suspendu',
  [UserStatus.BANNED]: 'Banni',
  [UserStatus.PENDING_VERIFICATION]: 'En attente',
  [UserStatus.INACTIVE]: 'Inactif',
} as const;

export default function UsersManagement() {
  const [users, setUsers] = useState<PublicUser[]>(MOCK_USERS);
  const [filteredUsers, setFilteredUsers] = useState<PublicUser[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    let result = users;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, users]);

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleSuspendUser = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: UserStatus.SUSPENDED } : user
      )
    );
  };

  const handleBanUser = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: UserStatus.BANNED } : user
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Utilisateurs</h1>
          <p className="text-slate-400 mt-1">Gérer et surveiller tous les utilisateurs de la plateforme</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors">
          <Download size={18} />
          <span>Exporter</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Utilisateurs Total" value={users.length} icon={<Shield size={24} />} color="blue" />
        <StatCard label="Utilisateurs Actifs" value={users.filter((u) => u.status === UserStatus.ACTIVE).length} icon={<Shield size={24} />} color="green" />
        <StatCard label="Suspendus" value={users.filter((u) => u.status === UserStatus.SUSPENDED).length} icon={<Lock size={24} />} color="amber" />
        <StatCard label="Bannis" value={users.filter((u) => u.status === UserStatus.BANNED).length} icon={<Ban size={24} />} color="red" />
      </div>

      {/* Filters */}
      <ChartContainer title="Recherche et Filtres">
        <div className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {['all', ...Object.values(UserStatus)].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as UserStatus | 'all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {status === 'all' ? 'Tous' : statusLabels[status as UserStatus]}
              </button>
            ))}
          </div>
        </div>
      </ChartContainer>

      {/* Users Table */}
      <ChartContainer
        title={`Utilisateurs (${filteredUsers.length})`}
        description={`Affichage ${(currentPage - 1) * itemsPerPage + 1} à ${Math.min(currentPage * itemsPerPage, filteredUsers.length)}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Utilisateur</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Email</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Vendeur</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Statut</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-400">Inscription</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                        {user.suspiciousActivity && <p className="text-xs text-red-400">⚠️ Activité suspecte</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{user.email}</td>
                  <td className="px-4 py-3">
                    {user.isSeller ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                        ⭐ {user.sellerRating?.toFixed(1)} ({user.sellerListingsCount})
                      </span>
                    ) : (
                      <span className="text-slate-500">Acheteur</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium bg-opacity-20 ${
                        statusColors[user.status] === 'green'
                          ? 'bg-green-500 text-green-400'
                          : statusColors[user.status] === 'amber'
                          ? 'bg-amber-500 text-amber-400'
                          : statusColors[user.status] === 'red'
                          ? 'bg-red-500 text-red-400'
                          : statusColors[user.status] === 'blue'
                          ? 'bg-blue-500 text-blue-400'
                          : 'bg-slate-500 text-slate-400'
                      }`}
                    >
                      {statusLabels[user.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">
                    {user.createdAt.toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetails(true);
                        }}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors"
                        title="Voir les détails"
                      >
                        <Eye size={16} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleSuspendUser(user.id)}
                        disabled={user.status === UserStatus.SUSPENDED}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors disabled:opacity-50"
                        title="Suspendre"
                      >
                        <Lock size={16} className="text-amber-400" />
                      </button>
                      <button
                        onClick={() => handleBanUser(user.id)}
                        disabled={user.status === UserStatus.BANNED}
                        className="p-2 hover:bg-slate-700/50 rounded transition-colors disabled:opacity-50"
                        title="Bannir"
                      >
                        <Ban size={16} className="text-red-400" />
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

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Détails de l'utilisateur</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <img src={selectedUser.avatar} alt="" className="w-16 h-16 rounded-full" />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</h4>
                  <p className="text-slate-400">{selectedUser.email}</p>
                  <p className="text-slate-400">{selectedUser.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Statut</p>
                  <p className="font-medium text-white">{statusLabels[selectedUser.status]}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Vérification</p>
                  <p className="font-medium text-white capitalize">{selectedUser.verificationStatus}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Inscrit le</p>
                  <p className="font-medium text-white">{selectedUser.createdAt.toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Dernière activité</p>
                  <p className="font-medium text-white">{selectedUser.lastActivityDate?.toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {selectedUser.isSeller && (
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-white mb-3">Informations Vendeur</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Note</p>
                      <p className="font-medium text-white">⭐ {selectedUser.sellerRating?.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Listings Actifs</p>
                      <p className="font-medium text-white">{selectedUser.sellerListingsCount}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
