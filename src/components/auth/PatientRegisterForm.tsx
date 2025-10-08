import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { PatientRegistrationForm } from '@/types';
import { AlertCircle, User, Mail, Phone, Lock, Eye, EyeOff, Heart } from 'lucide-react';

interface PatientRegisterFormProps {
  onSwitchToLogin?: () => void;
}

export function PatientRegisterForm({ onSwitchToLogin }: PatientRegisterFormProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuth();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<PatientRegistrationForm>();
  const password = watch('password');

  const onSubmit = async (data: PatientRegistrationForm) => {
    try {
      setLoading(true);
      setError('');
      
      if (data.password !== data.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      
      const { confirmPassword, ...patientData } = data;
      await registerUser(patientData, 'patient');
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
          Créer votre compte
        </h2>
        <p className="text-therapy-600">
          Rejoignez-nous pour commencer votre parcours de bien-être
        </p>
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-therapy-700 font-medium">Prénom</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-therapy-500" />
                <Input
                  id="firstName"
                  placeholder="Votre prénom"
                  className="pl-10 therapy-input border-therapy-200 focus:border-therapy-500 focus:ring-therapy-200"
                  {...register('firstName', { 
                    required: 'Le prénom est requis',
                    minLength: { value: 2, message: 'Minimum 2 caractères' }
                  })}
                />
              </div>
              {errors.firstName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.firstName.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-therapy-700 font-medium">Nom de famille</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-therapy-500" />
                <Input
                  id="lastName"
                  placeholder="Votre nom de famille"
                  className="pl-10 therapy-input border-therapy-200 focus:border-therapy-500 focus:ring-therapy-200"
                  {...register('lastName', { 
                    required: 'Le nom de famille est requis',
                    minLength: { value: 2, message: 'Minimum 2 caractères' }
                  })}
                />
              </div>
              {errors.lastName && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          
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
            <Label htmlFor="phoneNumber" className="text-therapy-700 font-medium">Téléphone <span className="text-therapy-500 text-sm">(optionnel)</span></Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-therapy-500" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="01 23 45 67 89"
                className="pl-10 therapy-input border-therapy-200 focus:border-therapy-500 focus:ring-therapy-200"
                {...register('phoneNumber', {
                  pattern: {
                    value: /^(\+33|0)[1-9](\d{8})$/,
                    message: 'Format de téléphone invalide (ex: 01 23 45 67 89)'
                  }
                })}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.phoneNumber.message}
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
                placeholder="Minimum 8 caractères"
                className="pl-10 pr-10 therapy-input border-therapy-200 focus:border-therapy-500 focus:ring-therapy-200"
                {...register('password', { 
                  required: 'Le mot de passe est requis',
                  minLength: {
                    value: 8,
                    message: 'Le mot de passe doit contenir au moins 8 caractères'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Doit contenir au moins une minuscule, une majuscule et un chiffre'
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
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-therapy-700 font-medium">Confirmer le mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-therapy-500" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmez votre mot de passe"
                className="pl-10 pr-10 therapy-input border-therapy-200 focus:border-therapy-500 focus:ring-therapy-200"
                {...register('confirmPassword', { 
                  required: 'La confirmation du mot de passe est requise',
                  validate: value => value === password || 'Les mots de passe ne correspondent pas'
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-therapy-500 hover:text-therapy-700"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword.message}
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
                Création du compte...
              </div>
            ) : (
              'Créer mon compte'
            )}
          </Button>
        </form>
      </div>
      
      {onSwitchToLogin && (
        <div className="text-center mt-6 pt-6 border-t border-therapy-200">
          <p className="text-sm text-therapy-600">
            Déjà un compte ?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-therapy-600 hover:text-therapy-700 font-semibold underline decoration-2 underline-offset-2"
            >
              Se connecter
            </button>
          </p>
        </div>
      )}
    </div>
  );
}