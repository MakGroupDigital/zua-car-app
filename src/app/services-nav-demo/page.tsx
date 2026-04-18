import { ServicesNav } from '@/components/navigation';

export default function ServicesNavDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          Navigation des Services - Démonstration
        </h1>
        
        {/* Navigation complète */}
        <ServicesNav 
          title="Tous nos services Nzila"
          subtitle="Découvrez notre gamme complète de services automobiles en République Démocratique du Congo"
          columns={3}
          showDescription={true}
        />
        
        {/* Navigation compacte */}
        <div className="mt-16">
          <ServicesNav 
            title="Services principaux"
            subtitle="Accès rapide à nos services les plus demandés"
            columns={4}
            showDescription={false}
          />
        </div>
      </div>
    </div>
  );
}