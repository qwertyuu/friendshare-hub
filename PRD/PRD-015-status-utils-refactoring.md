# PRD-015: Refactoring - Centralisation des Status Utilities

**Version:** 1.0
**Date:** 2026-01-18
**Auteur:** FriendShare Hub Team
**Statut:** Draft

---

## 📋 Résumé Exécutif

Refactoriser le code répété pour les couleurs, labels et icônes des statuts (ItemStatus, RequestStatus) en créant un fichier utilitaire centralisé `lib/statusUtils.ts`, améliorant ainsi la maintenabilité et la cohérence visuelle de l'application.

---

## 🎯 Contexte & Problème

### Situation Actuelle
- Les couleurs et labels des statuts sont dupliqués dans plusieurs composants
- Incohérences visuelles possibles entre différentes pages
- Difficile de modifier globalement l'apparence d'un statut
- Code difficile à maintenir (changement nécessite modifications multiples)
- Risque d'oublier un composant lors de modifications

### Localisation du Code Dupliqué

**ItemStatus (AVAILABLE, BORROWED, UNAVAILABLE):**
- `frontend/src/components/ItemCard.tsx`
- `frontend/src/pages/MyItems.tsx`
- `frontend/src/pages/Browse.tsx`
- Potentiellement dans d'autres composants futurs

**RequestStatus (PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED):**
- `frontend/src/pages/Requests.tsx`
- `frontend/src/components/IncomingRequestCard.tsx`
- `frontend/src/components/OutgoingRequestCard.tsx`

### Exemple de Duplication

**Dans ItemCard.tsx:**
```tsx
{item.status === 'AVAILABLE' && (
  <Badge className="bg-green-500">Disponible</Badge>
)}
{item.status === 'BORROWED' && (
  <Badge className="bg-orange-500">Emprunté</Badge>
)}
```

**Dans MyItems.tsx:**
```tsx
{item.status === 'AVAILABLE' && (
  <Badge variant="success">Disponible</Badge>
)}
{item.status === 'BORROWED' && (
  <Badge variant="warning">Emprunté</Badge>
)}
```

→ **Incohérence:** Classes CSS différentes pour le même statut!

---

## 🎯 Objectifs

### Objectifs Primaires
- ✅ Créer un fichier utilitaire centralisé `lib/statusUtils.ts`
- ✅ Définir couleurs, labels et variantes de badges pour tous les statuts
- ✅ Refactorer tous les composants existants pour utiliser les fonctions utilitaires
- ✅ Garantir la cohérence visuelle à travers toute l'application

### Objectifs Secondaires
- ✅ Faciliter les modifications futures (changement de couleur/label en un seul endroit)
- ✅ Réduire la duplication de code (-50% lignes pour gestion statuts)
- ✅ Améliorer la lisibilité du code
- ✅ Ajouter support TypeScript pour auto-complétion

### Non-Objectifs (Hors Scope)
- ❌ Modifier les statuts eux-mêmes (enums backend)
- ❌ Ajouter de nouveaux statuts
- ❌ Changer la logique métier des statuts
- ❌ Créer un système de thèmes dynamiques

---

## 👥 User Stories

### US-1: Développeur modifie la couleur d'un statut
**En tant que** développeur
**Je veux** changer la couleur du statut AVAILABLE en un seul endroit
**Afin de** voir le changement reflété partout dans l'app

**Critères d'acceptation:**
- [ ] Modification dans `statusUtils.ts` uniquement
- [ ] Changement visible dans tous les composants
- [ ] Aucune régression visuelle

### US-2: Designer assure la cohérence visuelle
**En tant que** designer
**Je veux** que tous les badges BORROWED utilisent la même couleur
**Afin de** garantir une expérience utilisateur cohérente

**Critères d'acceptation:**
- [ ] Tous les composants utilisent `getItemStatusConfig()`
- [ ] Couleurs et labels identiques partout
- [ ] Documentation claire des couleurs disponibles

### US-3: Nouveau développeur comprend le système
**En tant que** nouveau développeur
**Je veux** facilement afficher un badge de statut
**Afin de** ne pas avoir à chercher quelle couleur/label utiliser

**Critères d'acceptation:**
- [ ] Fonctions bien documentées avec JSDoc
- [ ] Exemples d'utilisation dans les commentaires
- [ ] TypeScript auto-complétion fonctionnelle

---

## 🔧 Spécifications Fonctionnelles

### Feature 1: Fichier Utilitaire Centralisé

**Localisation:** `frontend/src/lib/statusUtils.ts`

**Fonctions à créer:**

1. **`getItemStatusConfig(status: ItemStatus)`**
   - Retourne: `{ label: string, variant: BadgeVariant, className: string, icon?: LucideIcon }`

2. **`getRequestStatusConfig(status: RequestStatus)`**
   - Retourne: `{ label: string, variant: BadgeVariant, className: string, icon?: LucideIcon }`

3. **`ItemStatusBadge({ status }: { status: ItemStatus })`**
   - Composant réutilisable pour afficher un badge de statut d'item

4. **`RequestStatusBadge({ status }: { status: RequestStatus })`**
   - Composant réutilisable pour afficher un badge de statut de demande

### Feature 2: Standardisation des Couleurs

**ItemStatus:**
- `AVAILABLE`: Badge vert (`bg-green-100 text-green-800 border-green-300`)
- `BORROWED`: Badge orange (`bg-orange-100 text-orange-800 border-orange-300`)
- `UNAVAILABLE`: Badge gris (`bg-gray-100 text-gray-800 border-gray-300`)

**RequestStatus:**
- `PENDING`: Badge jaune (`bg-yellow-100 text-yellow-800 border-yellow-300`)
- `APPROVED`: Badge vert (`bg-green-100 text-green-800 border-green-300`)
- `REJECTED`: Badge rouge (`bg-red-100 text-red-800 border-red-300`)
- `COMPLETED`: Badge bleu (`bg-blue-100 text-blue-800 border-blue-300`)
- `CANCELLED`: Badge gris (`bg-gray-100 text-gray-800 border-gray-300`)

### Feature 3: Labels Français Standardisés

**ItemStatus:**
- `AVAILABLE` → "Disponible"
- `BORROWED` → "Emprunté"
- `UNAVAILABLE` → "Indisponible"

**RequestStatus:**
- `PENDING` → "En attente"
- `APPROVED` → "Approuvée"
- `REJECTED` → "Refusée"
- `COMPLETED` → "Terminée"
- `CANCELLED` → "Annulée"

### Feature 4: Icônes Optionnelles (Bonus)

**ItemStatus:**
- `AVAILABLE` → `CheckCircle2` (lucide-react)
- `BORROWED` → `UserCheck`
- `UNAVAILABLE` → `XCircle`

**RequestStatus:**
- `PENDING` → `Clock`
- `APPROVED` → `CheckCircle2`
- `REJECTED` → `XCircle`
- `COMPLETED` → `Check`
- `CANCELLED` → `Ban`

---

## 🏗️ Spécifications Techniques

### 1. Nouveau Fichier: `lib/statusUtils.ts`

```typescript
import { ItemStatus, RequestStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  UserCheck,
  XCircle,
  Clock,
  Check,
  Ban,
  type LucideIcon
} from 'lucide-react';

/**
 * Configuration pour l'affichage d'un statut
 */
interface StatusConfig {
  label: string;
  /** Classe Tailwind pour le badge */
  className: string;
  /** Icône Lucide (optionnel) */
  icon?: LucideIcon;
}

/**
 * Retourne la configuration d'affichage pour un statut d'item
 *
 * @param status - Le statut de l'item (AVAILABLE, BORROWED, UNAVAILABLE)
 * @returns Configuration avec label, className, et icône
 *
 * @example
 * const config = getItemStatusConfig('AVAILABLE');
 * // => { label: 'Disponible', className: 'bg-green-100...', icon: CheckCircle2 }
 */
export function getItemStatusConfig(status: ItemStatus): StatusConfig {
  const configs: Record<ItemStatus, StatusConfig> = {
    AVAILABLE: {
      label: 'Disponible',
      className: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle2
    },
    BORROWED: {
      label: 'Emprunté',
      className: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: UserCheck
    },
    UNAVAILABLE: {
      label: 'Indisponible',
      className: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: XCircle
    }
  };

  return configs[status];
}

/**
 * Retourne la configuration d'affichage pour un statut de demande
 *
 * @param status - Le statut de la demande (PENDING, APPROVED, etc.)
 * @returns Configuration avec label, className, et icône
 */
export function getRequestStatusConfig(status: RequestStatus): StatusConfig {
  const configs: Record<RequestStatus, StatusConfig> = {
    PENDING: {
      label: 'En attente',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: Clock
    },
    APPROVED: {
      label: 'Approuvée',
      className: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle2
    },
    REJECTED: {
      label: 'Refusée',
      className: 'bg-red-100 text-red-800 border-red-300',
      icon: XCircle
    },
    COMPLETED: {
      label: 'Terminée',
      className: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: Check
    },
    CANCELLED: {
      label: 'Annulée',
      className: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: Ban
    }
  };

  return configs[status];
}

/**
 * Composant Badge pour statut d'item
 *
 * @example
 * <ItemStatusBadge status="AVAILABLE" />
 */
export function ItemStatusBadge({
  status,
  showIcon = false
}: {
  status: ItemStatus;
  showIcon?: boolean;
}) {
  const config = getItemStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      {showIcon && Icon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

/**
 * Composant Badge pour statut de demande
 *
 * @example
 * <RequestStatusBadge status="PENDING" showIcon />
 */
export function RequestStatusBadge({
  status,
  showIcon = false
}: {
  status: RequestStatus;
  showIcon?: boolean;
}) {
  const config = getRequestStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      {showIcon && Icon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
```

### 2. Types: Update `types.ts`

```typescript
// S'assurer que les enums sont exportés
export type ItemStatus = 'AVAILABLE' | 'BORROWED' | 'UNAVAILABLE';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
```

### 3. Refactoring: `ItemCard.tsx`

**AVANT:**
```tsx
{item.status === 'AVAILABLE' && (
  <Badge className="bg-green-500">Disponible</Badge>
)}
{item.status === 'BORROWED' && (
  <Badge className="bg-orange-500">Emprunté</Badge>
)}
{item.status === 'UNAVAILABLE' && (
  <Badge className="bg-gray-500">Indisponible</Badge>
)}
```

**APRÈS:**
```tsx
import { ItemStatusBadge } from '@/lib/statusUtils';

<ItemStatusBadge status={item.status} />
```

### 4. Refactoring: `MyItems.tsx`

**AVANT:**
```tsx
<span className={`status ${item.status === 'AVAILABLE' ? 'green' : 'orange'}`}>
  {item.status === 'AVAILABLE' ? 'Disponible' : 'Emprunté'}
</span>
```

**APRÈS:**
```tsx
import { ItemStatusBadge } from '@/lib/statusUtils';

<ItemStatusBadge status={item.status} showIcon />
```

### 5. Refactoring: `IncomingRequestCard.tsx` & `OutgoingRequestCard.tsx`

**AVANT:**
```tsx
{request.status === 'PENDING' && <Badge variant="warning">En attente</Badge>}
{request.status === 'APPROVED' && <Badge variant="success">Approuvée</Badge>}
{request.status === 'REJECTED' && <Badge variant="destructive">Refusée</Badge>}
```

**APRÈS:**
```tsx
import { RequestStatusBadge } from '@/lib/statusUtils';

<RequestStatusBadge status={request.status} />
```

### 6. Refactoring: `Requests.tsx`

**AVANT:**
```tsx
const getStatusBadge = (status: string) => {
  switch(status) {
    case 'PENDING': return <Badge className="bg-yellow-500">En attente</Badge>;
    case 'APPROVED': return <Badge className="bg-green-500">Approuvée</Badge>;
    // ... etc
  }
};
```

**APRÈS:**
```tsx
import { RequestStatusBadge } from '@/lib/statusUtils';

// Simplement utiliser le composant directement
<RequestStatusBadge status={request.status} />
```

---

## 📊 Analyse d'Impact

### Fichiers à Modifier

**Création:**
- ✅ `frontend/src/lib/statusUtils.ts` (nouveau)

**Modifications:**
- ✅ `frontend/src/components/ItemCard.tsx`
- ✅ `frontend/src/pages/MyItems.tsx`
- ✅ `frontend/src/pages/Browse.tsx`
- ✅ `frontend/src/components/IncomingRequestCard.tsx`
- ✅ `frontend/src/components/OutgoingRequestCard.tsx`
- ✅ `frontend/src/pages/Requests.tsx`
- ✅ `frontend/src/types/index.ts` (vérifier exports)

**Total:** 1 nouveau fichier + 7 fichiers modifiés

### Réduction de Code

**Estimation:**
- Code dupliqué actuel: ~150 lignes (across components)
- Code après refactoring: ~80 lignes (utils + usage)
- **Réduction: ~45%**

---

## ⚠️ Cas Limites & Edge Cases

### Cas 1: Nouveau statut ajouté en backend
**Comportement:** TypeScript erreur si non défini dans statusUtils
**Action:** Ajouter la config dans `getItemStatusConfig()` ou `getRequestStatusConfig()`

### Cas 2: Statut invalide/null
**Comportement:** Afficher badge "Inconnu" avec style gris
**Solution:** Ajouter fallback dans les fonctions

```typescript
export function getItemStatusConfig(status: ItemStatus | null): StatusConfig {
  if (!status) {
    return {
      label: 'Inconnu',
      className: 'bg-gray-100 text-gray-800',
      icon: undefined
    };
  }
  // ... rest of logic
}
```

### Cas 3: Composant a besoin d'un style custom
**Comportement:** Permettre className optionnel en prop
**Solution:**

```tsx
export function ItemStatusBadge({
  status,
  showIcon = false,
  className = ''
}: {
  status: ItemStatus;
  showIcon?: boolean;
  className?: string;
}) {
  const config = getItemStatusConfig(status);
  return (
    <Badge className={`${config.className} ${className}`}>
      {/* ... */}
    </Badge>
  );
}
```

---

## ✅ Critères d'Acceptation

### Acceptance Tests

**Test 1: Cohérence visuelle**
- [ ] Tous les badges AVAILABLE ont la même couleur verte
- [ ] Tous les badges BORROWED ont la même couleur orange
- [ ] Labels français identiques partout

**Test 2: Refactoring réussi**
- [ ] Aucun code dupliqué de gestion de statuts
- [ ] Tous les composants utilisent `statusUtils.ts`
- [ ] Aucune régression visuelle

**Test 3: TypeScript**
- [ ] Auto-complétion fonctionne pour `getItemStatusConfig()`
- [ ] Erreur si statut invalide passé
- [ ] Types correctement exportés

**Test 4: Modification centralisée**
- [ ] Changer la couleur de AVAILABLE dans statusUtils
- [ ] Vérifier changement dans Browse, MyItems, ItemCard
- [ ] Aucune modification manuelle nécessaire ailleurs

**Test 5: Icônes optionnelles**
- [ ] `showIcon={true}` affiche l'icône
- [ ] `showIcon={false}` masque l'icône (défaut)
- [ ] Icônes correctes pour chaque statut

---

## 🚀 Implémentation

### Phase 1: Création du fichier utilitaire (1h)
1. Créer `lib/statusUtils.ts`
2. Définir interfaces `StatusConfig`
3. Implémenter `getItemStatusConfig()`
4. Implémenter `getRequestStatusConfig()`
5. Créer composants `ItemStatusBadge` et `RequestStatusBadge`
6. Ajouter JSDoc documentation
7. Tests TypeScript (vérifier types)

### Phase 2: Refactoring composants Items (30min)
1. Modifier `ItemCard.tsx`
2. Modifier `MyItems.tsx`
3. Modifier `Browse.tsx`
4. Tester visuellement

### Phase 3: Refactoring composants Requests (30min)
1. Modifier `IncomingRequestCard.tsx`
2. Modifier `OutgoingRequestCard.tsx`
3. Modifier `Requests.tsx`
4. Tester visuellement

### Phase 4: Testing & Documentation (30min)
1. Tests visuels de tous les statuts
2. Tests de régression
3. Vérifier cohérence entre pages
4. Mettre à jour documentation si nécessaire

### Total Estimé: 2-3 heures

---

## 📊 Impact & Bénéfices

### Bénéfices Immédiats
- ✅ Cohérence visuelle garantie
- ✅ Maintenance simplifiée (1 fichier à modifier)
- ✅ Réduction de ~45% du code lié aux statuts
- ✅ Meilleure expérience développeur (auto-complétion)

### Bénéfices Long Terme
- ✅ Facilite l'ajout de nouveaux statuts
- ✅ Facilite le changement de design system
- ✅ Réduit risque d'incohérences
- ✅ Code plus testable (fonctions pures)

### ROI
- **Temps investi:** 2-3 heures
- **Temps gagné:** ~30 min à chaque modification de statut (vs 7 fichiers à modifier)
- **Break-even:** Dès la 5e modification de statut
- **Qualité:** Incohérences visuelles éliminées

---

## 🔗 Dépendances

### Dépendances Externes
- **lucide-react:** Icônes (déjà installé)
- **TypeScript:** Pour typage strict

### Dépendances Internes
- **Badge component:** shadcn-ui (déjà disponible)
- **Types:** ItemStatus, RequestStatus

### Bloquants
- Aucun

---

## 🔐 Considérations

### Performance
- ✅ Aucun impact: fonctions pures, pas de calculs lourds
- ✅ Pas de re-renders supplémentaires
- ✅ Bundle size: +2KB (négligeable)

### Accessibilité
- ✅ Labels textuels toujours présents
- ✅ Couleurs respectent contraste WCAG AA (à vérifier)
- ✅ Icônes décoratives, pas nécessaires pour compréhension

### Extensibilité
- ✅ Facile d'ajouter nouveaux statuts
- ✅ Facile d'ajouter nouvelles props (taille, variant custom)
- ✅ Facile de migrer vers un design system externe

---

## 📝 Notes & Questions Ouvertes

### Questions
1. **Q:** Faut-il supporter les variantes de shadcn Badge (default, destructive, etc.)?
   **R:** Non pour v1, utiliser className custom suffisant

2. **Q:** Faut-il créer des Storybook stories pour les badges?
   **R:** Nice-to-have si Storybook existe, sinon hors scope

3. **Q:** Faut-il un mode sombre (dark mode)?
   **R:** Hors scope pour ce refactoring, mais anticiper dans les classes

### Améliorations Futures (v2)
- Support dark mode avec classes `dark:bg-*`
- Variants de taille (sm, md, lg)
- Animations sur changement de statut
- Tooltips explicatifs au survol
- Export des couleurs en variables CSS

---

## 🧪 Plan de Test

### Tests Unitaires (Optionnel)
```typescript
describe('statusUtils', () => {
  it('should return correct config for AVAILABLE', () => {
    const config = getItemStatusConfig('AVAILABLE');
    expect(config.label).toBe('Disponible');
    expect(config.className).toContain('green');
  });

  it('should render ItemStatusBadge without icon by default', () => {
    render(<ItemStatusBadge status="AVAILABLE" />);
    expect(screen.getByText('Disponible')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
```

### Tests Visuels (Manuel)
1. Ouvrir Browse → vérifier tous les badges AVAILABLE verts
2. Ouvrir MyItems → vérifier badges cohérents
3. Ouvrir Requests → vérifier badges PENDING jaunes
4. Tester responsive (mobile, tablet, desktop)
5. Vérifier accessibilité (contraste, screen readers)

---

## 📚 Références

- Issue GitHub: À créer
- Tailwind CSS Colors: https://tailwindcss.com/docs/customizing-colors
- lucide-react Icons: https://lucide.dev/icons
- shadcn Badge Component: https://ui.shadcn.com/docs/components/badge

---

**Changelog:**
- 2026-01-18: Version initiale (v1.0)
