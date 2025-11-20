import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  
  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      if (location !== '/admin') {
        toast.success('Connexion réussie ! Redirection...');
        setLocation('/admin');
      }
    }
  }, [isAuthenticated, user, setLocation, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simuler un délai d'authentification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const success = await login(email, password);
      
      if (!success) {
        toast.error('Email ou mot de passe incorrect');
      }
      // La redirection est maintenant gérée automatiquement par useEffect
    } catch (error) {
      toast.error('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Connexion Admin</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous pour accéder au tableau de bord
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
