import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { 
  ShieldCheck, 
  User, 
  Calendar, 
  Clock, 
  Users, 
  Heart,
  ArrowRight 
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">MedicalApp</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Système de Gestion des Rendez-vous Médicaux
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Une plateforme moderne et sécurisée pour la gestion des rendez-vous médicaux,
            offrant une expérience optimale pour les patients et les professionnels de santé.
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Patient Access */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full transform translate-x-16 -translate-y-16"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Espace Patient</CardTitle>
                  <CardDescription>Gérez vos rendez-vous médicaux</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Réserver vos rendez-vous en ligne</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Consulter vos prochains rendez-vous</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Gérer votre profil médical</span>
                </div>
              </div>
              <Link href="/patient/login" className="block w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Accès Patient
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Access */}
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full transform translate-x-16 -translate-y-16"></div>
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Administration</CardTitle>
                  <CardDescription>Gestion complète de la clinique</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Gérer les patients et praticiens</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Superviser tous les rendez-vous</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Configurer les créneaux horaires</span>
                </div>
              </div>
              <Link href="/admin/login" className="block w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Accès Administration
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Fonctionnalités principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Réservation en ligne</h3>
              <p className="text-gray-600">
                Système de réservation simple et intuitif disponible 24h/24
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gestion complète</h3>
              <p className="text-gray-600">
                Outils complets pour la gestion des patients et des praticiens
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sécurité avancée</h3>
              <p className="text-gray-600">
                Protection des données médicales avec authentification sécurisée
              </p>
            </div>
          </div>
        </div>

        {/* Test Accounts Info */}
        <div className="mt-16 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Comptes de démonstration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-green-700 mb-2">Compte Patient</h4>
              <p><strong>Email:</strong> patient@test.fr</p>
              <p><strong>Mot de passe:</strong> patient123</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-blue-700 mb-2">Compte Administration</h4>
              <p><strong>Email:</strong> admin@medical.fr</p>
              <p><strong>Mot de passe:</strong> admin123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 MedicalApp - Système de gestion des rendez-vous médicaux
          </p>
        </div>
      </footer>
    </div>
  );
}