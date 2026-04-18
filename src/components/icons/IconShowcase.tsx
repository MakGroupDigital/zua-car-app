"use client";

import React from 'react';
import { ServiceIcons } from './ServiceIcons';
import { ServicesList, ServiceBadge } from '@/components/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const IconShowcase: React.FC = () => {
  const iconData = [
    { name: 'Pièces', component: ServiceIcons.Parts, description: 'Pièces détachées automobiles' },
    { name: 'Sécurité automobile', component: ServiceIcons.Security, description: 'Systèmes de sécurité et protection' },
    { name: 'Assurance', component: ServiceIcons.Insurance, description: 'Assurance automobile et protection' },
    { name: 'Auto-école', component: ServiceIcons.DrivingSchool, description: 'Formation et permis de conduire' },
    { name: 'Conseiller automobile', component: ServiceIcons.Advisor, description: 'Conseil et expertise automobile' },
    { name: 'Garage', component: ServiceIcons.Garage, description: 'Réparation et maintenance' },
    { name: 'Stations', component: ServiceIcons.Station, description: 'Stations-service et carburant' },
  ];

  // Exemples de services pour la démonstration
  const exampleServices = [
    ['Réparation', 'Entretien', 'Pneus', 'Vidange', 'Diagnostic'],
    ['Pièces détachées', 'Batterie', 'Alternateur'],
    ['Sécurité automobile', 'Alarme', 'Antivol'],
    ['Assurance auto', 'Conseil'],
    ['Station-service', 'Carburant', 'Essence'],
  ];

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-primary">
          Icônes de Services Nzila
        </h1>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Collection d'icônes modernes et personnalisées selon notre charte graphique pour tous les services automobiles de Nzila.
        </p>
        
        {/* Galerie d'icônes */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Galerie d'icônes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {iconData.map((icon, index) => {
              const IconComponent = icon.component;
              return (
                <Card
                  key={index}
                  className="group flex flex-col items-center p-6 bg-card rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-accent/50"
                >
                  <div className="mb-4 p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full border border-accent/20 group-hover:border-accent/50 transition-all duration-300">
                    <IconComponent size={48} className="transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 text-center group-hover:text-accent transition-colors duration-300">
                    {icon.name}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {icon.description}
                  </p>
                  
                  {/* Variantes de taille */}
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-md">
                    <IconComponent size={16} />
                    <IconComponent size={24} />
                    <IconComponent size={32} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Exemples d'utilisation avec badges */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Badges de services</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exampleServices.map((services, index) => (
              <Card key={index} className="p-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Exemple {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Taille small:</p>
                    <ServicesList services={services} maxDisplay={3} size="sm" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Taille medium:</p>
                    <ServicesList services={services} maxDisplay={2} size="md" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Badges individuels:</p>
                    <div className="flex flex-wrap gap-2">
                      {services.slice(0, 3).map((service, serviceIndex) => (
                        <ServiceBadge key={serviceIndex} service={service} size="sm" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Exemple de carte garage */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-primary">Exemple d'utilisation - Carte Garage</h2>
          <div className="max-w-md mx-auto">
            <Card className="group transition-all duration-300 hover:shadow-lg hover:scale-105 border hover:border-accent/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Garage Central Nzila</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <ServiceIcons.Garage size={16} />
                      <span>Avenue Lumumba, Kinshasa</span>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-medium">4.8</span>
                      <span className="text-xs text-muted-foreground">(45 avis)</span>
                    </div>
                    <ServicesList 
                      services={['Réparation', 'Entretien', 'Diagnostic', 'Pneus', 'Vidange']} 
                      maxDisplay={3} 
                      size="sm" 
                    />
                  </div>
                  <ServiceIcons.Advisor size={24} className="text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section d'utilisation */}
        <div className="p-6 bg-accent/10 rounded-lg border border-accent/20">
          <h3 className="text-xl font-semibold mb-4 text-primary">
            Comment utiliser ces icônes
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-card p-4 rounded-md border">
              <h4 className="font-semibold mb-2">Icônes individuelles</h4>
              <pre className="text-sm text-foreground overflow-x-auto bg-muted/50 p-2 rounded">
{`import { ServiceIcons } from '@/components/icons/ServiceIcons';

// Utilisation basique
<ServiceIcons.Parts />

// Avec taille personnalisée
<ServiceIcons.Garage size={32} />

// Avec classes CSS
<ServiceIcons.Security 
  className="text-primary" 
  size={24} 
/>`}
              </pre>
            </div>
            <div className="bg-card p-4 rounded-md border">
              <h4 className="font-semibold mb-2">Badges de services</h4>
              <pre className="text-sm text-foreground overflow-x-auto bg-muted/50 p-2 rounded">
{`import { ServiceBadge, ServicesList } from '@/components/services';

// Badge individuel
<ServiceBadge service="Réparation" size="md" />

// Liste de services
<ServicesList 
  services={['Réparation', 'Entretien']} 
  maxDisplay={3} 
  size="sm" 
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconShowcase;