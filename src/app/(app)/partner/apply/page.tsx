'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, Building2, Car, FileCheck2, Loader2, Mail, Phone, ShieldCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';
import { cn } from '@/lib/utils';

type BusinessType = 'vehicle_company' | 'insurance_company';

type FormState = {
  businessType: BusinessType | '';
  companyName: string;
  representativeName: string;
  address: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  logoFile: File | null;
  legalDocuments: File[];
  logoUrl: string;
  logoCloudinaryPublicId: string;
  legalDocumentUrls: string[];
  legalDocumentCloudinary: any[];
  legalDocumentNames: string[];
};

const initialForm: FormState = {
  businessType: '',
  companyName: '',
  representativeName: '',
  address: '',
  description: '',
  website: '',
  phone: '',
  email: '',
  logoFile: null,
  legalDocuments: [],
  logoUrl: '',
  logoCloudinaryPublicId: '',
  legalDocumentUrls: [],
  legalDocumentCloudinary: [],
  legalDocumentNames: [],
};

const steps = ['Type', 'Entreprise', 'Contact', 'Documents', 'Confirmation'];

export default function PartnerApplyPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(true);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  const businessLabel = form.businessType === 'insurance_company'
    ? 'Entreprise d’assurance'
    : form.businessType === 'vehicle_company'
      ? 'Entreprise de vente/location de véhicules'
      : '';

  const addressLabel = form.businessType === 'insurance_company' ? 'Adresse du siège social' : 'Adresse';

  const canGoNext = useMemo(() => {
    if (step === 0) return Boolean(form.businessType);
    if (step === 1) return Boolean(form.companyName && form.representativeName && form.address && form.description);
    if (step === 2) return Boolean(form.phone && form.email);
    if (step === 3) return form.legalDocuments.length > 0 || form.legalDocumentUrls.length > 0;
    return true;
  }, [form, step]);

  const updateForm = (field: keyof FormState, value: FormState[keyof FormState]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const draftPayload = useMemo(() => ({
    step,
    businessType: form.businessType,
    companyName: form.companyName,
    representativeName: form.representativeName,
    address: form.address,
    description: form.description,
    website: form.website,
    phone: form.phone,
    email: form.email,
    logoUrl: form.logoUrl,
    logoCloudinaryPublicId: form.logoCloudinaryPublicId,
    legalDocumentUrls: form.legalDocumentUrls,
    legalDocumentCloudinary: form.legalDocumentCloudinary,
    legalDocumentNames: form.legalDocumentNames,
  }), [form, step]);

  useEffect(() => {
    const loadDraft = async () => {
      if (!user || !firestore) {
        setIsDraftLoading(false);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(firestore, 'businessProfiles', user.uid));
        if (profileSnap.exists()) {
          const status = profileSnap.data().status;
          if (status === 'approved') {
            router.replace('/partner/dashboard');
            return;
          }
          if (status === 'pending') {
            router.replace('/partner/pending');
            return;
          }
        }

        const draftSnap = await getDoc(doc(firestore, 'businessProfileDrafts', user.uid));
        if (draftSnap.exists()) {
          const draft = draftSnap.data();
          setForm({
            ...initialForm,
            businessType: draft.businessType || '',
            companyName: draft.companyName || '',
            representativeName: draft.representativeName || '',
            address: draft.address || '',
            description: draft.description || '',
            website: draft.website || '',
            phone: draft.phone || '',
            email: draft.email || '',
            logoUrl: draft.logoUrl || '',
            logoCloudinaryPublicId: draft.logoCloudinaryPublicId || '',
            legalDocumentUrls: draft.legalDocumentUrls || [],
            legalDocumentCloudinary: draft.legalDocumentCloudinary || [],
            legalDocumentNames: draft.legalDocumentNames || [],
          });
          setStep(Math.min(Math.max(Number(draft.step || 0), 0), steps.length - 1));
        }
      } catch (error) {
        console.error('Error loading business draft:', error);
      } finally {
        setHasLoadedDraft(true);
        setIsDraftLoading(false);
      }
    };

    loadDraft();
  }, [firestore, router, user]);

  useEffect(() => {
    if (!user || !firestore || !hasLoadedDraft || isSubmitting) return;

    const timeout = window.setTimeout(async () => {
      try {
        await setDoc(doc(firestore, 'businessProfileDrafts', user.uid), {
          ...draftPayload,
          userId: user.uid,
          status: 'draft',
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (error) {
        console.error('Error saving business draft:', error);
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [draftPayload, firestore, hasLoadedDraft, isSubmitting, user]);

  const goNext = () => {
    if (!canGoNext) {
      toast({
        variant: 'destructive',
        title: 'Informations manquantes',
        description: 'Complétez les champs requis avant de continuer.',
      });
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const uploadLogoDraft = async (files: File[]) => {
    const file = files[0];
    if (!file || !user) {
      updateForm('logoFile', null);
      return;
    }

    setIsUploadingMedia(true);
    try {
      const upload = await uploadToCloudinary(file, `autonex/businessProfiles/${user.uid}/draft`);
      setForm((prev) => ({
        ...prev,
        logoFile: file,
        logoUrl: upload.secureUrl,
        logoCloudinaryPublicId: upload.publicId,
      }));
      toast({ title: 'Logo sauvegardé', description: 'Le logo est enregistré dans votre brouillon.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Upload impossible', description: error.message || 'Impossible d’envoyer le logo.' });
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const uploadLegalDocumentsDraft = async (files: File[]) => {
    if (!files.length || !user) {
      updateForm('legalDocuments', []);
      return;
    }

    setIsUploadingMedia(true);
    try {
      const timestamp = Date.now();
      const uploads = await Promise.all(
        files.map((file, index) => uploadToCloudinary(file, `autonex/businessProfiles/${user.uid}/draft/legal_${timestamp}_${index}`))
      );
      setForm((prev) => ({
        ...prev,
        legalDocuments: files,
        legalDocumentUrls: uploads.map((upload) => upload.secureUrl),
        legalDocumentCloudinary: uploads,
        legalDocumentNames: files.map((file) => file.name),
      }));
      toast({ title: 'Documents sauvegardés', description: 'Les documents sont enregistrés dans votre brouillon.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Upload impossible', description: error.message || 'Impossible d’envoyer les documents.' });
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const submitApplication = async () => {
    if (!user || !firestore) {
      router.push('/login');
      return;
    }

    if (!form.businessType || !canGoNext) {
      toast({
        variant: 'destructive',
        title: 'Dossier incomplet',
        description: 'Vérifiez les informations avant de soumettre.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const existingRef = doc(firestore, 'businessProfiles', user.uid);
      const existingSnap = await getDoc(existingRef);
      if (existingSnap.exists() && existingSnap.data().status === 'approved') {
        router.push('/partner/dashboard');
        return;
      }

      const cloudinaryFolder = `autonex/businessProfiles/${user.uid}`;
      const logoUpload = form.logoUrl ? null : form.logoFile
        ? await uploadToCloudinary(form.logoFile, cloudinaryFolder)
        : null;

      const timestamp = Date.now();
      const legalDocumentUploads = form.legalDocumentUrls.length > 0
        ? form.legalDocumentCloudinary
        : await Promise.all(
          form.legalDocuments.map((file, index) =>
            uploadToCloudinary(file, `${cloudinaryFolder}/legal_${timestamp}_${index}`)
          )
        );

      const payload = {
        userId: user.uid,
        businessType: form.businessType,
        businessLabel,
        companyName: form.companyName.trim(),
        representativeName: form.representativeName.trim(),
        address: form.address.trim(),
        description: form.description.trim(),
        website: form.website.trim() || null,
        phone: form.phone.trim(),
        email: form.email.trim(),
        logoUrl: form.logoUrl || logoUpload?.secureUrl || null,
        logoCloudinaryPublicId: form.logoCloudinaryPublicId || logoUpload?.publicId || null,
        legalDocumentUrls: form.legalDocumentUrls.length > 0 ? form.legalDocumentUrls : legalDocumentUploads.map((upload) => upload.secureUrl),
        legalDocumentCloudinary: legalDocumentUploads,
        legalDocumentNames: form.legalDocumentNames.length > 0 ? form.legalDocumentNames : form.legalDocuments.map((file) => file.name),
        status: 'pending',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(existingRef, payload, { merge: true });
      await addDoc(collection(firestore, 'businessProfileApplications'), {
        ...payload,
        profileId: user.uid,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Demande envoyée',
        description: 'Votre dossier est en attente de validation administrateur.',
      });
      router.push('/partner/pending');
    } catch (error: any) {
      console.error('Partner application error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible d’envoyer votre demande partenaire.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || isDraftLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <BriefcaseBusiness className="mb-4 h-14 w-14 text-primary" />
        <h1 className="text-2xl font-black">Connexion requise</h1>
        <p className="mt-2 text-muted-foreground">Connectez-vous pour créer un profil partenaire.</p>
        <Button className="mt-5 rounded-full" onClick={() => router.push('/login')}>Se connecter</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/90 p-4 backdrop-blur-xl">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-black">Devenir partenaire</h1>
          <p className="text-xs text-muted-foreground">Créez votre profil business AUTONEX</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 p-4 pb-24">
        <Card className="border-primary/10 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {steps.map((item, index) => (
                <div key={item} className="flex flex-1 items-center gap-2">
                  <div className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black',
                    index <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && <div className={cn('h-1 flex-1 rounded-full', index < step ? 'bg-primary' : 'bg-muted')} />}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm font-bold text-primary">{steps[step]}</p>
          </CardContent>
        </Card>

        {step === 0 && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Quel type de compte business voulez-vous créer ?</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <button
                type="button"
                onClick={() => updateForm('businessType', 'vehicle_company')}
                className={cn(
                  'rounded-3xl border p-4 text-left transition hover:border-primary',
                  form.businessType === 'vehicle_company' ? 'border-primary bg-primary/10' : 'bg-card'
                )}
              >
                <Car className="mb-3 h-8 w-8 text-primary" />
                <h2 className="text-lg font-black">Entreprise de vente/location de véhicules</h2>
                <p className="mt-1 text-sm text-muted-foreground">Agences, garages, importateurs, vendeurs pros et sociétés de location.</p>
              </button>
              <button
                type="button"
                onClick={() => updateForm('businessType', 'insurance_company')}
                className={cn(
                  'rounded-3xl border p-4 text-left transition hover:border-primary',
                  form.businessType === 'insurance_company' ? 'border-primary bg-primary/10' : 'bg-card'
                )}
              >
                <ShieldCheck className="mb-3 h-8 w-8 text-primary" />
                <h2 className="text-lg font-black">Entreprise d’assurance</h2>
                <p className="mt-1 text-sm text-muted-foreground">Assureurs et courtiers souhaitant recevoir des demandes qualifiées.</p>
              </button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Informations de l’entreprise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-sm font-semibold text-primary">{businessLabel}</div>
              <Field label="Nom de l’entreprise *" value={form.companyName} onChange={(value) => updateForm('companyName', value)} icon={<Building2 className="h-4 w-4" />} />
              <Field label="Nom du représentant *" value={form.representativeName} onChange={(value) => updateForm('representativeName', value)} />
              <Field label={`${addressLabel} *`} value={form.address} onChange={(value) => updateForm('address', value)} />
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={form.description}
                  onChange={(event) => updateForm('description', event.target.value)}
                  placeholder={form.businessType === 'insurance_company' ? 'Présentez vos produits, zones couvertes et garanties.' : 'Présentez votre flotte, vos services, vos villes couvertes.'}
                  className="min-h-28 rounded-2xl"
                />
              </div>
              <Field label="Site web" value={form.website} onChange={(value) => updateForm('website', value)} placeholder="https://..." />
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Contacts officiels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Numéro de contact *" value={form.phone} onChange={(value) => updateForm('phone', value)} icon={<Phone className="h-4 w-4" />} placeholder="+243..." />
              <Field label="Adresse mail *" value={form.email} onChange={(value) => updateForm('email', value)} icon={<Mail className="h-4 w-4" />} placeholder="contact@entreprise.com" />
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Logo et documents légaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FilePicker
                label="Logo"
                accept="image/*"
                multiple={false}
                description={form.logoFile?.name || (form.logoUrl ? 'Logo déjà sauvegardé' : 'PNG, JPG ou WEBP')}
                disabled={isUploadingMedia}
                onChange={uploadLogoDraft}
              />
              <FilePicker
                label="Documents légaux *"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                multiple
                description={form.legalDocumentNames.length ? `${form.legalDocumentNames.length} fichier(s) déjà sauvegardé(s)` : 'RCCM, ID NAT, autorisation, agrément ou équivalent'}
                disabled={isUploadingMedia}
                onChange={uploadLegalDocumentsDraft}
              />
              {isUploadingMedia && (
                <div className="flex items-center gap-2 rounded-2xl bg-muted p-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Sauvegarde des médias sur Cloudinary...
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Les documents sont utilisés uniquement pour validation interne avant activation du compte partenaire.
              </p>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Summary label="Type" value={businessLabel} />
              <Summary label="Entreprise" value={form.companyName} />
              <Summary label="Représentant" value={form.representativeName} />
              <Summary label="Adresse" value={form.address} />
              <Summary label="Téléphone" value={form.phone} />
              <Summary label="Mail" value={form.email} />
              <Summary label="Documents" value={`${form.legalDocumentUrls.length || form.legalDocuments.length} fichier(s)`} />
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <FileCheck2 className="mt-0.5 h-5 w-5 text-primary" />
                  <p className="text-muted-foreground">
                    Après soumission, votre profil sera envoyé à l’administration AUTONEX. Vous pourrez accéder au dashboard partenaire uniquement après validation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-2xl gap-2 rounded-3xl border bg-background/90 p-2 shadow-2xl backdrop-blur-xl">
          <Button variant="outline" className="flex-1 rounded-full" disabled={step === 0 || isSubmitting} onClick={() => setStep((current) => Math.max(current - 1, 0))}>
            Retour
          </Button>
          {step < steps.length - 1 ? (
            <Button className="flex-[1.4] rounded-full" onClick={goNext} disabled={isUploadingMedia}>
              Continuer
            </Button>
          ) : (
            <Button className="flex-[1.4] rounded-full" onClick={submitApplication} disabled={isSubmitting || isUploadingMedia}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BadgeCheck className="mr-2 h-4 w-4" />}
              Soumettre
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={cn('h-11 rounded-xl', icon && 'pl-9')} />
      </div>
    </div>
  );
}

function FilePicker({
  label,
  description,
  accept,
  multiple,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  onChange: (files: File[]) => void | Promise<void>;
}) {
  return (
    <label className={cn(
      "block rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-4 transition hover:bg-primary/10",
      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
    )}>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(event) => onChange(Array.from(event.target.files || []))}
      />
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-muted p-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-bold">{value || '—'}</span>
    </div>
  );
}
