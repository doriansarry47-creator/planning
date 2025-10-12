import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle } from 'lucide-react';

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
              <p className="text-gray-600 mt-1">
                Conditions d'utilisation de la plateforme de prise de rendez-vous en ligne
              </p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Version en vigueur :</strong> 1.0 - Dernière mise à jour : 12 octobre 2024<br />
                L'utilisation de ce service implique l'acceptation pleine et entière de ces conditions.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Section 1: Objet */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">1. Objet</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les 
                modalités et conditions d'utilisation de la plateforme de prise de rendez-vous en ligne 
                proposée par Dorian Sarry, Praticien en Thérapie Sensorimotrice.
              </p>
              <p>
                Cette plateforme permet aux patients de prendre rendez-vous en ligne pour des consultations 
                en thérapie sensorimotrice, de gérer leur profil patient et de suivre leurs rendez-vous.
              </p>
            </div>
          </section>

          {/* Section 2: Acceptation */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              2. Acceptation des conditions
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                L'accès et l'utilisation de la plateforme impliquent l'acceptation pleine et entière des 
                présentes CGU. Si vous n'acceptez pas ces conditions, vous devez cesser immédiatement 
                d'utiliser le service.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-amber-800">
                    <strong>Important :</strong> Ces CGU peuvent être modifiées à tout moment. 
                    Nous vous informerons de toute modification substantielle par email ou via 
                    la plateforme. La version applicable est celle en vigueur au moment de votre utilisation.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Description du service */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              3. Description du service
            </h2>
            <div className="space-y-6">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-teal-800 mb-3">3.1 Services proposés</h3>
                <ul className="space-y-2 text-teal-700">
                  <li>• Prise de rendez-vous en ligne 24h/24</li>
                  <li>• Gestion et modification des rendez-vous</li>
                  <li>• Espace patient personnalisé</li>
                  <li>• Historique des consultations</li>
                  <li>• Communication sécurisée avec le praticien</li>
                  <li>• Rappels de rendez-vous par email</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">3.2 Disponibilité du service</h3>
                <p className="text-blue-700">
                  Nous nous efforçons d'assurer une disponibilité du service 24h/24, 7j/7. Cependant, 
                  des interruptions peuvent survenir pour maintenance, mise à jour ou en cas de force majeure. 
                  Nous nous engageons à minimiser ces interruptions et à vous en informer dans la mesure du possible.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Inscription et compte utilisateur */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              4. Inscription et compte utilisateur
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.1 Conditions d'inscription</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Être majeur ou avoir l'autorisation d'un représentant légal</li>
                  <li>• Fournir des informations exactes et complètes</li>
                  <li>• Posséder une adresse email valide</li>
                  <li>• Accepter les présentes CGU et la Politique de Confidentialité</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">4.2 Responsabilités du compte</h3>
                <div className="text-gray-700 space-y-2">
                  <p>Vous vous engagez à :</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Maintenir la confidentialité de vos identifiants de connexion</li>
                    <li>• Informer immédiatement en cas d'utilisation non autorisée de votre compte</li>
                    <li>• Mettre à jour vos informations personnelles si nécessaire</li>
                    <li>• Utiliser le service conformément à sa destination médicale</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Utilisation du service */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              5. Règles d'utilisation
            </h2>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Utilisations autorisées</h3>
                  <ul className="space-y-1 text-sm text-green-700">
                    <li>• Prise de rendez-vous pour des consultations légitimes</li>
                    <li>• Gestion de votre profil patient</li>
                    <li>• Communication professionnelle avec le praticien</li>
                    <li>• Consultation de vos informations médicales</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Utilisations interdites</h3>
                  <ul className="space-y-1 text-sm text-red-700">
                    <li>• Usurpation d'identité</li>
                    <li>• Utilisation commerciale non autorisée</li>
                    <li>• Tentatives de piratage ou d'intrusion</li>
                    <li>• Diffusion d'informations fausses ou malveillantes</li>
                    <li>• Utilisation contraire aux bonnes mœurs</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Rendez-vous */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibent text-gray-800 mb-4 pb-2 border-b border-gray-200">
              6. Gestion des rendez-vous
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">6.1 Prise de rendez-vous</h3>
                <div className="text-blue-700 space-y-2">
                  <p>• Les créneaux affichés sont ceux disponibles en temps réel</p>
                  <p>• La confirmation du rendez-vous vous sera envoyée par email</p>
                  <p>• Tout rendez-vous pris engage votre responsabilité</p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">6.2 Modification et annulation</h3>
                <div className="text-orange-700 space-y-2">
                  <p><strong>Délais requis :</strong></p>
                  <ul className="ml-4 space-y-1">
                    <li>• Modification : minimum 24h avant le rendez-vous</li>
                    <li>• Annulation : minimum 48h avant le rendez-vous</li>
                  </ul>
                  <p className="text-sm mt-2">
                    Les annulations tardives ou les absences non justifiées peuvent donner lieu 
                    à la facturation de la consultation.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">6.3 Présence aux consultations</h3>
                <div className="text-gray-700 space-y-2">
                  <p>• Respecter l'heure de rendez-vous (tolérance de 10 minutes)</p>
                  <p>• Se présenter en état de suivre la consultation</p>
                  <p>• Signaler tout empêchement dans les délais requis</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Responsabilités */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              7. Responsabilités et limitations
            </h2>
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-teal-800 mb-3">7.1 Responsabilité du praticien</h3>
                <div className="text-teal-700 space-y-2">
                  <p>• Assurer la sécurité et la confidentialité des données</p>
                  <p>• Maintenir la qualité du service dans la mesure du possible</p>
                  <p>• Respecter le secret médical et les règles déontologiques</p>
                  <p>• Informer en cas de dysfonctionnement majeur</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">7.2 Responsabilité de l'utilisateur</h3>
                <div className="text-blue-700 space-y-2">
                  <p>• Utilisation conforme du service</p>
                  <p>• Exactitude des informations fournies</p>
                  <p>• Sécurisation de ses accès personnels</p>
                  <p>• Respect des règles de civilité et de bienséance</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibent text-red-800 mb-3">7.3 Limitations de responsabilité</h3>
                <div className="text-red-700 space-y-2">
                  <p>• Pannes techniques indépendantes de notre volonté</p>
                  <p>• Interruptions liées aux fournisseurs tiers (internet, hébergement)</p>
                  <p>• Utilisation malveillante par des tiers</p>
                  <p>• Cas de force majeure</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8: Données personnelles */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              8. Protection des données personnelles
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Le traitement de vos données personnelles est soumis à notre{' '}
                <a href="/politique-confidentialite" className="text-teal-600 hover:text-teal-700 underline">
                  Politique de Confidentialité
                </a>{' '}
                qui fait partie intégrante des présentes CGU.
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Principaux engagements :</h3>
                <ul className="space-y-1 text-gray-700">
                  <li>• Conformité au RGPD et à la loi Informatique et Libertés</li>
                  <li>• Chiffrement et sécurisation des données médicales</li>
                  <li>• Respect du secret médical</li>
                  <li>• Droits d'accès, rectification et suppression</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 9: Propriété intellectuelle */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              9. Propriété intellectuelle
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                L'ensemble du contenu de cette plateforme (textes, images, logos, structure, 
                fonctionnalités) est protégé par les droits de propriété intellectuelle et appartient 
                à Dorian Sarry ou à ses partenaires.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800">
                  <strong>Utilisation autorisée :</strong> Consultation personnelle dans le cadre de 
                  l'utilisation normale du service. Toute reproduction, diffusion ou utilisation 
                  commerciale est interdite sans autorisation écrite préalable.
                </p>
              </div>
            </div>
          </section>

          {/* Section 10: Résiliation */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              10. Suspension et résiliation
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">10.1 Par l'utilisateur</h3>
                  <div className="text-blue-700 space-y-1 text-sm">
                    <p>• Suppression du compte à tout moment</p>
                    <p>• Conservation des données médicales selon obligations légales</p>
                    <p>• Possibilité de récupérer ses données avant suppression</p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">10.2 Par le praticien</h3>
                  <div className="text-red-700 space-y-1 text-sm">
                    <p>• Violation des présentes CGU</p>
                    <p>• Utilisation frauduleuse ou malveillante</p>
                    <p>• Non-respect répété des rendez-vous</p>
                    <p>• Comportement inapproprié</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 11: Droit applicable */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              11. Droit applicable et juridiction
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Les présentes CGU sont régies par le droit français. En cas de litige, les parties 
                s'efforceront de trouver une solution amiable. À défaut, les tribunaux français 
                seront seuls compétents.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-sm">
                  <strong>Médiation :</strong> Conformément au Code de la consommation, vous avez le droit 
                  de recourir gratuitement à un médiateur de la consommation en cas de litige. 
                  Coordonnées disponibles sur demande.
                </p>
              </div>
            </div>
          </section>

          {/* Section 12: Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              12. Contact et assistance
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Pour toute question concernant ces CGU ou l'utilisation du service :
              </p>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div><strong>Email :</strong> <a href="mailto:support@dorian-sarry.fr" className="text-teal-600 hover:text-teal-700 underline">support@dorian-sarry.fr</a></div>
                  <div><strong>Téléphone :</strong> +33 (0)1 23 45 67 89</div>
                  <div><strong>Horaires :</strong> Du lundi au vendredi, 9h-17h</div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}