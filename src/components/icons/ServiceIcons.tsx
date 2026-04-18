import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Icône Pièces - Engrenage moderne avec détails
export const PartsIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="partsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(210, 100%, 20%)" />
        <stop offset="100%" stopColor="hsl(198, 100%, 49%)" />
      </linearGradient>
    </defs>
    <path
      d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
      fill="url(#partsGradient)"
    />
    <circle cx="12" cy="9" r="3" fill="hsl(210, 40%, 96.1%)" />
    <circle cx="12" cy="9" r="1.5" fill="hsl(210, 100%, 20%)" />
    <path
      d="M12 15L13.5 18.5L17 17L13.5 15.5L12 15Z"
      fill="url(#partsGradient)"
      opacity="0.8"
    />
    <path
      d="M12 15L10.5 18.5L7 17L10.5 15.5L12 15Z"
      fill="url(#partsGradient)"
      opacity="0.8"
    />
  </svg>
);

// Icône Sécurité automobile - Bouclier avec voiture
export const SecurityIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="securityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(210, 100%, 20%)" />
        <stop offset="100%" stopColor="hsl(198, 100%, 49%)" />
      </linearGradient>
    </defs>
    <path
      d="M12 2L4 6V11C4 16 8 20.88 12 22C16 20.88 20 16 20 11V6L12 2Z"
      fill="url(#securityGradient)"
    />
    <path
      d="M12 4L6 7V11C6 14.5 8.5 17.8 12 19C15.5 17.8 18 14.5 18 11V7L12 4Z"
      fill="hsl(210, 40%, 96.1%)"
    />
    <rect x="8" y="10" width="8" height="4" rx="1" fill="hsl(210, 100%, 20%)" />
    <circle cx="9.5" cy="11.5" r="0.5" fill="hsl(210, 40%, 96.1%)" />
    <circle cx="14.5" cy="11.5" r="0.5" fill="hsl(210, 40%, 96.1%)" />
    <path d="M10 14L14 14" stroke="hsl(210, 40%, 96.1%)" strokeWidth="0.5" />
  </svg>
);

// Icône Assurance - Parapluie protecteur moderne
export const InsuranceIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="insuranceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(210, 100%, 20%)" />
        <stop offset="100%" stopColor="hsl(198, 100%, 49%)" />
      </linearGradient>
    </defs>
    <path
      d="M12 3C7 3 3 7 3 12H21C21 7 17 3 12 3Z"
      fill="url(#insuranceGradient)"
    />
    <path
      d="M12 5C8.5 5 5.5 8 5.5 11.5H18.5C18.5 8 15.5 5 12 5Z"
      fill="hsl(210, 40%, 96.1%)"
    />
    <line x1="12" y1="12" x2="12" y2="20" stroke="hsl(210, 100%, 20%)" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 18C13 18 14 19 14 20H10C10 19 11 18 12 18Z" fill="hsl(210, 100%, 20%)" />
    <circle cx="8" cy="9" r="1" fill="hsl(198, 100%, 49%)" />
    <circle cx="12" cy="8" r="1" fill="hsl(198, 100%, 49%)" />
    <circle cx="16" cy="9" r="1" fill="hsl(198, 100%, 49%)" />
  </svg>
);

// Icône Auto-école - Volant avec graduation
export const DrivingSchoolIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="schoolGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(210, 100%, 20%)" />
        <stop offset="100%" stopColor="hsl(198, 100%, 49%)" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" fill="url(#schoolGradient)" />
    <circle cx="12" cy="12" r="7" fill="hsl(210, 40%, 96.1%)" />
    <circle cx="12" cy="12" r="3" fill="hsl(210, 100%, 20%)" />
    <rect x="10.5" y="6" width="3" height="2" rx="0.5" fill="hsl(210, 100%, 20%)" />
    <rect x="10.5" y="16" width="3" height="2" rx="0.5" fill="hsl(210, 100%, 20%)" />
    <rect x="6" y="10.5" width="2" height="3" rx="0.5" fill="hsl(210, 100%, 20%)" />
    <rect x="16" y="10.5" width="2" height="3" rx="0.5" fill="hsl(210, 100%, 20%)" />
    <path d="M12 2L13 5L12 8L11 5L12 2Z" fill="hsl(198, 100%, 49%)" />
    <text x="12" y="16" textAnchor="middle" fontSize="6" fill="hsl(210, 100%, 20%)" fontWeight="bold">L</text>
  </svg>
);

// Icône Conseiller automobile - Personne avec bulle de dialogue
export const AdvisorIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="advisorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(210, 100%, 20%)" />
        <stop offset="100%" stopColor="hsl(198, 100%, 49%)" />
      </linearGradient>
    </defs>
    <circle cx="9" cy="8" r="4" fill="url(#advisorGradient)" />
    <circle cx="9" cy="8" r="2.5" fill="hsl(210, 40%, 96.1%)" />
    <path
      d="M2 20C2 16 5 13 9 13S16 16 16 20"
      stroke="url(#advisorGradient)"
      strokeWidth="2"
      fill="none"
    />
    <rect x="15" y="4" width="7" height="5" rx="2" fill="hsl(198, 100%, 49%)" />
    <rect x="16" y="5" width="5" height="3" rx="1" fill="hsl(210, 40%, 96.1%)" />
    <path d="M18 9L19 11L20 9" fill="hsl(198, 100%, 49%)" />
    <circle cx="17.5" cy="6" r="0.5" fill="hsl(210, 100%, 20%)" />
    <circle cx="19.5" cy="6" r="0.5" fill="hsl(210, 100%, 20%)" />
  </svg>
);

// Icône Garage - Bâtiment avec outils
export const GarageIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="garageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(210, 100%, 20%)" />
        <stop offset="100%" stopColor="hsl(198, 100%, 49%)" />
      </linearGradient>
    </defs>
    <path d="M2 12L12 2L22 12V20H2V12Z" fill="url(#garageGradient)" />
    <rect x="4" y="12" width="16" height="8" fill="hsl(210, 40%, 96.1%)" />
    <rect x="6" y="15" width="5" height="5" fill="hsl(210, 100%, 20%)" />
    <rect x="13" y="15" width="5" height="5" fill="hsl(210, 100%, 20%)" />
    <rect x="7" y="16" width="3" height="1" fill="hsl(210, 40%, 96.1%)" />
    <rect x="14" y="16" width="3" height="1" fill="hsl(210, 40%, 96.1%)" />
    <path d="M10 10L14 10L13 14L11 14L10 10Z" fill="hsl(198, 100%, 49%)" />
    <circle cx="12" cy="12" r="1" fill="hsl(210, 40%, 96.1%)" />
  </svg>
);

// Icône Stations - Pompe à essence moderne
export const StationIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="stationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(210, 100%, 20%)" />
        <stop offset="100%" stopColor="hsl(198, 100%, 49%)" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="8" height="16" rx="1" fill="url(#stationGradient)" />
    <rect x="5" y="5" width="6" height="14" rx="0.5" fill="hsl(210, 40%, 96.1%)" />
    <rect x="6" y="7" width="4" height="3" rx="0.5" fill="hsl(210, 100%, 20%)" />
    <circle cx="8" cy="13" r="1.5" fill="hsl(198, 100%, 49%)" />
    <rect x="14" y="8" width="2" height="8" fill="hsl(210, 100%, 20%)" />
    <path d="M16 8L18 6L20 8L18 10L16 8Z" fill="hsl(198, 100%, 49%)" />
    <path d="M16 16L20 16L19 18L17 18L16 16Z" fill="hsl(198, 100%, 49%)" />
    <rect x="6" y="15" width="4" height="1" fill="hsl(198, 100%, 49%)" />
    <circle cx="7" cy="17" r="0.5" fill="hsl(210, 100%, 20%)" />
    <circle cx="9" cy="17" r="0.5" fill="hsl(210, 100%, 20%)" />
  </svg>
);

// Export all icons
export const ServiceIcons = {
  Parts: PartsIcon,
  Security: SecurityIcon,
  Insurance: InsuranceIcon,
  DrivingSchool: DrivingSchoolIcon,
  Advisor: AdvisorIcon,
  Garage: GarageIcon,
  Station: StationIcon,
};