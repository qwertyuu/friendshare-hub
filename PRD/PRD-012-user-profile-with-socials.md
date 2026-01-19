# PRD-012: Profil Utilisateur Public avec Réseaux Sociaux

**Version:** 1.0
**Date:** 2026-01-18
**Auteur:** FriendShare Hub Team
**Statut:** Draft

---

## 📋 Résumé Exécutif

Créer une page de profil public pour chaque utilisateur affichant ses objets partagés, ses informations publiques, et une section dédiée aux réseaux sociaux de la communauté (Facebook, Discord) pour faciliter les échanges et renforcer le sentiment d'appartenance.

---

## 🎯 Contexte & Problème

### Situation Actuelle
- Aucune page de profil utilisateur n'existe
- Impossible de voir tous les objets d'un utilisateur spécifique
- Pas de moyen de découvrir d'autres objets du même propriétaire
- Liens vers les réseaux sociaux communautaires (Facebook, Discord) dispersés ou absents
- Communication entre membres limitée

### Problèmes Identifiés
1. **Manque de découvrabilité:** Impossible de parcourir le catalogue d'un utilisateur
2. **Perte d'opportunités:** Un utilisateur intéressé par un objet ne peut voir les autres items du même propriétaire
3. **Isolement social:** Pas de liens vers la communauté externe (Facebook, Discord)
4. **Manque de transparence:** Pas d'informations publiques sur les membres

---

## 🎯 Objectifs

### Objectifs Primaires
- ✅ Créer une page de profil public pour chaque utilisateur (`/user/:id`)
- ✅ Afficher tous les objets disponibles de l'utilisateur
- ✅ Ajouter une section "Réseaux Sociaux" avec liens vers Facebook et Discord de la communauté
- ✅ Afficher des statistiques de base (nombre d'objets, membre depuis)

### Objectifs Secondaires
- ✅ Permettre la navigation fluide entre profils
- ✅ Encourager l'engagement communautaire via les socials
- ✅ Améliorer la confiance entre membres

### Non-Objectifs (Hors Scope)
- ❌ Profil privé/éditable par l'utilisateur (v2)
- ❌ Système de messagerie privée
- ❌ Notes/évaluations des utilisateurs
- ❌ Paramètres de confidentialité avancés
- ❌ Intégration OAuth avec Facebook/Discord

---

## 👥 User Stories

### US-1: Consulter le profil d'un utilisateur
**En tant que** visiteur
**Je veux** accéder au profil public d'un utilisateur
**Afin de** voir tous ses objets disponibles et en savoir plus sur lui

**Critères d'acceptation:**
- [ ] Route `/user/:id` accessible depuis n'importe où
- [ ] Affichage du nom de l'utilisateur
- [ ] Liste de tous ses objets AVAILABLE et BORROWED (pas UNAVAILABLE)
- [ ] Statistiques: nombre d'objets, membre depuis
- [ ] Page responsive (mobile/desktop)

### US-2: Découvrir d'autres objets du même propriétaire
**En tant que** visiteur intéressé par un objet
**Je veux** cliquer sur le nom du propriétaire pour voir ses autres objets
**Afin de** découvrir d'autres items qui pourraient m'intéresser

**Critères d'acceptation:**
- [ ] Lien cliquable depuis ItemCard (Browse)
- [ ] Lien cliquable depuis page détails objet
- [ ] Navigation fluide vers `/user/:id`

### US-3: Rejoindre la communauté sur les réseaux sociaux
**En tant que** nouveau membre
**Je veux** voir les liens vers Facebook et Discord de la communauté
**Afin de** rejoindre les groupes et échanger avec les autres membres

**Critères d'acceptation:**
- [ ] Section "Rejoignez la communauté" visible sur toutes les pages de profil
- [ ] Bouton/lien vers groupe Facebook avec icône
- [ ] Bouton/lien vers serveur Discord avec icône
- [ ] Liens s'ouvrent dans un nouvel onglet
- [ ] Design cohérent avec l'identité visuelle

### US-4: Voir ses propres statistiques
**En tant que** propriétaire
**Je veux** accéder à mon propre profil
**Afin de** voir comment les autres me perçoivent

**Critères d'acceptation:**
- [ ] Lien "Mon profil" dans le menu utilisateur (Header)
- [ ] Affichage de tous mes objets (AVAILABLE, BORROWED, UNAVAILABLE)
- [ ] Indication visuelle "C'est votre profil" (optionnel)

---

## 🔧 Spécifications Fonctionnelles

### Feature 1: Page Profil Utilisateur

**URL:** `/user/:id`

**Sections de la page:**

1. **En-tête du profil**
   - Photo de profil (placeholder avatar si non défini)
   - Nom de l'utilisateur
   - Membre depuis [date d'inscription]
   - Badge "Admin" si rôle ADMIN

2. **Statistiques**
   - 📦 Nombre d'objets partagés
   - ✅ Objets disponibles
   - 📤 Objets actuellement empruntés

3. **Grille d'objets**
   - Réutiliser le composant `ItemCard`
   - Afficher uniquement AVAILABLE et BORROWED
   - Masquer UNAVAILABLE pour visiteurs (sauf si c'est son propre profil)
   - Layout responsive (grid 3 colonnes → 2 → 1)

4. **Section Réseaux Sociaux**
   - Titre: "Rejoignez la communauté Raphartage Club"
   - Bouton Facebook avec icône + lien
   - Bouton Discord avec icône + lien
   - Design attractif avec call-to-action

### Feature 2: Navigation vers Profils

**Emplacements des liens:**

1. **ItemCard (Browse.tsx):**
   - Nom du propriétaire cliquable sous le titre de l'objet
   - Format: "Par [Nom]" → lien vers `/user/:id`

2. **Page détails objet:**
   - Section propriétaire avec lien vers profil

3. **BorrowRequest cards:**
   - Nom de l'emprunteur/propriétaire cliquable

4. **Header (menu utilisateur):**
   - Nouveau lien "Mon profil" dans le dropdown

### Feature 3: Section Réseaux Sociaux

**Design:**
```
┌────────────────────────────────────────────┐
│  🌟 Rejoignez la communauté!               │
├────────────────────────────────────────────┤
│                                            │
│  Échangez avec les autres membres:         │
│                                            │
│  [📘 Groupe Facebook]  [💬 Serveur Discord]│
│                                            │
│  Partagez vos expériences, posez des      │
│  questions, et restez informé!             │
└────────────────────────────────────────────┘
```

**Configuration:**
- URLs définies dans variables d'environnement
- Fallback si URLs non définies: section masquée

---

## 🏗️ Spécifications Techniques

### Backend Changes

#### 1. Nouveau Controller: `users.controller.ts`

**Endpoint:**
```typescript
GET /api/users/:id
Response: {
  id: string;
  name: string;
  email: string; // Caché ou partiel (optionnel)
  role: 'USER' | 'ADMIN';
  createdAt: string;
  stats: {
    totalItems: number;
    availableItems: number;
    borrowedItems: number;
  };
  items: Item[]; // Filtrés selon règles de visibilité
}
```

**Logique:**
- Récupérer utilisateur par ID
- Compter les items par statut
- Récupérer items avec images
- Filtrer UNAVAILABLE sauf si userId === requesterId

#### 2. Nouvelle Route: `users.routes.ts`

```typescript
router.get('/users/:id', getUserProfile);
```

#### 3. Middleware: Authentification optionnelle

- Route publique, pas besoin d'être connecté
- Si connecté, enrichir avec infos supplémentaires (voir ses propres UNAVAILABLE)

### Frontend Changes

#### 1. Nouvelle Page: `UserProfile.tsx`

**Structure:**
```tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/services/api';
import ItemCard from '@/components/ItemCard';
import SocialLinks from '@/components/SocialLinks';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', id],
    queryFn: () => getUserProfile(id!)
  });

  if (isLoading) return <Skeleton />;

  return (
    <div className="container py-8">
      {/* Header Section */}
      <ProfileHeader user={profile} />

      {/* Stats Section */}
      <ProfileStats stats={profile.stats} />

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profile.items.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Social Links */}
      <SocialLinks />
    </div>
  );
}
```

#### 2. Nouveau Composant: `SocialLinks.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Facebook, MessageCircle } from 'lucide-react';

const FACEBOOK_URL = import.meta.env.VITE_FACEBOOK_GROUP_URL;
const DISCORD_URL = import.meta.env.VITE_DISCORD_SERVER_URL;

export default function SocialLinks() {
  if (!FACEBOOK_URL && !DISCORD_URL) return null;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🌟 Rejoignez la communauté Raphartage Club
        </CardTitle>
        <CardDescription>
          Échangez avec les autres membres, partagez vos expériences, et restez informé!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {FACEBOOK_URL && (
          <Button asChild variant="outline" className="flex-1 min-w-[200px]">
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
              <Facebook className="mr-2 h-5 w-5" />
              Groupe Facebook
            </a>
          </Button>
        )}
        {DISCORD_URL && (
          <Button asChild variant="outline" className="flex-1 min-w-[200px]">
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              Serveur Discord
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 3. Service: `api.ts`

**Nouvelle fonction:**
```typescript
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};
```

#### 4. Types: `types.ts`

```typescript
interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  stats: {
    totalItems: number;
    availableItems: number;
    borrowedItems: number;
  };
  items: Item[];
}
```

#### 5. Routing: `App.tsx`

```tsx
<Route path="/user/:id" element={<UserProfile />} />
```

#### 6. Variables d'environnement: `frontend/.env`

```env
VITE_FACEBOOK_GROUP_URL=https://www.facebook.com/groups/raphartage
VITE_DISCORD_SERVER_URL=https://discord.gg/raphartage
```

### Modifications de Composants Existants

#### `ItemCard.tsx`

**Ajout du lien propriétaire:**
```tsx
<p className="text-sm text-muted-foreground">
  Par{' '}
  <Link
    to={`/user/${item.owner.id}`}
    className="hover:underline font-medium"
  >
    {item.owner.name}
  </Link>
</p>
```

#### `Header.tsx`

**Ajout dans DropdownMenu:**
```tsx
<DropdownMenuItem asChild>
  <Link to={`/user/${user.id}`}>
    <User className="mr-2 h-4 w-4" />
    Mon profil
  </Link>
</DropdownMenuItem>
```

---

## 🎨 UI/UX Specifications

### Page Profil - Desktop

```
┌──────────────────────────────────────────────────────┐
│  Header Navigation                                    │
├──────────────────────────────────────────────────────┤
│                                                       │
│  [Avatar]  Jean Dupont                               │
│            Membre depuis janvier 2025                │
│            [Badge: ADMIN]                            │
│                                                       │
│  ┌──────────┬──────────────┬──────────────┐         │
│  │ 12       │ 8            │ 4            │         │
│  │ Objets   │ Disponibles  │ Empruntés    │         │
│  └──────────┴──────────────┴──────────────┘         │
│                                                       │
│  ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │[Image] │ │[Image] │ │[Image] │                   │
│  │Perceuse│ │Échelle │ │Tente   │                   │
│  │DISPO   │ │EMPRUNTÉ│ │DISPO   │                   │
│  └────────┘ └────────┘ └────────┘                   │
│                                                       │
│  ┌────────────────────────────────────────┐         │
│  │ 🌟 Rejoignez la communauté!            │         │
│  │ [📘 Groupe Facebook] [💬 Discord]      │         │
│  └────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────┘
```

### Section Réseaux Sociaux - Design

**Option 1: Carte simple (recommandé)**
```tsx
<Card>
  <CardHeader>
    <CardTitle>🌟 Rejoignez la communauté</CardTitle>
    <CardDescription>
      Échangez avec les autres membres du Raphartage Club
    </CardDescription>
  </CardHeader>
  <CardContent className="flex gap-4">
    <Button variant="outline" asChild>
      <a href="..." target="_blank">
        <Facebook /> Groupe Facebook
      </a>
    </Button>
    <Button variant="outline" asChild>
      <a href="..." target="_blank">
        <MessageCircle /> Serveur Discord
      </a>
    </Button>
  </CardContent>
</Card>
```

**Option 2: Bannière colorée**
```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
  <h3 className="text-xl font-bold mb-2">
    Rejoignez notre communauté!
  </h3>
  <p className="mb-4">
    Échangez, partagez, et connectez avec les membres
  </p>
  <div className="flex gap-3">
    <Button variant="secondary">
      <Facebook /> Facebook
    </Button>
    <Button variant="secondary">
      <MessageCircle /> Discord
    </Button>
  </div>
</div>
```

---

## ⚠️ Cas Limites & Edge Cases

### Cas 1: Utilisateur sans objets
**Comportement:** Afficher message "Aucun objet partagé pour le moment"
**UI:** Empty state avec illustration

### Cas 2: Utilisateur supprimé/inexistant
**Comportement:** Afficher page 404 "Utilisateur introuvable"
**Redirect:** Optionnel vers Browse après 3 secondes

### Cas 3: URLs socials non configurées
**Comportement:** Masquer la section complètement
**Validation:** Vérifier `if (!FACEBOOK_URL && !DISCORD_URL) return null;`

### Cas 4: Profil admin
**Comportement:** Afficher badge "Administrateur" distinct
**Style:** Badge coloré (variant="destructive" ou custom)

### Cas 5: Voir son propre profil
**Comportement:** Afficher tous les items (y compris UNAVAILABLE)
**Indication:** Message "Votre profil (seuls vous voyez les items indisponibles)"

### Cas 6: Utilisateur PENDING (non approuvé)
**Comportement:** Profil accessible mais message "En attente d'approbation"
**Items:** Aucun item visible

---

## ✅ Critères d'Acceptation

### Acceptance Tests

**Test 1: Accès au profil depuis ItemCard**
- [ ] Cliquer sur nom propriétaire dans Browse → navigation vers `/user/:id`
- [ ] Page charge avec tous les items de l'utilisateur
- [ ] Statistiques affichées correctement

**Test 2: Profil avec objets multiples**
- [ ] Grille d'items responsive (3 cols → 2 → 1)
- [ ] Items AVAILABLE et BORROWED visibles
- [ ] Items UNAVAILABLE cachés (sauf pour le propriétaire)

**Test 3: Section réseaux sociaux**
- [ ] Section visible si URLs configurées
- [ ] Boutons Facebook et Discord cliquables
- [ ] Liens s'ouvrent dans nouvel onglet
- [ ] Section masquée si URLs vides

**Test 4: Statistiques précises**
- [ ] Nombre total d'objets correct
- [ ] Nombre d'objets disponibles correct
- [ ] Nombre d'objets empruntés correct

**Test 5: Lien "Mon profil" dans Header**
- [ ] Lien visible dans menu utilisateur
- [ ] Navigation vers son propre profil fonctionne
- [ ] Items UNAVAILABLE visibles sur son propre profil

**Test 6: Profil utilisateur inexistant**
- [ ] Affiche page 404
- [ ] Message d'erreur clair
- [ ] Navigation retour possible

---

## 📊 Impact & Métriques

### Métriques de Succès
- **Engagement profils:** 30% des visiteurs explorent au moins 1 profil dans le premier mois
- **Conversion socials:** 15% des visiteurs cliquent sur Facebook ou Discord
- **Découverte items:** +25% de vues d'items via navigation de profils
- **Temps sur site:** +20% grâce à la navigation inter-profils

### Impact Utilisateurs
- **Découvrabilité:** Facilite la découverte d'objets par propriétaire
- **Confiance:** Transparence accrue avec profils publics
- **Communauté:** Renforce le lien social via Facebook/Discord
- **Engagement:** Encourage l'exploration du catalogue

---

## 🚀 Implémentation

### Phase 1: Backend (2h)
1. Créer `users.controller.ts` avec endpoint `/users/:id`
2. Ajouter route dans `users.routes.ts`
3. Implémenter logique de statistiques
4. Filtrage des items selon visibilité
5. Tests unitaires

### Phase 2: Frontend - Structure (2h)
1. Créer page `UserProfile.tsx`
2. Créer composants `ProfileHeader`, `ProfileStats`
3. Intégrer grille d'items (réutiliser ItemCard)
4. Service API `getUserProfile()`
5. Route dans `App.tsx`

### Phase 3: Frontend - Socials (1h)
1. Créer composant `SocialLinks.tsx`
2. Ajouter variables d'env (Facebook, Discord URLs)
3. Intégrer dans UserProfile
4. Styles et icônes (lucide-react)

### Phase 4: Navigation (1h)
1. Ajouter liens dans ItemCard
2. Ajouter "Mon profil" dans Header
3. Liens dans BorrowRequest cards
4. Tests de navigation

### Phase 5: Testing & Polish (1h)
1. Tests des 6 scénarios d'acceptance
2. Tests edge cases
3. Responsive design
4. Optimisation performance

### Total Estimé: 6-7 heures

---

## 🔗 Dépendances

### Dépendances Externes
- **lucide-react:** Icônes Facebook, MessageCircle, User (déjà installé)
- **Variables d'environnement:** URLs Facebook et Discord

### Dépendances Internes
- **PRD-004 (Borrower tracking):** Liens vers profils emprunteurs
- Composants shadcn-ui: Card, Button, Badge, Skeleton

### Bloquants
- Aucun

---

## 🔐 Sécurité & Confidentialité

### Considérations
1. **Email:** Ne pas afficher l'email complet (ou masquer partiellement)
2. **Rate Limiting:** Limiter requêtes API pour éviter scraping
3. **CORS:** Vérifier que endpoints publics sont sécurisés
4. **Validation:** Valider UUID dans `:id` param

### Données Publiques vs Privées

**Public:**
- ✅ Nom d'utilisateur
- ✅ Date d'inscription (année/mois)
- ✅ Nombre d'objets
- ✅ Liste des items AVAILABLE/BORROWED
- ✅ Rôle (USER/ADMIN)

**Privé:**
- ❌ Email complet (masquer ou exclure)
- ❌ Items UNAVAILABLE (sauf pour le propriétaire)
- ❌ Historique des emprunts (hors scope)

---

## 📝 Notes & Questions Ouvertes

### Questions
1. **Q:** Faut-il permettre aux utilisateurs de personnaliser leur profil (bio, photo)?
   **R:** Hors scope v1, envisager pour v2

2. **Q:** Faut-il une section "Avis/Notes" sur les profils?
   **R:** Hors scope, nécessite système de rating (PRD séparé)

3. **Q:** URLs socials hardcodées ou configurables par admin?
   **R:** Variables d'env pour v1, interface admin pour v2

4. **Q:** Faut-il afficher les statistiques d'emprunt (nombre de fois emprunté)?
   **R:** Nice-to-have, ajouter si temps le permet

### Nice-to-Have (v2)
- Photo de profil personnalisée (upload)
- Biographie courte (200 caractères)
- Lien vers site web personnel
- Badge "Membre actif" (gamification)
- Partage de profil sur réseaux sociaux

---

## 📚 Références

- Issue GitHub: À créer
- Design Figma: N/A (utiliser composants existants)
- Documentation API: `/docs/api.md` (à mettre à jour)
- URLs Socials: À configurer dans `.env`

---

**Changelog:**
- 2026-01-18: Version initiale (v1.0)
