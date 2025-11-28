'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bell, Moon, Globe, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/hooks/use-language';
import type { Language } from '@/lib/i18n/translations';

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const { theme, setTheme, mounted: themeMounted } = useTheme();
  const { language, setLanguage, mounted: langMounted } = useLanguage();
  
  const darkMode = theme === 'dark';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-gradient-to-r from-primary/10 via-background/90 to-accent/10 backdrop-blur-xl border-b border-primary/20 p-4 flex items-center gap-4 shadow-lg">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-primary/10">
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Réglages du compte
        </h1>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Notifications */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-base font-medium">
                  Activer les notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recevez des notifications pour les nouveaux messages et activités
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Apparence */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Moon className="h-5 w-5" />
              Apparence
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base font-medium">
                  Mode sombre
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activez le thème sombre pour une meilleure expérience nocturne
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                className="data-[state=checked]:bg-primary"
                disabled={!themeMounted}
              />
            </div>
          </CardContent>
        </Card>

        {/* Langue */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Globe className="h-5 w-5" />
              Langue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Langue de l'application</Label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  disabled={!langMounted}
                  className="px-3 py-2 rounded-md border border-primary/20 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="sw">Kiswahili</option>
                  <option value="ln">Lingala</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Button
              variant="outline"
              className="w-full border-primary/20 hover:bg-primary/10 justify-start"
              onClick={() => router.push('/forgot-password')}
            >
              Changer le mot de passe
            </Button>
            <Button
              variant="outline"
              className="w-full border-primary/20 hover:bg-primary/10 justify-start"
              onClick={() => {
                // TODO: Implement 2FA
                alert('Fonctionnalité à venir');
              }}
            >
              Authentification à deux facteurs
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

