import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, User, Calendar, MessageCircle, HelpCircle, MapPin } from 'lucide-react';

interface TherapyIntakeFormData {
  // Informations de base
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  
  // Questionnaire d'accueil thérapie sensorimotrice
  isReferredByProfessional: boolean;
  referringProfessional?: string;
  consultationReason: string;
  symptomsStartDate: string;
  preferredSessionType: 'cabinet';
  
  // Questions supplémentaires pour la thérapie sensorimotrice
  hasPhysicalSymptoms: boolean;
  physicalSymptomsDescription?: string;
  hasEmotionalDifficulties: boolean;
  emotionalDifficultiesDescription?: string;
  previousTherapyExperience: boolean;
  previousTherapyDetails?: string;
  currentMedications?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  
  // Consentement
  consentToTreatment: boolean;
  consentToDataProcessing: boolean;
}

interface TherapyIntakeFormProps {
  onSubmit: (data: TherapyIntakeFormData) => Promise<void>;
  isLoading?: boolean;
  selectedDate?: Date;
  selectedTime?: string;
}

export function TherapyIntakeForm({ onSubmit, isLoading = false, selectedDate, selectedTime }: TherapyIntakeFormProps) {
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<TherapyIntakeFormData>({
    defaultValues: {
      isReferredByProfessional: false,
      hasPhysicalSymptoms: false,
      hasEmotionalDifficulties: false,
      previousTherapyExperience: false,
      consentToTreatment: false,
      consentToDataProcessing: false,
      preferredSessionType: 'cabinet'
    }
  });

  const watchIsReferred = watch('isReferredByProfessional');
  const watchHasPhysicalSymptoms = watch('hasPhysicalSymptoms');
  const watchHasEmotionalDifficulties = watch('hasEmotionalDifficulties');
  const watchPreviousTherapy = watch('previousTherapyExperience');
  const watchPassword = watch('password');

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
            Questionnaire d'accueil - Thérapie Sensorimotrice
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2 text-teal-600" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  {...register('firstName', { required: 'Le prénom est requis' })}
                  placeholder="Votre prénom"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  {...register('lastName', { required: 'Le nom est requis' })}
                  placeholder="Votre nom"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide'
                    }
                  })}
                  placeholder="votre@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password', { 
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 8,
                      message: 'Le mot de passe doit contenir au moins 8 caractères'
                    }
                  })}
                  placeholder="Minimum 8 caractères"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword', { 
                    required: 'Veuillez confirmer le mot de passe',
                    validate: (value) => value === watchPassword || 'Les mots de passe ne correspondent pas'
                  })}
                  placeholder="Confirmer le mot de passe"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questionnaire thérapeutique */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <HelpCircle className="h-5 w-5 mr-2 text-teal-600" />
              Questionnaire thérapeutique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Référé par un professionnel */}
            <div>
              <Label className="text-base font-medium">Êtes-vous adressé(e) par un professionnel de santé ?</Label>
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
                placeholder="Décrivez ce qui vous amène à consulter : symptômes, difficultés rencontrées, objectifs..."
              />
              {errors.consultationReason && (
                <p className="text-red-500 text-sm mt-1">{errors.consultationReason.message}</p>
              )}
            </div>

            {/* Date d'apparition */}
            <div>
              <Label htmlFor="symptomsStartDate">Depuis quand ressentez-vous ce besoin de consultation ?</Label>
              <Input
                id="symptomsStartDate"
                {...register('symptomsStartDate')}
                placeholder="Il y a 2 mois, depuis janvier 2024, récemment..."
              />
            </div>

            {/* Note sur la consultation */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-teal-600" />
                <div>
                  <div className="font-medium text-teal-900">Consultation en cabinet uniquement</div>
                  <div className="text-sm text-teal-700 mt-1">
                    Toutes les séances de thérapie sensorimotrice se déroulent en présentiel dans le cabinet 
                    situé au 20 rue des Jacobins, 24000 Périgueux.
                  </div>
                </div>
              </div>
            </div>

            {/* Symptômes physiques */}
            <div>
              <Label className="text-base font-medium">Ressentez-vous des symptômes physiques ?</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('hasPhysicalSymptoms')}
                    className="mr-2"
                  />
                  Oui, j'ai des manifestations physiques
                </label>
              </div>
              
              {watchHasPhysicalSymptoms && (
                <div className="mt-4">
                  <Label htmlFor="physicalSymptomsDescription">Décrivez vos symptômes physiques</Label>
                  <textarea
                    id="physicalSymptomsDescription"
                    {...register('physicalSymptomsDescription')}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Tensions, douleurs, troubles du sommeil, fatigue..."
                  />
                </div>
              )}
            </div>

            {/* Difficultés émotionnelles */}
            <div>
              <Label className="text-base font-medium">Rencontrez-vous des difficultés émotionnelles ?</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('hasEmotionalDifficulties')}
                    className="mr-2"
                  />
                  Oui, j'ai des difficultés émotionnelles
                </label>
              </div>
              
              {watchHasEmotionalDifficulties && (
                <div className="mt-4">
                  <Label htmlFor="emotionalDifficultiesDescription">Décrivez vos difficultés émotionnelles</Label>
                  <textarea
                    id="emotionalDifficultiesDescription"
                    {...register('emotionalDifficultiesDescription')}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Anxiété, stress, difficultés relationnelles, trauma..."
                  />
                </div>
              )}
            </div>

            {/* Expérience thérapeutique antérieure */}
            <div>
              <Label className="text-base font-medium">Avez-vous déjà suivi une thérapie ?</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('previousTherapyExperience')}
                    className="mr-2"
                  />
                  Oui, j'ai déjà consulté un thérapeute
                </label>
              </div>
              
              {watchPreviousTherapy && (
                <div className="mt-4">
                  <Label htmlFor="previousTherapyDetails">Décrivez votre expérience thérapeutique antérieure</Label>
                  <textarea
                    id="previousTherapyDetails"
                    {...register('previousTherapyDetails')}
                    rows={3}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Type de thérapie, durée, bénéfices obtenus..."
                  />
                </div>
              )}
            </div>

            {/* Médicaments actuels */}
            <div>
              <Label htmlFor="currentMedications">Prenez-vous actuellement des médicaments ?</Label>
              <textarea
                id="currentMedications"
                {...register('currentMedications')}
                rows={2}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Listez vos médicaments actuels (optionnel)"
              />
            </div>

            {/* Contact d'urgence */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Personne à contacter en cas d'urgence</Label>
                <Input
                  id="emergencyContact"
                  {...register('emergencyContact')}
                  placeholder="Nom de la personne"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Téléphone d'urgence</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  {...register('emergencyPhone')}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consentement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <MessageCircle className="h-5 w-5 mr-2 text-teal-600" />
              Consentement et acceptation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  {...register('consentToTreatment', { required: 'Veuillez accepter le consentement au traitement' })}
                  className="mr-3 mt-1"
                />
                <div className="text-sm">
                  <span className="font-medium">Consentement au traitement</span>
                  <p className="text-gray-600 mt-1">
                    Je consens à recevoir un traitement de thérapie sensorimotrice de la part de Dorian Sarry. 
                    Je comprends que cette approche thérapeutique vise à intégrer les aspects sensoriels et moteurs 
                    dans le processus de guérison.
                  </p>
                </div>
              </label>
              {errors.consentToTreatment && (
                <p className="text-red-500 text-sm mt-1">{errors.consentToTreatment.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  {...register('consentToDataProcessing', { required: 'Veuillez accepter le traitement des données' })}
                  className="mr-3 mt-1"
                />
                <div className="text-sm">
                  <span className="font-medium">Traitement des données personnelles (RGPD)</span>
                  <p className="text-gray-600 mt-1">
                    J'accepte que mes données personnelles soient traitées dans le cadre de ma prise en charge thérapeutique, 
                    conformément au Règlement Général sur la Protection des Données (RGPD). Ces données ne seront utilisées 
                    que dans le cadre de mon suivi thérapeutique et ne seront pas transmises à des tiers.
                  </p>
                </div>
              </label>
              {errors.consentToDataProcessing && (
                <p className="text-red-500 text-sm mt-1">{errors.consentToDataProcessing.message}</p>
              )}
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
                    Création du compte...
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5 mr-2" />
                    Finaliser et prendre rendez-vous
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-600 mt-4">
                En soumettant ce formulaire, vous acceptez nos conditions d'utilisation 
                et notre politique de confidentialité.
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}