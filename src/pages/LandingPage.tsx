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
  Brain,
  Leaf,
  ArrowRight 
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-therapy-50 via-white to-therapy-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-therapy-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-therapy-600 p-2 rounded-full mr-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-therapy-800">Dorian Sarry</h1>
                <p className="text-sm text-therapy-600">Thérapie sensori-motrice</p>
              </div>
            </div>
            <div className="space-x-4">
              <Link href="/login/patient">
                <Button variant="outline" className="border-therapy-600 text-therapy-600 hover:bg-therapy-50">
                  Connexion Patient
                </Button>
              </Link>
              <Link href="/login/admin">
                <Button className="bg-therapy-600 hover:bg-therapy-700">
                  Espace Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-therapy-600 p-4 rounded-full">
                <Leaf className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-5xl font-bold text-therapy-800 mb-4">
              Stabilisation émotionnelle
            </h2>
            <h3 className="text-4xl font-bold text-therapy-700 mb-6">
              et traitement du <span className="text-therapy-600">psycho-traumatisme</span>
            </h3>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-therapy-200 healing-shadow mb-8">
            <p className="text-xl text-therapy-700 mb-6 leading-relaxed">
              Une approche thérapeutique moderne et bienveillante pour votre bien-être émotionnel. 
              Prenez rendez-vous en toute simplicité et gérez votre parcours de soin.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-therapy-600 mb-8">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Confidentialité assurée</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Accompagnement bienveillant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Approche holistique</span>
              </div>
            </div>
          </div>
          <div className="space-x-4">
            <Link href="/login/patient">
              <Button size="lg" className="bg-therapy-gradient hover:opacity-90 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
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
            <h3 className="text-3xl font-bold text-therapy-800 mb-4">
              Votre parcours thérapeutique
            </h3>
            <p className="text-lg text-therapy-600 max-w-2xl mx-auto">
              Découvrez une approche personnalisée pour votre bien-être émotionnel
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="therapy-card p-6">
              <div className="mb-4">
                <div className="bg-therapy-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-therapy-600" />
                </div>
                <h4 className="text-xl font-semibold text-therapy-800">Prise de rendez-vous simplifiée</h4>
              </div>
              <p className="text-therapy-600">
                Réservez vos séances de thérapie en ligne, 24h/24. 
                Choisissez le créneau qui vous convient le mieux.
              </p>
            </div>

            <div className="therapy-card p-6">
              <div className="mb-4">
                <div className="bg-therapy-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-therapy-600" />
                </div>
                <h4 className="text-xl font-semibold text-therapy-800">Suivi thérapeutique personnalisé</h4>
              </div>
              <p className="text-therapy-600">
                Suivez votre progression thérapeutique et accédez à vos notes 
                de séances en toute confidentialité.
              </p>
            </div>

            <div className="therapy-card p-6">
              <div className="mb-4">
                <div className="bg-therapy-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-therapy-600" />
                </div>
                <h4 className="text-xl font-semibold text-therapy-800">Confidentialité absolue</h4>
              </div>
              <p className="text-therapy-600">
                Vos échanges thérapeutiques sont protégés par le secret professionnel 
                et un chiffrement de niveau bancaire.
              </p>
            </div>

            <div className="therapy-card p-6">
              <div className="mb-4">
                <div className="bg-therapy-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-therapy-600" />
                </div>
                <h4 className="text-xl font-semibold text-therapy-800">Rappels bienveillants</h4>
              </div>
              <p className="text-therapy-600">
                Recevez des rappels personnalisés pour vos séances à venir 
                et ne manquez plus vos rendez-vous thérapeutiques.
              </p>
            </div>

            <div className="therapy-card p-6">
              <div className="mb-4">
                <div className="bg-therapy-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-therapy-600" />
                </div>
                <h4 className="text-xl font-semibold text-therapy-800">Accompagnement professionnel</h4>
              </div>
              <p className="text-therapy-600">
                Bénéficiez d'un accompagnement spécialisé en thérapie sensori-motrice 
                avec une approche adaptée à vos besoins.
              </p>
            </div>

            <div className="therapy-card p-6">
              <div className="mb-4">
                <div className="bg-therapy-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-therapy-600" />
                </div>
                <h4 className="text-xl font-semibold text-therapy-800">Approche holistique</h4>
              </div>
              <p className="text-therapy-600">
                Une prise en charge globale de votre bien-être émotionnel, 
                corporel et mental pour une guérison durable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-therapy-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Prêt à commencer votre parcours de guérison ?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Créez votre compte dès maintenant et prenez votre premier rendez-vous
          </p>
          <Link href="/login/patient">
            <Button size="lg" className="bg-white text-therapy-600 hover:bg-gray-50 font-semibold px-8 py-4">
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
                <div className="bg-therapy-600 p-2 rounded-full mr-3">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold">Dorian Sarry</span>
                  <p className="text-sm text-gray-500">Thérapie sensori-motrice</p>
                </div>
              </div>
              <p className="text-gray-400">
                Votre thérapeute de confiance pour la stabilisation émotionnelle et le traitement du psycho-traumatisme.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services thérapeutiques</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Thérapie sensori-motrice</li>
                <li>Traitement du psycho-traumatisme</li>
                <li>Stabilisation émotionnelle</li>
                <li>Accompagnement personnalisé</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>📧 doriansarry47@gmail.com</p>
                <p>📞 Sur rendez-vous uniquement</p>
                <p>📍 Consultations en cabinet ou à distance</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Dorian Sarry - Thérapie sensori-motrice. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}