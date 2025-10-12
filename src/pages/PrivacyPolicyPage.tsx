import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, Database, Mail, AlertCircle } from 'lucide-react';

export function PrivacyPolicyPage() {
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
            <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Politique de Confidentialité</h1>
              <p className="text-gray-600 mt-1">
                Protection de vos données personnelles et respect de votre vie privée
              </p>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Dernière mise à jour :</strong> 12 octobre 2024<br />
                Cette politique est conforme au RGPD (Règlement Général sur la Protection des Données)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Section 1: Introduction */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-6 w-6 text-teal-600" />
              <h2 className="text-2xl font-semibold text-gray-800">1. Introduction</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                Dorian Sarry, Praticien en Thérapie Sensorimotrice, s'engage à protéger la confidentialité 
                et la sécurité de vos données personnelles. Cette politique explique comment nous collectons, 
                utilisons et protégeons vos informations lorsque vous utilisez notre plateforme de prise de 
                rendez-vous en ligne.
              </p>
              <p>
                En utilisant notre site web, vous acceptez les pratiques décrites dans cette politique de 
                confidentialité. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
              </p>
            </div>
          </section>

          {/* Section 2: Données collectées */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-teal-600" />
              <h2 className="text-2xl font-semibold text-gray-800">2. Données que nous collectons</h2>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.1 Données d'identification</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Nom et prénom</li>
                  <li>• Adresse email</li>
                  <li>• Numéro de téléphone</li>
                  <li>• Date de naissance</li>
                  <li>• Adresse postale</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.2 Données médicales</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Motif de consultation</li>
                  <li>• Antécédents médicaux pertinents</li>
                  <li>• Allergies et intolérances</li>
                  <li>• Traitements en cours</li>
                  <li>• Notes de consultation (avec votre consentement explicite)</li>
                </ul>
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-sm text-amber-800">
                    <strong>Important :</strong> Ces données sont soumises au secret médical et bénéficient 
                    d'une protection renforcée selon la législation française.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2.3 Données techniques</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Adresse IP (anonymisée)</li>
                  <li>• Type de navigateur et version</li>
                  <li>• Pages visitées et temps de navigation</li>
                  <li>• Cookies techniques nécessaires au fonctionnement</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Utilisation des données */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="h-6 w-6 text-teal-600" />
              <h2 className="text-2xl font-semibold text-gray-800">3. Utilisation de vos données</h2>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-teal-800 mb-2">3.1 Finalités légitimes</h3>
                <ul className="space-y-1 text-teal-700">
                  <li>• Gestion des rendez-vous et du planning</li>
                  <li>• Communication relative aux consultations</li>
                  <li>• Suivi thérapeutique et continuité des soins</li>
                  <li>• Respect des obligations légales et déontologiques</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">3.2 Amélioration du service</h3>
                <ul className="space-y-1 text-blue-700">
                  <li>• Optimisation de la plateforme de réservation</li>
                  <li>• Analyse anonymisée de l'utilisation du site</li>
                  <li>• Développement de nouvelles fonctionnalités</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Base légale */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              4. Base légale du traitement
            </h2>
            <div className="text-gray-700 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Consentement</h3>
                  <p className="text-sm">Pour la création de compte et la prise de rendez-vous en ligne</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Exécution du contrat</h3>
                  <p className="text-sm">Pour la fourniture des services de thérapie sensorimotrice</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Obligation légale</h3>
                  <p className="text-sm">Conservation du dossier patient selon la réglementation médicale</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Intérêt légitime</h3>
                  <p className="text-sm">Amélioration de la qualité des soins et du service</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Partage des données */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              5. Partage et transmission de vos données
            </h2>
            <div className="text-gray-700 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Principe général</h3>
                <p className="text-red-700">
                  Vos données médicales ne sont jamais vendues, louées ou transmises à des tiers à des fins 
                  commerciales. Le secret médical est strictement respecté.
                </p>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800">Exceptions limitées :</h3>
              <ul className="space-y-2 ml-4">
                <li>• <strong>Prestataires techniques :</strong> Hébergement sécurisé (Vercel) avec garanties contractuelles</li>
                <li>• <strong>Obligation légale :</strong> Réquisition judiciaire ou administrative</li>
                <li>• <strong>Urgence médicale :</strong> Transmission aux services de secours si nécessaire</li>
                <li>• <strong>Votre consentement :</strong> Transmission à un autre professionnel de santé à votre demande</li>
              </ul>
            </div>
          </section>

          {/* Section 6: Conservation */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibent text-gray-800 mb-4 pb-2 border-b border-gray-200">
              6. Conservation des données
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Données de compte</h3>
                  <p className="text-sm text-green-700">Jusqu'à la fermeture du compte + 1 an</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Dossier médical</h3>
                  <p className="text-sm text-blue-700">20 ans après la dernière consultation</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">Données techniques</h3>
                  <p className="text-sm text-purple-700">Maximum 13 mois (cookies, logs)</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Ces durées respectent les recommandations de la CNIL et les obligations du Code de la santé publique.
              </p>
            </div>
          </section>

          {/* Section 7: Vos droits */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              7. Vos droits sur vos données
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-teal-500 bg-teal-50">
                  <h3 className="font-semibold text-teal-800">Droit d'accès</h3>
                  <p className="text-sm text-teal-700">Consulter vos données personnelles</p>
                </div>
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <h3 className="font-semibold text-blue-800">Droit de rectification</h3>
                  <p className="text-sm text-blue-700">Corriger des informations inexactes</p>
                </div>
                <div className="p-3 border-l-4 border-red-500 bg-red-50">
                  <h3 className="font-semibold text-red-800">Droit à l'effacement</h3>
                  <p className="text-sm text-red-700">Supprimer vos données (sous conditions)</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
                  <h3 className="font-semibold text-purple-800">Droit de portabilité</h3>
                  <p className="text-sm text-purple-700">Récupérer vos données dans un format lisible</p>
                </div>
                <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                  <h3 className="font-semibold text-orange-800">Droit d'opposition</h3>
                  <p className="text-sm text-orange-700">Vous opposer au traitement (sous conditions)</p>
                </div>
                <div className="p-3 border-l-4 border-gray-500 bg-gray-50">
                  <h3 className="font-semibold text-gray-800">Droit de limitation</h3>
                  <p className="text-sm text-gray-700">Limiter le traitement temporairement</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8: Sécurité */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              8. Sécurité de vos données
            </h2>
            <div className="text-gray-700 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Mesures techniques</h3>
                <ul className="space-y-1 text-green-700 text-sm">
                  <li>• Chiffrement SSL/TLS pour toutes les communications</li>
                  <li>• Mots de passe chiffrés avec algorithme bcrypt</li>
                  <li>• Authentification JWT sécurisée</li>
                  <li>• Hébergement sur infrastructure sécurisée (Vercel/AWS)</li>
                  <li>• Sauvegardes automatiques et chiffrées</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Mesures organisationnelles</h3>
                <ul className="space-y-1 text-blue-700 text-sm">
                  <li>• Accès aux données limité au praticien et administrateur technique</li>
                  <li>• Formation continue sur la sécurité des données</li>
                  <li>• Procédures de réponse aux incidents de sécurité</li>
                  <li>• Audits réguliers de sécurité</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 9: Contact */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-teal-600" />
              <h2 className="text-2xl font-semibold text-gray-800">9. Contact et réclamations</h2>
            </div>
            <div className="text-gray-700 space-y-4">
              <p>
                Pour exercer vos droits ou pour toute question concernant cette politique de confidentialité :
              </p>
              
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-teal-800 mb-3">Contact direct</h3>
                <div className="space-y-2 text-teal-700">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <strong>Email :</strong> 
                    <a href="mailto:dpo@dorian-sarry.fr" className="underline">dpo@dorian-sarry.fr</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4"></span>
                    <strong>Objet :</strong> "Protection des données personnelles"
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Délai de réponse :</strong> Nous nous engageons à répondre à votre demande dans un délai maximum de 30 jours.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Réclamation auprès de la CNIL</h4>
                <p className="text-sm text-blue-700">
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation 
                  auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) : 
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline">
                    www.cnil.fr
                  </a>
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}