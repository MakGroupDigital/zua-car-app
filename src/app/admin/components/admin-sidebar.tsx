'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Users,
  ShoppingCart,
  AlertCircle,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Shield,
  FileText,
  Bell,
  Zap,
  Eye,
} from 'lucide-react';
import { useState } from 'react';
import { useAdmin } from '@/contexts/admin-context';
import { PermissionType } from '@/types/admin';

const SIDEBAR_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    permission: undefined,
  },
  {
    label: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
    permission: PermissionType.VIEW_USERS,
  },
  {
    label: 'Listings',
    href: '/admin/listings',
    icon: ShoppingCart,
    permission: PermissionType.VIEW_LISTINGS,
  },
  {
    label: 'Signalements',
    href: '/admin/reports',
    icon: AlertCircle,
    permission: PermissionType.VIEW_REPORTS,
  },
  {
    label: 'Approbations',
    href: '/admin/approvals',
    icon: Shield,
    permission: PermissionType.APPROVE_LISTINGS,
  },
  {
    label: 'Finances',
    href: '/admin/finances',
    icon: CreditCard,
    permission: PermissionType.VIEW_FINANCES,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
    permission: PermissionType.VIEW_ANALYTICS,
  },
  {
    label: 'Connexions',
    href: '/admin/sessions',
    icon: Eye,
    permission: PermissionType.VIEW_USERS,
  },
  {
    label: 'Audit Logs',
    href: '/admin/logs',
    icon: FileText,
    permission: PermissionType.VIEW_LOGS,
  },
  {
    label: 'Système',
    href: '/admin/system',
    icon: Zap,
    permission: PermissionType.MANAGE_SETTINGS,
  },
  {
    label: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
    permission: PermissionType.MANAGE_SETTINGS,
  },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const { hasPermission } = useAdmin();

  const filteredItems = SIDEBAR_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 transition-all duration-300 z-40',
          isOpen ? 'w-64' : 'w-0 md:w-20',
          'overflow-hidden'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white">
                A
              </div>
              {isOpen && <span className="font-bold text-white text-lg">AUTONEX</span>}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  )}
                  title={isOpen ? '' : item.label}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <button
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200'
              )}
              title={isOpen ? '' : 'Logout'}
            >
              <LogOut size={20} className="flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">Déconnexion</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Offset */}
      <div className={cn('transition-all duration-300', isOpen ? 'lg:ml-64' : 'lg:ml-20')} />
    </>
  );
}
