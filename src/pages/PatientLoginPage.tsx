import React, { useState } from 'react';
import { Link } from 'wouter';
import { PatientLoginForm } from '@/components/auth/PatientLoginForm';
import { PatientRegisterForm } from '@/components/auth/PatientRegisterForm';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, Leaf, Shield } from 'lucide-react';

export function PatientLoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapy-50 via-white to-therapy-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-therapy-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center text-therapy-700 hover:text-therapy-800 hover:bg-therapy-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
            <div className="flex items-center">
              <div className="bg-therapy-600 p-2 rounded-full mr-3">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-therapy-800">Dorian Sarry</h1>
                <p className="text-xs text-therapy-600">Thérapie sensori-motrice</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Welcome Message */}
            <div className="text-center md:text-left space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <div className="bg-therapy-600 p-3 rounded-full">
                    <Leaf className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-therapy-800">
                    Stabilisation émotionnelle
                  </h2>
                </div>
                <h3 className="text-2xl text-therapy-700 font-semibold">
                  et traitement du psycho-traumatisme
                </h3>
                <div className="bg-therapy-50 p-6 rounded-xl border border-therapy-200">
                  <p className="text-therapy-700 text-lg leading-relaxed">
                    Une approche thérapeutique moderne et bienveillante pour votre bien-être émotionnel. 
                    Prenez rendez-vous en toute simplicité et gérez votre parcours de soin.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-therapy-600">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Données sécurisées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Approche bienveillante</span>
                </div>
              </div>
            </div>
            
            {/* Right Side - Form */}
            <div className="w-full">
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
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pb-8 px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto border border-therapy-200 healing-shadow">
          <p className="text-sm text-therapy-700 mb-3">
            Besoin d'aide pour votre première connexion ?{' '}
            <a href="mailto:doriansarry47@gmail.com" className="text-therapy-600 hover:text-therapy-700 font-medium">
              doriansarry47@gmail.com
            </a>
          </p>
          <div className="flex items-center justify-center space-x-6 text-xs text-therapy-600">
            <span className="flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>Confidentialité assurée</span>
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>Accompagnement bienveillant</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}