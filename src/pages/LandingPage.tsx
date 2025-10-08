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
  ArrowRight,
  Phone,
  Mail,
  Brain,
  Sparkles,
  CheckCircle
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-lg mr-3">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dorian Sarry</h1>
                <p className="text-sm text-green-600 font-medium">Thérapie sensori-motrice</p>
              </div>
            </div>
            <div className="space-x-3">
              <Link href="/login/patient">
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                  Connexion Patient
                </Button>
              </Link>
              <Link href="/login/admin">
                <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                  Espace Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-teal-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Approche thérapeutique moderne
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Stabilisation émotionnelle
                <span className="block text-green-600">et traitement du psycho-traumatisme</span>
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-xl">
                Une approche thérapeutique moderne et bienveillante pour votre bien-être émotionnel. 
                Prenez rendez-vous en toute simplicité et gérez votre parcours de soin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login/patient">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Prendre rendez-vous
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-green-200 text-green-700 hover:bg-green-50 px-8 py-3 rounded-xl">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact direct
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <Brain className="h-8 w-8 text-green-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Thérapie personnalisée</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Stabilisation émotionnelle
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Traitement des traumatismes
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Approche sensori-motrice
                    </div>
                    <div className="flex items-center text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Suivi personnalisé
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Mes spécialités thérapeutiques
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une approche globale et personnalisée pour votre bien-être émotionnel et psychologique
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 to-teal-50">
              <CardHeader>
                <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 rounded-xl w-fit">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900 mt-4">Stabilisation émotionnelle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Techniques avancées pour retrouver l'équilibre émotionnel et gérer 
                  l'anxiété, le stress et les émotions difficiles au quotidien.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl w-fit">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900 mt-4">Traitement des traumatismes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Accompagnement spécialisé dans le traitement du psycho-traumatisme 
                  avec des méthodes éprouvées et adaptées à votre rythme.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl w-fit">
                  <Stethoscope className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900 mt-4">Thérapie sensori-motrice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Approche holistique intégrant le corps et l'esprit pour 
                  une guérison complète et durable des blessures psychiques.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader>
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-xl w-fit">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900 mt-4">Rendez-vous simplifiés</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Planifiez vos séances en ligne 24h/24. Interface intuitive 
                  pour gérer vos rendez-vous en toute simplicité.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-teal-50 to-cyan-50">
              <CardHeader>
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-3 rounded-xl w-fit">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900 mt-4">Confidentialité garantie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Respect total du secret professionnel. Vos données sont 
                  protégées selon les normes les plus strictes de confidentialité.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-green-50">
              <CardHeader>
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-3 rounded-xl w-fit">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-900 mt-4">Suivi personnalisé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Accompagnement individualisé avec un suivi régulier 
                  de votre progression et adaptation des méthodes thérapeutiques.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-800/20 to-blue-800/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold mb-6">
            Prêt à commencer votre parcours de guérison ?
          </h3>
          <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
            Prenez le premier pas vers votre bien-être émotionnel. 
            Réservez votre consultation dès aujourd'hui dans un environnement sécurisé et bienveillant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login/patient">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                Prendre rendez-vous
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl">
              <Mail className="mr-2 h-4 w-4" />
              Me contacter
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-lg mr-3">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Dorian Sarry</h4>
                  <p className="text-green-400">Thérapie sensori-motrice</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md">
                Professionnel de la santé mentale spécialisé dans la stabilisation émotionnelle 
                et le traitement du psycho-traumatisme. Une approche moderne et bienveillante 
                pour votre bien-être.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">Spécialités</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Stabilisation émotionnelle</li>
                <li>Traitement des traumatismes</li>
                <li>Thérapie sensori-motrice</li>
                <li>Gestion du stress et anxiété</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-green-400">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-green-500" />
                  <span>doriansarry47@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-green-500" />
                  <span>Sur rendez-vous uniquement</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-green-500" />
                  <span>Consultations sur mesure</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Dorian Sarry - Thérapie sensori-motrice. Tous droits réservés.</p>
            <p className="text-sm mt-2">Respect du secret professionnel et de la confidentialité</p>
          </div>
        </div>
      </footer>
    </div>
  );
}