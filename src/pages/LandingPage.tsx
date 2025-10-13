import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  Shield, 
  Users, 
  Heart, 
  Stethoscope,
  ArrowRight,
  Phone,
  Mail,
  Brain,
  Sparkles,
  CheckCircle,
  Target,
  Waves,
  TreePine,
  Lightbulb
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/40">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-slate-600 to-blue-700 p-2 rounded-lg mr-3">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Dorian Sarry</h1>
                <p className="text-sm text-slate-600 font-medium">Thérapeute en psychomotricité sensori-motrice®</p>
              </div>
            </div>
            <div className="space-x-3">
              <Link href="/login/patient">
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  Connexion Patient
                </Button>
              </Link>
              <Link href="/login/admin">
                <Button className="bg-gradient-to-r from-slate-600 to-blue-700 hover:from-slate-700 hover:to-blue-800">
                  Espace Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center bg-blue-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-blue-100">
                <Waves className="w-4 h-4 mr-2 text-blue-600" />
                Thérapie sensori-motrice® • Neurosciences • Traumatologie
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Travailler par le corps
                <span className="block text-blue-700">pour intégrer les expériences</span>
                <span className="block text-slate-600 text-3xl lg:text-4xl mt-2">et restaurer la sécurité intérieure</span>
              </h2>
              <p className="text-lg text-slate-700 mb-6 leading-relaxed max-w-xl">
                Nos expériences et nos croyances restent inscrites dans le corps — posture, tonus, respiration. 
                La thérapie sensori-motrice® permet de transformer ces mémoires corporelles avec une approche 
                basée sur la pleine conscience, les neurosciences et la traumatologie.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 max-w-xl">
                <p className="text-sm text-slate-600 italic">
                  <span className="font-medium">Formation Sensorimotor Psychotherapy Institute®</span> — 
                  Approche développée par Pat Ogden, basée sur les recherches en neurosciences et attachement.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login/patient">
                  <Button size="lg" className="bg-gradient-to-r from-slate-600 to-blue-700 hover:from-slate-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Prendre rendez-vous
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-xl">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact direct
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-3xl p-8 shadow-xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                  <div className="flex items-center mb-4">
                    <TreePine className="h-8 w-8 text-blue-600 mr-3" />
                    <h3 className="text-xl font-bold text-slate-900">Bénéfices thérapeutiques</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-slate-700">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                      <span className="text-sm">Retrouver sécurité et stabilité intérieure</span>
                    </div>
                    <div className="flex items-center text-slate-700">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                      <span className="text-sm">Réguler émotions et réactions corporelles</span>
                    </div>
                    <div className="flex items-center text-slate-700">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                      <span className="text-sm">Explorer en pleine conscience</span>
                    </div>
                    <div className="flex items-center text-slate-700">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                      <span className="text-sm">Intégrer progressivement les expériences</span>
                    </div>
                    <div className="flex items-center text-slate-700">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-3" />
                      <span className="text-sm">Développer des ressources personnelles</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 italic">
                      Complémentaire à d'autres approches (EMDR, etc.)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-16 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              La thérapie sensori-motrice® en pratique
            </h3>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Une approche thérapeutique innovante qui reconnaît que nos expériences et traumatismes 
              s'inscrivent dans le corps. Les séances sont basées sur l'observation des mouvements, 
              postures et sensations pour favoriser l'intégration et la guérison.
            </p>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-8 mb-12 border border-slate-200">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <Target className="h-6 w-6 text-blue-600 mr-3" />
                  <h4 className="text-xl font-semibold text-slate-900">Indications principales</h4>
                </div>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    Troubles de l'attachement et relations interpersonnelles
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    Traumatismes complexes et ESPT
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    Troubles anxieux et dépression
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    Difficultés de régulation émotionnelle
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-6 w-6 text-blue-600 mr-3" />
                  <h4 className="text-xl font-semibold text-slate-900">Fondements scientifiques</h4>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Basée sur les recherches en <strong>neurosciences</strong>, <strong>théorie de l'attachement</strong> 
                  et <strong>traumatologie</strong>. Cette approche intègre les découvertes sur la mémoire 
                  procédurale, l'impact du trauma sur le système nerveux, et l'importance de la 
                  régulation corporelle dans la guérison psychique.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 rounded-xl w-fit">
                  <Waves className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-slate-900 mt-4">Sécurisation et stabilisation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Restaurer la capacité du système nerveux à s'auto-réguler. 
                  Techniques de régulation pour retrouver un état de sécurité intérieure 
                  et favoriser la résilience naturelle du corps.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader>
                <div className="bg-gradient-to-r from-slate-600 to-blue-700 p-3 rounded-xl w-fit">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-slate-900 mt-4">Exploration en pleine conscience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Apprendre à observer ses sensations, émotions et pensées sans jugement. 
                  Développer la conscience corporelle pour mieux comprendre les messages 
                  du corps et ses besoins.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader>
                <div className="bg-gradient-to-r from-green-600 to-teal-700 p-3 rounded-xl w-fit">
                  <TreePine className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-slate-900 mt-4">Intégration progressive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Accompagner l'intégration graduelle des expériences douloureuses. 
                  Favoriser l'émergence de nouvelles ressources et 
                  patterns comportementaux plus adaptés.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-3 rounded-xl w-fit">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-slate-900 mt-4">Planification accessible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Prise de rendez-vous simplifiée et flexible. 
                  Interface sécurisée pour organiser votre parcours thérapeutique 
                  en respectant votre rythme et vos besoins.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader>
                <div className="bg-gradient-to-r from-slate-600 to-gray-700 p-3 rounded-xl w-fit">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-slate-900 mt-4">Environnement sécurisé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Respect strict du secret professionnel et cadre thérapeutique 
                  bienveillant. Protection complète de vos données personnelles 
                  et de votre intimité psychique.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader>
                <div className="bg-gradient-to-r from-teal-600 to-green-700 p-3 rounded-xl w-fit">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-slate-900 mt-4">Accompagnement individualisé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Approche collaborative et non-intrusive. Adaptation des techniques 
                  selon votre profil unique, vos ressources et votre progression 
                  dans le processus thérapeutique.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 to-indigo-900/30"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Heart className="w-4 h-4 mr-2" />
            Premier rendez-vous disponible rapidement
          </div>
          <h3 className="text-4xl font-bold mb-6 leading-tight">
            Commencez votre parcours vers un mieux-être durable
          </h3>
          <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto leading-relaxed">
            La thérapie sensori-motrice® offre un espace sécurisé pour explorer, intégrer et guérir. 
            Prenez rendez-vous dès aujourd'hui pour retrouver votre équilibre intérieur.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login/patient">
              <Button size="lg" className="bg-white text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                Prendre rendez-vous
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl">
              <Mail className="mr-2 h-4 w-4" />
              Questions ? Me contacter
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-slate-600 to-blue-700 p-2 rounded-lg mr-3">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">Dorian Sarry</h4>
                  <p className="text-blue-300">Thérapeute en psychomotricité sensori-motrice®</p>
                </div>
              </div>
              <p className="text-slate-300 max-w-md leading-relaxed text-sm">
                Formation Sensorimotor Psychotherapy Institute®. Spécialiste de l'intégration 
                psycho-corporelle basée sur les neurosciences, la traumatologie et la théorie 
                de l'attachement. Approche douce et respectueuse du rythme de chacun.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-300">Approches thérapeutiques</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>Thérapie sensori-motrice®</li>
                <li>Pleine conscience corporelle</li>
                <li>Traumatologie spécialisée</li>
                <li>Régulation du système nerveux</li>
                <li>Complémentaire à l'EMDR</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-blue-300">Informations pratiques</h4>
              <div className="space-y-3 text-slate-300 text-sm">
                <div className="flex items-start">
                  <Mail className="h-4 w-4 mr-2 text-blue-400 mt-0.5" />
                  <span>doriansarry47@gmail.com</span>
                </div>
                <div className="flex items-start">
                  <Phone className="h-4 w-4 mr-2 text-blue-400 mt-0.5" />
                  <span>Consultations sur rendez-vous</span>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mr-2 text-blue-400 mt-0.5" />
                  <span>Séances adaptées à votre rythme</span>
                </div>
                <div className="flex items-start">
                  <Shield className="h-4 w-4 mr-2 text-blue-400 mt-0.5" />
                  <span>Cadre thérapeutique sécurisé</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-12 pt-8">
            <div className="text-center text-slate-400">
              <p>&copy; 2024 Dorian Sarry - Thérapie sensori-motrice®. Tous droits réservés.</p>
              <p className="text-xs mt-2">Respect strict du secret professionnel • Données protégées RGPD • Formation continue certifiée</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}