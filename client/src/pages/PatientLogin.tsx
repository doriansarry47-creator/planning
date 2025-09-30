import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Loader2, User, UserPlus } from "lucide-react";

export default function PatientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const { login, register } = useAuth();

  // États pour l'inscription
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, "patient");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation côté client
    if (registerData.firstName.length < 2) {
      setError("Le prénom doit contenir au moins 2 caractères");
      setLoading(false);
      return;
    }
    
    if (registerData.lastName.length < 2) {
      setError("Le nom doit contenir au moins 2 caractères");
      setLoading(false);
      return;
    }
    
    if (registerData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setLoading(false);
      return;
    }
    
    // Validation du mot de passe (au moins 1 majuscule, 1 minuscule, 1 chiffre)
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerData.password)) {
      setError("Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre");
      setLoading(false);
      return;
    }
    
    // Validation du téléphone (si fourni)
    if (registerData.phoneNumber && !/^(?:\+33|0)[1-9](?:[0-9]{8})$/.test(registerData.phoneNumber.replace(/\s/g, ''))) {
      setError("Format de téléphone invalide (utilisez le format français)");
      setLoading(false);
      return;
    }

    try {
      await register(registerData, "patient");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Espace Patient</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous ou créez votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Connexion
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Inscription
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre.email@exemple.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Se connecter
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-gray-600">
                <p>Compte de test: patient@test.fr / patient123</p>
              </div>
            </TabsContent>

            <TabsContent value="register" className="mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      placeholder="Prénom (min 2 caractères)"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Nom (min 2 caractères)"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="votre.email@exemple.fr"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    required
                    minLength={8}
                  />
                  <div className="text-xs text-gray-600">
                    Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule et un chiffre
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Téléphone (optionnel)</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="06 12 34 56 78 ou +33 6 12 34 56 78"
                    value={registerData.phoneNumber}
                    onChange={(e) => setRegisterData({...registerData, phoneNumber: e.target.value})}
                    pattern="^(?:\+33|0)[1-9](?:[0-9]{8})$"
                  />
                  <div className="text-xs text-gray-600">
                    Format français : 06 12 34 56 78 ou +33 6 12 34 56 78
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date de naissance (optionnel)</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={registerData.dateOfBirth}
                    onChange={(e) => setRegisterData({...registerData, dateOfBirth: e.target.value})}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer mon compte
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}