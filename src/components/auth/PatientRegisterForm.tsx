import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { PatientRegistrationForm } from '@/types';
import { AlertCircle, Heart, Loader2 } from 'lucide-react';

interface PatientRegisterFormProps {
  onSwitchToLogin?: () => void;
}

export function PatientRegisterForm({ onSwitchToLogin }: PatientRegisterFormProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const { addToast } = useToast();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<PatientRegistrationForm>();
  const password = watch('password');

  const onSubmit = async (data: PatientRegistrationForm) => {
    try {
      setLoading(true);
      setError('');
      
      if (data.password !== data.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        addToast({
          type: 'error',
          title: 'Erreur de saisie',
          description: 'Les mots de passe ne correspondent pas'
        });
        return;
      }
      
      const { confirmPassword, ...patientData } = data;
      
      addToast({
        type: 'info',
        title: 'Inscription en cours...',
        description: 'Veuillez patienter pendant que nous créons votre compte'
      });
      
      await registerUser(patientData, 'patient');
      
      addToast({
        type: 'success',
        title: 'Inscription réussie !',
        description: 'Votre compte a été créé avec succès. Vous êtes maintenant connecté.'
      });
      
    } catch (err: any) {
      const errorMessage = err.message || 'Une erreur est survenue';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Erreur d\'inscription',
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 rounded-xl w-fit mx-auto mb-4">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Inscription Patient
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Créez votre compte pour commencer votre parcours thérapeutique
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
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                placeholder="Votre prénom"
                {...register('firstName', { 
                  required: 'Le prénom est requis',
                  minLength: { value: 2, message: 'Minimum 2 caractères' }
                })}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                placeholder="Votre nom"
                {...register('lastName', { 
                  required: 'Le nom est requis',
                  minLength: { value: 2, message: 'Minimum 2 caractères' }
                })}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.fr"
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
            <Label htmlFor="phoneNumber">Téléphone (optionnel)</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="01 23 45 67 89"
              {...register('phoneNumber', {
                pattern: {
                  value: /^(\+33|0)[1-9](\d{8})$/,
                  message: 'Format de téléphone invalide'
                }
              })}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mot de passe (min. 8 caractères)"
              {...register('password', { 
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 8,
                  message: 'Le mot de passe doit contenir au moins 8 caractères'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
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
              placeholder="Confirmez votre mot de passe"
              {...register('confirmPassword', { 
                required: 'La confirmation du mot de passe est requise',
                validate: value => value === password || 'Les mots de passe ne correspondent pas'
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Inscription...
              </div>
            ) : (
              'S\'inscrire'
            )}
          </Button>
        </form>
      </CardContent>
      
      {onSwitchToLogin && (
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-medical-600 hover:text-medical-700 font-medium"
            >
              Se connecter
            </button>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}