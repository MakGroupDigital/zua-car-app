import React from 'react';
import { ServiceIcons } from '@/components/icons/ServiceIcons';
import { Badge } from '@/components/ui/badge';

interface ServiceBadgeProps {
  service: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'secondary' | 'outline';
}

// Mapping des services vers les icônes appropriées
const serviceIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  // Pièces
  'pièces': ServiceIcons.Parts,
  'pieces': ServiceIcons.Parts,
  'pièces détachées': ServiceIcons.Parts,
  'pieces detachees': ServiceIcons.Parts,
  
  // Réparation/Garage
  'réparation': ServiceIcons.Garage,
  'reparation': ServiceIcons.Garage,
  'entretien': ServiceIcons.Garage,
  'maintenance': ServiceIcons.Garage,
  'révision': ServiceIcons.Garage,
  'revision': ServiceIcons.Garage,
  'vidange': ServiceIcons.Garage,
  'diagnostic': ServiceIcons.Garage,
  'carrosserie': ServiceIcons.Garage,
  'mécanique': ServiceIcons.Garage,
  'mecanique': ServiceIcons.Garage,
  'réparation moteur': ServiceIcons.Garage,
  'reparation moteur': ServiceIcons.Garage,
  'réparation complète': ServiceIcons.Garage,
  'reparation complete': ServiceIcons.Garage,
  'service rapide': ServiceIcons.Garage,
  'express': ServiceIcons.Garage,
  'réparation rapide': ServiceIcons.Garage,
  'reparation rapide': ServiceIcons.Garage,
  
  // Sécurité
  'sécurité': ServiceIcons.Security,
  'securite': ServiceIcons.Security,
  'alarme': ServiceIcons.Security,
  'antivol': ServiceIcons.Security,
  'sécurité automobile': ServiceIcons.Security,
  'securite automobile': ServiceIcons.Security,
  
  // Assurance
  'assurance': ServiceIcons.Insurance,
  'assurance auto': ServiceIcons.Insurance,
  'assurance automobile': ServiceIcons.Insurance,
  
  // Formation
  'auto-école': ServiceIcons.DrivingSchool,
  'auto-ecole': ServiceIcons.DrivingSchool,
  'formation': ServiceIcons.DrivingSchool,
  'permis': ServiceIcons.DrivingSchool,
  'conduite': ServiceIcons.DrivingSchool,
  
  // Conseil
  'conseil': ServiceIcons.Advisor,
  'conseiller': ServiceIcons.Advisor,
  'expertise': ServiceIcons.Advisor,
  'consultation': ServiceIcons.Advisor,
  
  // Stations/Carburant
  'station': ServiceIcons.Station,
  'carburant': ServiceIcons.Station,
  'essence': ServiceIcons.Station,
  'diesel': ServiceIcons.Station,
  'station-service': ServiceIcons.Station,
  'station service': ServiceIcons.Station,
  
  // Spécialisés
  'pneus': ServiceIcons.Parts,
  'pneumatiques': ServiceIcons.Parts,
  'batterie': ServiceIcons.Parts,
  'alternateur': ServiceIcons.Parts,
  'électricité auto': ServiceIcons.Parts,
  'electricite auto': ServiceIcons.Parts,
  'climatisation': ServiceIcons.Garage,
};

// Fonction pour obtenir l'icône appropriée
const getServiceIcon = (service: string): React.ComponentType<{ size?: number; className?: string }> => {
  const normalizedService = service.toLowerCase().trim();
  return serviceIconMap[normalizedService] || ServiceIcons.Garage; // Icône par défaut
};

// Fonction pour obtenir la couleur du badge selon le type de service
const getServiceColor = (service: string): string => {
  const normalizedService = service.toLowerCase().trim();
  
  if (['pièces', 'pieces', 'pneus', 'batterie', 'alternateur'].some(s => normalizedService.includes(s))) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (['réparation', 'reparation', 'entretien', 'maintenance'].some(s => normalizedService.includes(s))) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (['sécurité', 'securite', 'alarme', 'antivol'].some(s => normalizedService.includes(s))) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (['assurance'].some(s => normalizedService.includes(s))) {
    return 'bg-purple-100 text-purple-800 border-purple-200';
  }
  if (['formation', 'auto-école', 'permis'].some(s => normalizedService.includes(s))) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  if (['conseil', 'expertise'].some(s => normalizedService.includes(s))) {
    return 'bg-indigo-100 text-indigo-800 border-indigo-200';
  }
  if (['station', 'carburant', 'essence'].some(s => normalizedService.includes(s))) {
    return 'bg-orange-100 text-orange-800 border-orange-200';
  }
  
  return 'bg-gray-100 text-gray-800 border-gray-200'; // Couleur par défaut
};

const ServiceBadge: React.FC<ServiceBadgeProps> = ({ 
  service, 
  size = 'sm', 
  variant = 'outline' 
}) => {
  const Icon = getServiceIcon(service);
  const colorClass = getServiceColor(service);
  
  const iconSize = size === 'lg' ? 16 : size === 'md' ? 14 : 12;
  const textSize = size === 'lg' ? 'text-sm' : size === 'md' ? 'text-xs' : 'text-xs';
  const padding = size === 'lg' ? 'px-3 py-2' : size === 'md' ? 'px-2 py-1' : 'px-2 py-1';
  
  return (
    <Badge 
      variant={variant}
      className={`${colorClass} ${padding} ${textSize} font-medium inline-flex items-center gap-1.5 border transition-all duration-200 hover:scale-105`}
    >
      <Icon size={iconSize} />
      <span className="capitalize">{service}</span>
    </Badge>
  );
};

export default ServiceBadge;