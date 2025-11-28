export type Language = 'fr' | 'en' | 'ln' | 'sw';

export const translations = {
  fr: {
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    
    // Navigation
    'nav.home': 'Accueil',
    'nav.vehicles': 'Véhicules',
    'nav.parts': 'Pièces',
    'nav.rentals': 'Location',
    'nav.favorites': 'Favoris',
    'nav.profile': 'Profil',
    'nav.messages': 'Messages',
    'nav.notifications': 'Notifications',
    
    // Favorites
    'favorites.title': 'Mes Favoris',
    'favorites.empty': 'Votre liste de favoris est vide',
    'favorites.empty.description': 'Cliquez sur l\'icône en forme de cœur sur une offre pour l\'ajouter ici.',
    'favorites.remove': 'Retiré des favoris',
    'favorites.add': 'Ajouté aux favoris',
    'favorites.count': '{count} favori{plural}',
    
    // Vehicle types
    'type.vehicle': 'Véhicule',
    'type.part': 'Pièce détachée',
    'type.rental': 'Location',
    
    // Actions
    'action.view': 'Voir',
    'action.contact': 'Contacter',
    'action.buy': 'Acheter',
    'action.rent': 'Louer',
    'action.sell': 'Vendre',
  },
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    
    // Navigation
    'nav.home': 'Home',
    'nav.vehicles': 'Vehicles',
    'nav.parts': 'Parts',
    'nav.rentals': 'Rentals',
    'nav.favorites': 'Favorites',
    'nav.profile': 'Profile',
    'nav.messages': 'Messages',
    'nav.notifications': 'Notifications',
    
    // Favorites
    'favorites.title': 'My Favorites',
    'favorites.empty': 'Your favorites list is empty',
    'favorites.empty.description': 'Click on the heart icon on an offer to add it here.',
    'favorites.remove': 'Removed from favorites',
    'favorites.add': 'Added to favorites',
    'favorites.count': '{count} favorite{plural}',
    
    // Vehicle types
    'type.vehicle': 'Vehicle',
    'type.part': 'Part',
    'type.rental': 'Rental',
    
    // Actions
    'action.view': 'View',
    'action.contact': 'Contact',
    'action.buy': 'Buy',
    'action.rent': 'Rent',
    'action.sell': 'Sell',
  },
  ln: {
    // Common
    'common.loading': 'Kobongisa...',
    'common.error': 'Libunga',
    'common.success': 'Ntina',
    'common.cancel': 'Koboya',
    'common.confirm': 'Kondima',
    'common.save': 'Kobikisa',
    'common.delete': 'Kolongola',
    'common.edit': 'Kobongola',
    'common.back': 'Kozonga',
    'common.next': 'Elandi',
    'common.previous': 'Elandi',
    
    // Navigation
    'nav.home': 'Ndako',
    'nav.vehicles': 'Moto',
    'nav.parts': 'Biloko',
    'nav.rentals': 'Kofanda',
    'nav.favorites': 'Biloko oyo olingi',
    'nav.profile': 'Nkombo na yo',
    'nav.messages': 'Bamessage',
    'nav.notifications': 'Bamessage ya sango',
    
    // Favorites
    'favorites.title': 'Biloko oyo olingi',
    'favorites.empty': 'Liste na yo ezali vide',
    'favorites.empty.description': 'Béta na moto ya motema na ofre moko mpo na koyaka yango awa.',
    'favorites.remove': 'Elongoli na biloko oyo olingi',
    'favorites.add': 'Eyaki na biloko oyo olingi',
    'favorites.count': '{count} elingi{plural}',
    
    // Vehicle types
    'type.vehicle': 'Moto',
    'type.part': 'Elingi',
    'type.rental': 'Kofanda',
    
    // Actions
    'action.view': 'Komona',
    'action.contact': 'Kobenga',
    'action.buy': 'Kozwa',
    'action.rent': 'Kofanda',
    'action.sell': 'Kotosa',
  },
  sw: {
    // Common
    'common.loading': 'Inapakia...',
    'common.error': 'Kosa',
    'common.success': 'Mafanikio',
    'common.cancel': 'Ghairi',
    'common.confirm': 'Thibitisha',
    'common.save': 'Hifadhi',
    'common.delete': 'Futa',
    'common.edit': 'Hariri',
    'common.back': 'Rudi',
    'common.next': 'Ifuatayo',
    'common.previous': 'Iliyotangulia',
    
    // Navigation
    'nav.home': 'Nyumbani',
    'nav.vehicles': 'Magari',
    'nav.parts': 'Sehemu',
    'nav.rentals': 'Kukodisha',
    'nav.favorites': 'Vipendwa',
    'nav.profile': 'Wasifu',
    'nav.messages': 'Ujumbe',
    'nav.notifications': 'Arifa',
    
    // Favorites
    'favorites.title': 'Vipendwa Vyangu',
    'favorites.empty': 'Orodha yako ya vipendwa ni tupu',
    'favorites.empty.description': 'Bofya ikoni ya moyo kwenye ofa ili kuongeza hapa.',
    'favorites.remove': 'Imeondolewa kutoka kwa vipendwa',
    'favorites.add': 'Imeongezwa kwenye vipendwa',
    'favorites.count': '{count} kipendwa{plural}',
    
    // Vehicle types
    'type.vehicle': 'Gari',
    'type.part': 'Sehemu',
    'type.rental': 'Kukodisha',
    
    // Actions
    'action.view': 'Angalia',
    'action.contact': 'Wasiliana',
    'action.buy': 'Nunua',
    'action.rent': 'Kodisha',
    'action.sell': 'Uza',
  },
};

export function translate(key: string, lang: Language = 'fr', params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Replace parameters
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }
  
  return value;
}

