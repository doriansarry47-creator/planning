import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  Shield, 
  Users, 
  Heart, 
  Stethoscope,
  ArrowRight 
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-medical-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">MedPlan</h1>
            </div>
            <div className="space-x-4">
              <Link href="/login/patient">
                <Button variant="outline">Connexion Patient</Button>
              </Link>
              <Link href="/login/admin">
                <Button>Espace Admin</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Gestion des rendez-vous médicaux
            <span className="text-medical-600"> simplifiée</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Une plateforme moderne et intuitive pour gérer vos consultations médicales. 
            Prenez rendez-vous en ligne, suivez votre historique médical et restez connecté 
            avec vos professionnels de santé.
          </p>
          <div className="space-x-4">
            <Link href="/login/patient">
              <Button size="lg" className="medical-button">
                Prendre un rendez-vous
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités principales
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez tous les avantages de notre plateforme de gestion médicale
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="medical-card">
              <CardHeader>
                <Calendar className="h-12 w-12 text-medical-600 mb-4" />
                <CardTitle>Prise de rendez-vous en ligne</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Réservez vos consultations 24h/24, 7j/7 avec nos praticiens. 
                  Interface simple et intuitive pour choisir vos créneaux.
                </p>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <Stethoscope className="h-12 w-12 text-medical-600 mb-4" />
                <CardTitle>Suivi médical personnalisé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Accédez à votre historique médical, vos prescriptions et 
                  suivez l'évolution de votre santé en un clic.
                </p>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <Shield className="h-12 w-12 text-medical-600 mb-4" />
                <CardTitle>Sécurité et confidentialité</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Vos données médicales sont protégées par un chiffrement de 
                  niveau bancaire et respectent la réglementation RGPD.
                </p>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <Clock className="h-12 w-12 text-medical-600 mb-4" />
                <CardTitle>Rappels automatiques</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Recevez des notifications pour vos rendez-vous à venir et 
                  n'oubliez plus jamais vos consultations importantes.
                </p>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <Users className="h-12 w-12 text-medical-600 mb-4" />
                <CardTitle>Équipe médicale qualifiée</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Consultez le profil de nos praticiens, leurs spécialités et 
                  choisissez le professionnel qui vous correspond.
                </p>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <Heart className="h-12 w-12 text-medical-600 mb-4" />
                <CardTitle>Soins coordonnés</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Bénéficiez d'un suivi coordonné entre différents spécialistes 
                  pour des soins optimaux et personnalisés.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-medical-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Prêt à prendre en main votre santé ?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Créez votre compte dès maintenant et accédez à tous nos services
          </p>
          <Link href="/login/patient">
            <Button size="lg" variant="secondary">
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Heart className="h-6 w-6 text-medical-400 mr-2" />
                <span className="text-lg font-bold">MedPlan</span>
              </div>
              <p className="text-gray-400">
                Votre plateforme de confiance pour la gestion des rendez-vous médicaux.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Prise de rendez-vous</li>
                <li>Suivi médical</li>
                <li>Consultations en ligne</li>
                <li>Gestion des prescriptions</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>📧 contact@medplan.fr</p>
                <p>📞 01 23 45 67 89</p>
                <p>📍 123 Rue de la Santé, 75001 Paris</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MedPlan. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}