'use client';

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { CreditCard, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { ChartContainer, StatCard } from '../components/stat-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';

type MoneyRow = { id: string; amount?: number; estimatedTotal?: number; status?: string; type?: string; userId?: string; createdAt?: any; paymentMethod?: string };

function amountOf(row: MoneyRow) {
  return Number(row.amount ?? row.estimatedTotal ?? 0);
}

export default function FinancesDashboard() {
  const firestore = useFirestore();
  const transactionsRef = useMemoFirebase(() => firestore ? collection(firestore, 'transactions') : null, [firestore]);
  const bookingsRef = useMemoFirebase(() => firestore ? collection(firestore, 'rentalBookings') : null, [firestore]);
  const { data: transactions, isLoading: txLoading } = useCollection<MoneyRow>(transactionsRef);
  const { data: bookings, isLoading: bookingsLoading } = useCollection<MoneyRow>(bookingsRef);

  const rows = transactions || [];
  const bookingRows = bookings || [];
  const totalRevenue = useMemo(() => rows.filter((r) => ['completed', 'paid'].includes(r.status || '')).reduce((sum, row) => sum + amountOf(row), 0), [rows]);
  const estimatedBookings = useMemo(() => bookingRows.reduce((sum, row) => sum + amountOf(row), 0), [bookingRows]);
  const pending = rows.filter((r) => ['pending', 'processing'].includes(r.status || '')).reduce((sum, row) => sum + amountOf(row), 0);
  const completedCount = rows.filter((r) => ['completed', 'paid'].includes(r.status || '')).length;

  if (txLoading || bookingsLoading) return <div className="p-8 text-center text-slate-400">Chargement finances...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion finances</h1>
        <p className="mt-1 text-slate-400">Données réelles depuis `transactions` et estimations `rentalBookings`</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Revenu confirmé" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign size={24} />} color="amber" />
        <StatCard label="Transactions payées" value={completedCount} icon={<CreditCard size={24} />} color="blue" />
        <StatCard label="Montant en attente" value={`$${pending.toLocaleString()}`} icon={<Zap size={24} />} color="purple" />
        <StatCard label="Réservations estimées" value={`$${estimatedBookings.toLocaleString()}`} icon={<TrendingUp size={24} />} color="green" />
      </div>

      <ChartContainer title={`Transactions (${rows.length})`}>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-slate-700/30 bg-slate-800/30 p-6 text-center text-slate-400">
            Aucune transaction réelle trouvée. Les paiements apparaîtront ici quand la collection `transactions` sera alimentée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-700"><th className="px-4 py-3 text-left text-slate-400">Type</th><th className="px-4 py-3 text-left text-slate-400">Utilisateur</th><th className="px-4 py-3 text-left text-slate-400">Montant</th><th className="px-4 py-3 text-left text-slate-400">Statut</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-800">
                    <td className="px-4 py-3 text-white">{row.type || 'Transaction'}</td>
                    <td className="px-4 py-3 text-slate-400">{row.userId || '—'}</td>
                    <td className="px-4 py-3 text-white">${amountOf(row).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-400">{row.status || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartContainer>
    </div>
  );
}
