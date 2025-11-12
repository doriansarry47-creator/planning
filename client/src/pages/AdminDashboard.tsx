import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Calendar, Clock, Users, Settings, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('appointments');

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin</h1>
              <p className="text-sm text-gray-500">Bienvenue, {user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rendez-vous du jour
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Aucun rendez-vous aujourd'hui
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rendez-vous à venir
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Cette semaine
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total patients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Patients enregistrés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Créneaux disponibles
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Ce mois-ci
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
            <TabsTrigger value="availability">Disponibilités</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des rendez-vous</CardTitle>
                <CardDescription>
                  Consultez et gérez tous les rendez-vous
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Rendez-vous à venir</h3>
                    <Button>Nouveau rendez-vous</Button>
                  </div>
                  <div className="border rounded-lg p-4 text-center text-muted-foreground">
                    Aucun rendez-vous prévu pour le moment
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des disponibilités</CardTitle>
                <CardDescription>
                  Gérez vos créneaux horaires et disponibilités
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Créneaux disponibles</h3>
                    <Button>Ajouter un créneau</Button>
                  </div>
                  <div className="border rounded-lg p-4 text-center text-muted-foreground">
                    Aucun créneau disponible configuré
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4">Horaires de travail</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Lundi - Vendredi</label>
                        <div className="flex gap-2">
                          <input type="time" className="flex-1 px-3 py-2 border rounded-md" placeholder="09:00" />
                          <span className="py-2">à</span>
                          <input type="time" className="flex-1 px-3 py-2 border rounded-md" placeholder="17:00" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Durée consultation</label>
                        <input type="number" className="w-full px-3 py-2 border rounded-md" placeholder="60" />
                      </div>
                    </div>
                    <Button className="mt-4">Générer les créneaux</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Liste des patients</CardTitle>
                <CardDescription>
                  Consultez la liste de vos patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 text-center text-muted-foreground">
                  Aucun patient enregistré
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du compte</CardTitle>
                <CardDescription>
                  Gérez les paramètres de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom complet</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-md" 
                      defaultValue="Dorian Sarry"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border rounded-md" 
                      defaultValue={user?.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Spécialisation</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-md" 
                      defaultValue="Thérapie Sensori-Motrice"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Téléphone</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border rounded-md" 
                      defaultValue="06.45.15.63.68"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Adresse</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border rounded-md" 
                      defaultValue="20 rue des Jacobins, 24000 Périgueux"
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
