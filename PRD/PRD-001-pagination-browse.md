# PRD-001: Pagination Visuelle dans Browse

**Version:** 1.0
**Date:** 2026-01-18
**Auteur:** FriendShare Hub Team
**Statut:** Draft

---

## 📋 Résumé Exécutif

Ajouter une interface de pagination visuelle dans la page Browse pour permettre aux utilisateurs de naviguer facilement entre les pages d'objets, alors que l'API backend supporte déjà la pagination avec les paramètres `page` et `limit`.

---

## 🎯 Contexte & Problème

### Situation Actuelle
- L'API backend charge les items avec paramètres `page` et `limit` (actuellement: 20 items par page)
- **Aucune UI de pagination** n'est affichée sur la page Browse
- Les utilisateurs voient uniquement les 20 premiers items
- Impossible de savoir qu'il existe plus d'objets
- Impossible d'accéder aux objets au-delà de la première page

### Problèmes Identifiés
1. **Perte de découvrabilité:** Les objets au-delà de la page 1 sont invisibles
2. **Mauvaise UX:** Aucune indication qu'il y a plus de contenu
3. **Frustration utilisateur:** "Il n'y a que 20 objets?" alors qu'il y en a 50+
4. **Gaspillage de développement:** API pagination prête mais inutilisée

### Preuve du Problème

**Code actuel dans `Browse.tsx`:**
```typescript
const { data: items, isLoading } = useQuery({
  queryKey: ['items', selectedCategory, searchQuery],
  queryFn: () => getItems({ category: selectedCategory, search: searchQuery })
});
```

**API dans `api.ts`:**
```typescript
export const getItems = async (params?: {
  category?: string;
  search?: string;
  page?: number;  // ← Paramètre existe mais jamais utilisé!
  limit?: number; // ← Paramètre existe mais jamais utilisé!
}): Promise<Item[]> => {
  const response = await api.get('/items', { params });
  return response.data;
};
```

**Backend retourne déjà:**
```json
{
  "items": [...],
  "total": 87,        // ← Total d'items disponible
  "page": 1,
  "totalPages": 5     // ← Nombre de pages calculé
}
```

→ **Toute l'infrastructure backend existe, il manque juste l'UI!**

---

## 🎯 Objectifs

### Objectifs Primaires
- ✅ Afficher un composant de pagination sous la grille d'items
- ✅ Permettre de naviguer entre les pages (Précédent/Suivant)
- ✅ Afficher le numéro de page actuel et le total de pages
- ✅ Afficher le nombre total d'items disponibles

### Objectifs Secondaires
- ✅ Maintenir les filtres (catégorie, recherche) lors de la navigation
- ✅ Scroll automatique vers le haut lors du changement de page
- ✅ Désactiver les boutons Précédent/Suivant aux extrémités
- ✅ Afficher un indicateur de chargement lors du changement de page

### Non-Objectifs (Hors Scope)
- ❌ Pagination infinie (infinite scroll) - peut être ajouté en v2
- ❌ Sélection de la taille de page (10, 20, 50) - v2
- ❌ Navigation directe vers une page spécifique (1, 2, 3...) - v2
- ❌ Modification du backend (déjà fonctionnel)

---

## 👥 User Stories

### US-1: Naviguer entre les pages
**En tant que** visiteur parcourant les objets
**Je veux** voir un contrôle de pagination sous la grille
**Afin de** pouvoir accéder à tous les objets disponibles

**Critères d'acceptation:**
- [ ] Boutons "Précédent" et "Suivant" visibles sous la grille d'items
- [ ] Affichage "Page X sur Y" visible
- [ ] Clic sur "Suivant" charge la page suivante
- [ ] Clic sur "Précédent" charge la page précédente
- [ ] Scroll automatique vers le haut de la page

### US-2: Voir le nombre total d'objets
**En tant que** utilisateur
**Je veux** savoir combien d'objets sont disponibles au total
**Afin de** comprendre l'étendue du catalogue

**Critères d'acceptation:**
- [ ] Affichage "87 objets disponibles" ou similaire
- [ ] Nombre mis à jour selon les filtres actifs
- [ ] Visible au-dessus ou en dessous de la grille

### US-3: Pagination avec filtres
**En tant que** utilisateur filtrant par catégorie "Outils"
**Je veux** que la pagination fonctionne avec mes filtres
**Afin de** parcourir tous les outils disponibles

**Critères d'acceptation:**
- [ ] Changement de catégorie reset la pagination à page 1
- [ ] Changement de recherche reset la pagination à page 1
- [ ] Pagination respecte les filtres actifs
- [ ] Total pages recalculé selon les filtres

### US-4: Boutons désactivés aux limites
**En tant que** utilisateur sur la première page
**Je veux** que le bouton "Précédent" soit désactivé
**Afin de** comprendre que je suis au début

**Critères d'acceptation:**
- [ ] Bouton "Précédent" désactivé sur page 1
- [ ] Bouton "Suivant" désactivé sur dernière page
- [ ] Indicateur visuel clair (opacité, curseur, couleur)

---

## 🔧 Spécifications Fonctionnelles

### Feature 1: Composant Pagination

**Emplacement:** Sous la grille d'items dans Browse.tsx

**Éléments UI:**
1. **Bouton "Précédent"**
   - Désactivé si `currentPage === 1`
   - Décrémente `currentPage` de 1

2. **Indicateur de page**
   - Format: "Page 2 sur 5"
   - Centré entre les boutons

3. **Bouton "Suivant"**
   - Désactivé si `currentPage === totalPages`
   - Incrémente `currentPage` de 1

4. **Compteur total** (optionnel mais recommandé)
   - Format: "87 objets disponibles"
   - Affiché au-dessus de la grille

**Comportement:**
- Changement de page → scroll vers le haut (window.scrollTo)
- Changement de filtres → reset `currentPage` à 1
- État de chargement → désactiver tous les boutons

### Feature 2: Gestion de l'État

**State à ajouter dans Browse.tsx:**
```typescript
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 20; // Constante
```

**Intégration avec React Query:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['items', selectedCategory, searchQuery, currentPage],
  queryFn: () => getItems({
    category: selectedCategory,
    search: searchQuery,
    page: currentPage,
    limit: ITEMS_PER_PAGE
  })
});

const items = data?.items || [];
const totalItems = data?.total || 0;
const totalPages = data?.totalPages || 1;
```

### Feature 3: Reset Pagination lors Filtrage

**Logique:**
```typescript
useEffect(() => {
  setCurrentPage(1); // Reset à page 1 quand filtres changent
}, [selectedCategory, searchQuery]);
```

### Feature 4: Scroll Automatique

**Logique:**
```typescript
const handlePageChange = (newPage: number) => {
  setCurrentPage(newPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

---

## 🏗️ Spécifications Techniques

### Backend Changes

**Aucun changement nécessaire!** 🎉

Le backend retourne déjà:
```typescript
{
  items: Item[];
  total: number;
  page: number;
  totalPages: number;
}
```

### Frontend Changes

#### 1. Types: Update `types.ts`

```typescript
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
```

#### 2. Service: Update `api.ts`

**AVANT:**
```typescript
export const getItems = async (params?: {
  category?: string;
  search?: string;
}): Promise<Item[]> => {
  const response = await api.get('/items', { params });
  return response.data;
};
```

**APRÈS:**
```typescript
export const getItems = async (params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Item>> => {
  const response = await api.get('/items', { params });
  return response.data;
};
```

#### 3. Nouveau Composant: `Pagination.tsx`

**Fichier:** `frontend/src/components/Pagination.tsx`

```tsx
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false
}: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) return null; // Cacher si une seule page

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={!canGoPrevious || isLoading}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Précédent
      </Button>

      <span className="text-sm text-muted-foreground">
        Page <span className="font-medium">{currentPage}</span> sur{' '}
        <span className="font-medium">{totalPages}</span>
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={!canGoNext || isLoading}
      >
        Suivant
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
```

#### 4. Update: `Browse.tsx`

**Modifications:**

```tsx
import { useState, useEffect } from 'react';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 20;

export default function Browse() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: ['items', selectedCategory, searchQuery, currentPage],
    queryFn: () =>
      getItems({
        category: selectedCategory,
        search: searchQuery,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      })
  });

  const items = data?.items || [];
  const totalItems = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Parcourir les objets</h1>

      {/* Filters */}
      <div className="mb-6">
        {/* ... existing filters ... */}
      </div>

      {/* Total count */}
      <p className="text-sm text-muted-foreground mb-4">
        {totalItems} objet{totalItems > 1 ? 's' : ''} disponible{totalItems > 1 ? 's' : ''}
      </p>

      {/* Items Grid */}
      {isLoading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
```

---

## 🎨 UI/UX Specifications

### Layout Desktop

```
┌──────────────────────────────────────────────────────┐
│  Parcourir les objets                                 │
│                                                       │
│  [Toutes] [Outils] [Électronique] [Livres] [...]    │
│  [Recherche: _____________________] [🔍]             │
│                                                       │
│  87 objets disponibles                               │
│                                                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ Item 1 │ │ Item 2 │ │ Item 3 │ │ Item 4 │        │
│  └────────┘ └────────┘ └────────┘ └────────┘        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ Item 5 │ │ Item 6 │ │ Item 7 │ │ Item 8 │        │
│  └────────┘ └────────┘ └────────┘ └────────┘        │
│                                                       │
│  [← Précédent]  Page 2 sur 5  [Suivant →]           │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### Composant Pagination - États

**État Normal:**
```
[← Précédent]  Page 2 sur 5  [Suivant →]
```

**Première Page:**
```
[← Précédent]  Page 1 sur 5  [Suivant →]
     (grisé)                   (actif)
```

**Dernière Page:**
```
[← Précédent]  Page 5 sur 5  [Suivant →]
    (actif)                    (grisé)
```

**Chargement:**
```
[← Précédent]  Page 2 sur 5  [Suivant →]
   (désactivé)               (désactivé)
```

### Mobile Responsive

```
┌────────────────────────┐
│ 87 objets disponibles  │
│                        │
│ ┌────────────────────┐ │
│ │      Item 1        │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │      Item 2        │ │
│ └────────────────────┘ │
│                        │
│ [←] Page 2/5 [→]      │
│                        │
└────────────────────────┘
```

---

## ⚠️ Cas Limites & Edge Cases

### Cas 1: Une seule page d'items (≤20 items)
**Comportement:** Masquer complètement la pagination
**Raison:** Pas besoin de pagination si tout tient sur une page
**Code:** `if (totalPages <= 1) return null;`

### Cas 2: Recherche retourne 0 résultats
**Comportement:** Masquer pagination, afficher EmptyState
**Message:** "Aucun objet trouvé"

### Cas 3: Utilisateur sur page 3, applique filtre qui retourne seulement 1 page
**Comportement:** Reset automatique à page 1 via `useEffect`
**Feedback:** Pas de message d'erreur, navigation fluide

### Cas 4: Changement rapide de pages (spam clic)
**Comportement:** Désactiver boutons pendant `isLoading`
**Protection:** React Query gère le debouncing automatiquement

### Cas 5: URL partagée avec page spécifique
**Comportement v1:** Pas de support URL params, toujours page 1
**Amélioration v2:** Support `?page=3` dans URL

### Cas 6: Backend retourne erreur
**Comportement:** Afficher message d'erreur, masquer pagination
**Fallback:** `totalPages = 1` par défaut

### Cas 7: Total items change pendant navigation (nouvel objet ajouté)
**Comportement:** React Query rafraîchit automatiquement
**Impact:** Possible saut de pagination, acceptable pour v1

---

## ✅ Critères d'Acceptation

### Acceptance Tests

**Test 1: Pagination visible**
- [ ] Créer 25+ items dans la DB
- [ ] Charger Browse
- [ ] Vérifier que pagination apparaît sous la grille
- [ ] Affiche "Page 1 sur 2"

**Test 2: Navigation Suivant**
- [ ] Être sur page 1
- [ ] Cliquer "Suivant"
- [ ] Vérifier que page 2 se charge
- [ ] Vérifier que nouveaux items (21-40) s'affichent
- [ ] Vérifier scroll vers le haut

**Test 3: Navigation Précédent**
- [ ] Être sur page 2
- [ ] Cliquer "Précédent"
- [ ] Vérifier retour à page 1
- [ ] Vérifier que items 1-20 s'affichent

**Test 4: Boutons désactivés**
- [ ] Sur page 1, bouton "Précédent" grisé/désactivé
- [ ] Sur dernière page, bouton "Suivant" grisé/désactivé
- [ ] Impossible de cliquer sur boutons désactivés

**Test 5: Reset pagination avec filtres**
- [ ] Aller à page 3
- [ ] Changer de catégorie
- [ ] Vérifier reset à page 1
- [ ] Changer recherche
- [ ] Vérifier reset à page 1

**Test 6: Total count correct**
- [ ] Vérifier "87 objets disponibles" (nombre correct)
- [ ] Filtrer par catégorie
- [ ] Vérifier que total se met à jour

**Test 7: Pagination cachée si ≤1 page**
- [ ] Filtrer pour avoir <20 items
- [ ] Vérifier que pagination disparaît
- [ ] Retirer filtre
- [ ] Vérifier que pagination réapparaît

---

## 📊 Impact & Métriques

### Métriques de Succès
- **Découvrabilité:** +80% d'objets vus (au-delà de la page 1)
- **Engagement:** +50% de pages parcourues par session
- **Satisfaction:** Retour utilisateurs positif (moins de confusion)
- **Conversion:** +25% de demandes d'emprunt (accès à plus d'objets)

### Impact Utilisateurs
- **Visiteurs:** Peuvent enfin voir tout le catalogue
- **Propriétaires:** Leurs objets en page 2+ deviennent visibles
- **Admin:** Meilleure utilisation de la plateforme

### Analytics à Suivre
- Nombre moyen de pages parcourues par session
- Taux de clic sur "Suivant"
- Objets empruntés provenant de pages 2+
- Taux de rebond sur Browse

---

## 🚀 Implémentation

### Phase 1: Types & API (15 min)
1. Créer interface `PaginatedResponse<T>` dans types.ts
2. Modifier signature de `getItems()` dans api.ts
3. Tests TypeScript

### Phase 2: Composant Pagination (20 min)
1. Créer `components/Pagination.tsx`
2. Props: currentPage, totalPages, onPageChange, isLoading
3. Styles avec shadcn Button
4. Icônes ChevronLeft/Right

### Phase 3: Intégration Browse (15 min)
1. Ajouter state `currentPage` dans Browse.tsx
2. Update queryKey avec currentPage
3. Passer params page/limit à getItems()
4. Ajouter useEffect pour reset pagination

### Phase 4: UI & Polish (10 min)
1. Ajouter total count display
2. Intégrer composant Pagination sous grille
3. Handler handlePageChange avec scroll
4. Styles responsive

### Phase 5: Testing (15 min)
1. Tests des 7 scénarios d'acceptance
2. Tests responsive (mobile, tablet)
3. Tests edge cases (0 items, 1 page, etc.)
4. Validation UX

### Total Estimé: 1-1.5 heures

---

## 🔗 Dépendances

### Dépendances Externes
- **lucide-react:** ChevronLeft, ChevronRight (déjà installé)

### Dépendances Internes
- **Backend API:** `/api/items` avec pagination (déjà fonctionnel ✅)
- **shadcn Button:** Déjà disponible
- **React Query:** Déjà configuré

### Bloquants
- **Aucun!** Tout est prêt côté backend

---

## 🔐 Considérations

### Performance
- ✅ Pas de sur-fetching: seulement 20 items par requête
- ✅ React Query cache les pages déjà visitées
- ✅ Pas de re-render inutile grâce à queryKey

### Accessibilité
- ✅ Boutons désactivés avec `aria-disabled`
- ✅ Navigation au clavier fonctionnelle
- ✅ Labels textuels clairs ("Précédent", "Suivant")
- ✅ Indicateur de page lisible par screen readers

### SEO (Hors Scope v1)
- ❌ Pas de support URL params (`?page=3`)
- ❌ Pas de balises `rel="prev"` / `rel="next"`
- Note: Acceptable pour app authentifiée

---

## 📝 Notes & Questions Ouvertes

### Questions
1. **Q:** Faut-il permettre de changer la taille de page (10, 20, 50)?
   **R:** Hors scope v1, peut être ajouté en v2

2. **Q:** Faut-il un "Jump to page" (aller à la page 5 directement)?
   **R:** Hors scope v1, YAGNI pour l'instant

3. **Q:** Faut-il afficher "Affichage 21-40 sur 87"?
   **R:** Nice-to-have, ajouter si temps le permet

4. **Q:** Infinite scroll au lieu de pagination?
   **R:** Alternative valide pour v2, pagination plus simple pour v1

### Nice-to-Have (v2)
- Navigation directe vers page (1, 2, 3, 4, 5...)
- Sélecteur de taille de page
- URL params (?page=3&category=outils)
- Infinite scroll option
- "Affichage 21-40 sur 87 objets"
- Préchargement de la page suivante

---

## 🧪 Plan de Test

### Tests Manuels
1. Créer 45 items en DB (pour 3 pages)
2. Naviguer Browse → vérifier page 1
3. Cliquer "Suivant" → vérifier page 2
4. Vérifier items différents affichés
5. Cliquer "Précédent" → retour page 1
6. Aller page 3 → bouton "Suivant" désactivé
7. Filtrer par catégorie → reset page 1
8. Chercher texte → reset page 1
9. Tester mobile/tablet responsive

### Tests Automatisés (Optionnel)
```typescript
describe('Pagination', () => {
  it('should show pagination when more than 20 items', () => {
    // Mock 50 items
    render(<Browse />);
    expect(screen.getByText(/Page 1 sur 3/)).toBeInTheDocument();
  });

  it('should navigate to next page', async () => {
    render(<Browse />);
    const nextButton = screen.getByText('Suivant');
    await userEvent.click(nextButton);
    expect(screen.getByText(/Page 2 sur 3/)).toBeInTheDocument();
  });
});
```

---

## 📚 Références

- shadcn Pagination: https://ui.shadcn.com/docs/components/pagination (alternative à notre composant custom)
- React Query Pagination: https://tanstack.com/query/latest/docs/react/guides/paginated-queries
- lucide-react Icons: https://lucide.dev/icons

---

## 🎯 Success Criteria

**Cette feature sera considérée comme réussie si:**
1. ✅ Les utilisateurs peuvent accéder à TOUS les objets (pas seulement les 20 premiers)
2. ✅ La navigation est intuitive et fluide
3. ✅ Aucune régression sur les filtres existants
4. ✅ Performance maintenue (pas de ralentissement)
5. ✅ 0 bug critique en production dans les 2 premières semaines

---

**Changelog:**
- 2026-01-18: Version initiale (v1.0)
