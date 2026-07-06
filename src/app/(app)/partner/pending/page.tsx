'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { ArrowLeft, Clock3, FileCheck2, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';

type BusinessProfile = {
  companyName?: string;
  businessLabel?: string;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
};

export default function PartnerPendingPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'businessProfiles', user.uid);
  }, [firestore, user]);
  const { data: profile, isLoading } = useDoc<BusinessProfile>(profileRef);

  useEffect(() => {
    if (!isUserLoading && !user) router.replace('/login');
  }, [isUserLoading, router, user]);

  useEffect(() => {
    if (profile?.status === 'approved') router.replace('/partner/dashboard');
  }, [profile?.status, router]);

  if (isUserLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <FileCheck2 className="mb-4 h-14 w-14 text-primary" />
        <h1 className="text-2xl font-black">Aucune demande partenaire</h1>
        <p className="mt-2 text-muted-foreground">Créez d’abord un profil business pour demander l’accès partenaire.</p>
        <Button className="mt-5 rounded-full" onClick={() => router.push('/partner/apply')}>Créer une demande</Button>
      </div>
    );
  }

  const rejected = profile.status === 'rejected';

  return (
    <div className="min-h-screen bg-muted">
      <header className="flex items-center gap-3 border-b bg-background p-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push('/profile')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-black">Statut partenaire</h1>
          <p className="text-xs text-muted-foreground">Suivi de votre demande business</p>
        </div>
      </header>

      <main className="mx-auto max-w-xl p-4">
        <Card className="overflow-hidden shadow-xl">
          <CardContent className="space-y-5 p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              {rejected ? <XCircle className="h-10 w-10 text-destructive" /> : <Clock3 className="h-10 w-10 text-primary" />}
            </div>
            <div>
              <h2 className="text-2xl font-black">
                {rejected ? 'Demande rejetée' : 'Demande en attente'}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {rejected
                  ? 'Votre dossier nécessite une correction avant activation.'
                  : 'Votre profil business sera accessible après validation par l’administration AUTONEX.'}
              </p>
            </div>

            <div className="rounded-3xl bg-muted p-4 text-left">
              <p className="text-sm text-muted-foreground">Entreprise</p>
              <p className="font-black">{profile.companyName || '—'}</p>
              <p className="mt-3 text-sm text-muted-foreground">Type</p>
              <p className="font-black">{profile.businessLabel || '—'}</p>
              {rejected && profile.rejectionReason && (
                <>
                  <p className="mt-3 text-sm text-muted-foreground">Motif</p>
                  <p className="font-semibold text-destructive">{profile.rejectionReason}</p>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => router.refresh()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
              <Button className="flex-1 rounded-full" onClick={() => router.push('/partner/apply')}>
                {rejected ? 'Corriger' : 'Modifier'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
