import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceIcons } from "@/components/icons/ServiceIcons";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type ServicesProps = {
  content: {
    title: string;
    subtitle: string;
    items: {
      title: string;
      description: string;
    }[];
  }
}

// Configuration des services avec nos nouvelles icônes personnalisées
const servicesConfig = [
  {
    icon: ServiceIcons.Parts,
    imageId: 'service-maintenance',
    title: 'Pièces détachées',
    description: 'Large gamme de pièces automobiles authentiques et compatibles pour tous types de véhicules.'
  },
  {
    icon: ServiceIcons.Garage,
    imageId: 'service-repair',
    title: 'Garage & Réparation',
    description: 'Services de réparation et maintenance professionnels par des mécaniciens certifiés.'
  },
  {
    icon: ServiceIcons.Security,
    imageId: 'service-sales',
    title: 'Sécurité automobile',
    description: 'Systèmes de sécurité avancés, alarmes et dispositifs de protection pour votre véhicule.'
  },
  {
    icon: ServiceIcons.Insurance,
    imageId: 'service-maintenance',
    title: 'Assurance',
    description: 'Solutions d\'assurance automobile complètes adaptées à vos besoins et votre budget.'
  },
  {
    icon: ServiceIcons.DrivingSchool,
    imageId: 'service-repair',
    title: 'Auto-école',
    description: 'Formation au permis de conduire avec instructeurs qualifiés et véhicules modernes.'
  },
  {
    icon: ServiceIcons.Advisor,
    imageId: 'service-sales',
    title: 'Conseiller automobile',
    description: 'Expertise et conseils personnalisés pour l\'achat, la vente et l\'entretien de votre véhicule.'
  },
  {
    icon: ServiceIcons.Station,
    imageId: 'service-maintenance',
    title: 'Stations-service',
    description: 'Réseau de stations-service avec carburants de qualité et services complémentaires.'
  }
];

export default function Services({ content }: ServicesProps) {
  return (
    <section id="services" className="py-20 md:py-32 bg-card">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline text-primary">
            {content.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{content.subtitle}</p>
        </div>
        
        {/* Services principaux (3 premiers) */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {content.items.map((service, index) => {
            const serviceConfig = servicesConfig[index];
            const Icon = serviceConfig?.icon || ServiceIcons.Garage;
            const image = PlaceHolderImages.find(p => p.id === serviceConfig?.imageId);
            
            return (
              <Card key={index} className="group flex flex-col overflow-hidden text-center transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 hover:border-accent/50">
                {image && (
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={image.imageUrl}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      data-ai-hint={image.imageHint}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-accent/20 group-hover:border-accent/50 transition-all duration-300">
                    <Icon size={40} className="transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <CardTitle className="font-headline text-2xl text-primary group-hover:text-accent transition-colors duration-300">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Services supplémentaires */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-primary">
            Services complémentaires
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {servicesConfig.slice(3).map((serviceConfig, index) => {
              const Icon = serviceConfig.icon;
              return (
                <Card key={index + 3} className="group text-center transition-all duration-300 hover:shadow-lg hover:scale-105 border hover:border-accent/50">
                  <CardHeader className="pb-2">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-accent/20 group-hover:border-accent/50 transition-all duration-300">
                      <Icon size={32} className="transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <CardTitle className="font-headline text-lg text-primary group-hover:text-accent transition-colors duration-300">
                      {serviceConfig.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {serviceConfig.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <ServiceIcons.Advisor size={20} />
            <span>Découvrez tous nos services</span>
          </div>
        </div>
      </div>
    </section>
  );
}
