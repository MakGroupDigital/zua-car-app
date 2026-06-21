'use client';

import { BarChart3, TrendingUp, Users, ShoppingCart, AlertCircle, CreditCard } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  color: 'amber' | 'blue' | 'green' | 'red' | 'purple';
}

const colorClasses = {
  amber: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  green: 'bg-green-500/10 text-green-500 border-green-500/30',
  red: 'bg-red-500/10 text-red-500 border-red-500/30',
  purple: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
};

export function StatCard({ label, value, change, icon, color }: StatCardProps) {
  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]} bg-gradient-to-br from-slate-900/50 to-slate-800/50`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-2">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change}% depuis hier
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]} border`}>{icon}</div>
      </div>
    </div>
  );
}

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function ChartContainer({ title, description, children, action }: ChartContainerProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

interface ListItemProps {
  title: string;
  description: string;
  avatar?: string;
  badge?: {
    label: string;
    color: 'amber' | 'blue' | 'green' | 'red' | 'purple';
  };
  onClick?: () => void;
}

export function ListItem({ title, description, avatar, badge, onClick }: ListItemProps) {
  const badgeColors = {
    amber: 'bg-amber-500/20 text-amber-400',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    purple: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-600 hover:bg-slate-800/50 transition-all duration-200 text-left"
    >
      <div className="flex items-center gap-3">
        {avatar && (
          <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
        )}
        <div className="flex-1">
          <p className="font-medium text-white">{title}</p>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        {badge && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColors[badge.color]}`}>
            {badge.label}
          </span>
        )}
      </div>
    </button>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Précédent
      </button>
      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
        const page = i + 1;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentPage === page
                ? 'bg-amber-500 text-white'
                : 'border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {page}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Suivant
      </button>
    </div>
  );
}
