import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { LoginForm } from '@/types';
import { AlertCircle, ShieldCheck, Mail, Loader2 } from 'lucide-react';
import axios from 'axios';

interface PatientLoginFormProps {
  onSwitchToRegister?: () => void;
}

export function PatientLoginForm({ onSwitchToRegister }: PatientLoginFormProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  
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

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setError('Veuillez entrer votre email');
      return;
    }

    try {
      setForgotPasswordLoading(true);
      setError('');
      
      await axios.post('/api/auth/forgot-password', {
        email: forgotPasswordEmail,
        userType: 'patient'
      });
      
      setForgotPasswordSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 p-3 rounded-xl w-fit mx-auto mb-4">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Connexion Patient
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Accédez à votre espace personnel et gérez vos rendez-vous thérapeutiques
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
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all" 
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
          
          <div className="text-center mt-4">
            {!forgotPasswordSuccess ? (
              <ForgotPasswordSection 
                email={forgotPasswordEmail}
                setEmail={setForgotPasswordEmail}
                loading={forgotPasswordLoading}
                onSubmit={handleForgotPassword}
              />
            ) : (
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                <Mail className="h-4 w-4" />
                <span className="text-sm">
                  Instructions envoyées par email si le compte existe.
                </span>
              </div>
            )}
          </div>
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

interface ForgotPasswordSectionProps {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  onSubmit: () => void;
}

function ForgotPasswordSection({ email, setEmail, loading, onSubmit }: ForgotPasswordSectionProps) {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <button
        type="button"
        className="text-sm text-gray-600 hover:text-gray-900 underline"
        onClick={() => setShowForm(true)}
      >
        Mot de passe oublié ?
      </button>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-700 font-medium">Récupération de mot de passe</p>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={onSubmit}
          disabled={loading || !email}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Envoi...' : 'Envoyer'}
        </Button>
      </div>
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="text-xs text-gray-500 hover:text-gray-700"
      >
        Annuler
      </button>
    </div>
  );
}