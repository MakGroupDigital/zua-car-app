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
    
    // Home page
    'home.search.placeholder': 'Rechercher...',
    'home.categories': 'Catégories',
    'home.popular.cars': 'Voitures Populaires',
    'home.see.all': 'Voir tout',
    'home.location.share': 'Partager votre localisation',
    'home.location.loading': 'Chargement...',
    'home.location.denied': 'Localisation refusée',
    'home.location.denied.description': 'Veuillez autoriser l\'accès à votre localisation dans les paramètres de votre navigateur',
    'home.location.request': 'Demande de localisation',
    'home.location.request.description': 'Veuillez autoriser l\'accès à votre localisation',
    'home.filters': 'Filtres',
    'home.filters.price': 'Prix',
    'home.filters.year': 'Année',
    'home.filters.make': 'Marque',
    'home.filters.reset': 'Réinitialiser',
    'home.filters.active': 'Filtres actifs',
    'home.filters.results': '{count} résultat{plural}',
    'home.services.location': 'Location',
    'home.services.buy': 'Achat',
    'home.services.sell': 'Vente',
    'home.services.parts': 'Pièces',
    'home.services.security': 'Sécurité automobile',
    'home.services.insurance': 'Assurance',
    'home.services.drivingSchool': 'Auto-école',
    'home.services.advisor': 'Conseiller automobile',
    'home.services.garage': 'Garage',
    'home.services.stations': 'Stations',
    'home.available': 'Disponible',
    'home.add.offer': 'Ajouter une offre',
    'home.sell.vehicle': 'Vendre un véhicule',
    'home.rent.vehicle': 'Louer un véhicule',
    'home.sell.vehicle.description': 'Mettez votre véhicule en vente',
    'home.rent.vehicle.description': 'Proposez votre véhicule à la location',
    'home.create.offer': 'Créer une nouvelle offre',
    'home.create.offer.description': 'Choisissez le type d\'offre que vous souhaitez créer',
    'home.available': 'Disponible',
    'home.no.vehicles': 'Aucun véhicule disponible pour le moment.',
    'home.browse.vehicles': 'Parcourir les véhicules',
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
    
    // Home page
    'home.search.placeholder': 'Search...',
    'home.categories': 'Categories',
    'home.popular.cars': 'Popular Cars',
    'home.see.all': 'See all',
    'home.location.share': 'Share your location',
    'home.location.loading': 'Loading...',
    'home.location.denied': 'Location denied',
    'home.location.denied.description': 'Please enable location access in your browser settings',
    'home.location.request': 'Location request',
    'home.location.request.description': 'Please authorize access to your location',
    'home.filters': 'Filters',
    'home.filters.price': 'Price',
    'home.filters.year': 'Year',
    'home.filters.make': 'Make',
    'home.filters.reset': 'Reset',
    'home.filters.active': 'Active filters',
    'home.filters.results': '{count} result{plural}',
    'home.services.location': 'Rental',
    'home.services.buy': 'Buy',
    'home.services.sell': 'Sell',
    'home.services.parts': 'Parts',
    'home.services.security': 'Car Security',
    'home.services.insurance': 'Insurance',
    'home.services.drivingSchool': 'Driving School',
    'home.services.advisor': 'Car Advisor',
    'home.services.garage': 'Garage',
    'home.services.stations': 'Stations',
    'home.available': 'Available',
    'home.add.offer': 'Add an offer',
    'home.sell.vehicle': 'Sell a vehicle',
    'home.rent.vehicle': 'Rent a vehicle',
    'home.sell.vehicle.description': 'Put your vehicle up for sale',
    'home.rent.vehicle.description': 'Offer your vehicle for rent',
    'home.create.offer': 'Create a new offer',
    'home.create.offer.description': 'Choose the type of offer you want to create',
    'home.available': 'Available',
    'home.no.vehicles': 'No vehicles available at the moment.',
    'home.browse.vehicles': 'Browse vehicles',
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
    
    // Home page
    'home.search.placeholder': 'Koluka...',
    'home.categories': 'Biloko',
    'home.popular.cars': 'Moto ya bato mingi',
    'home.see.all': 'Komona nyonso',
    'home.location.share': 'Kopartager esika oyo ozali',
    'home.location.loading': 'Kobongisa...',
    'home.location.denied': 'Esika ebotami',
    'home.location.denied.description': 'Svp zongisa esika na paramètre ya navigateur na yo',
    'home.location.request': 'Kosenga esika',
    'home.location.request.description': 'Svp zongisa esika na yo',
    'home.filters': 'Filtre',
    'home.filters.price': 'Prix',
    'home.filters.year': 'Mibu',
    'home.filters.make': 'Marque',
    'home.filters.reset': 'Kozongisa',
    'home.filters.active': 'Filtre ya makasi',
    'home.filters.results': '{count} esika{plural}',
    'home.services.location': 'Kofanda',
    'home.services.buy': 'Kozwa',
    'home.services.sell': 'Kotosa',
    'home.services.parts': 'Biloko',
    'home.services.security': 'Sécurité ya moto',
    'home.services.insurance': 'Assurance',
    'home.services.drivingSchool': 'Auto-école',
    'home.services.advisor': 'Conseiller ya moto',
    'home.services.garage': 'Garage',
    'home.services.stations': 'Stations',
    'home.available': 'Ezali',
    'home.add.offer': 'Koyaka ofre',
    'home.sell.vehicle': 'Kotosa moto',
    'home.rent.vehicle': 'Kofanda moto',
    'home.sell.vehicle.description': 'Tosa moto na yo',
    'home.rent.vehicle.description': 'Fanda moto na yo',
    'home.create.offer': 'Kosala ofre ya sika',
    'home.create.offer.description': 'Pona ndenge ya ofre oyaka',
    'home.available': 'Ezali',
    'home.no.vehicles': 'Moto ezali te na ntango oyo.',
    'home.browse.vehicles': 'Koluka moto',
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
    
    // Home page
    'home.search.placeholder': 'Tafuta...',
    'home.categories': 'Jamii',
    'home.popular.cars': 'Magari Maarufu',
    'home.see.all': 'Angalia zote',
    'home.location.share': 'Shiriki eneo lako',
    'home.location.loading': 'Inapakia...',
    'home.location.denied': 'Eneo limekataliwa',
    'home.location.denied.description': 'Tafadhali wezesha ufikiaji wa eneo katika mipangilio ya kivinjari chako',
    'home.location.request': 'Ombi la eneo',
    'home.location.request.description': 'Tafadhali idhinisha ufikiaji wa eneo lako',
    'home.filters': 'Vichujio',
    'home.filters.price': 'Bei',
    'home.filters.year': 'Mwaka',
    'home.filters.make': 'Chapa',
    'home.filters.reset': 'Weka upya',
    'home.filters.active': 'Vichujio vya kazi',
    'home.filters.results': '{count} matokeo{plural}',
    'home.services.location': 'Kukodisha',
    'home.services.buy': 'Kununua',
    'home.services.sell': 'Kuuzisha',
    'home.services.parts': 'Sehemu',
    'home.services.security': 'Usalama wa Gari',
    'home.services.insurance': 'Bima',
    'home.services.drivingSchool': 'Shule ya Udereva',
    'home.services.advisor': 'Mshauri wa Gari',
    'home.services.garage': 'Karakana',
    'home.services.stations': 'Stesheni',
    'home.available': 'Inapatikana',
    'home.add.offer': 'Ongeza ofa',
    'home.sell.vehicle': 'Uza gari',
    'home.rent.vehicle': 'Kodisha gari',
    'home.sell.vehicle.description': 'Weka gari lako kwa kuuzwa',
    'home.rent.vehicle.description': 'Toa gari lako kwa kukodisha',
    'home.create.offer': 'Unda ofa mpya',
    'home.create.offer.description': 'Chagua aina ya ofa unayotaka kuunda',
    'home.available': 'Inapatikana',
    'home.no.vehicles': 'Hakuna magari yanayopatikana kwa sasa.',
    'home.browse.vehicles': 'Vinjari magari',
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

