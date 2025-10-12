import React from 'react';
import { PatientRegisterForm } from '@/components/auth/PatientRegisterForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Shield, Clock, Calendar } from 'lucide-react';

export function PatientRegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
            <div className="text-sm text-gray-600">
              Déjà un compte ? 
              <a href="/login/patient" className="text-teal-600 hover:text-teal-700 font-medium ml-1">
                Se connecter
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left side - Information */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 p-12 flex flex-col justify-center text-white">
            <div className="mb-8">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full w-fit mb-6">
                <UserPlus className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold mb-4">
                Créez votre compte patient
              </h1>
              <p className="text-xl text-teal-100 mb-8">
                Rejoignez notre plateforme pour bénéficier d'une prise en charge personnalisée 
                en thérapie sensorimotrice.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Réservation 24h/24</h3>
                  <p className="text-teal-100">
                    Prenez vos rendez-vous en ligne à tout moment, 
                    consultez et modifiez vos créneaux facilement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Sécurité médicale</h3>
                  <p className="text-teal-100">
                    Vos données de santé sont protégées par un chiffrement de niveau médical 
                    et le respect du secret professionnel.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Suivi personnalisé</h3>
                  <p className="text-teal-100">
                    Accédez à votre historique médical, vos notes de consultation 
                    et votre progression thérapeutique.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <h4 className="font-semibold mb-2">Thérapie Sensorimotrice</h4>
              <p className="text-sm text-teal-100">
                Une approche thérapeutique innovante qui intègre les aspects sensoriels et moteurs 
                pour traiter les traumatismes et favoriser la régulation du système nerveux.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 lg:hidden">
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-3 rounded-full w-fit mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Créer un compte
              </h1>
              <p className="text-gray-600">
                Rejoignez notre plateforme de thérapie sensorimotrice
              </p>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="hidden lg:block text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Inscription Patient
                </h2>
                <p className="text-gray-600">
                  Créez votre compte en quelques étapes
                </p>
              </div>

              <PatientRegisterForm />

              {/* Additional Information */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    En créant un compte, vous acceptez nos{' '}
                    <a href="/conditions-utilisation" className="text-teal-600 hover:text-teal-700 underline">
                      Conditions d'utilisation
                    </a>{' '}
                    et notre{' '}
                    <a href="/politique-confidentialite" className="text-teal-600 hover:text-teal-700 underline">
                      Politique de confidentialité
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 text-center">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Besoin d'aide ?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Notre équipe est là pour vous accompagner dans votre inscription
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Téléphone :</span>{' '}
                    <a href="tel:+33123456789" className="text-teal-600 hover:text-teal-700">
                      +33 (0)1 23 45 67 89
                    </a>
                  </div>
                  <div>
                    <span className="font-medium">Email :</span>{' '}
                    <a href="mailto:support@dorian-sarry.fr" className="text-teal-600 hover:text-teal-700">
                      support@dorian-sarry.fr
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}