import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, User, Calendar, MessageCircle, CheckCircle } from 'lucide-react';

interface QuickAppointmentData {
  consultationReason: string;
  symptomsStartDate?: string;
  isReferredByProfessional: boolean;
  referringProfessional?: string;
}

interface QuickAppointmentFormProps {
  user: any;
  onSubmit: (data: QuickAppointmentData) => Promise<void>;
  isLoading?: boolean;
  selectedDate?: Date;
  selectedTime?: string;
}

export function QuickAppointmentForm({ 
  user, 
  onSubmit, 
  isLoading = false, 
  selectedDate, 
  selectedTime 
}: QuickAppointmentFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<QuickAppointmentData>({
    defaultValues: {
      isReferredByProfessional: false,
    }
  });

  const watchIsReferred = watch('isReferredByProfessional');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* En-tête */}
      <Card className="border-t-4 border-teal-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Nouveau Rendez-vous
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Dorian Sarry - Praticien en thérapie sensorimotrice
          </p>
          {selectedDate && selectedTime && (
            <div className="flex justify-center items-center mt-4 text-teal-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-medium">
                Rendez-vous prévu le {selectedDate.toLocaleDateString('fr-FR')} à {selectedTime}
              </span>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Informations du patient connecté */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-green-800">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Patient identifié
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-green-800">Nom :</span>
              <span className="ml-2 text-green-700">{user.firstName} {user.lastName}</span>
            </div>
            <div>
              <span className="font-medium text-green-800">Email :</span>
              <span className="ml-2 text-green-700">{user.email}</span>
            </div>
            {user.phone && (
              <div>
                <span className="font-medium text-green-800">Téléphone :</span>
                <span className="ml-2 text-green-700">{user.phone}</span>
              </div>
            )}
          </div>
          <p className="text-green-700 text-sm mt-3">
            ✓ Vos informations personnelles sont déjà enregistrées. Vous n'avez plus qu'à préciser le motif de cette nouvelle consultation.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Motif de consultation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <MessageCircle className="h-5 w-5 mr-2 text-teal-600" />
              Motif de cette consultation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Référé par un professionnel */}
            <div>
              <Label className="text-base font-medium">Êtes-vous adressé(e) par un professionnel de santé pour cette consultation ?</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('isReferredByProfessional')}
                    value="true"
                    className="mr-2"
                  />
                  Oui
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('isReferredByProfessional')}
                    value="false"
                    className="mr-2"
                  />
                  Non
                </label>
              </div>
              
              {watchIsReferred && (
                <div className="mt-4">
                  <Label htmlFor="referringProfessional">Nom du professionnel référent</Label>
                  <Input
                    id="referringProfessional"
                    {...register('referringProfessional')}
                    placeholder="Dr. Dupont, Psychologue Martin..."
                  />
                </div>
              )}
            </div>

            {/* Motif de consultation */}
            <div>
              <Label htmlFor="consultationReason">Motif de votre demande de consultation *</Label>
              <textarea
                id="consultationReason"
                {...register('consultationReason', { 
                  required: 'Veuillez décrire votre motif de consultation'
                })}
                rows={4}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Décrivez ce qui vous amène à consulter aujourd'hui : nouveaux symptômes, évolution de votre situation, suivi..."
              />
              {errors.consultationReason && (
                <p className="text-red-500 text-sm mt-1">{errors.consultationReason.message}</p>
              )}
            </div>

            {/* Date d'apparition */}
            <div>
              <Label htmlFor="symptomsStartDate">Depuis quand ressentez-vous ce nouveau besoin de consultation ?</Label>
              <Input
                id="symptomsStartDate"
                {...register('symptomsStartDate')}
                placeholder="Il y a 2 semaines, depuis le mois dernier, récemment..."
              />
            </div>

            {/* Note information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">Suivi thérapeutique</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Votre historique thérapeutique et vos informations personnelles sont déjà disponibles. 
                    Dorian Sarry pourra ainsi mieux adapter la séance à vos besoins actuels.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bouton de soumission */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Confirmation en cours...
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5 mr-2" />
                    Confirmer le rendez-vous
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-600 mt-4">
                Votre rendez-vous sera confirmé et vous recevrez une notification par email et SMS.
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}