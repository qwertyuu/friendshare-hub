# PRD-004: Gestion du statut UNAVAILABLE et traçabilité des emprunts

**Version:** 1.0
**Date:** 2026-01-18
**Auteur:** FriendShare Hub Team
**Statut:** Draft

---

## 📋 Résumé Exécutif

Permettre aux propriétaires d'objets de marquer leurs items comme temporairement indisponibles, et afficher publiquement qui emprunte actuellement un objet pour faciliter la communication entre membres.

---

## 🎯 Contexte & Problème

### Situation Actuelle
- Le statut `UNAVAILABLE` existe dans l'enum `ItemStatus` mais n'est jamais utilisé
- Quand un objet est emprunté (`BORROWED`), on ne sait pas qui l'a actuellement
- Les propriétaires ne peuvent pas marquer un objet comme "en réparation" ou "temporairement indisponible"
- Les utilisateurs intéressés ne savent pas qui contacter pour récupérer l'objet

### Problèmes Identifiés
1. **Manque de flexibilité:** Un objet peut être temporairement indisponible sans être emprunté (réparation, usage personnel, etc.)
2. **Manque de transparence:** Impossible de savoir qui détient un objet emprunté
3. **Friction de communication:** Pas de moyen facile de contacter l'emprunteur actuel

---

## 🎯 Objectifs

### Objectifs Primaires
- ✅ Permettre aux propriétaires de marquer un objet comme `UNAVAILABLE`
- ✅ Afficher qui emprunte actuellement un objet
- ✅ Cacher les objets `UNAVAILABLE` de la liste publique Browse (optionnel)

### Objectifs Secondaires
- ✅ Faciliter la communication entre membres
- ✅ Améliorer la transparence du système d'emprunt
- ✅ Réduire les demandes pour des objets non disponibles

### Non-Objectifs (Hors Scope)
- ❌ Système de messagerie directe
- ❌ Historique complet des emprunts passés
- ❌ Notifications automatiques de disponibilité

---

## 👥 User Stories

### US-1: Propriétaire marque un objet comme indisponible
**En tant que** propriétaire d'un objet
**Je veux** pouvoir marquer mon objet comme temporairement indisponible
**Afin de** éviter de recevoir des demandes d'emprunt quand je ne peux pas prêter

**Critères d'acceptation:**
- [ ] Bouton/toggle visible dans MyItems pour basculer vers UNAVAILABLE
- [ ] L'objet disparaît de la page Browse quand UNAVAILABLE
- [ ] L'objet reste visible pour le propriétaire dans MyItems
- [ ] Le propriétaire peut remettre l'objet AVAILABLE facilement

### US-2: Voir qui emprunte actuellement un objet
**En tant que** visiteur intéressé par un objet emprunté
**Je veux** savoir qui l'a actuellement
**Afin de** pouvoir le contacter directement pour savoir quand il sera disponible

**Critères d'acceptation:**
- [ ] Quand un objet est BORROWED, afficher "Emprunté par [Nom Utilisateur]"
- [ ] Le nom de l'emprunteur est cliquable et mène au profil (si US-12 implémenté)
- [ ] Visible sur la page Browse et sur la page de détails de l'objet

### US-3: Propriétaire voit qui emprunte son objet
**En tant que** propriétaire d'un objet emprunté
**Je veux** voir facilement qui l'a actuellement
**Afin de** pouvoir le contacter si besoin

**Critères d'acceptation:**
- [ ] Dans MyItems, afficher "Emprunté par [Nom]" sur les objets BORROWED
- [ ] Lien direct vers le profil de l'emprunteur
- [ ] Date de fin d'emprunt affichée (si disponible)

---

## 🔧 Spécifications Fonctionnelles

### Feature 1: Toggle UNAVAILABLE

**Comportement:**
1. Dans MyItems, ajouter un bouton/switch pour chaque objet
2. Statuts disponibles: `AVAILABLE` ↔ `UNAVAILABLE`
3. Si l'objet est `BORROWED`, désactiver le toggle avec tooltip explicatif
4. Confirmation dialog si l'objet a des demandes en attente

**Actions:**
- Clic sur toggle → Modal de confirmation (optionnel)
- Mise à jour immédiate du statut
- Toast de confirmation "Objet marqué comme indisponible"
- L'objet disparaît de Browse pour les autres utilisateurs

### Feature 2: Affichage de l'emprunteur actuel

**Logique Métier:**
1. Quand un objet est `BORROWED`, récupérer la BorrowRequest APPROVED active
2. Afficher l'emprunteur via `BorrowRequest.borrower.name`
3. Rendre le nom cliquable → lien vers profil utilisateur

**Emplacements d'affichage:**
- **Browse.tsx**: Badge "Emprunté par X" sur ItemCard
- **MyItems.tsx**: Info "Emprunté par X" avec date de fin
- **Page détails item**: Section "Actuellement emprunté par X depuis [date]"

### Feature 3: Visibilité conditionnelle

**Règles:**
- `AVAILABLE`: Visible par tous dans Browse ✅
- `BORROWED`: Visible par tous dans Browse avec info emprunteur ✅
- `UNAVAILABLE`:
  - ❌ Caché de Browse pour visiteurs
  - ✅ Visible pour propriétaire dans MyItems
  - Badge "Indisponible" en gris

---

## 🏗️ Spécifications Techniques

### Backend Changes

#### 1. Controller: `items.controller.ts`

**Nouveau endpoint:**
```typescript
PUT /api/items/:id/status
Body: { status: 'AVAILABLE' | 'UNAVAILABLE' }
```

**Validation:**
- Vérifier que l'utilisateur est propriétaire
- Si status = UNAVAILABLE et objet BORROWED → erreur
- Si demandes PENDING en cours → warning optionnel

#### 2. Controller: `items.controller.ts` (modification)

**Endpoint existant:** `GET /api/items`

**Modification:**
- Par défaut, exclure les items `UNAVAILABLE` sauf si `includeUnavailable=true`
- Pour le propriétaire, toujours inclure ses propres items

```typescript
where: {
  ...(userId !== itemOwnerId && {
    status: { not: 'UNAVAILABLE' }
  })
}
```

#### 3. Requête enrichie pour BorrowRequest

**Dans `GET /api/items` et `GET /api/items/:id`:**

```typescript
include: {
  images: true,
  owner: { select: { id: true, name: true } },
  borrowRequests: {
    where: { status: 'APPROVED' },
    include: {
      borrower: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 1
  }
}
```

#### 4. Migration Prisma

Aucune migration nécessaire, le statut UNAVAILABLE existe déjà dans l'enum.

### Frontend Changes

#### 1. Component: `MyItems.tsx`

**Ajout du toggle UNAVAILABLE:**

```tsx
<div className="flex items-center gap-2">
  <Label>Disponibilité</Label>
  <Switch
    checked={item.status === 'AVAILABLE'}
    onCheckedChange={(checked) =>
      handleStatusToggle(item.id, checked ? 'AVAILABLE' : 'UNAVAILABLE')
    }
    disabled={item.status === 'BORROWED'}
  />
  {item.status === 'BORROWED' && (
    <Tooltip>Impossible de modifier: l'objet est emprunté</Tooltip>
  )}
</div>
```

**Affichage emprunteur:**

```tsx
{item.status === 'BORROWED' && item.activeBorrow && (
  <div className="text-sm text-muted-foreground">
    Emprunté par{' '}
    <Link to={`/user/${item.activeBorrow.borrower.id}`} className="underline">
      {item.activeBorrow.borrower.name}
    </Link>
    {item.activeBorrow.endDate && (
      <> jusqu'au {formatDate(item.activeBorrow.endDate)}</>
    )}
  </div>
)}
```

#### 2. Component: `ItemCard.tsx`

**Badge pour UNAVAILABLE:**

```tsx
{item.status === 'UNAVAILABLE' && (
  <Badge variant="secondary" className="bg-gray-200">
    Indisponible
  </Badge>
)}
```

**Badge pour BORROWED avec emprunteur:**

```tsx
{item.status === 'BORROWED' && item.activeBorrow && (
  <Badge variant="outline" className="bg-blue-50">
    Emprunté par {item.activeBorrow.borrower.name}
  </Badge>
)}
```

#### 3. Service: `api.ts`

**Nouvelle fonction:**

```typescript
export const updateItemStatus = async (
  itemId: string,
  status: 'AVAILABLE' | 'UNAVAILABLE'
): Promise<void> => {
  await api.put(`/items/${itemId}/status`, { status });
};
```

#### 4. Types: Update `Item` interface

```typescript
interface Item {
  // ... existing fields
  activeBorrow?: {
    borrower: {
      id: string;
      name: string;
    };
    startDate: string;
    endDate?: string;
  };
}
```

---

## 🎨 UI/UX Specifications

### MyItems Page

**État AVAILABLE:**
```
┌─────────────────────────────────────┐
│ [Image]  Perceuse sans fil          │
│                                     │
│ État: ●DISPONIBLE                   │
│ [Toggle: ON]  Marquer indisponible │
│                                     │
│ [Modifier] [Supprimer]              │
└─────────────────────────────────────┘
```

**État BORROWED:**
```
┌─────────────────────────────────────┐
│ [Image]  Perceuse sans fil          │
│                                     │
│ État: ●EMPRUNTÉ                     │
│ Par: Jean Dupont (depuis 2026-01-15)│
│ [Toggle: DISABLED]                  │
│                                     │
│ [Modifier] [Supprimer]              │
└─────────────────────────────────────┘
```

**État UNAVAILABLE:**
```
┌─────────────────────────────────────┐
│ [Image]  Perceuse sans fil          │
│                                     │
│ État: ●INDISPONIBLE                 │
│ [Toggle: OFF]  Rendre disponible   │
│                                     │
│ [Modifier] [Supprimer]              │
└─────────────────────────────────────┘
```

### Browse Page (ItemCard)

**Objet emprunté:**
```
┌──────────────────┐
│                  │
│   [Image Item]   │
│                  │
├──────────────────┤
│ Perceuse         │
│ [Badge: Emprunté]│
│ par Jean D.      │
└──────────────────┘
```

---

## ⚠️ Cas Limites & Edge Cases

### Cas 1: Objet BORROWED → Toggle UNAVAILABLE
**Comportement:** Toggle désactivé avec tooltip
**Raison:** On ne peut pas marquer indisponible un objet déjà emprunté

### Cas 2: Objet UNAVAILABLE avec demandes PENDING
**Comportement:** Afficher warning "X demandes en attente seront masquées"
**Action:** Propriétaire peut confirmer ou annuler

### Cas 3: Emprunteur supprime son compte
**Comportement:** Afficher "Emprunté par [Utilisateur supprimé]"
**Technique:** Vérifier borrower !== null

### Cas 4: Plusieurs BorrowRequest APPROVED (bug data)
**Comportement:** Prendre la plus récente (ORDER BY createdAt DESC LIMIT 1)
**Prévention:** Ajouter contrainte unique dans migration future

### Cas 5: Propriétaire marque UNAVAILABLE puis supprime item
**Comportement:** Suppression normale, aucune logique spéciale
**Impact:** Aucun car objet déjà caché

---

## ✅ Critères d'Acceptation

### Acceptance Tests

**Test 1: Toggle UNAVAILABLE**
- [ ] Propriétaire peut marquer son objet AVAILABLE → UNAVAILABLE
- [ ] L'objet disparaît de Browse pour les autres
- [ ] L'objet reste visible dans MyItems du propriétaire
- [ ] Toast de confirmation affiché

**Test 2: Affichage emprunteur dans Browse**
- [ ] Item BORROWED affiche "Emprunté par [Nom]"
- [ ] Le nom est cliquable (lien vers profil si implémenté)
- [ ] Badge visible et distinct

**Test 3: MyItems avec emprunteur**
- [ ] Propriétaire voit qui emprunte son objet
- [ ] Date de fin affichée si disponible
- [ ] Lien vers profil emprunteur fonctionnel

**Test 4: Toggle désactivé si BORROWED**
- [ ] Toggle grisé quand objet BORROWED
- [ ] Tooltip explicatif au survol
- [ ] Aucun changement de statut possible

**Test 5: Filtrage dans Browse**
- [ ] Items UNAVAILABLE exclus de Browse
- [ ] Propriétaire voit tous ses items dans MyItems
- [ ] Items BORROWED toujours visibles dans Browse

---

## 📊 Impact & Métriques

### Métriques de Succès
- **Réduction des demandes invalides:** -20% de demandes pour items non disponibles
- **Transparence:** 100% des objets empruntés affichent l'emprunteur
- **Engagement:** +15% d'utilisation du toggle UNAVAILABLE dans les 2 premières semaines

### Impact Utilisateurs
- **Propriétaires:** Plus de contrôle, moins de demandes inutiles
- **Emprunteurs:** Meilleure visibilité, savent qui contacter
- **Communauté:** Transparence accrue, confiance renforcée

---

## 🚀 Implémentation

### Phase 1: Backend (1-2h)
1. Créer endpoint `PUT /items/:id/status`
2. Modifier `GET /items` pour filtrer UNAVAILABLE
3. Enrichir requêtes avec `activeBorrow`
4. Tests unitaires

### Phase 2: Frontend (2-3h)
1. Ajouter toggle dans MyItems
2. Créer composant BorrowerBadge
3. Intégrer dans ItemCard
4. Styles et responsive

### Phase 3: Testing (1h)
1. Tests manuels des 5 scénarios
2. Tests edge cases
3. Validation UX

### Total Estimé: 4-6 heures

---

## 🔗 Dépendances

### Dépendances Externes
- **PRD-012 (Profil utilisateur):** Lien vers profil emprunteur (optionnel, fallback possible)

### Dépendances Internes
- Aucune migration DB nécessaire
- Composants shadcn-ui: Switch, Badge, Tooltip déjà disponibles

---

## 📝 Notes & Questions Ouvertes

### Questions
1. **Q:** Faut-il notifier les demandeurs en attente quand un objet devient UNAVAILABLE?
   **R:** Hors scope, à traiter dans PRD-013 (Notifications)

2. **Q:** Faut-il un historique des changements de statut?
   **R:** Hors scope pour v1, nice-to-have pour v2

3. **Q:** Limitation du nombre de fois qu'on peut toggle UNAVAILABLE?
   **R:** Non, pas de limitation pour l'instant

### Notes Techniques
- Utiliser le composant `Switch` de shadcn-ui pour le toggle
- Réutiliser la logique de badges existante
- Considérer l'ajout d'un index sur `BorrowRequest(status, itemId)` pour performance

---

## 📚 Références

- Issue GitHub: À créer
- Design Figma: N/A (utiliser composants existants)
- Documentation API: `/docs/api.md` (à mettre à jour)

---

**Changelog:**
- 2026-01-18: Version initiale (v1.0)
