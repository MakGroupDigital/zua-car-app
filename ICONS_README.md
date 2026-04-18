# Icônes de Services Nzila

## 🎨 Vue d'ensemble

Collection d'icônes modernes et personnalisées selon la charte graphique de Nzila pour tous les services automobiles. Ces icônes utilisent les couleurs officielles de la marque et sont optimisées pour une utilisation dans l'interface utilisateur.

## 🎯 Charte de couleurs

- **Primary** : Bleu profond (`hsl(210, 100%, 20%)`)
- **Accent** : Cyan vif (`hsl(198, 100%, 49%)`)
- **Secondary** : Bleu clair (`hsl(210, 40%, 96.1%)`)

## 📦 Icônes disponibles

### 🔧 ServiceIcons.Parts
**Pièces détachées automobiles**
- Engrenage moderne avec dégradé
- Utilisation : Pièces, composants, accessoires

### 🛡️ ServiceIcons.Security
**Sécurité automobile**
- Bouclier avec voiture stylisée
- Utilisation : Alarmes, antivol, systèmes de sécurité

### ☂️ ServiceIcons.Insurance
**Assurance automobile**
- Parapluie protecteur moderne
- Utilisation : Assurance, protection, garanties

### 🎓 ServiceIcons.DrivingSchool
**Auto-école**
- Volant avec indicateur de formation
- Utilisation : Formation, permis de conduire, apprentissage

### 👨‍💼 ServiceIcons.Advisor
**Conseiller automobile**
- Personne avec bulle de dialogue
- Utilisation : Conseil, expertise, support client

### 🏢 ServiceIcons.Garage
**Garage et réparation**
- Bâtiment avec outils
- Utilisation : Réparation, maintenance, atelier

### ⛽ ServiceIcons.Station
**Stations-service**
- Pompe à essence moderne
- Utilisation : Carburant, stations-service, services routiers

## 🚀 Utilisation

### Import des icônes

```tsx
import { ServiceIcons } from '@/components/icons/ServiceIcons';

// Utilisation basique
<ServiceIcons.Parts />

// Avec taille personnalisée
<ServiceIcons.Garage size={32} />

// Avec classes CSS
<ServiceIcons.Security 
  className="text-primary hover:text-accent" 
  size={24} 
/>
```

### Badges de services

```tsx
import { ServiceBadge, ServicesList } from '@/components/services';

// Badge individuel
<ServiceBadge service="Réparation" size="md" />

// Liste de services avec icônes automatiques
<ServicesList 
  services={['Réparation', 'Entretien', 'Pneus']} 
  maxDisplay={3} 
  size="sm" 
/>
```

### Navigation de services

```tsx
import { ServicesNav } from '@/components/navigation';

<ServicesNav 
  title="Nos Services"
  subtitle="Découvrez notre gamme complète"
  columns={3}
  showDescription={true}
/>
```

## 🎨 Composants disponibles

### ServiceIcons
- **Fichier** : `src/components/icons/ServiceIcons.tsx`
- **Props** : `size?: number`, `className?: string`
- **Utilisation** : Icônes individuelles avec dégradés personnalisés

### ServiceBadge
- **Fichier** : `src/components/services/ServiceBadge.tsx`
- **Props** : `service: string`, `size?: 'sm'|'md'|'lg'`, `variant?: 'default'|'secondary'|'outline'`
- **Utilisation** : Badge individuel avec icône automatique selon le nom du service

### ServicesList
- **Fichier** : `src/components/services/ServicesList.tsx`
- **Props** : `services: string[]`, `maxDisplay?: number`, `size?: 'sm'|'md'|'lg'`
- **Utilisation** : Liste de badges avec limitation d'affichage

### ServicesNav
- **Fichier** : `src/components/navigation/ServicesNav.tsx`
- **Props** : `title?: string`, `subtitle?: string`, `columns?: 2|3|4`, `showDescription?: boolean`
- **Utilisation** : Navigation complète des services avec liens

## 🔄 Mapping automatique des services

Le système reconnaît automatiquement les services et assigne les bonnes icônes :

- **Pièces** : "pièces", "pieces", "pneus", "batterie", "alternateur"
- **Garage** : "réparation", "entretien", "maintenance", "vidange", "diagnostic"
- **Sécurité** : "sécurité", "alarme", "antivol"
- **Assurance** : "assurance", "assurance auto"
- **Formation** : "auto-école", "formation", "permis", "conduite"
- **Conseil** : "conseil", "conseiller", "expertise"
- **Station** : "station", "carburant", "essence", "diesel"

## 📱 Pages de démonstration

- **Galerie d'icônes** : `/icons-demo`
- **Navigation services** : `/services-nav-demo`

## 🎯 Intégration dans l'application

Les icônes sont déjà intégrées dans :
- ✅ Section Services de la page d'accueil
- ✅ Navigation mobile
- ✅ Pages des garages (badges de services)
- ✅ Cartes détaillées des garages

## 🔧 Personnalisation

Pour ajouter de nouvelles icônes :

1. Créer le composant SVG dans `ServiceIcons.tsx`
2. Utiliser les couleurs de la charte graphique
3. Ajouter le mapping dans `ServiceBadge.tsx`
4. Tester dans les pages de démonstration

## 📊 Performance

- **Format** : SVG inline pour une performance optimale
- **Taille** : Icônes vectorielles adaptatives
- **Couleurs** : Utilisation des variables CSS de la charte
- **Animation** : Transitions fluides avec Tailwind CSS

---

**Développé pour Nzila** - Solutions automobiles modernes en RDC 🚗✨