import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Users, 
  Calendar, 
  CheckCircle, 
  MapPin,
  Brain,
  Leaf,
  Shield,
  Award,
  Phone,
  Mail,
  Clock
} from 'lucide-react';

export function TherapyLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600/20 via-blue-600/20 to-green-600/20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-4 rounded-full shadow-lg">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Dorian Sarry
            </span>
          </h1>
          <p className="text-2xl text-gray-700 mb-4 font-medium">
            Praticien en Thérapie Sensorimotrice
          </p>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Une approche thérapeutique innovante qui intègre les aspects sensoriels et moteurs 
            dans le processus de guérison pour vous accompagner vers un mieux-être durable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.location.href = '/patient/book-appointment'}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Prendre rendez-vous
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-4 text-lg"
              onClick={() => window.location.href = '/login/patient'}
            >
              <Users className="h-5 w-5 mr-2" />
              Espace patient
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">500+</div>
              <div className="text-gray-600">Patients accompagnés</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600">Taux de satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">10+</div>
              <div className="text-gray-600">Années d'expérience</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Qu'est-ce que la Thérapie Sensorimotrice ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une approche thérapeutique qui reconnaît la sagesse du corps et utilise les ressources sensorielles 
              et motrices pour favoriser la guérison des traumatismes et du stress.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-teal-100 p-3 rounded-full mr-4">
                    <Brain className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Approche Corps-Esprit</h3>
                    <p className="text-gray-600">
                      Intégration des sensations corporelles et des émotions pour une guérison complète.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Leaf className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Processus Naturel</h3>
                    <p className="text-gray-600">
                      Respect des rythmes naturels du corps et de sa capacité innée à guérir.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Sécurité Thérapeutique</h3>
                    <p className="text-gray-600">
                      Création d'un espace sûr pour explorer et libérer les tensions accumulées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Cette approche peut vous aider avec :</h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  'Traumatismes et stress post-traumatique',
                  'Anxiété et troubles anxieux',
                  'Dépression et troubles de l\'humeur',
                  'Troubles du sommeil',
                  'Douleurs chroniques',
                  'Difficultés relationnelles',
                  'Troubles de l\'attachement',
                  'Troubles dissociatifs'
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Consultation en Cabinet</h2>
            <p className="text-xl text-gray-600">
              Toutes les séances se déroulent uniquement en présentiel dans le cabinet
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-teal-200 hover:border-teal-400 transition-colors shadow-xl">
              <CardHeader className="text-center">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Séances en Cabinet</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Séances en présentiel dans un cadre thérapeutique sécurisant et confidentiel, 
                  au cœur de Périgueux.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-center">
                    <Clock className="h-5 w-5 text-teal-600 mr-2" />
                    <span>60 minutes par séance</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-teal-600 mr-2" />
                    <span>20 rue des Jacobins, 24000 Périgueux</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => window.location.href = '/patient/book-appointment'}
                >
                  Prendre rendez-vous
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Mon Parcours</h2>
            <p className="text-xl text-gray-600">
              Une formation solide au service de votre bien-être
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Formation Certifiée</h3>
                <p className="text-gray-600">
                  Certification en Thérapie Sensorimotrice par le Somatic Experiencing Institute
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Supervision Continue</h3>
                <p className="text-gray-600">
                  Formation continue et supervision régulière pour garantir la qualité des soins
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Approche Humaniste</h3>
                <p className="text-gray-600">
                  Une pratique centrée sur la personne et ses besoins spécifiques
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Prêt(e) à commencer votre parcours de guérison ?</h2>
          <p className="text-xl mb-12 opacity-90">
            Je serai ravi(e) de vous accompagner dans votre cheminement vers un mieux-être durable.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="flex items-center justify-center">
              <Mail className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">Email</div>
                <div className="opacity-90">doriansarry@yahoo.fr</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <Phone className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">Téléphone</div>
                <div className="opacity-90">06.45.15.63.68</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <MapPin className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">Adresse</div>
                <div className="opacity-90">20 rue des Jacobins, 24000 Périgueux</div>
              </div>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg"
            onClick={() => window.location.href = '/patient/book-appointment'}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Prendre rendez-vous maintenant
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Heart className="h-6 w-6 text-teal-400 mr-2" />
                <span className="text-xl font-bold">Dorian Sarry</span>
              </div>
              <p className="text-gray-400">
                Praticien en Thérapie Sensorimotrice<br />
                Accompagnement vers la guérison et le mieux-être
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/patient/book-appointment" className="hover:text-white">Prendre rendez-vous</a></li>
                <li><a href="/login/patient" className="hover:text-white">Espace patient</a></li>
                <li><a href="/login/admin" className="hover:text-white">Espace praticien</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Informations légales</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white">Conditions d'utilisation</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Dorian Sarry - Thérapie Sensorimotrice. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}