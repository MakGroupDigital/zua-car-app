import React from 'react';
import Link from 'next/link';
import { ServiceIcons } from '@/components/icons/ServiceIcons';
import { Card, CardContent } from '@/components/ui/card';

interface ServiceNavItem {
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  description: string;
  color: string;
}

const servicesNavItems: ServiceNavItem[] = [
  {
    name: 'Pièces détachées',
    icon: ServiceIcons.Parts,
    href: '/parts',
    description: 'Trouvez toutes vos pièces automobiles',
    color: 'from-blue-500/20 to-blue-600/20 border-blue-200 hover:border-blue-400'
  },
  {
    name: 'Garages',
    icon: ServiceIcons.Garage,
    href: '/garages',
    description: 'Réparation et maintenance professionnelle',
    color: 'from-green-500/20 to-green-600/20 border-green-200 hover:border-green-400'
  },
  {
    name: 'Sécurité',
    icon: ServiceIcons.Security,
    href: '/security',
    description: 'Systèmes de sécurité automobile',
    color: 'from-red-500/20 to-red-600/20 border-red-200 hover:border-red-400'
  },
  {
    name: 'Assurance',
    icon: ServiceIcons.Insurance,
    href: '/insurance',
    description: 'Protection et assurance auto',
    color: 'from-purple-500/20 to-purple-600/20 border-purple-200 hover:border-purple-400'
  },
  {
    name: 'Auto-école',
    icon: ServiceIcons.DrivingSchool,
    href: '/driving-school',
    description: 'Formation au permis de conduire',
    color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-200 hover:border-yellow-400'
  },
  {
    name: 'Conseiller',
    icon: ServiceIcons.Advisor,
    href: '/advisor',
    description: 'Conseil et expertise automobile',
    color: 'from-indigo-500/20 to-indigo-600/20 border-indigo-200 hover:border-indigo-400'
  },
  {
    name: 'Stations-service',
    icon: ServiceIcons.Station,
    href: '/stations',
    description: 'Carburant et services routiers',
    color: 'from-orange-500/20 to-orange-600/20 border-orange-200 hover:border-orange-400'
  },
];

interface ServicesNavProps {
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  showDescription?: boolean;
}

const ServicesNav: React.FC<ServicesNavProps> = ({
  title = "Nos Services",
  subtitle = "Découvrez tous nos services automobiles",
  columns = 3,
  showDescription = true
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>
        
        <div className={`grid gap-6 ${gridCols[columns]}`}>
          {servicesNavItems.map((service, index) => {
            const Icon = service.icon;
            return (
              <Link key={index} href={service.href}>
                <Card className={`group transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-br ${service.color} border-2`}>
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="p-3 bg-white/80 rounded-full shadow-md group-hover:shadow-lg transition-shadow duration-300">
                        <Icon size={32} className="transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                      {service.name}
                    </h3>
                    {showDescription && (
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesNav;