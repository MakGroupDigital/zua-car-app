'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import {
  ArrowLeft,
  BarChart3,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  Eye,
  FileSignature,
  FileText,
  Handshake,
  Loader2,
  Megaphone,
  MessageSquare,
  PackageSearch,
  Percent,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';

type BusinessProfile = {
  companyName?: string;
  businessLabel?: string;
  businessType?: 'vehicle_company' | 'insurance_company';
  status?: 'pending' | 'approved' | 'rejected';
  logoUrl?: string;
  phone?: string;
  email?: string;
  description?: string;
};

export default function PartnerDashboardPage() {
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
    if (!isLoading && !profile) router.replace('/partner/apply');
    if (!isLoading && profile && profile.status !== 'approved') router.replace('/partner/pending');
  }, [isLoading, profile, router]);

  if (isUserLoading || isLoading || !profile || profile.status !== 'approved') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isInsurance = profile.businessType === 'insurance_company';
  const modules = isInsurance ? insuranceModules : vehicleCompanyModules;
  const stats = isInsurance ? insuranceStats : vehicleCompanyStats;

  return (
    <div className="min-h-screen bg-muted">
      <header className="flex items-center gap-3 border-b bg-background p-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push('/profile')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-black">Dashboard partenaire</h1>
          <p className="text-xs text-muted-foreground">Espace business AUTONEX</p>
        </div>
        <Badge className="gap-1 rounded-full">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approuvé
        </Badge>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 p-4 pb-24">
        <Card className="overflow-hidden shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-primary/10">
                {profile.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.logoUrl} alt={profile.companyName || 'Logo'} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-black">{profile.companyName}</h2>
                <p className="font-semibold text-primary">{profile.businessLabel}</p>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{profile.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <Metric key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} />
          ))}
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{isInsurance ? 'Modules assurance' : 'Modules vente & location'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <ActionCard
                key={module.title}
                title={module.title}
                description={module.description}
                href={module.href}
                icon={module.icon}
                disabled={module.disabled}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Pipeline d’activité</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {(isInsurance ? insurancePipeline : vehicleCompanyPipeline).map((item) => (
              <div key={item.title} className="rounded-3xl border bg-card p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <p className="font-black">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Metric({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <Card className="shadow-lg">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-black">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({
  title,
  description,
  href,
  icon,
  disabled,
}: {
  title: string;
  description: string;
  href?: string;
  icon: ReactNode;
  disabled?: boolean;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => href && !disabled && router.push(href)}
      disabled={disabled}
      className="rounded-3xl border bg-card p-4 text-left transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex items-center gap-2">
        <h3 className="font-black">{title}</h3>
        {disabled && <Badge variant="outline" className="rounded-full text-[10px]">Bientôt</Badge>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </button>
  );
}

const sharedStats = [
  { title: 'Nombre de vues', value: '0', icon: <Eye className="h-5 w-5" /> },
  { title: 'Leads générés', value: '0', icon: <Users className="h-5 w-5" /> },
  { title: 'Demandes reçues', value: '0', icon: <MessageSquare className="h-5 w-5" /> },
  { title: 'Taux conversion', value: '0%', icon: <Percent className="h-5 w-5" /> },
  { title: 'Revenus générés', value: '$0', icon: <Wallet className="h-5 w-5" /> },
];

const vehicleCompanyStats = sharedStats;
const insuranceStats = sharedStats;

const vehicleCompanyModules = [
  {
    title: 'Ajouter des véhicules',
    description: 'Publiez rapidement des véhicules en vente ou en location.',
    href: '/dashboard/vente/nouveau',
    icon: <PlusCircle className="h-5 w-5" />,
  },
  {
    title: 'Gestion du stock',
    description: 'Suivez les véhicules disponibles, réservés, vendus ou en maintenance.',
    href: '/dashboard/vente',
    icon: <PackageSearch className="h-5 w-5" />,
  },
  {
    title: 'Promotion des véhicules',
    description: 'Mettez en avant vos meilleures offres pour générer plus de leads.',
    icon: <Megaphone className="h-5 w-5" />,
    disabled: true,
  },
  {
    title: 'Gestion des prospects',
    description: 'Centralisez les demandes, contacts et relances commerciales.',
    href: '/messages',
    icon: <Handshake className="h-5 w-5" />,
  },
  {
    title: 'Statistiques de vente',
    description: 'Analysez vues, leads, conversion et revenus de vos annonces.',
    icon: <BarChart3 className="h-5 w-5" />,
    disabled: true,
  },
  {
    title: 'Gestion de flotte',
    description: 'Organisez votre flotte de véhicules disponibles à la location.',
    href: '/vehicleRentalListings',
    icon: <Car className="h-5 w-5" />,
  },
  {
    title: 'Calendrier de disponibilité',
    description: 'Visualisez les périodes libres, réservées et indisponibles.',
    icon: <CalendarDays className="h-5 w-5" />,
    disabled: true,
  },
  {
    title: 'Réservations',
    description: 'Suivez les demandes de location reçues et leurs statuts.',
    href: '/notifications',
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
  {
    title: 'Tarification',
    description: 'Préparez les prix par heure, jour, semaine ou campagne.',
    icon: <DollarSign className="h-5 w-5" />,
    disabled: true,
  },
  {
    title: 'Contrats de location',
    description: 'Générez et suivez les contrats liés aux réservations.',
    icon: <FileSignature className="h-5 w-5" />,
    disabled: true,
  },
];

const insuranceModules = [
  {
    title: 'Publication des offres d’assurance',
    description: 'Publiez vos produits assurance et conditions commerciales.',
    icon: <ShieldCheck className="h-5 w-5" />,
    disabled: true,
  },
  {
    title: 'Gestion des devis',
    description: 'Recevez, traitez et suivez les demandes de devis.',
    icon: <FileText className="h-5 w-5" />,
    disabled: true,
  },
  {
    title: 'Gestion des souscriptions',
    description: 'Suivez les clients qui passent du devis à la souscription.',
    icon: <ClipboardCheck className="h-5 w-5" />,
    disabled: true,
  },
  {
    title: 'Renouvellements',
    description: 'Organisez les renouvellements de contrats et relances clients.',
    icon: <RefreshCw className="h-5 w-5" />,
    disabled: true,
  },
  {
    title: 'Statistiques',
    description: 'Analysez vues, leads, demandes reçues, conversions et revenus.',
    icon: <TrendingUp className="h-5 w-5" />,
    disabled: true,
  },
  {
    title: 'Gestion des prospects',
    description: 'Centralisez les contacts assurance et les échanges clients.',
    href: '/messages',
    icon: <Handshake className="h-5 w-5" />,
  },
];

const vehicleCompanyPipeline = [
  {
    title: 'Prospects',
    description: 'Demandes d’achat, contacts et messages entrants.',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Réservations',
    description: 'Demandes de location en attente ou validées.',
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    title: 'Revenus',
    description: 'Suivi futur des ventes et locations générées.',
    icon: <Wallet className="h-5 w-5" />,
  },
];

const insurancePipeline = [
  {
    title: 'Demandes de devis',
    description: 'Demandes reçues depuis les achats et locations.',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'Souscriptions',
    description: 'Contrats à transformer et finaliser.',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Renouvellements',
    description: 'Suivi futur des expirations et relances.',
    icon: <RefreshCw className="h-5 w-5" />,
  },
];
