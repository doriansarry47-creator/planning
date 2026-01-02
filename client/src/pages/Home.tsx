import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { CheckCircle2, Heart, Brain, Shield, Phone, Mail, MapPin, Info, Sparkles, Calendar } from 'lucide-react';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge animé */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 shadow-lg mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-sm font-medium text-blue-700">Praticien certifié</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 tracking-tight animate-fade-in-up">
            Dorian Sarry
          </h1>
          
          <div className="inline-block mb-8">
            <h2 className="text-2xl md:text-4xl font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
              Thérapie Sensori-Motrice
            </h2>
            <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full mt-2 animate-scale-in"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in-up animation-delay-400">
            Accompagnement spécialisé pour la guérison des traumatismes et du stress 
            par l'approche sensori-motrice
          </p>
          
          <div className="flex flex-col gap-6 justify-center items-center animate-fade-in-up animation-delay-600">
            <Link href="/book-appointment">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-10 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-w-[280px]"
              >
                <Calendar className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Prendre rendez-vous
              </Button>
            </Link>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="group px-8 py-7 text-lg bg-white/80 backdrop-blur-sm hover:bg-white border-2 border-blue-600 text-blue-600 hover:text-blue-700 hover:border-indigo-600 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-w-[280px]"
                >
                  <Info className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Savoir plus sur le sensori-moteur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl mb-4 text-gray-900">
                    La Psychothérapie Sensori-Motrice
                  </DialogTitle>
                </DialogHeader>
                <div className="text-base text-left space-y-6 mt-4">
                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-gray-900 text-lg mb-3 flex items-center">
                      <Info className="h-5 w-5 text-blue-600 mr-2" />
                      Qu'est-ce que la Psychothérapie Sensori-Motrice ?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      La psychothérapie sensori-motrice est une approche thérapeutique intégrative 
                      qui combine la thérapie narrative et la thérapie corporelle. Elle mobilise les 
                      mouvements et sensations corporelles pour traiter les traumatismes et les 
                      problèmes développementaux.
                    </p>
                  </div>

                  <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                    <h3 className="font-semibold text-gray-900 text-lg mb-3 flex items-center">
                      <Heart className="h-5 w-5 text-amber-600 mr-2" />
                      Parce que les mots ne suffisent pas...
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Le corps possède sa propre mémoire. Les traumatismes se manifestent non 
                      seulement par des pensées et émotions, mais aussi par des réactions 
                      sensori-motrices : images intrusives, sensations corporelles, tensions, 
                      douleurs physiques ou engourdissements.
                    </p>
                  </div>

                  <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                    <h3 className="font-semibold text-gray-900 text-lg mb-3 flex items-center">
                      <Shield className="h-5 w-5 text-purple-600 mr-2" />
                      Le traitement des traumatismes
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Cette approche permet de traiter le trauma au niveau intellectuel mais 
                      également corporel, en travaillant directement avec les réactions 
                      physiques et sensorielles qui accompagnent les souvenirs traumatiques.
                    </p>
                  </div>

                  <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                    <h3 className="font-semibold text-gray-900 text-lg mb-3 flex items-center">
                      <Brain className="h-5 w-5 text-green-600 mr-2" />
                      Les blessures développementales
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      L'approche sensori-motrice est particulièrement efficace pour traiter les 
                      blessures d'attachement, le stress chronique précoce, et leurs impacts sur 
                      la régulation émotionnelle et les relations interpersonnelles.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 bg-gray-50 p-5 rounded-lg">
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      <strong className="text-gray-900 not-italic">À propos de la méthode :</strong><br />
                      Fondée par Pat Ogden, pionnière de la psychologie somatique et fondatrice 
                      du Sensorimotor Psychotherapy Institute®, cette méthode s'appuie sur les 
                      neurosciences, la théorie de l'attachement et les approches corporelles.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white/60 backdrop-blur-sm py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Comment la thérapie peut vous aider
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="group border-2 border-blue-100 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Heart className="h-10 w-10 text-blue-600 group-hover:animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                  Guérison des traumatismes
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Traitement du stress post-traumatique et des blessures émotionnelles profondes
                </p>
              </CardContent>
            </Card>

            <Card className="group border-2 border-indigo-100 hover:border-indigo-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Brain className="h-10 w-10 text-indigo-600 group-hover:animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-indigo-600 transition-colors">
                  Régulation émotionnelle
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Amélioration de la conscience corporelle et de la gestion des émotions
                </p>
              </CardContent>
            </Card>

            <Card className="group border-2 border-purple-100 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Shield className="h-10 w-10 text-purple-600 group-hover:animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-purple-600 transition-colors">
                  Renforcement de la résilience
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Restauration de la capacité de connexion à soi et aux autres
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <CardContent className="p-10">
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 p-3 rounded-full flex-shrink-0 shadow-lg">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl text-gray-800 italic mb-6 leading-relaxed font-light">
                    "Grâce à la thérapie sensori-motrice, j'ai enfin pu me reconnecter à mon corps 
                    et retrouver une sérénité que je pensais perdue."
                  </p>
                  <p className="text-gray-700 font-semibold text-lg">
                    — Marie, 34 ans
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white/60 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Contact & Localisation
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-100 hover:border-blue-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">Adresse</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    20 bis rue des Jacobins<br />
                    24000 Périgueux
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-indigo-100 hover:border-indigo-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Phone className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">Téléphone</h3>
                  <a 
                    href="tel:+33645156368" 
                    className="text-indigo-600 hover:text-indigo-700 hover:underline text-lg font-medium transition-colors"
                  >
                    06.45.15.63.68
                  </a>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-purple-100 hover:border-purple-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Mail className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">Email</h3>
                  <a 
                    href="mailto:doriansarry@yahoo.fr" 
                    className="text-purple-600 hover:text-purple-700 hover:underline break-all text-lg font-medium transition-colors"
                  >
                    doriansarry@yahoo.fr
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 text-white py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <p className="text-gray-400 text-lg">
              © 2025 Dorian Sarry - Thérapie Sensori-Motrice. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
