import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  FileText, 
  TrendingUp,
  Calendar,
  Target,
  Heart,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export function PatientFollowUpPage() {
  const { user } = useAuth();

  // Récupérer le suivi thérapeutique du patient
  const { data: followUp, isLoading } = useQuery({
    queryKey: ['patient-follow-up'],
    queryFn: async () => {
      // Pour l'instant, on retourne des données mock
      // TODO: Implémenter l'API pour récupérer le suivi réel
      return {
        sessions: [
          {
            id: '1',
            date: '2024-03-15',
            notes: 'Première séance - évaluation initiale. Le patient présente des tensions dans les épaules et le cou. Bon engagement dans le processus.',
            objectives: ['Réduire les tensions musculaires', 'Améliorer la conscience corporelle'],
            progress: 'Début de parcours'
          },
          {
            id: '2',
            date: '2024-03-22',
            notes: 'Travail sur la respiration et les sensations corporelles. Le patient commence à identifier les zones de tension.',
            objectives: ['Approfondir la respiration', 'Explorer les sensations'],
            progress: 'Progrès notable'
          },
          {
            id: '3',
            date: '2024-03-29',
            notes: 'Séance axée sur l\'intégration des mouvements naturels. Meilleure connexion corps-esprit observée.',
            objectives: ['Intégrer les mouvements', 'Renforcer la connexion'],
            progress: 'Évolution positive'
          }
        ],
        summary: {
          totalSessions: 3,
          startDate: '2024-03-15',
          mainObjectives: [
            'Réduction des tensions corporelles',
            'Amélioration de la conscience somatique',
            'Régulation du système nerveux',
            'Renforcement de la résilience'
          ],
          currentProgress: 'En cours - évolution positive'
        }
      };
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.history.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Mon Suivi Thérapeutique</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Résumé du parcours */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                  Résumé de votre parcours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Informations générales</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-purple-600 mr-2" />
                        <span>Début du suivi: {formatDate(followUp?.summary.startDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-purple-600 mr-2" />
                        <span>Nombre de séances: {followUp?.summary.totalSessions}</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-purple-600 mr-2" />
                        <span>Statut: {followUp?.summary.currentProgress}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Objectifs principaux</h3>
                    <div className="space-y-2">
                      {followUp?.summary.mainObjectives.map((objective, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Target className="h-4 w-4 text-purple-600 mr-2 flex-shrink-0" />
                          <span>{objective}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message d'introduction */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-teal-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 p-3 rounded-full">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      Bienvenue dans votre suivi thérapeutique
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      Cette section vous permet de suivre l'évolution de votre parcours en thérapie sensorimotrice 
                      avec Dorian Sarry. Vous y trouverez un résumé de vos séances, les objectifs travaillés et 
                      les notes importantes de votre praticien. Cet espace vous aide à prendre conscience de votre 
                      progression et à rester connecté(e) à votre processus de guérison.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historique des séances */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  Historique des séances
                </CardTitle>
              </CardHeader>
              <CardContent>
                {followUp?.sessions && followUp.sessions.length > 0 ? (
                  <div className="space-y-6">
                    {followUp.sessions.map((session, index) => (
                      <div 
                        key={session.id}
                        className="border-l-4 border-blue-500 pl-6 pb-6 last:pb-0"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">
                            Séance #{followUp.sessions.length - index}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(session.date)}
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Notes de séance</h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {session.notes}
                          </p>
                        </div>

                        {session.objectives && session.objectives.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-900 mb-2 text-sm">Objectifs travaillés</h4>
                            <div className="space-y-1">
                              {session.objectives.map((objective, objIndex) => (
                                <div key={objIndex} className="flex items-center text-sm">
                                  <CheckCircle2 className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                                  <span className="text-gray-700">{objective}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-gray-700 font-medium">
                            Progression: {session.progress}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Aucune séance enregistrée pour le moment</p>
                    <Button 
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                      onClick={() => window.location.href = '/patient/book-appointment'}
                    >
                      Prendre un premier rendez-vous
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prochaine étape */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Continuer votre parcours
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Votre progression est encourageante. Poursuivons ensemble ce chemin vers votre mieux-être.
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    onClick={() => window.location.href = '/patient/book-appointment'}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Prendre un nouveau rendez-vous
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}