import React from 'react';
import ServiceBadge from './ServiceBadge';

interface ServicesListProps {
  services: string[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}

const ServicesList: React.FC<ServicesListProps> = ({ 
  services, 
  maxDisplay = 3, 
  size = 'sm', 
  variant = 'outline',
  className = ''
}) => {
  if (!services || services.length === 0) {
    return null;
  }

  const displayServices = services.slice(0, maxDisplay);
  const remainingCount = services.length - maxDisplay;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {displayServices.map((service, index) => (
        <ServiceBadge 
          key={index} 
          service={service} 
          size={size} 
          variant={variant}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded-md border border-dashed">
          +{remainingCount} autres
        </span>
      )}
    </div>
  );
};

export default ServicesList;