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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center text-gray-300 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-medical-400 mr-2" />
              <h1 className="text-xl font-bold text-white">MedPlan Admin</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-xl">
            <CardHeader className="text-center bg-gray-800 text-white rounded-t-lg">
              <Shield className="h-12 w-12 mx-auto mb-4 text-medical-400" />
              <CardTitle className="text-2xl font-bold">
                Connexion Administrateur
              </CardTitle>
              <p className="text-gray-300 mt-2">
                Accès réservé au personnel autorisé
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
                  className="w-full bg-gray-800 hover:bg-gray-900" 
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Accéder à l\'administration'}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium">Accès sécurisé</p>
                    <p className="text-yellow-700 mt-1">
                      Cet espace est réservé au personnel médical et administratif autorisé.
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
          <a href="mailto:support@medplan.fr" className="text-medical-400 hover:text-medical-300">
            support@medplan.fr
          </a>
        </p>
        <p className="text-xs text-gray-500">
          Toutes les connexions sont enregistrées et surveillées
        </p>
      </div>
    </div>
  );
}