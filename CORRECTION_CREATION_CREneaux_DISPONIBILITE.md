# Correction Erreur Création Créneaux de Disponibilité

## Problème Identifié

L'erreur lors de la création des créneaux de disponibilité était due à plusieurs incohérences dans le code :

### 1. Types de Données Incohérents
- **Schéma Zod** : Utilisait `datetime()` pour `startTime` et `endTime`
- **Schéma Drizzle** : Utilisait `time()` pour les mêmes champs
- **Résultat** : Conflits de types lors des opérations en base

### 2. Colonnes Manquantes
- Les schémas Zod incluaient `capacity` et `notes`
- Le schéma Drizzle ne contenait pas ces colonnes
- **Résultat** : Erreurs lors de l'insertion en base

### 3. Variables Non Utilisées
- Variables `adminProcedure` et `ctx` déclarées mais non utilisées dans le router
- **Résultat** : Avertissements TypeScript

### 4. Erreur "Property 'where' does not exist"
- Utilisation incorrecte de `.where()` en chaîne sur les requêtes Drizzle
- **Résultat** : Erreurs d'exécution

## Corrections Appliquées

### 1. **Schema Drizzle** (`drizzle/schema.ts`)
```typescript
// Avant :
startTime: time("startTime").notNull(),
endTime: time("endTime").notNull(),

// Après :
startTime: timestamp("startTime").notNull(),
endTime: timestamp("endTime").notNull(),
capacity: integer("capacity").default(1).notNull(),
notes: text("notes"),
```

### 2. **Router tRPC** (`server/availabilitySlotsRouter.ts`)
```typescript
// Avant :
import { protectedProcedure, router, adminProcedure, practitionerProcedure } from "./_core/trpc";
.mutation(async ({ input, ctx }) => {

// Après :
import { protectedProcedure, router, practitionerProcedure } from "./_core/trpc";
.mutation(async ({ input }) => {
```

### 3. **Fonction Base de Données** (`server/db.ts`)
```typescript
// Avant (problématique) :
let query = db.select().from(availabilitySlots).where(eq(...));
query = query.where(and(...)); // ❌ Erreur

// Après (correct) :
const conditions = [eq(...), and(...)]; // ✅ Correct
const result = await db.select().from(availabilitySlots).where(and(...conditions));
```

### 4. **Migration SQL**
Fichier `add_availability_columns.sql` créé pour ajouter les colonnes manquantes :
```sql
ALTER TABLE availabilitySlots 
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 1 NOT NULL,
ADD COLUMN IF NOT EXISTS notes TEXT;
```

## Fichiers Modifiés

1. **<filepath>drizzle/schema.ts</filepath>** - Ajout colonnes capacity et notes, correction types startTime/endTime
2. **<filepath>server/availabilitySlotsRouter.ts</filepath>** - Suppression variables non utilisées, correction paramètres
3. **<filepath>server/db.ts</filepath>** - Correction requête getPractitionerSlots
4. **<filepath>add_availability_columns.sql</filepath>** - Migration pour colonnes manquantes

## Résolution

Ces corrections garantissent :
- ✅ Cohérence entre schémas Zod et Drizzle
- ✅ Types corrects pour les opérations en base
- ✅ Colonnes manquantes disponibles
- ✅ Requêtes de base fonctionnelles
- ✅ Suppression des avertissements TypeScript

La création des créneaux de disponibilité devrait maintenant fonctionner sans erreur.