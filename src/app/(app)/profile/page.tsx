'use client';

import { useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useUser, useFirestore, useDoc, useAuth, useMemoFirebase, useStorage } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut, updateProfile } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, User, Settings, HelpCircle, LogOut, ArrowLeft, Shield, FileText, Loader2, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const profileMenuItems = [
  { label: 'Modifier le profil', icon: User, href: '/profile/edit' },
  { label: 'Réglages du compte', icon: Settings, href: '/settings' },
  { label: 'Politique de confidentialité', icon: Shield, href: '/privacy' },
  { label: 'Termes et conditions', icon: FileText, href: '/terms' },
  { label: 'Centre d\'aide', icon: HelpCircle, href: '/help' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const auth = useAuth();
  const { toast } = useToast();
  const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !storage || !firestore) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Fichier invalide',
        description: 'Veuillez sélectionner une image (JPG, PNG, etc.)',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Fichier trop volumineux',
        description: 'La taille maximale est de 5 Mo',
      });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      // Create unique filename
      const timestamp = Date.now();
      const fileName = `users/${user.uid}/profile_${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload file
      toast({
        title: 'Upload en cours...',
        description: 'Votre photo est en cours de téléchargement',
      });

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update Firestore user document
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        photoURL: downloadURL,
      });

      // Update Firebase Auth profile
      await updateProfile(user, {
        photoURL: downloadURL,
      });

      toast({
        title: 'Photo mise à jour !',
        description: 'Votre photo de profil a été modifiée avec succès',
      });

      // Force re-render by updating state
      // The useDoc hook will automatically update via onSnapshot
      // But we need to wait a bit for Firestore to propagate
      // No need to reload, the onSnapshot will update automatically
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour la photo',
      });
    } finally {
      setIsUploadingPhoto(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      toast({
        title: 'Déconnexion réussie',
        description: 'À bientôt !',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur de déconnexion',
        description: error.message || 'Impossible de se déconnecter.',
      });
      setIsLoggingOut(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    if (firstName) return firstName.substring(0, 2);
    return 'ZU';
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className={cn("flex h-screen flex-col items-center justify-center bg-background text-foreground")}>
        <div className="flex flex-col items-center gap-8">
          {logoImage && (
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg animate-pulse">
              <Image src={logoImage.imageUrl} alt={logoImage.description} fill className="object-cover" priority data-ai-hint={logoImage.imageHint} />
            </div>
          )}
          <div className="flex items-center gap-4 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-lg font-semibold">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  const userInitials = getInitials(userProfile?.firstName, userProfile?.lastName);
  const displayName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Utilisateur';
  const displayEmail = userProfile?.email || user?.email;
  const displayPhone = userProfile?.phoneNumber || user?.phoneNumber;
  
  // Get photo URL from Firestore profile, Firebase Auth, or fallback
  const photoURL = userProfile?.photoURL || user?.photoURL;

  return (
    <div className="bg-muted min-h-screen">
      <header className="bg-background p-4 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Profil</h1>
      </header>

      <main className="p-4 space-y-6">
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-6 flex flex-col items-center text-center">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
            
            {/* Clickable Avatar with camera overlay */}
            <div 
              className="relative cursor-pointer group mb-4"
              onClick={handlePhotoClick}
            >
              <Avatar className={cn(
                "h-24 w-24 border-4 border-primary/50 transition-opacity",
                isUploadingPhoto && "opacity-50"
              )}>
                {photoURL ? (
                  <AvatarImage 
                    src={`${photoURL}?t=${Date.now()}`} 
                    alt="Photo de profil"
                    key={photoURL}
                  />
                ) : null}
              <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
            </Avatar>
              
              {/* Camera overlay */}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full bg-black/40 transition-opacity",
                isUploadingPhoto ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                {isUploadingPhoto ? (
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                ) : (
                  <Camera className="h-8 w-8 text-white" />
                )}
              </div>
              
              {/* Camera badge */}
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 shadow-lg border-2 border-background">
                <Camera className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              Cliquez sur la photo pour la modifier
            </p>
            
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <div className="text-muted-foreground mt-2 space-y-1">
              {displayEmail && <p>{displayEmail}</p>}
              {displayPhone && <p>{displayPhone}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-0">
            <ul className="divide-y">
              {profileMenuItems.map((item, index) => (
                <li key={index}>
                  <button onClick={() => router.push(item.href)} className="w-full flex items-center p-4 text-left hover:bg-muted transition-colors">
                    <item.icon className="h-6 w-6 mr-4 text-primary" />
                    <span className="flex-grow font-medium">{item.label}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
           <CardContent className="p-0">
                <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center p-4 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut className="h-6 w-6 mr-4" />
                    <span className="flex-grow font-semibold">Déconnexion</span>
                    {isLoggingOut && <Loader2 className="h-5 w-5 animate-spin"/>}
                </button>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
