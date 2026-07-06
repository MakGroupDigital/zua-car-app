'use client';

import { useMemo, useState } from 'react';
import { collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { AlertCircle, BriefcaseBusiness, CheckCircle, ExternalLink, Search, XCircle } from 'lucide-react';
import { ChartContainer, StatCard } from '../components/stat-card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { UserRole } from '@/types/admin';

type BusinessProfile = { id: string; userId?: string; businessType?: 'vehicle_company' | 'insurance_company'; companyName?: string; businessLabel?: string; representativeName?: string; email?: string; phone?: string; address?: string; description?: string; legalDocumentUrls?: string[]; status?: 'pending' | 'approved' | 'rejected'; rejectionReason?: string };
type Listing = { id: string; title?: string; make?: string; model?: string; status?: string; userId?: string };

function titleOf(item: Listing) {
  return item.title || `${item.make || ''} ${item.model || ''}`.trim() || 'Annonce';
}

export default function ApprovalsPage() {
  const firestore = useFirestore();
  const businessRef = useMemoFirebase(() => firestore ? collection(firestore, 'businessProfiles') : null, [firestore]);
  const vehiclesRef = useMemoFirebase(() => firestore ? collection(firestore, 'vehicles') : null, [firestore]);
  const rentalsRef = useMemoFirebase(() => firestore ? collection(firestore, 'rentals') : null, [firestore]);
  const partsRef = useMemoFirebase(() => firestore ? collection(firestore, 'parts') : null, [firestore]);
  const { data: businessProfiles, isLoading: a } = useCollection<BusinessProfile>(businessRef);
  const { data: vehicles, isLoading: b } = useCollection<Listing>(vehiclesRef);
  const { data: rentals, isLoading: c } = useCollection<Listing>(rentalsRef);
  const { data: parts, isLoading: d } = useCollection<Listing>(partsRef);
  const [businessSearch, setBusinessSearch] = useState('');
  const [businessStatusFilter, setBusinessStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const profiles = businessProfiles || [];
  const pendingListings = [
    ...(vehicles || []).map((item) => ({ ...item, collectionName: 'vehicles', type: 'Vente' })),
    ...(rentals || []).map((item) => ({ ...item, collectionName: 'rentals', type: 'Location' })),
    ...(parts || []).map((item) => ({ ...item, collectionName: 'parts', type: 'Pièce' })),
  ].filter((item) => ['pending', 'draft'].includes(item.status || ''));

  const filteredBusinessProfiles = useMemo(() => profiles.filter((profile) => {
    const text = `${profile.companyName || ''} ${profile.representativeName || ''} ${profile.email || ''} ${profile.phone || ''} ${profile.businessLabel || ''}`.toLowerCase();
    return (!businessSearch || text.includes(businessSearch.toLowerCase())) && (businessStatusFilter === 'all' || profile.status === businessStatusFilter);
  }), [profiles, businessSearch, businessStatusFilter]);

  const updateBusinessProfileStatus = async (profile: BusinessProfile, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    const rejectionReason = status === 'rejected' ? window.prompt('Motif du rejet', 'Documents ou informations à corriger') || 'Documents ou informations à corriger' : null;
    setUpdatingId(profile.id);
    try {
      await updateDoc(doc(firestore, 'businessProfiles', profile.id), { status, rejectionReason, reviewedAt: serverTimestamp(), updatedAt: serverTimestamp() });
      if (status === 'approved') {
        const role = profile.businessType === 'insurance_company'
          ? UserRole.BUSINESS_INSURANCE
          : UserRole.BUSINESS_VEHICLE;
        await updateDoc(doc(firestore, 'users', profile.userId || profile.id), {
          role,
          isBusinessPartner: true,
          businessProfileId: profile.id,
          updatedAt: serverTimestamp(),
        });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const updateListingStatus = async (item: any, status: string) => {
    if (!firestore) return;
    setUpdatingId(`${item.collectionName}:${item.id}`);
    try {
      await updateDoc(doc(firestore, item.collectionName, item.id), { status, reviewedAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } finally {
      setUpdatingId(null);
    }
  };

  if (a || b || c || d) return <div className="p-8 text-center text-slate-400">Chargement approbations...</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-white">Approbations</h1><p className="mt-1 text-slate-400">Profils partenaires et annonces en attente depuis Firestore</p></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Partenaires attente" value={profiles.filter((p) => p.status === 'pending').length} icon={<BriefcaseBusiness size={24} />} color="amber" />
        <StatCard label="Partenaires approuvés" value={profiles.filter((p) => p.status === 'approved').length} icon={<CheckCircle size={24} />} color="green" />
        <StatCard label="Annonces attente" value={pendingListings.length} icon={<AlertCircle size={24} />} color="blue" />
        <StatCard label="Rejetés" value={profiles.filter((p) => p.status === 'rejected').length} icon={<XCircle size={24} />} color="red" />
      </div>

      <ChartContainer title={`Profils partenaires (${filteredBusinessProfiles.length})`}>
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative"><Search className="absolute left-3 top-3 text-slate-500" size={20} /><input value={businessSearch} onChange={(e) => setBusinessSearch(e.target.value)} placeholder="Rechercher entreprise..." className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-10 pr-4 text-white placeholder-slate-500" /></div>
          <select value={businessStatusFilter} onChange={(e) => setBusinessStatusFilter(e.target.value as any)} className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-white"><option value="pending">En attente</option><option value="approved">Approuvés</option><option value="rejected">Rejetés</option><option value="all">Tous</option></select>
        </div>
        <div className="grid gap-3">
          {filteredBusinessProfiles.length === 0 ? <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6 text-center text-slate-400">Aucun profil partenaire trouvé.</div> : filteredBusinessProfiles.map((profile) => (
            <div key={profile.id} className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-white">{profile.companyName || 'Entreprise sans nom'}</p>
                  <p className="text-sm text-slate-400">{profile.businessLabel || 'Type non précisé'} · {profile.email || '—'} · {profile.phone || '—'}</p>
                  <p className="mt-2 text-sm text-slate-400">{profile.description || 'Aucune description.'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">{(profile.legalDocumentUrls || []).map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-xs text-amber-400">Document {i + 1}<ExternalLink size={12} /></a>)}</div>
                </div>
                <div className="flex min-w-[180px] flex-col gap-2">
                  <span className="rounded-full bg-slate-700 px-3 py-1 text-center text-xs text-white">{profile.status || 'pending'}</span>
                  {profile.status !== 'approved' && <button disabled={updatingId === profile.id} onClick={() => updateBusinessProfileStatus(profile, 'approved')} className="rounded-lg border border-green-500/30 bg-green-500/20 px-4 py-2 text-green-400">Approuver</button>}
                  {profile.status !== 'rejected' && <button disabled={updatingId === profile.id} onClick={() => updateBusinessProfileStatus(profile, 'rejected')} className="rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-2 text-red-400">Rejeter</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>

      <ChartContainer title={`Annonces en attente (${pendingListings.length})`}>
        <div className="space-y-3">
          {pendingListings.length === 0 ? <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6 text-center text-slate-400">Aucune annonce en attente.</div> : pendingListings.map((item: any) => (
            <div key={`${item.collectionName}:${item.id}`} className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
              <div><p className="font-bold text-white">{titleOf(item)}</p><p className="text-sm text-slate-400">{item.type} · {item.userId || '—'}</p></div>
              <div className="flex gap-2"><button onClick={() => updateListingStatus(item, 'active')} className="rounded border border-green-500/30 px-3 py-2 text-green-400">Approuver</button><button onClick={() => updateListingStatus(item, 'rejected')} className="rounded border border-red-500/30 px-3 py-2 text-red-400">Rejeter</button></div>
            </div>
          ))}
        </div>
      </ChartContainer>
    </div>
  );
}
