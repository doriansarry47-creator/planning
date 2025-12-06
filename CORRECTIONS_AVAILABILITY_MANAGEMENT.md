# Corrections pour AvailabilityManagement.tsx

## Code à ajouter au début du composant

```typescript
import { trpc } from '@/_core/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useEffect } from 'react';

export default function AvailabilityManagement() {
  const { user } = useAuth();
  const utils = trpc.useContext();
  
  // Supposons que le praticien est l'utilisateur connecté
  // Dans une version production, cela devrait venir d'un sélecteur ou du contexte
  const currentPractitionerId = 1; // TODO: Récupérer depuis l'utilisateur connecté ou un sélecteur
  
  // Récupérer les créneaux depuis la base de données
  const { data: slotsFromDb, isLoading, refetch } = trpc.availabilitySlots.listByPractitioner.useQuery(
    currentPractitionerId,
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
  
  // Mutations
  const createSlotMutation = trpc.availabilitySlots.create.useMutation({
    onSuccess: () => {
      utils.availabilitySlots.listByPractitioner.invalidate();
      toast.success('Créneau créé avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la création: ' + error.message);
    },
  });
  
  const updateSlotMutation = trpc.availabilitySlots.update.useMutation({
    onSuccess: () => {
      utils.availabilitySlots.listByPractitioner.invalidate();
      toast.success('Créneau mis à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour: ' + error.message);
    },
  });
  
  const deleteSlotMutation = trpc.availabilitySlots.delete.useMutation({
    onSuccess: () => {
      utils.availabilitySlots.listByPractitioner.invalidate();
      toast.success('Créneau supprimé');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression: ' + error.message);
    },
  });
  
  // État local pour l'interface (converti depuis les données DB)
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  
  // Synchroniser les données de la DB avec l'état local
  useEffect(() => {
    if (slotsFromDb && slotsFromDb.length > 0) {
      const convertedSlots = slotsFromDb.map((slot: any) => {
        const startDate = new Date(slot.startTime);
        const endDate = new Date(slot.endTime);
        
        return {
          id: slot.id,
          date: startDate.toISOString().split('T')[0],
          startTime: startDate.toTimeString().slice(0, 5),
          endTime: endDate.toTimeString().slice(0, 5),
          status: slot.isActive ? 'available' : 'cancelled',
          capacity: slot.capacity || 1,
          notes: slot.notes,
        };
      });
      
      setSlots(convertedSlots);
    }
  }, [slotsFromDb]);
  
  // ... reste du code
}
```

## Remplacer la fonction handleCreateSlots

```typescript
// ANCIENNE VERSION (à supprimer)
/*
const handleCreateSlots = async (slotsData: SlotData[]) => {
  try {
    const newSlots: TimeSlot[] = slotsData.map((slotData, index) => ({
      id: slots.length + index + 1,
      date: slotData.date,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      status: 'available',
      capacity: 1,
      consultationType: slotData.consultationType,
    }));

    setSlots(prev => [...prev, ...newSlots]);
    toast.success(`${newSlots.length} créneau(x) créé(s) avec succès`);
  } catch (error) {
    toast.error('Erreur lors de la création des créneaux');
    throw error;
  }
};
*/

// NOUVELLE VERSION (avec appel API)
const handleCreateSlots = async (slotsData: SlotData[]) => {
  try {
    setIsCreationDialogOpen(false); // Fermer le dialog
    toast.loading(`Création de ${slotsData.length} créneau(x)...`, { id: 'creating-slots' });
    
    // Créer chaque créneau dans la base de données
    await Promise.all(
      slotsData.map(async (slotData) => {
        const startDateTime = new Date(`${slotData.date}T${slotData.startTime}:00`);
        const endDateTime = new Date(`${slotData.date}T${slotData.endTime}:00`);
        
        return createSlotMutation.mutateAsync({
          practitionerId: currentPractitionerId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          capacity: 1,
          isActive: true,
          notes: slotData.consultationType || undefined,
        });
      })
    );
    
    toast.dismiss('creating-slots');
    toast.success(`${slotsData.length} créneau(x) créé(s) avec succès`);
    
    // Les données seront automatiquement rechargées via invalidate()
  } catch (error) {
    toast.dismiss('creating-slots');
    console.error('Erreur création créneaux:', error);
    toast.error('Erreur lors de la création des créneaux');
    throw error;
  }
};
```

## Remplacer la fonction handleDeleteSlot

```typescript
// ANCIENNE VERSION
/*
const handleDeleteSlot = async (slotId: number) => {
  setSlots(prev => prev.filter(s => s.id !== slotId));
  setSlotToDelete(null);
  toast.success('Créneau supprimé avec succès');
};
*/

// NOUVELLE VERSION (avec appel API)
const handleDeleteSlot = async () => {
  if (!slotToDelete) return;
  
  try {
    await deleteSlotMutation.mutateAsync(slotToDelete.id);
    setSlotToDelete(null);
    // Les données seront automatiquement rechargées via invalidate()
  } catch (error) {
    console.error('Erreur suppression:', error);
    // L'erreur est déjà affichée par la mutation
  }
};
```

## Remplacer la fonction handleEventDrop (drag & drop)

```typescript
const handleEventDrop = async ({ event, start, end }: { event: CalendarSlot; start: Date; end: Date }) => {
  try {
    const slot = slots.find(s => s.id === event.id);
    if (!slot) return;

    if (slot.status === 'booked') {
      toast.error('Impossible de déplacer un créneau réservé');
      return;
    }

    // Vérifier les conflits
    const newDate = start.toISOString().split('T')[0];
    const newStartTime = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
    const newEndTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

    const hasConflict = slots.some(s => 
      s.id !== slot.id && 
      s.date === newDate &&
      s.startTime < newEndTime && 
      s.endTime > newStartTime
    );

    if (hasConflict) {
      toast.error('Conflit détecté : un créneau existe déjà à cette période');
      return;
    }

    // NOUVELLE PARTIE: Mettre à jour dans la base de données
    const startDateTime = new Date(`${newDate}T${newStartTime}:00`);
    const endDateTime = new Date(`${newDate}T${newEndTime}:00`);
    
    await updateSlotMutation.mutateAsync({
      id: slot.id,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    });
    
    // Les données seront automatiquement rechargées via invalidate()
  } catch (error) {
    console.error('Erreur déplacement:', error);
    toast.error('Erreur lors du déplacement du créneau');
  }
};
```

## Remplacer la fonction handleEventResize

```typescript
const handleEventResize = async ({ event, start, end }: { event: CalendarSlot; start: Date; end: Date }) => {
  try {
    const slot = slots.find(s => s.id === event.id);
    if (!slot) return;

    if (slot.status === 'booked') {
      toast.error('Impossible de redimensionner un créneau réservé');
      return;
    }

    const newStartTime = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
    const newEndTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

    // Vérifier les conflits
    const hasConflict = slots.some(s => 
      s.id !== slot.id && 
      s.date === slot.date &&
      s.startTime < newEndTime && 
      s.endTime > newStartTime
    );

    if (hasConflict) {
      toast.error('Conflit détecté : un créneau existe déjà à cette période');
      return;
    }

    // NOUVELLE PARTIE: Mettre à jour dans la base de données
    const startDateTime = new Date(`${slot.date}T${newStartTime}:00`);
    const endDateTime = new Date(`${slot.date}T${newEndTime}:00`);
    
    await updateSlotMutation.mutateAsync({
      id: slot.id,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    });
    
    // Les données seront automatiquement rechargées via invalidate()
  } catch (error) {
    console.error('Erreur redimensionnement:', error);
    toast.error('Erreur lors du redimensionnement du créneau');
  }
};
```

## Ajouter un indicateur de chargement

```typescript
// Dans le JSX, au début du composant
{isLoading && (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2">Chargement des créneaux...</span>
  </div>
)}
```

## Instructions d'intégration

1. **Importer les dépendances** au début du fichier
2. **Remplacer le useState initial** par les hooks tRPC
3. **Ajouter le useEffect** pour synchroniser les données
4. **Remplacer chaque fonction** (handleCreateSlots, handleDeleteSlot, handleEventDrop, handleEventResize)
5. **Ajouter l'indicateur de chargement** dans le JSX
6. **Tester** la création, modification et suppression de créneaux

## Note importante

La variable `currentPractitionerId` doit être déterminée dynamiquement selon:
- L'utilisateur connecté (si c'est un praticien)
- Un sélecteur de praticien (si c'est un admin gérant plusieurs praticiens)

Dans une version complète, il faudrait ajouter:
```typescript
const [selectedPractitionerId, setSelectedPractitionerId] = useState<number>(1);

// Sélecteur de praticien pour les admins
{user?.role === 'admin' && (
  <Select value={selectedPractitionerId.toString()} onValueChange={(v) => setSelectedPractitionerId(Number(v))}>
    <SelectTrigger>
      <SelectValue placeholder="Sélectionner un praticien" />
    </SelectTrigger>
    <SelectContent>
      {practitioners.map(p => (
        <SelectItem key={p.id} value={p.id.toString()}>
          {p.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}
```

## Tests à effectuer après implémentation

1. ✅ Se connecter en tant qu'admin
2. ✅ Créer un créneau simple → Vérifier qu'il apparaît dans le calendrier
3. ✅ Recharger la page → Vérifier que le créneau est toujours là
4. ✅ Créer un créneau récurrent (vendredis 18h-19h) → Vérifier tous les créneaux générés
5. ✅ Déplacer un créneau par drag & drop → Vérifier la persistence
6. ✅ Redimensionner un créneau → Vérifier la persistence
7. ✅ Supprimer un créneau → Vérifier qu'il disparaît
8. ✅ Se déconnecter et reconnecter → Vérifier que les créneaux sont toujours là
