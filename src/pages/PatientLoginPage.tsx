import React, { useState } from 'react';
import { Link } from 'wouter';
import { PatientLoginForm } from '@/components/auth/PatientLoginForm';
import { PatientRegisterForm } from '@/components/auth/PatientRegisterForm';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';

export function PatientLoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-medical-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">MedPlan</h1>
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
          Besoin d'aide ? Contactez-nous au{' '}
          <a href="tel:0123456789" className="text-medical-600 hover:text-medical-700">
            01 23 45 67 89
          </a>
        </p>
        <p className="text-xs text-gray-500">
          Vos données sont protégées et sécurisées
        </p>
      </div>
    </div>
  );
}