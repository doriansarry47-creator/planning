import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/types';
import { AlertCircle } from 'lucide-react';

interface PatientLoginFormProps {
  onSwitchToRegister?: () => void;
}

export function PatientLoginForm({ onSwitchToRegister }: PatientLoginFormProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-medical-600">
          Connexion Patient
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Connectez-vous pour gérer vos rendez-vous
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
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Votre mot de passe"
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
            className="w-full medical-button" 
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </CardContent>
      
      {onSwitchToRegister && (
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-medical-600 hover:text-medical-700 font-medium"
            >
              S'inscrire
            </button>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}