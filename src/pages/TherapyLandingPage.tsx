import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Users, 
  Calendar, 
  CheckCircle, 
  MapPin,
  Brain,
  Shield,
  Award,
  Phone,
  Mail,
  Clock,
  Waves,
  X,
  ArrowRight
} from 'lucide-react';

export function TherapyLandingPage() {
  const [showTherapyModal, setShowTherapyModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
      {/* Hero Section - Simplifié */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-4 rounded-full shadow-lg">
              <Waves className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
            Dorian Sarry
          </h1>
          <h2 className="text-2xl text-gray-700 mb-6 font-medium">
            Praticien certifié en Thérapie Sensori-Motrice
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Accompagnement spécialisé pour la guérison des traumatismes et du stress 
            par l'approche sensori-motrice.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-10 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => window.location.href = '/patient/book-appointment'}
            >
              <Calendar className="h-6 w-6 mr-3" />
              Prendre rendez-vous
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.location.href = '/login/patient'}
            >
              <Users className="h-6 w-6 mr-3" />
              Espace patient
            </Button>
          </div>

          {/* Lien vers plus d'informations */}
          <button
            onClick={() => setShowTherapyModal(true)}
            className="text-blue-600 hover:text-blue-700 font-medium underline flex items-center justify-center mx-auto"
          >
            En savoir plus sur la thérapie sensori-motrice
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </section>

      {/* Bénéfices/Indications - Section concise */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Cette approche peut vous aider</h2>
            <p className="text-lg text-gray-600">
              Une méthode basée sur les neurosciences pour accompagner la guérison
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { text: 'Guérison des traumatismes et du stress post-traumatique', icon: Heart },
              { text: 'Amélioration de la régulation émotionnelle et conscience corporelle', icon: Brain },
              { text: 'Renforcement de la résilience face au stress', icon: Shield },
              { text: 'Restauration de la capacité de connexion', icon: Users }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="bg-blue-500 p-2 rounded-full mr-4 flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Témoignage unique */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 to-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-100 to-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-2xl">★</span>
                  ))}
                </div>
              </div>
              <p className="text-xl text-gray-700 italic mb-4 leading-relaxed">
                "Grâce à la thérapie sensori-motrice, j'ai enfin pu me reconnecter à mon corps 
                et retrouver une sérénité que je pensais perdue."
              </p>
              <div className="text-gray-600">
                - Marie, 34 ans
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section - Épurée */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-teal-600 to-green-600 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Prêt(e) à commencer votre parcours ?</h2>
          <p className="text-xl mb-12 opacity-95 max-w-3xl mx-auto">
            Prenons rendez-vous pour découvrir ensemble comment la thérapie sensori-motrice peut vous aider.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-full mb-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="font-semibold text-lg mb-2">Cabinet</div>
                <div className="opacity-90">20 rue des Jacobins<br/>24000 Périgueux</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-full mb-4">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="font-semibold text-lg mb-2">Téléphone</div>
                <div className="opacity-90">06.45.15.63.68</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-full mb-4">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="font-semibold text-lg mb-2">Email</div>
                <div className="opacity-90">doriansarry@yahoo.fr</div>
              </div>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-lg font-semibold shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            onClick={() => window.location.href = '/patient/book-appointment'}
          >
            <Calendar className="h-6 w-6 mr-3" />
            Prendre rendez-vous
          </Button>
        </div>
      </section>

      {/* Footer - Simplifié */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-full mr-3">
                  <Waves className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Dorian Sarry</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Praticien certifié en Thérapie Sensori-Motrice
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/patient/book-appointment" className="text-gray-300 hover:text-blue-400 transition-colors">Prendre rendez-vous</a></li>
                <li><a href="/patient/register" className="text-gray-300 hover:text-blue-400 transition-colors">Créer un compte</a></li>
                <li><a href="/login/patient" className="text-gray-300 hover:text-blue-400 transition-colors">Espace patient</a></li>
                <li><a href="/login/admin" className="text-gray-300 hover:text-blue-400 transition-colors">Espace praticien</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Mentions légales</h3>
              <ul className="space-y-2 text-sm mb-4">
                <li><a href="/mentions-legales" className="text-gray-300 hover:text-blue-400 transition-colors">Mentions légales</a></li>
                <li><a href="/politique-confidentialite" className="text-gray-300 hover:text-blue-400 transition-colors">Confidentialité</a></li>
                <li><a href="/conditions-utilisation" className="text-gray-300 hover:text-blue-400 transition-colors">Conditions d'utilisation</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 Dorian Sarry - Thérapie Sensori-Motrice. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal - Qu'est-ce que la Thérapie Sensorimotrice */}
      {showTherapyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Qu'est-ce que la Thérapie Sensori-Motrice ?</h2>
              <button 
                onClick={() => setShowTherapyModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Introduction */}
              <div>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  La thérapie sensori-motrice est une approche psychothérapeutique basée sur les neurosciences 
                  qui reconnaît la sagesse du corps et utilise les ressources sensorielles et motrices pour 
                  favoriser la guérison des traumatismes et du stress.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  <strong>Parce que les mots ne suffisent pas…</strong> Cette approche intègre la dimension 
                  corporelle dans le processus thérapeutique, reconnaissant que le corps stocke les mémoires 
                  traumatiques et possède les ressources naturelles pour les transformer.
                </p>
              </div>

              {/* Fondements scientifiques */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Brain className="h-6 w-6 text-blue-600 mr-3" />
                  Fondements Scientifiques
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Neuroplasticité</h4>
                    <p className="text-gray-600 text-sm">
                      Utilisation de la capacité du cerveau à se réorganiser et créer de nouvelles connexions 
                      pour surmonter les schémas traumatiques.
                    </p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Théorie Polyvagale</h4>
                    <p className="text-gray-600 text-sm">
                      Compréhension du rôle du nerf vague dans la régulation émotionnelle et la réponse au stress.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Mémoire Somatique</h4>
                    <p className="text-gray-600 text-sm">
                      Reconnaissance que le corps stocke les mémoires traumatiques et possède les ressources pour les transformer.
                    </p>
                  </div>
                </div>
              </div>

              {/* Indications thérapeutiques */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Heart className="h-6 w-6 text-red-500 mr-3" />
                  Indications Thérapeutiques
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Traumatismes et stress post-traumatique',
                    'Anxiété et troubles de régulation émotionnelle',
                    'Troubles de l\'attachement',
                    'Troubles dissociatifs',
                    'Douleurs chroniques et tensions somatiques',
                    'Troubles du sommeil et hypervigilance'
                  ].map((indication, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{indication}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Déroulement d'une séance */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Clock className="h-6 w-6 text-purple-600 mr-3" />
                  Déroulement d'une Séance
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      title: 'Accueil et Sécurisation',
                      description: 'Création d\'un environnement sûr et bienveillant pour favoriser la détente et la confiance.'
                    },
                    {
                      title: 'Exploration en Pleine Conscience',
                      description: 'Observation attentive des sensations corporelles, de la respiration et des émotions présentes.'
                    },
                    {
                      title: 'Activation des Ressources',
                      description: 'Identification et renforcement de vos capacités naturelles de régulation et de guérison.'
                    }
                  ].map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{step.title}</h4>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certification */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Award className="h-6 w-6 text-indigo-600 mr-3" />
                  Certification & Formation
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3 mt-0.5">
                      <Award className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">Certification SP Institute</h4>
                      <p className="text-gray-600 text-xs">Sensorimotor Psychotherapy Institute - Formation selon les standards internationaux</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-full mr-3 mt-0.5">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">Supervision Continue</h4>
                      <p className="text-gray-600 text-xs">Formation et mise à jour régulières des pratiques thérapeutiques</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center pt-4">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8 py-4 shadow-lg"
                  onClick={() => {
                    setShowTherapyModal(false);
                    window.location.href = '/patient/book-appointment';
                  }}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Prendre rendez-vous
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
