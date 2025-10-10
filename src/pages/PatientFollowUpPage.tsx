import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  FileText, 
  Target,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

export function PatientFollowUpPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Button 
              variant="ghost" 
              className="flex items-center text-green-700 hover:bg-green-50"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Suivi Thérapeutique</h1>
                <p className="text-xs text-purple-600 font-medium">Dorian Sarry - Thérapie Sensorimotrice</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="p-12 text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-xl w-fit mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Suivi Thérapeutique
            </h2>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl mb-6">
              <p className="text-xl text-purple-800 font-semibold mb-2">
                Bientôt disponible
              </p>
              <p className="text-purple-700">
                Cette fonctionnalité de suivi personnalisé sera bientôt disponible pour vous permettre 
                de suivre votre progression et consulter les notes de vos séances.
              </p>
            </div>
            
            <div className="text-left bg-gray-50 p-6 rounded-xl mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-600" />
                Ce que vous pourrez bientôt faire :
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Consulter vos objectifs thérapeutiques
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Suivre votre progression séance après séance
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Accéder aux résumés de vos séances
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Visualiser votre évolution thérapeutique
                </li>
              </ul>
            </div>
            
            <Button 
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
              onClick={() => window.location.href = '/patient/dashboard'}
            >
              Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}