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
import { CheckCircle2, Heart, Brain, Shield, Phone, Mail, MapPin, Info, Lock } from 'lucide-react';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Bouton Admin Discret - Position fixe en haut à droite */}
      <Link href="/login">
        <button 
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/80 
                     text-gray-400 hover:text-gray-600 transition-all duration-300 
                     backdrop-blur-sm border border-gray-200/30 hover:border-gray-300/50
                     shadow-sm hover:shadow-md group"
          aria-label="Accès administrateur"
          title="Accès administrateur"
        >
          <Lock className="h-4 w-4 group-hover:scale-110 transition-transform" />
        </button>
      </Link>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Dorian Sarry
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-blue-700">
            Praticien certifié en Thérapie Sensori-Motrice
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Accompagnement spécialisé pour la guérison des traumatismes et du stress 
            par l'approche sensori-motrice
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/book-appointment">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg">
                Prendre rendez-vous
              </Button>
            </Link>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-6 text-lg bg-white hover:bg-gray-50 border-2 border-blue-600 text-blue-600 hover:text-blue-700 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Info className="mr-2 h-5 w-5" />
                  En savoir plus
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl mb-4">
                    La Psychothérapie Sensori-Motrice
                  </DialogTitle>
                  <DialogDescription className="text-base text-left space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        Qu'est-ce que la Psychothérapie Sensori-Motrice ?
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        La psychothérapie sensori-motrice est une approche thérapeutique intégrative 
                        qui combine la thérapie narrative et la thérapie corporelle. Elle mobilise les 
                        mouvements et sensations corporelles pour traiter les traumatismes et les 
                        problèmes développementaux.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        Parce que les mots ne suffisent pas...
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Le corps possède sa propre mémoire. Les traumatismes se manifestent non 
                        seulement par des pensées et émotions, mais aussi par des réactions 
                        sensori-motrices : images intrusives, sensations corporelles, tensions, 
                        douleurs physiques ou engourdissements.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        Le traitement des traumatismes
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Cette approche permet de traiter le trauma au niveau intellectuel mais 
                        également corporel, en travaillant directement avec les réactions 
                        physiques et sensorielles qui accompagnent les souvenirs traumatiques.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        Les blessures développementales
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        L'approche sensori-motrice est particulièrement efficace pour traiter les 
                        blessures d'attachement, le stress chronique précoce, et leurs impacts sur 
                        la régulation émotionnelle et les relations interpersonnelles.
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 italic">
                        Fondée par Pat Ogden, pionnière de la psychologie somatique et fondatrice 
                        du Sensorimotor Psychotherapy Institute®, cette méthode s'appuie sur les 
                        neurosciences, la théorie de l'attachement et les approches corporelles.
                      </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Comment la thérapie peut vous aider
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Heart className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Guérison des traumatismes
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Traitement du stress post-traumatique et des blessures émotionnelles profondes
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Brain className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Régulation émotionnelle
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Amélioration de la conscience corporelle et de la gestion des émotions
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Renforcement de la résilience
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Restauration de la capacité de connexion à soi et aux autres
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg text-gray-700 italic mb-4 leading-relaxed">
                    "Grâce à la thérapie sensori-motrice, j'ai enfin pu me reconnecter à mon corps 
                    et retrouver une sérénité que je pensais perdue."
                  </p>
                  <p className="text-gray-600 font-medium">
                    — Marie, 34 ans
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Contact & Localisation
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-gray-900">Adresse</h3>
                  <p className="text-gray-600">
                    20 rue des Jacobins<br />
                    24000 Périgueux
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Phone className="h-6 w-6 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-gray-900">Téléphone</h3>
                  <a href="tel:+33645156368" className="text-blue-600 hover:underline">
                    06.45.15.63.68
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Mail className="h-6 w-6 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2 text-gray-900">Email</h3>
                  <a 
                    href="mailto:doriansarry@yahoo.fr" 
                    className="text-blue-600 hover:underline break-all"
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
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 Dorian Sarry - Thérapie Sensori-Motrice. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
