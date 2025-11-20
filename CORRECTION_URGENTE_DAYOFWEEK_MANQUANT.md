# Correction URGENTE: Champ dayOfWeek Manquant

## Problème Identifié

**ERREUR PRINCIPALE** : Le champ `dayOfWeek` était **manquant** dans les mutations de création des créneaux de disponibilité.

### Contexte de l'Erreur
- **Schéma Drizzle** : `availabilitySlots.dayOfWeek` est défini comme `NOT NULL`
- **Code Client** : `createSlotMutation.mutateAsync()` n'incluait **PAS** ce champ
- **Résultat** : Erreur de contrainte NOT NULL violée lors de l'insertion en base

### Symptômes
```
Error: Cannot create availability slot: NOT NULL constraint failed
ou
Error: dayOfWeek is required but not provided
```

## Correction Appliquée

### 1. **Client - AvailabilityManagement.tsx**
```typescript
// AVANT (Manquant) :
createSlotMutation.mutateAsync({
  practitionerId: currentPractitionerId,
  startTime: startDateTime.toISOString(),
  endTime: endDateTime.toISOString(),
  // ❌ dayOfWeek manquant !
});

// APRÈS (Corrigé) :
createSlotMutation.mutateAsync({
  practitionerId: currentPractitionerId,
  dayOfWeek: new Date(slotData.date).getDay(), // ✅ Ajouté
  startTime: startDateTime.toISOString(),
  endTime: endDateTime.toISOString(),
  capacity: 1,
  isActive: true,
  notes: slotData.consultationType || undefined,
});
```

### 2. **Schémas Zod - zodSchemas.ts**
```typescript
// AVANT (Incomplet) :
export const createAvailabilitySlotSchema = z.object({
  practitionerId: z.number().int().positive(),
  startTime: z.string().datetime(),
  // ❌ dayOfWeek manquant !
});

// APRÈS (Complet) :
export const createAvailabilitySlotSchema = z.object({
  practitionerId: z.number().int().positive(),
  dayOfWeek: z.number().int().min(0).max(6), // ✅ Ajouté
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  capacity: z.number().int().positive().default(1).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
});
```

## Détails Techniques

### Calcul du DayOfWeek
```typescript
new Date(slotData.date).getDay()
// Retourne : 0=dimanche, 1=lundi, 2=mardi, ..., 6=samedi
```

### Contrainte Base de Données
```sql
dayOfWeek integer NOT NULL
-- Valeurs autorisées : 0-6
-- Valeur par défaut : NONE (pas de valeur par défaut)
```

## Validation

### Tests Requis
1. **Créer un créneau simple** → Vérifier insertion réussie
2. **Créer des créneaux récurrents** → Vérifier toutes insertions
3. **Vérifier logs serveur** → Aucune erreur NOT NULL
4. **Vérifier base de données** → Champs dayOfWeek populés

### Fichiers Modifiés
- ✅ `client/src/components/admin/AvailabilityManagement.tsx` - Ajout dayOfWeek
- ✅ `shared/zodSchemas.ts` - Ajout dayOfWeek aux schémas

## Impact
- **Criticité** : 🚨 CRITIQUE - Fonctionnalité complètement cassée
- **Résolution** : ✅ CORRIGÉ - dayOfWeek maintenant inclus
- **Test** : 📋 REQUIS - Vérifier la création de créneaux

La création des créneaux de disponibilité devrait maintenant fonctionner correctement.