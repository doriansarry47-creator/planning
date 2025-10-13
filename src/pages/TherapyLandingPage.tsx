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
  Clock,
  Flower,
  Target,
  Lightbulb,
  Compass,
  Sparkles,
  Eye,
  Waves
} from 'lucide-react';

export function TherapyLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-green-600/10 to-teal-600/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-5 rounded-full shadow-xl">
              <Waves className="h-14 w-14 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Dorian Sarry
            </span>
          </h1>
          <p className="text-2xl text-gray-700 mb-4 font-medium">
            Praticien certifié en Thérapie Sensori-Motrice
          </p>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Une approche thérapeutique basée sur les neurosciences qui reconnaît la sagesse du corps 
            et utilise ses ressources naturelles pour favoriser la guérison des traumatismes et du stress.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-10 py-5 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => window.location.href = '/patient/book-appointment'}
            >
              <Calendar className="h-5 w-5 mr-3" />
              Prendre rendez-vous
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-5 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.location.href = '/login/patient'}
            >
              <Users className="h-5 w-5 mr-3" />
              Espace patient
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">300+</div>
              <div className="text-gray-600 font-medium">Patients accompagnés</div>
            </div>
            <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-teal-600 mb-2">98%</div>
              <div className="text-gray-600 font-medium">Taux de satisfaction</div>
            </div>
            <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">8+</div>
              <div className="text-gray-600 font-medium">Années d'expérience</div>
            </div>
            <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-indigo-600 mb-2">100%</div>
              <div className="text-gray-600 font-medium">Confidentialité</div>
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
            
            <div className="bg-gradient-to-br from-blue-50 via-white to-teal-50 p-8 rounded-2xl shadow-xl border border-blue-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full mb-4">
                  <Target className="h-4 w-4 mr-2" />
                  <span className="font-semibold">Indications Thérapeutiques</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Cette approche peut vous aider avec :</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { text: 'Traumatismes et stress post-traumatique', icon: Heart },
                  { text: 'Anxiété et troubles de la régulation émotionnelle', icon: Leaf },
                  { text: 'Troubles de l\'attachement et difficultés relationnelles', icon: Users },
                  { text: 'Troubles dissociatifs et déconnexion corporelle', icon: Eye },
                  { text: 'Douleurs chroniques et tensions somatiques', icon: Shield },
                  { text: 'Troubles du sommeil et hypervigilance', icon: Clock },
                  { text: 'Complément à l\'EMDR et autres thérapies', icon: Compass },
                  { text: 'Difficultés de régulation du système nerveux', icon: Brain }
                ].map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-center p-3 bg-white/70 rounded-lg hover:bg-white transition-colors group">
                      <div className="bg-blue-100 p-2 rounded-full mr-4 group-hover:bg-blue-200 transition-colors">
                        <IconComponent className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Foundation Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-indigo-100 px-6 py-3 rounded-full mb-6">
              <Lightbulb className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-indigo-600 font-semibold">Fondements Scientifiques</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Une Approche Basée sur les Neurosciences</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              La thérapie sensori-motrice s'appuie sur les découvertes récentes en neurosciences 
              sur la mémoire traumatique et la régulation du système nerveux autonome.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Neuroplasticité</h3>
                <p className="text-gray-600 leading-relaxed">
                  Utilisation de la capacité du cerveau à se réorganiser et créer de nouvelles connexions 
                  pour surmonter les schémas traumatiques.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-teal-100 to-cyan-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Théorie Polyvagale</h3>
                <p className="text-gray-600 leading-relaxed">
                  Compréhension du rôle du nerf vague dans la régulation émotionnelle 
                  et la réponse au stress pour favoriser la guérison.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Waves className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Mémoire Somatique</h3>
                <p className="text-gray-600 leading-relaxed">
                  Reconnaissance que le corps stocke les mémoires traumatiques 
                  et possède les ressources pour les transformer.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Session Process Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 px-6 py-3 rounded-full mb-6">
              <Flower className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-600 font-semibold">Déroulement d'une Séance</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Comment se déroule une Séance ?</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Chaque séance est adaptée à vos besoins spécifiques et respecte votre rythme naturel de guérison.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[
                {
                  step: '1',
                  title: 'Accueil et Sécurisation',
                  description: 'Création d\'un environnement sûr et bienveillant pour favoriser la détente et la confiance.',
                  icon: Shield
                },
                {
                  step: '2', 
                  title: 'Exploration en Pleine Conscience',
                  description: 'Observation attentive des sensations corporelles, de la respiration et des émotions présentes.',
                  icon: Eye
                },
                {
                  step: '3',
                  title: 'Activation des Ressources',
                  description: 'Identification et renforcement de vos capacités naturelles de régulation et de guérison.',
                  icon: Sparkles
                }
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="flex items-start group">
                    <div className="flex-shrink-0 mr-6">
                      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    <div className="group-hover:bg-green-50 p-4 rounded-lg transition-colors flex-1">
                      <div className="flex items-center mb-3">
                        <IconComponent className="h-6 w-6 text-green-600 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-800">{item.title}</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-2xl border border-green-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Objectifs Thérapeutiques</h3>
              <div className="space-y-4">
                {[
                  'Se sentir plus sécurisé(e) dans son corps',
                  'Améliorer la régulation émotionnelle', 
                  'Renforcer la résilience face au stress',
                  'Intégrer les expériences traumatiques',
                  'Développer la conscience corporelle',
                  'Restaurer la capacité de connexion'
                ].map((objective, index) => (
                  <div key={index} className="flex items-center p-3 bg-white/70 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gray-100 px-6 py-3 rounded-full mb-6">
              <MapPin className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-gray-600 font-semibold">Cabinet Thérapeutique</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Consultation en Cabinet</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Toutes les séances se déroulent uniquement en présentiel dans un cadre thérapeutique 
              spécialement aménagé pour favoriser votre bien-être et votre sécurité.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-2xl bg-white hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-t-lg">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Séances en Cabinet</CardTitle>
                </CardHeader>
                <CardContent className="text-center p-8">
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Séances en présentiel dans un environnement thérapeutique soigneusement conçu 
                    pour votre confort et votre sécurité.
                  </p>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-center bg-blue-50 p-3 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="font-medium">60 minutes par séance</span>
                    </div>
                    <div className="flex items-center justify-center bg-teal-50 p-3 rounded-lg">
                      <MapPin className="h-5 w-5 text-teal-600 mr-3" />
                      <span className="font-medium">20 rue des Jacobins, 24000 Périgueux</span>
                    </div>
                    <div className="flex items-center justify-center bg-green-50 p-3 rounded-lg">
                      <Shield className="h-5 w-5 text-green-600 mr-3" />
                      <span className="font-medium">Confidentialité assurée</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => window.location.href = '/patient/book-appointment'}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Prendre rendez-vous
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-3xl transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-gray-800">Certification & Formation</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-gray-600 mb-6 text-center leading-relaxed">
                    Formation certifiée selon les standards internationaux de thérapie sensori-motrice.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 p-2 rounded-full mr-4 mt-1">
                        <Award className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Certification SP Institute</h4>
                        <p className="text-gray-600 text-sm">Sensorimotor Psychotherapy Institute</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-purple-100 p-2 rounded-full mr-4 mt-1">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Supervision Continue</h4>
                        <p className="text-gray-600 text-sm">Formation et mise à jour régulières</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-teal-100 p-2 rounded-full mr-4 mt-1">
                        <Brain className="h-4 w-4 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Approche Intégrative</h4>
                        <p className="text-gray-600 text-sm">Complémentaire à l'EMDR et autres thérapies</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-teal-100 px-6 py-3 rounded-full mb-6">
              <Heart className="h-5 w-5 text-teal-600 mr-2" />
              <span className="text-teal-600 font-semibold">Témoignages</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Ce que disent mes patients</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des parcours de guérison uniques, des résultats durables
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-blue-100 to-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 leading-relaxed">
                  "Grâce à la thérapie sensori-motrice, j'ai enfin pu me reconnecter à mon corps 
                  et retrouver une sérénité que je pensais perdue."
                </p>
                <div className="text-sm text-gray-500">
                  - Marie, 34 ans
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-teal-100 to-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-teal-600" />
                  </div>
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 leading-relaxed">
                  "L'approche douce et respectueuse de Dorian m'a permis de surmonter 
                  des traumatismes anciens en toute sécurité."
                </p>
                <div className="text-sm text-gray-500">
                  - Thomas, 42 ans
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 italic mb-4 leading-relaxed">
                  "Une méthode révolutionnaire qui a transformé ma relation à l'anxiété. 
                  Je recommande vivement cette approche."
                </p>
                <div className="text-sm text-gray-500">
                  - Sophie, 28 ans
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-teal-600 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="mb-12">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-semibold">Prendre Rendez-vous</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">Prêt(e) à commencer votre parcours ?</h2>
            <p className="text-xl mb-12 opacity-95 max-w-4xl mx-auto leading-relaxed">
              Je vous accompagne avec bienveillance dans votre cheminement vers la guérison 
              et l'épanouissement personnel. Prenons rendez-vous pour découvrir ensemble 
              comment la thérapie sensori-motrice peut vous aider.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-colors">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-full mb-4">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="font-semibold text-lg mb-2">Email</div>
                <div className="opacity-90">doriansarry@yahoo.fr</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-colors">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-full mb-4">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="font-semibold text-lg mb-2">Téléphone</div>
                <div className="opacity-90">06.45.15.63.68</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-colors">
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 p-3 rounded-full mb-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="font-semibold text-lg mb-2">Cabinet</div>
                <div className="opacity-90">20 rue des Jacobins<br/>24000 Périgueux</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-5 text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
              onClick={() => window.location.href = '/patient/book-appointment'}
            >
              <Calendar className="h-6 w-6 mr-3" />
              Prendre rendez-vous
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-5 text-lg font-semibold backdrop-blur-sm transition-all duration-300"
              onClick={() => window.location.href = '/login/patient'}
            >
              <Users className="h-6 w-6 mr-3" />
              Espace patient
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-3 rounded-full mr-4">
                  <Waves className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">Dorian Sarry</span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                <span className="font-semibold text-white">Praticien certifié en Thérapie Sensori-Motrice</span><br />
                Accompagnement bienveillant vers la guérison et l'épanouissement personnel 
                grâce à une approche scientifique et humaniste.
              </p>
              <div className="flex space-x-4">
                <div className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors">
                  <Mail className="h-5 w-5 text-gray-300" />
                </div>
                <div className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors">
                  <Phone className="h-5 w-5 text-gray-300" />
                </div>
                <div className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors">
                  <MapPin className="h-5 w-5 text-gray-300" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Navigation</h3>
              <ul className="space-y-3">
                <li><a href="/patient/book-appointment" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><Calendar className="h-4 w-4 mr-2" />Prendre rendez-vous</a></li>
                <li><a href="/patient/register" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><Users className="h-4 w-4 mr-2" />Créer un compte</a></li>
                <li><a href="/login/patient" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><Heart className="h-4 w-4 mr-2" />Espace patient</a></li>
                <li><a href="/login/admin" className="text-gray-300 hover:text-blue-400 transition-colors flex items-center"><Shield className="h-4 w-4 mr-2" />Espace praticien</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Légal & Contact</h3>
              <ul className="space-y-3 mb-6">
                <li><a href="/mentions-legales" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">Mentions légales</a></li>
                <li><a href="/politique-confidentialite" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">Confidentialité</a></li>
                <li><a href="/conditions-utilisation" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">Conditions d'utilisation</a></li>
              </ul>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-white font-semibold mb-2">Contact direct</h4>
                <p className="text-gray-300 text-sm mb-1">06.45.15.63.68</p>
                <p className="text-gray-300 text-sm">doriansarry@yahoo.fr</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; 2024 Dorian Sarry - Thérapie Sensori-Motrice. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <Award className="h-4 w-4 mr-1 text-blue-400" />
                  Certifié SP Institute
                </span>
                <span className="flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-green-400" />
                  Confidentialité garantie
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}