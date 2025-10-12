import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search, Calendar, Phone, Mail } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-9xl font-bold text-transparent bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text">
              404
            </h1>
            <div className="absolute inset-0 text-9xl font-bold text-teal-100 opacity-50 animate-pulse">
              404
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Page non trouvée
          </h2>
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            <br />
            Ne vous inquiétez pas, nous allons vous aider à retrouver votre chemin.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg"
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
          >
            <Home className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="px-8 py-3 text-lg border-2 border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Page précédente
          </Button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center justify-center gap-2">
            <Search className="h-5 w-5" />
            Pages les plus visitées
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <a 
              href="/patient/book-appointment" 
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors group"
            >
              <div className="bg-teal-100 group-hover:bg-teal-200 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-teal-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Prendre rendez-vous</div>
                <div className="text-sm text-gray-600">Réservez votre consultation</div>
              </div>
            </a>

            <a 
              href="/login/patient" 
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="bg-blue-100 group-hover:bg-blue-200 p-2 rounded-lg">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Espace patient</div>
                <div className="text-sm text-gray-600">Accédez à votre compte</div>
              </div>
            </a>

            <a 
              href="/patient/register" 
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
            >
              <div className="bg-green-100 group-hover:bg-green-200 p-2 rounded-lg">
                <Search className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Créer un compte</div>
                <div className="text-sm text-gray-600">Inscription patient</div>
              </div>
            </a>

            <a 
              href="/login/admin" 
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
            >
              <div className="bg-purple-100 group-hover:bg-purple-200 p-2 rounded-lg">
                <Search className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800">Espace admin</div>
                <div className="text-sm text-gray-600">Accès administrateur</div>
              </div>
            </a>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Besoin d'aide ?
          </h3>
          <p className="text-gray-600 mb-4">
            Si vous ne trouvez pas ce que vous cherchez, n'hésitez pas à nous contacter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+33123456789"
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
            >
              <Phone className="h-4 w-4" />
              +33 (0)1 23 45 67 89
            </a>
            <a 
              href="mailto:contact@dorian-sarry.fr"
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
            >
              <Mail className="h-4 w-4" />
              contact@dorian-sarry.fr
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Si le problème persiste, il est possible que la page soit temporairement indisponible.
            <br />
            Veuillez réessayer dans quelques minutes.
          </p>
        </div>
      </div>
    </div>
  );
}