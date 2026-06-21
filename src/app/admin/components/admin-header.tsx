'use client';

import { useAdmin } from '@/contexts/admin-context';
import { Bell, Settings, User, LogOut } from 'lucide-react';
import { useUser } from '@/firebase';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminHeader() {
  const { adminUser } = useAdmin();
  const { user } = useUser();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.replace('/login');
  };

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm">Bienvenue sur le panneau de contrôle AUTONEX</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Settings */}
        <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50">
          <Settings size={20} />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
              {adminUser?.firstName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-white">
                {adminUser?.firstName} {adminUser?.lastName}
              </p>
              <p className="text-xs text-slate-400 capitalize">{adminUser?.role}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-slate-700">
                <p className="text-sm font-medium text-white">{user?.email}</p>
              </div>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-left">
                <User size={16} />
                <span className="text-sm">Mon profil</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors text-left border-t border-slate-700"
              >
                <LogOut size={16} />
                <span className="text-sm">Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
