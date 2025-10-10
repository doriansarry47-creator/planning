import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertCircle, CheckCircle, Shield, Key } from 'lucide-react';
import axios from 'axios';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [userType, setUserType] = useState<'admin' | 'patient'>('patient');
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetForm>();

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const typeParam = urlParams.get('type') as 'admin' | 'patient';
    
    if (!tokenParam || !typeParam) {
      setError('Lien de réinitialisation invalide');
      return;
    }
    
    setToken(tokenParam);
    setUserType(typeParam);
  }, []);

  const onSubmit = async (data: ResetForm) => {
    if (data.password !== data.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await axios.post('/api/auth/reset-password', {
        token,
        password: data.password,
        userType,
      });
      
      setSuccess(true);
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        if (userType === 'admin') {
          setLocation('/admin/login');
        } else {
          setLocation('/patient/login');
        }
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 rounded-xl w-fit mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              Mot de passe réinitialisé !
            </CardTitle>
            <p className="text-green-600 mt-2">
              Votre mot de passe a été mis à jour avec succès.
            </p>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Vous allez être redirigé vers la page de connexion dans quelques secondes...
            </p>
            
            <Link href={userType === 'admin' ? '/admin/login' : '/patient/login'}>
              <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                Se connecter maintenant
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <Key className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Réinitialisation</h1>
                <p className="text-xs text-green-600 font-medium">Dorian Sarry - Thérapie Sensorimotrice</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 rounded-xl w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Nouveau mot de passe
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Choisissez un nouveau mot de passe sécurisé pour votre compte
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Au moins 8 caractères"
                    {...register('password', { 
                      required: 'Le mot de passe est requis',
                      minLength: {
                        value: 8,
                        message: 'Le mot de passe doit contenir au moins 8 caractères'
                      }
                    })}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Répétez votre mot de passe"
                    {...register('confirmPassword', { 
                      required: 'Veuillez confirmer votre mot de passe',
                      validate: value => 
                        value === watch('password') || 'Les mots de passe ne correspondent pas'
                    })}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all" 
                  disabled={loading || !token}
                >
                  {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-green-800 font-medium">Conseils de sécurité</p>
                    <ul className="text-green-700 mt-1 space-y-1">
                      <li>• Utilisez au moins 8 caractères</li>
                      <li>• Mélangez lettres, chiffres et symboles</li>
                      <li>• Évitez les mots courants</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}