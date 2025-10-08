import React, { useState } from 'react';
import { Link } from 'wouter';
import { PatientLoginForm } from '@/components/auth/PatientLoginForm';
import { PatientRegisterForm } from '@/components/auth/PatientRegisterForm';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';

export function PatientLoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center text-green-700 hover:bg-green-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-lg mr-3">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dorian Sarry</h1>
                <p className="text-xs text-green-600 font-medium">Thérapie sensori-motrice</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          {isLogin ? (
            <PatientLoginForm 
              onSwitchToRegister={() => setIsLogin(false)} 
            />
          ) : (
            <PatientRegisterForm 
              onSwitchToLogin={() => setIsLogin(true)} 
            />
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pb-8">
        <p className="text-sm text-gray-600 mb-2">
          Besoin d'aide ? Contactez-moi par email{' '}
          <a href="mailto:doriansarry47@gmail.com" className="text-green-600 hover:text-green-700 font-medium">
            doriansarry47@gmail.com
          </a>
        </p>
        <p className="text-xs text-gray-500">
          Respect du secret professionnel - Vos données sont protégées et confidentielles
        </p>
      </div>
    </div>
  );
}