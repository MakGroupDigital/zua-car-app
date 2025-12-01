'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, HelpCircle, Search, MessageCircle, Mail, Phone, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const faqItems = [
  {
    question: "Comment créer une annonce ?",
    answer: "Pour créer une annonce, cliquez sur le bouton '+' en bas de l'écran, puis sélectionnez 'Vendre un véhicule' ou 'Louer un véhicule'. Remplissez le formulaire avec les informations de votre véhicule et ajoutez des photos."
  },
  {
    question: "Comment contacter un vendeur ?",
    answer: "Sur la page de détails d'un véhicule, cliquez sur le bouton 'Écrire un message' ou 'Contacter' pour ouvrir une conversation avec le vendeur."
  },
  {
    question: "Comment ajouter un véhicule aux favoris ?",
    answer: "Cliquez sur l'icône cœur en haut à droite de la carte du véhicule. Les véhicules favoris sont accessibles depuis l'onglet 'Favoris' dans la navigation."
  },
  {
    question: "Comment modifier mon profil ?",
    answer: "Allez dans l'onglet 'Réglages' (icône engrenage), puis cliquez sur 'Modifier le profil'. Vous pouvez changer votre nom, prénom et numéro de téléphone."
  },
  {
    question: "Comment changer ma photo de profil ?",
    answer: "Allez dans l'onglet 'Réglages', cliquez sur votre photo de profil, puis sélectionnez une nouvelle image depuis votre appareil."
  },
  {
    question: "Comment rechercher un véhicule ?",
    answer: "Utilisez la barre de recherche en haut de la page d'accueil ou de la page des véhicules. Vous pouvez filtrer par prix, année et marque en utilisant le bouton de filtre."
  },
  {
    question: "Que faire si j'ai un problème avec une transaction ?",
    answer: "Contactez notre service client via le formulaire de contact ci-dessous ou par email à support@zua-car.com. Nous vous aiderons à résoudre le problème."
  },
  {
    question: "Comment supprimer mon compte ?",
    answer: "Pour supprimer votre compte, contactez notre service client. Nous traiterons votre demande dans les plus brefs délais."
  }
];

export default function HelpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleItem = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: 'Message envoyé !',
        description: 'Nous vous répondrons dans les plus brefs délais.',
      });
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="bg-gradient-to-r from-primary/10 via-background/90 to-accent/10 backdrop-blur-xl border-b border-primary/20 p-4 flex items-center gap-4 shadow-lg">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-primary/10">
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Button>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Centre d'aide
          </h1>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Search */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
              <Input
                placeholder="Rechercher dans l'aide..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-primary/20 focus:border-primary focus:ring-primary/30"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Questions fréquentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {filteredFAQ.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun résultat trouvé pour "{searchTerm}"
              </p>
            ) : (
              filteredFAQ.map((item, index) => (
                <div
                  key={index}
                  className="border border-primary/20 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-colors"
                  >
                    <span className="font-medium text-left flex-1">{item.question}</span>
                    {expandedItems.includes(index) ? (
                      <ChevronUp className="h-5 w-5 text-primary" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-primary" />
                    )}
                  </button>
                  {expandedItems.includes(index) && (
                    <div className="p-4 bg-muted/50 border-t border-primary/10">
                      <p className="text-muted-foreground">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Nous contacter
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-primary font-medium">
                  Nom complet
                </Label>
                <Input
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="border-primary/20 focus:border-primary focus:ring-primary/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="border-primary/20 focus:border-primary focus:ring-primary/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-primary font-medium">
                  Sujet
                </Label>
                <Input
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="border-primary/20 focus:border-primary focus:ring-primary/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-primary font-medium">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="border-primary/20 focus:border-primary focus:ring-primary/30 min-h-[120px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-pulse" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-primary/20 space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <span>support@zua-car.com</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary" />
                <span>+243 XXX XXX XXX</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


