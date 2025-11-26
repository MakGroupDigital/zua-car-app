'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-gradient-to-r from-primary/10 via-background/90 to-accent/10 backdrop-blur-xl border-b border-primary/20 p-4 flex items-center gap-4 shadow-lg">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-primary/10">
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Politique de confidentialité
          </h1>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        <Card className="shadow-lg border-2 border-primary/20">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">1. Introduction</h2>
                <p className="text-muted-foreground">
                  Zua-Car s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre application.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">2. Informations que nous collectons</h2>
                <p className="text-muted-foreground">
                  Nous collectons les informations suivantes :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Nom, prénom et coordonnées (email, téléphone)</li>
                  <li>Informations de profil (photo, adresse)</li>
                  <li>Données d'utilisation de l'application</li>
                  <li>Informations sur vos transactions et annonces</li>
                  <li>Données de localisation (si autorisé)</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">3. Utilisation des informations</h2>
                <p className="text-muted-foreground">
                  Nous utilisons vos informations pour :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Fournir et améliorer nos services</li>
                  <li>Faciliter les transactions entre utilisateurs</li>
                  <li>Vous contacter concernant votre compte</li>
                  <li>Envoyer des notifications importantes</li>
                  <li>Assurer la sécurité de la plateforme</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">4. Partage des informations</h2>
                <p className="text-muted-foreground">
                  Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos données uniquement dans les cas suivants :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Avec votre consentement explicite</li>
                  <li>Pour respecter les obligations légales</li>
                  <li>Avec les autres utilisateurs dans le cadre des transactions</li>
                  <li>Avec nos prestataires de services (sous contrat de confidentialité)</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">5. Sécurité des données</h2>
                <p className="text-muted-foreground">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre tout accès non autorisé, perte ou destruction.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">6. Vos droits</h2>
                <p className="text-muted-foreground">
                  Vous avez le droit de :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Accéder à vos données personnelles</li>
                  <li>Corriger vos informations</li>
                  <li>Demander la suppression de vos données</li>
                  <li>Vous opposer au traitement de vos données</li>
                  <li>Demander la portabilité de vos données</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">7. Cookies et technologies similaires</h2>
                <p className="text-muted-foreground">
                  Nous utilisons des cookies et technologies similaires pour améliorer votre expérience, analyser l'utilisation de l'application et personnaliser le contenu.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">8. Contact</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, contactez-nous à :
                </p>
                <p className="text-primary font-medium">
                  Email : privacy@zua-car.com<br />
                  Téléphone : +243 XXX XXX XXX
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

