import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/types';
import { AlertCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface PatientLoginFormProps {
  onSwitchToRegister?: () => void;
}

export function PatientLoginForm({ onSwitchToRegister }: PatientLoginFormProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');
      await login(data.email, data.password, 'patient');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="therapy-card w-full max-w-md mx-auto p-6 healing-shadow">
      <div className="text-center mb-6">
        <div className="bg-therapy-gradient p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-therapy-800 mb-2">
          Bienvenue
        </h2>
        <p className="text-therapy-600">
          Connectez-vous pour accéder à votre espace personnel
        </p>
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-therapy-700 font-medium">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-therapy-500" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.fr"
                className="pl-10 therapy-input border-therapy-200 focus:border-therapy-500 focus:ring-therapy-200"
                {...register('email', { 
                  required: 'L\'adresse email est requise',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Format d\'email invalide'
                  }
                })}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-therapy-700 font-medium">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-therapy-500" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Entrez votre mot de passe"
                className="pl-10 pr-10 therapy-input border-therapy-200 focus:border-therapy-500 focus:ring-therapy-200"
                {...register('password', { 
                  required: 'Le mot de passe est requis',
                  minLength: {
                    value: 6,
                    message: 'Le mot de passe doit contenir au moins 6 caractères'
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-therapy-500 hover:text-therapy-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-therapy-gradient hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connexion en cours...
              </div>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>
      </div>
      
      {onSwitchToRegister && (
        <div className="text-center mt-6 pt-6 border-t border-therapy-200">
          <p className="text-sm text-therapy-600">
            Première visite ?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-therapy-600 hover:text-therapy-700 font-semibold underline decoration-2 underline-offset-2"
            >
              Créer un compte
            </button>
          </p>
        </div>
      )}
    </div>
  );
}