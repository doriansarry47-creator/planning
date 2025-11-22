import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

interface Specialty {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

export default function SpecialtiesManagement() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/trpc/admin.getSpecialties');
      if (response.ok) {
        const data = await response.json();
        setSpecialties(data.result?.data?.json || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des spécialités:', error);
      toast.error('Impossible de charger les spécialités');
    } finally {
      setIsLoading(false);
    }
  };

  const createSpecialty = async () => {
    if (!newSpecialty.name.trim()) {
      toast.error('Le nom de la spécialité est requis');
      return;
    }

    try {
      const response = await fetch('/trpc/admin.createSpecialty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            name: newSpecialty.name,
            description: newSpecialty.description || undefined,
          }
        }),
      });

      if (response.ok) {
        toast.success('Spécialité créée avec succès');
        setIsDialogOpen(false);
        setNewSpecialty({ name: '', description: '' });
        fetchSpecialties();
      } else {
        toast.error('Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création');
    }
  };

  const deleteSpecialty = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette spécialité ?')) {
      return;
    }

    try {
      const response = await fetch('/trpc/admin.deleteSpecialty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: { id }
        }),
      });

      if (response.ok) {
        toast.success('Spécialité supprimée');
        fetchSpecialties();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Gestion des spécialités médicales
            </CardTitle>
            <CardDescription>
              Ajoutez, modifiez ou supprimez les spécialités médicales disponibles
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une spécialité
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle spécialité</DialogTitle>
                <DialogDescription>
                  Ajoutez une nouvelle spécialité médicale au système
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la spécialité *</Label>
                  <Input
                    id="name"
                    value={newSpecialty.name}
                    onChange={(e) => setNewSpecialty({ ...newSpecialty, name: e.target.value })}
                    placeholder="Ex: Psychothérapie"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSpecialty.description}
                    onChange={(e) => setNewSpecialty({ ...newSpecialty, description: e.target.value })}
                    placeholder="Description de la spécialité..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={createSpecialty}>
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Aucune spécialité trouvée
                  </TableCell>
                </TableRow>
              ) : (
                specialties.map((specialty) => (
                  <TableRow key={specialty.id}>
                    <TableCell className="font-medium">{specialty.name}</TableCell>
                    <TableCell className="max-w-md">
                      {specialty.description || <span className="text-muted-foreground italic">Aucune description</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteSpecialty(specialty.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
