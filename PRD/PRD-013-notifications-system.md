# PRD-013: Système de Notifications en Temps Réel

**Version:** 1.0
**Date:** 2026-01-18
**Auteur:** FriendShare Hub Team
**Statut:** Draft

---

## 📋 Résumé Exécutif

Implémenter un système de notifications en temps réel avec badge visuel dans le header pour alerter les utilisateurs des événements importants (nouvelles demandes d'emprunt, réponses aux demandes générales, approbations/rejets, messages administratifs).

---

## 🎯 Contexte & Problème

### Situation Actuelle
- Système d'emails existe en backend (`email.service.ts`) mais aucune notification visuelle en frontend
- Les utilisateurs doivent vérifier manuellement la page Requests pour voir les nouvelles demandes
- Aucune indication visuelle qu'une action requiert leur attention
- Pas de centre de notifications centralisé
- Mauvaise réactivité aux événements importants

### Problèmes Identifiés
1. **Manque de réactivité:** Les utilisateurs ne savent pas quand quelqu'un demande à emprunter leur objet
2. **Friction:** Nécessite de naviguer manuellement pour découvrir les nouveautés
3. **Perte d'engagement:** Demandes en attente non traitées par manque de visibilité
4. **Dépendance aux emails:** Les emails peuvent être filtrés/ignorés
5. **Absence de feedback:** Pas de confirmation visuelle des actions importantes

---

## 🎯 Objectifs

### Objectifs Primaires
- ✅ Afficher un badge de notifications non lues dans le header
- ✅ Créer une page/panneau de notifications centralisé
- ✅ Notifier en temps réel les événements clés (demandes, approbations, réponses)
- ✅ Permettre de marquer les notifications comme lues
- ✅ Afficher le nombre de notifications non lues

### Objectifs Secondaires
- ✅ Améliorer l'engagement utilisateur
- ✅ Réduire le temps de réponse aux demandes
- ✅ Réduire la dépendance aux emails
- ✅ Fournir un historique des notifications

### Non-Objectifs (Hors Scope)
- ❌ Push notifications navigateur (Web Push API) - v2
- ❌ Notifications mobiles (PWA) - v2
- ❌ Paramètres de préférences de notifications - v2
- ❌ Notifications en temps réel via WebSockets - v1 (polling suffisant)
- ❌ Groupement intelligent de notifications - v2

---

## 👥 User Stories

### US-1: Voir les notifications non lues
**En tant que** utilisateur connecté
**Je veux** voir un badge avec le nombre de notifications non lues
**Afin de** savoir rapidement si j'ai des actions en attente

**Critères d'acceptation:**
- [ ] Badge rouge avec chiffre visible dans le header
- [ ] Badge visible uniquement si notifications non lues > 0
- [ ] Badge mis à jour en temps réel (polling 30s)
- [ ] Clic sur badge ouvre le panneau de notifications

### US-2: Consulter mes notifications
**En tant que** utilisateur
**Je veux** voir la liste de toutes mes notifications récentes
**Afin de** comprendre ce qui s'est passé pendant mon absence

**Critères d'acceptation:**
- [ ] Page/panneau listant toutes les notifications (max 50)
- [ ] Notifications triées par date (plus récente en premier)
- [ ] Distinction visuelle entre lues et non lues
- [ ] Icône contextuelle par type de notification
- [ ] Timestamp relatif (il y a 2h, hier, etc.)

### US-3: Marquer comme lu
**En tant que** utilisateur
**Je veux** marquer des notifications comme lues
**Afin de** ne plus être alerté pour des événements déjà traités

**Critères d'acceptation:**
- [ ] Clic sur une notification la marque automatiquement comme lue
- [ ] Bouton "Tout marquer comme lu" en haut de la liste
- [ ] Badge diminue immédiatement après marquage
- [ ] Notifications lues affichées en gris/opacité réduite

### US-4: Être notifié des événements clés
**En tant que** propriétaire d'objet
**Je veux** recevoir une notification quand quelqu'un demande à emprunter
**Afin de** pouvoir réagir rapidement

**Critères d'acceptation:**
- [ ] Nouvelle demande d'emprunt → notification créée
- [ ] Approbation/rejet de ma demande → notification créée
- [ ] Réponse à ma demande générale → notification créée
- [ ] Message admin → notification créée
- [ ] Badge incrémenté immédiatement

### US-5: Accès rapide depuis notification
**En tant que** utilisateur
**Je veux** pouvoir cliquer sur une notification pour accéder à l'objet/demande concernée
**Afin de** traiter rapidement l'action requise

**Critères d'acceptation:**
- [ ] Clic sur notification → navigation vers page appropriée
- [ ] Notification sur demande → page Requests (onglet entrant)
- [ ] Notification sur objet → page Browse/détails objet
- [ ] Notification sur réponse générale → page GeneralRequests

---

## 🔧 Spécifications Fonctionnelles

### Feature 1: Modèle de Données Notification

**Attributs:**
```typescript
Notification {
  id: string (UUID)
  userId: string (destinataire)
  type: NotificationType
  title: string (max 100 chars)
  message: string (max 500 chars)
  read: boolean (default: false)
  linkType: 'item' | 'request' | 'generalRequest' | 'none'
  linkId: string | null (ID de l'objet/demande)
  createdAt: DateTime
}

enum NotificationType {
  BORROW_REQUEST_RECEIVED  // Quelqu'un demande à emprunter votre objet
  BORROW_REQUEST_APPROVED  // Votre demande a été approuvée
  BORROW_REQUEST_REJECTED  // Votre demande a été rejetée
  BORROW_COMPLETED         // Un emprunt a été marqué comme complété
  GENERAL_REQUEST_RESPONSE // Quelqu'un a répondu à votre demande générale
  ITEM_AVAILABLE          // Un objet qui vous intéresse est à nouveau disponible (v2)
  ADMIN_MESSAGE           // Message de l'administrateur
}
```

### Feature 2: Badge de Notifications (Header)

**Emplacement:** À côté du menu utilisateur dans le header

**Comportement:**
- Affiche un badge rouge avec le nombre de notifications non lues
- Badge caché si count = 0
- Clic ouvre un dropdown/panneau ou redirige vers `/notifications`
- Polling toutes les 30 secondes pour récupérer le count

**Design:**
```tsx
<Button variant="ghost" onClick={() => setShowNotifications(!showNotifications)}>
  <Bell className="h-5 w-5" />
  {unreadCount > 0 && (
    <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center bg-red-500">
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  )}
</Button>
```

### Feature 3: Panneau de Notifications

**Option A: Dropdown dans Header (recommandé pour v1)**
- Dropdown (Sheet ou Popover) qui s'ouvre au clic sur le badge
- Affiche les 10 dernières notifications
- Bouton "Voir tout" redirige vers `/notifications`
- Hauteur max avec scroll

**Option B: Page dédiée `/notifications`**
- Page complète listant toutes les notifications (50 max)
- Pagination si > 50
- Filtres: Toutes / Non lues / Par type

**Recommandation:** Implémenter les deux
- Dropdown pour accès rapide
- Page pour historique complet

### Feature 4: Création Automatique de Notifications

**Événements déclencheurs:**

1. **Nouvelle demande d'emprunt reçue**
   - Trigger: `POST /api/requests`
   - Destinataire: Propriétaire de l'objet
   - Type: `BORROW_REQUEST_RECEIVED`
   - Message: "Jean Dupont souhaite emprunter votre Perceuse"
   - Link: `/requests?tab=incoming`

2. **Demande approuvée**
   - Trigger: `PUT /api/requests/:id/approve`
   - Destinataire: Emprunteur
   - Type: `BORROW_REQUEST_APPROVED`
   - Message: "Votre demande pour Perceuse a été approuvée par Marie"
   - Link: `/requests?tab=outgoing`

3. **Demande rejetée**
   - Trigger: `PUT /api/requests/:id/reject`
   - Destinataire: Emprunteur
   - Type: `BORROW_REQUEST_REJECTED`
   - Message: "Votre demande pour Perceuse a été refusée"
   - Link: `/requests?tab=outgoing`

4. **Emprunt complété**
   - Trigger: `PUT /api/requests/:id/complete`
   - Destinataires: Propriétaire ET Emprunteur
   - Type: `BORROW_COMPLETED`
   - Message: "L'emprunt de Perceuse a été marqué comme terminé"

5. **Réponse à demande générale**
   - Trigger: `POST /api/generalRequests/:id/respond`
   - Destinataire: Auteur de la demande générale
   - Type: `GENERAL_REQUEST_RESPONSE`
   - Message: "Jean a répondu à votre demande: Vélo de route"
   - Link: `/general-requests`

### Feature 5: Marquage comme Lu

**Méthodes:**
- **Automatique:** Clic sur une notification la marque comme lue
- **Manuel:** Bouton "Marquer comme lu" sur chaque notification
- **Bulk:** Bouton "Tout marquer comme lu"

**Logique:**
- `PUT /api/notifications/:id/read`
- `PUT /api/notifications/read-all`

---

## 🏗️ Spécifications Techniques

### Backend Changes

#### 1. Nouveau Modèle Prisma: `Notification`

**Fichier:** `backend/prisma/schema.prisma`

```prisma
model Notification {
  id        String           @id @default(uuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  type      NotificationType
  title     String           @db.VarChar(100)
  message   String           @db.VarChar(500)
  read      Boolean          @default(false)

  linkType  String?          // 'item' | 'request' | 'generalRequest' | 'none'
  linkId    String?

  createdAt DateTime         @default(now())

  @@index([userId, read])
  @@index([userId, createdAt])
}

enum NotificationType {
  BORROW_REQUEST_RECEIVED
  BORROW_REQUEST_APPROVED
  BORROW_REQUEST_REJECTED
  BORROW_COMPLETED
  GENERAL_REQUEST_RESPONSE
  ADMIN_MESSAGE
}

// Ajouter relation dans User model
model User {
  // ... existing fields
  notifications Notification[]
}
```

**Migration:**
```bash
npx prisma migrate dev --name add-notifications
```

#### 2. Nouveau Service: `notification.service.ts`

**Fichier:** `backend/src/services/notification.service.ts`

```typescript
import { prisma } from '@/config/database';
import { NotificationType } from '@prisma/client';

interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkType?: 'item' | 'request' | 'generalRequest' | 'none';
  linkId?: string;
}

export const createNotification = async (dto: CreateNotificationDto) => {
  return await prisma.notification.create({
    data: dto
  });
};

export const getUserNotifications = async (userId: string, limit = 50) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return await prisma.notification.count({
    where: { userId, read: false }
  });
};

export const markAsRead = async (notificationId: string, userId: string) => {
  return await prisma.notification.update({
    where: { id: notificationId, userId }, // Sécurité: vérifier ownership
    data: { read: true }
  });
};

export const markAllAsRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  });
};
```

#### 3. Nouveau Controller: `notifications.controller.ts`

```typescript
export const getNotifications = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const limit = parseInt(req.query.limit as string) || 50;

  const notifications = await getUserNotifications(userId, limit);
  res.json(notifications);
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const count = await getUnreadCount(userId);
  res.json({ count });
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  await markAsRead(id, userId);
  res.json({ success: true });
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await markAllAsRead(userId);
  res.json({ success: true });
};
```

#### 4. Nouvelles Routes: `notifications.routes.ts`

```typescript
import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import * as notificationsController from '@/controllers/notifications.controller';

const router = Router();

router.use(authenticate); // Toutes les routes nécessitent authentification

router.get('/', notificationsController.getNotifications);
router.get('/unread-count', notificationsController.getUnreadCount);
router.put('/:id/read', notificationsController.markNotificationAsRead);
router.put('/read-all', notificationsController.markAllNotificationsAsRead);

export default router;
```

#### 5. Intégration dans les Controllers Existants

**`requests.controller.ts` - Créer notification à la création de demande:**

```typescript
export const createRequest = async (req: Request, res: Response) => {
  // ... logique existante

  const request = await prisma.borrowRequest.create({ /* ... */ });

  // NOUVEAU: Créer notification pour le propriétaire
  await createNotification({
    userId: item.ownerId,
    type: 'BORROW_REQUEST_RECEIVED',
    title: 'Nouvelle demande d\'emprunt',
    message: `${req.user.name} souhaite emprunter votre ${item.title}`,
    linkType: 'request',
    linkId: request.id
  });

  res.status(201).json(request);
};
```

**`requests.controller.ts` - Notification lors approbation:**

```typescript
export const approveRequest = async (req: Request, res: Response) => {
  // ... logique existante

  await createNotification({
    userId: request.borrowerId,
    type: 'BORROW_REQUEST_APPROVED',
    title: 'Demande approuvée',
    message: `Votre demande pour ${item.title} a été approuvée`,
    linkType: 'request',
    linkId: request.id
  });

  res.json(updatedRequest);
};
```

**Similaire pour reject, complete, et generalRequests responses.**

### Frontend Changes

#### 1. Nouveau Hook: `useNotifications.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/services/api';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: api.getNotifications,
    refetchInterval: 30000 // Polling toutes les 30 secondes
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: api.getUnreadCount,
    refetchInterval: 30000
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    }
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    }
  });
};
```

#### 2. Composant: `NotificationBadge.tsx` (Header)

```tsx
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUnreadCount } from '@/hooks/useNotifications';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NotificationsList from './NotificationsList';

export default function NotificationBadge() {
  const { data } = useUnreadCount();
  const unreadCount = data?.count || 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative" size="icon">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <NotificationsList />
      </SheetContent>
    </Sheet>
  );
}
```

#### 3. Composant: `NotificationsList.tsx`

```tsx
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotificationItem from './NotificationItem';

export default function NotificationsList() {
  const { data: notifications, isLoading } = useNotifications();
  const markAllAsRead = useMarkAllAsRead();

  if (isLoading) return <div>Chargement...</div>;

  const hasUnread = notifications?.some(n => !n.read);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
          >
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        {notifications?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucune notification
          </p>
        ) : (
          <div className="space-y-2">
            {notifications?.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
```

#### 4. Composant: `NotificationItem.tsx`

```tsx
import { useNavigate } from 'react-router-dom';
import { useMarkAsRead } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ShoppingBag,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const ICON_MAP = {
  BORROW_REQUEST_RECEIVED: ShoppingBag,
  BORROW_REQUEST_APPROVED: CheckCircle,
  BORROW_REQUEST_REJECTED: XCircle,
  BORROW_COMPLETED: CheckCircle,
  GENERAL_REQUEST_RESPONSE: MessageSquare,
  ADMIN_MESSAGE: AlertCircle
};

export default function NotificationItem({ notification }) {
  const navigate = useNavigate();
  const markAsRead = useMarkAsRead();
  const Icon = ICON_MAP[notification.type];

  const handleClick = () => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }

    // Navigation selon linkType
    if (notification.linkType === 'request') {
      navigate('/requests');
    } else if (notification.linkType === 'item') {
      navigate(`/browse`); // ou item detail
    } else if (notification.linkType === 'generalRequest') {
      navigate('/general-requests');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors',
        !notification.read && 'bg-blue-50 border-l-4 border-blue-500'
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn(
          'h-5 w-5 flex-shrink-0 mt-0.5',
          notification.read ? 'text-muted-foreground' : 'text-blue-600'
        )} />
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium text-sm',
            notification.read && 'text-muted-foreground'
          )}>
            {notification.title}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: fr
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 5. Service API: `api.ts`

```typescript
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/notifications');
  return response.data;
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.put('/notifications/read-all');
};
```

#### 6. Intégration dans Header: `Header.tsx`

```tsx
import NotificationBadge from '@/components/NotificationBadge';

export default function Header() {
  return (
    <header>
      {/* ... existing content */}

      {user && (
        <>
          <NotificationBadge />
          <DropdownMenu>
            {/* ... user menu */}
          </DropdownMenu>
        </>
      )}
    </header>
  );
}
```

#### 7. Page Dédiée (Optionnel): `Notifications.tsx`

```tsx
import NotificationsList from '@/components/NotificationsList';

export default function NotificationsPage() {
  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <NotificationsList />
    </div>
  );
}
```

---

## 🎨 UI/UX Specifications

### Header avec Badge

```
┌────────────────────────────────────────────┐
│ FriendShare  [Browse] [Mes Objets] [🔔3] [@]│
└────────────────────────────────────────────┘
                                         ↑
                                    Badge rouge
```

### Dropdown Notifications (Sheet)

```
┌────────────────────────────────────┐
│ Notifications  [Tout marquer lu]   │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ 🛍️  Nouvelle demande d'emprunt  │ │
│ │     Jean veut emprunter...     │ │
│ │     il y a 5 minutes           │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ✅  Demande approuvée           │ │
│ │     Votre demande pour...      │ │
│ │     il y a 2 heures            │ │
│ └────────────────────────────────┘ │
│                                    │
│ [Voir tout]                        │
└────────────────────────────────────┘
```

---

## ⚠️ Cas Limites & Edge Cases

### Cas 1: Plus de 99 notifications non lues
**Comportement:** Afficher "99+" dans le badge
**Raison:** Éviter l'overflow visuel

### Cas 2: Notification liée à un objet supprimé
**Comportement:** Afficher notification mais désactiver le lien
**Message:** "Cet objet n'est plus disponible"

### Cas 3: Utilisateur supprimé (auteur de la demande)
**Comportement:** Afficher "[Utilisateur supprimé]" dans le message
**Lien:** Désactivé

### Cas 4: Polling échoue (réseau coupé)
**Comportement:** Continuer le polling silencieusement
**Fallback:** Réessayer toutes les 30s

### Cas 5: 0 notifications
**Comportement:** Badge caché, panneau affiche "Aucune notification"
**UX:** Empty state avec illustration

### Cas 6: Plusieurs notifications du même type
**Comportement v1:** Afficher séparément
**Amélioration v2:** Grouper ("3 nouvelles demandes")

---

## ✅ Critères d'Acceptation

### Acceptance Tests

**Test 1: Badge de notifications**
- [ ] Badge visible uniquement si unreadCount > 0
- [ ] Nombre correct affiché (3, 15, 99+)
- [ ] Clic ouvre le panneau de notifications
- [ ] Badge mis à jour automatiquement (polling 30s)

**Test 2: Création de notification - Nouvelle demande**
- [ ] Utilisateur A demande objet de B
- [ ] B reçoit notification immédiatement
- [ ] Badge de B incrémenté
- [ ] Message correct: "A souhaite emprunter [objet]"

**Test 3: Marquer comme lu**
- [ ] Clic sur notification la marque comme lue
- [ ] Badge décrementé immédiatement
- [ ] Notification affichée en gris
- [ ] Requête API réussie

**Test 4: Tout marquer comme lu**
- [ ] Clic sur bouton marque toutes comme lues
- [ ] Badge passe à 0
- [ ] Toutes les notifications deviennent grises
- [ ] Requête API réussie

**Test 5: Navigation depuis notification**
- [ ] Clic sur notification de demande → page Requests
- [ ] Clic sur notification de réponse générale → page GeneralRequests
- [ ] Navigation fonctionne correctement

**Test 6: Polling automatique**
- [ ] Créer notification manuellement en DB
- [ ] Attendre max 30 secondes
- [ ] Badge mis à jour automatiquement
- [ ] Pas besoin de rafraîchir la page

---

## 📊 Impact & Métriques

### Métriques de Succès
- **Réactivité:** Temps moyen de réponse aux demandes < 4 heures (vs 24h avant)
- **Engagement:** +40% d'utilisateurs actifs quotidiennement
- **Conversion:** +25% de demandes traitées (approuvées ou rejetées)
- **Rétention:** +15% d'utilisateurs revenant dans les 7 jours

### Impact Utilisateurs
- **Propriétaires:** Notification immédiate des demandes, meilleur taux de réponse
- **Emprunteurs:** Feedback rapide sur leurs demandes
- **Communauté:** Communication plus fluide, confiance accrue

---

## 🚀 Implémentation

### Phase 1: Backend - Base (2h)
1. Créer modèle Prisma Notification
2. Migration de la base de données
3. Service notification.service.ts
4. Controller notifications.controller.ts
5. Routes notifications.routes.ts

### Phase 2: Backend - Intégrations (1.5h)
1. Modifier requests.controller.ts (create, approve, reject, complete)
2. Modifier generalRequests.controller.ts (respond)
3. Tests unitaires

### Phase 3: Frontend - Badge (1.5h)
1. Service API notifications
2. Hook useNotifications
3. Composant NotificationBadge
4. Intégration dans Header

### Phase 4: Frontend - Liste (2h)
1. Composant NotificationsList
2. Composant NotificationItem
3. Gestion du marquage comme lu
4. Styles et icônes

### Phase 5: Testing (1h)
1. Tests manuels des 6 scénarios
2. Tests de polling
3. Tests de navigation
4. Tests edge cases

### Total Estimé: 7-8 heures

---

## 🔗 Dépendances

### Dépendances Externes
- **date-fns:** Formatage des dates relatives (déjà installé)
- **lucide-react:** Icônes (déjà installé)

### Dépendances Internes
- **Composants shadcn-ui:** Badge, Sheet, ScrollArea, Button
- **React Query:** Polling et cache management

### Améliorations Futures (v2)
- **Web Push API:** Notifications navigateur même app fermée
- **WebSockets:** Notifications en temps réel sans polling
- **Service Worker:** Notifications PWA

---

## 🔐 Sécurité

### Considérations
1. **Ownership:** Vérifier userId dans toutes les requêtes
2. **Rate Limiting:** Limiter `/unread-count` pour éviter spam
3. **XSS:** Sanitiser title et message si contenus dynamiques
4. **Cascade Delete:** Supprimer notifications si utilisateur supprimé

### Index Database
```prisma
@@index([userId, read])        // Pour requêtes unread count
@@index([userId, createdAt])   // Pour tri par date
```

---

## 📝 Notes & Questions Ouvertes

### Questions
1. **Q:** Faut-il une limite de temps de rétention des notifications?
   **R:** v2 - Archiver/supprimer après 30 jours

2. **Q:** Faut-il permettre de désactiver certains types de notifications?
   **R:** v2 - Paramètres de préférences

3. **Q:** Faut-il un son/vibration lors de nouvelle notification?
   **R:** Hors scope v1, envisager avec Web Push API

4. **Q:** Groupement de notifications similaires?
   **R:** Nice-to-have v2 ("3 nouvelles demandes")

### Nice-to-Have (v2)
- Web Push Notifications
- Paramètres de préférences (activer/désactiver par type)
- Notifications groupées ("5 nouvelles demandes")
- Recherche dans notifications
- Filtres par type
- Dark mode pour panneau notifications

---

## 📚 Références

- Issue GitHub: À créer
- Web Push API: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- Design Figma: N/A (utiliser composants existants)
- Documentation API: `/docs/api.md` (à mettre à jour)

---

**Changelog:**
- 2026-01-18: Version initiale (v1.0)
