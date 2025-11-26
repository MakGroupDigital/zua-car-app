'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-gradient-to-r from-primary/10 via-background/90 to-accent/10 backdrop-blur-xl border-b border-primary/20 p-4 flex items-center gap-4 shadow-lg">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-primary/10">
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Button>
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Termes et conditions
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
                <h2 className="text-lg font-bold text-primary">1. Acceptation des conditions</h2>
                <p className="text-muted-foreground">
                  En utilisant l'application Zua-Car, vous acceptez d'être lié par ces termes et conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">2. Description du service</h2>
                <p className="text-muted-foreground">
                  Zua-Car est une plateforme qui permet aux utilisateurs de :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Vendre et acheter des véhicules</li>
                  <li>Louer des véhicules</li>
                  <li>Acheter et vendre des pièces détachées</li>
                  <li>Contacter d'autres utilisateurs</li>
                  <li>Accéder à des services automobiles</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">3. Compte utilisateur</h2>
                <p className="text-muted-foreground">
                  Pour utiliser certains services, vous devez créer un compte. Vous êtes responsable de :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Maintenir la confidentialité de vos identifiants</li>
                  <li>Toutes les activités sous votre compte</li>
                  <li>Fournir des informations exactes et à jour</li>
                  <li>Notifier immédiatement toute utilisation non autorisée</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">4. Utilisation acceptable</h2>
                <p className="text-muted-foreground">
                  Vous vous engagez à ne pas :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Utiliser le service à des fins illégales</li>
                  <li>Publier de fausses informations ou des annonces frauduleuses</li>
                  <li>Harceler, menacer ou nuire à d'autres utilisateurs</li>
                  <li>Violer les droits de propriété intellectuelle</li>
                  <li>Tenter d'accéder non autorisé aux systèmes</li>
                  <li>Utiliser des robots ou scripts automatisés</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">5. Transactions</h2>
                <p className="text-muted-foreground">
                  Zua-Car agit uniquement comme plateforme de mise en relation. Nous ne sommes pas partie aux transactions entre utilisateurs et ne garantissons pas :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>L'exactitude des descriptions d'annonces</li>
                  <li>La qualité ou l'état des biens vendus</li>
                  <li>La capacité des parties à conclure une transaction</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Les utilisateurs sont responsables de vérifier les informations et de conclure les transactions en toute sécurité.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">6. Contenu utilisateur</h2>
                <p className="text-muted-foreground">
                  En publiant du contenu sur Zua-Car, vous accordez à Zua-Car une licence mondiale, non exclusive, gratuite pour utiliser, reproduire et afficher ce contenu dans le cadre du service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">7. Propriété intellectuelle</h2>
                <p className="text-muted-foreground">
                  Tous les droits de propriété intellectuelle sur l'application Zua-Car, y compris mais sans s'y limiter, les logos, marques, et le code source, appartiennent à Zua-Car ou à ses concédants de licence.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">8. Limitation de responsabilité</h2>
                <p className="text-muted-foreground">
                  Dans la mesure permise par la loi, Zua-Car ne sera pas responsable des dommages directs, indirects, accessoires ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser le service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">9. Modifications des conditions</h2>
                <p className="text-muted-foreground">
                  Nous nous réservons le droit de modifier ces termes à tout moment. Les modifications prendront effet dès leur publication. Votre utilisation continue du service après les modifications constitue votre acceptation des nouvelles conditions.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">10. Résiliation</h2>
                <p className="text-muted-foreground">
                  Nous nous réservons le droit de suspendre ou de résilier votre compte à tout moment, avec ou sans préavis, pour violation de ces conditions ou pour toute autre raison.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">11. Droit applicable</h2>
                <p className="text-muted-foreground">
                  Ces conditions sont régies par les lois de la République Démocratique du Congo. Tout litige sera soumis à la juridiction exclusive des tribunaux compétents de la RDC.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-primary">12. Contact</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant ces termes et conditions, contactez-nous à :
                </p>
                <p className="text-primary font-medium">
                  Email : legal@zua-car.com<br />
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

