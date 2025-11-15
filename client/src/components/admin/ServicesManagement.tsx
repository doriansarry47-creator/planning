import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export function ServicesManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);
  
  const utils = trpc.useContext();
  
  // Récupérer les services
  const { data: services = [], isLoading: servicesLoading } = trpc.services.list.useQuery();
  
  // Récupérer les catégories
  const { data: categories = [], isLoading: categoriesLoading } = trpc.services.categories.list.useQuery();

  // Mutations
  const createService = trpc.services.create.useMutation({
    onSuccess: () => {
      utils.services.list.invalidate();
      toast.success('Service créé avec succès');
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const createCategory = trpc.services.categories.create.useMutation({
    onSuccess: () => {
      utils.services.categories.list.invalidate();
      toast.success('Catégorie créée avec succès');
      setIsCreateCategoryDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteService = trpc.services.delete.useMutation({
    onSuccess: () => {
      utils.services.list.invalidate();
      toast.success('Service supprimé');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: '',
    currency: 'EUR',
    location: '',
    color: '#3788d8',
    categoryId: '',
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    createService.mutate({
      name: formData.name,
      description: formData.description,
      duration: formData.duration,
      price: formData.price,
      currency: formData.currency,
      location: formData.location,
      color: formData.color,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
    });
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate(categoryFormData);
  };

  const handleDeleteService = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      deleteService.mutate(id);
    }
  };

  if (servicesLoading || categoriesLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Catégories de services */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Catégories de services</CardTitle>
              <CardDescription>Gérez les catégories de services</CardDescription>
            </div>
            <Dialog open={isCreateCategoryDialogOpen} onOpenChange={setIsCreateCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une catégorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle catégorie</DialogTitle>
                  <DialogDescription>
                    Créez une nouvelle catégorie de services
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCategory}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-name">Nom *</Label>
                      <Input
                        id="category-name"
                        name="name"
                        value={categoryFormData.name}
                        onChange={handleCategoryInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category-description">Description</Label>
                      <Textarea
                        id="category-description"
                        name="description"
                        value={categoryFormData.description}
                        onChange={handleCategoryInputChange}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit" disabled={createCategory.isPending}>
                      {createCategory.isPending ? 'Création...' : 'Créer'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category.id} variant="secondary" className="text-sm py-1 px-3">
                {category.name}
              </Badge>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-500">Aucune catégorie créée</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Services</CardTitle>
              <CardDescription>Gérez les services proposés</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nouveau service</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau service disponible à la réservation
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateService}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom du service *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoryId">Catégorie</Label>
                        <Select 
                          value={formData.categoryId} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Durée (minutes) *</Label>
                        <Input
                          id="duration"
                          name="duration"
                          type="number"
                          min="5"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Prix</Label>
                        <div className="flex gap-2">
                          <Input
                            id="price"
                            name="price"
                            type="text"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="50.00"
                            className="flex-1"
                          />
                          <Select 
                            value={formData.currency} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">Lieu</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Cabinet, téléconsultation..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="color">Couleur</Label>
                        <Input
                          id="color"
                          name="color"
                          type="color"
                          value={formData.color}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="submit" disabled={createService.isPending}>
                      {createService.isPending ? 'Création...' : 'Créer le service'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucun service créé. Commencez par ajouter un service.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => {
                  const category = categories.find(c => c.id === service.categoryId);
                  return (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: service.color }}
                          />
                          <div>
                            <div className="font-medium">{service.name}</div>
                            {service.description && (
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {service.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {service.duration} min
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.price ? (
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            {service.price} {service.currency}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {category ? (
                          <Badge variant="secondary">{category.name}</Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
