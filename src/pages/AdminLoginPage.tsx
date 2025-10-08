import React, { useState } from 'react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, ArrowLeft, AlertCircle, Shield } from 'lucide-react';
import { LoginForm } from '@/types';

export function AdminLoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');
      await login(data.email, data.password, 'admin');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-teal-900">
      {/* Header */}
      <header className="bg-gray-800/95 backdrop-blur-md border-b border-teal-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center text-gray-300 hover:text-white hover:bg-teal-700/30">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-2 rounded-lg mr-3">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Administration</h1>
                <p className="text-xs text-teal-400">Dorian Sarry - Thérapie</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center bg-gradient-to-r from-gray-800 to-slate-700 text-white rounded-t-lg pb-8">
              <div className="bg-gradient-to-r from-teal-400 to-green-500 p-3 rounded-xl w-fit mx-auto mb-4">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Administration Thérapeutique
              </CardTitle>
              <p className="text-gray-300 mt-2">
                Gestion des rendez-vous et suivi patients
              </p>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email administrateur</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@medplan.fr"
                    {...register('email', { 
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Format d\'email invalide'
                      }
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mot de passe administrateur"
                    {...register('password', { 
                      required: 'Le mot de passe est requis',
                      minLength: {
                        value: 6,
                        message: 'Le mot de passe doit contenir au moins 6 caractères'
                      }
                    })}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-gray-800 to-slate-700 hover:from-gray-900 hover:to-slate-800 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all" 
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Accéder à l\'administration'}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-teal-800 font-medium">Accès professionnel sécurisé</p>
                    <p className="text-teal-700 mt-1">
                      Espace de gestion thérapeutique réservé aux praticiens autorisés.
                      Toutes les données patients sont strictement confidentielles.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pb-8">
        <p className="text-sm text-gray-400 mb-2">
          Support technique :{' '}
          <a href="mailto:doriansarry47@gmail.com" className="text-teal-400 hover:text-teal-300">
            doriansarry47@gmail.com
          </a>
        </p>
        <p className="text-xs text-gray-500">
          Accès sécurisé - Respect du secret professionnel - Confidentialité garantie
        </p>
      </div>
    </div>
  );
}