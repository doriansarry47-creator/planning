import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Mail, Phone } from 'lucide-react';

export function LegalNoticesPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Mentions Légales</h1>
          <p className="text-gray-600 mt-2">
            Informations légales relatives au site web de Dorian Sarry, Praticien en Thérapie Sensorimotrice
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Section 1: Identification */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              1. Identification de l'éditeur
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <div className="font-medium min-w-24">Nom :</div>
                <div>Dorian Sarry</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="font-medium min-w-24">Activité :</div>
                <div>Praticien en Thérapie Sensorimotrice</div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Adresse :</div>
                  <div>123 Avenue de la Santé<br />75000 Paris, France</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Téléphone :</div>
                  <div>+33 (0)1 23 45 67 89</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Email :</div>
                  <div>contact@dorian-sarry.fr</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Hébergement */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              2. Hébergement du site
            </h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
              <p><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 underline">vercel.com</a></p>
            </div>
          </section>

          {/* Section 3: Propriété intellectuelle */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              3. Propriété intellectuelle
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur 
                et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour 
                les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              <p>
                La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est 
                formellement interdite sauf autorisation expresse du directeur de la publication.
              </p>
            </div>
          </section>

          {/* Section 4: Responsabilité */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              4. Limitation de responsabilité
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour 
                à différentes périodes de l'année, mais peut toutefois contenir des inexactitudes ou des omissions.
              </p>
              <p>
                Si vous constatez une lacune, erreur ou ce qui paraît être un dysfonctionnement, merci de bien 
                vouloir le signaler par email, à l'adresse contact@dorian-sarry.fr, en décrivant le problème de 
                la façon la plus précise possible.
              </p>
            </div>
          </section>

          {/* Section 5: Données personnelles */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              5. Protection des données personnelles
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Conformément à la loi "informatique et libertés" du 6 janvier 1978 modifiée et au Règlement 
                Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification 
                et de suppression des données vous concernant.
              </p>
              <p>
                Pour plus d'informations sur la collecte et le traitement de vos données personnelles, 
                consultez notre{' '}
                <a href="/politique-confidentialite" className="text-teal-600 hover:text-teal-700 underline">
                  Politique de Confidentialité
                </a>.
              </p>
            </div>
          </section>

          {/* Section 6: Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              6. Cookies
            </h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Ce site utilise des cookies techniques nécessaires au bon fonctionnement du service de prise de 
                rendez-vous en ligne et à la sécurisation des connexions utilisateurs.
              </p>
              <p>
                Aucun cookie de tracking ou publicitaire n'est utilisé sur ce site. Les cookies techniques sont 
                automatiquement supprimés à la fermeture de votre session.
              </p>
            </div>
          </section>

          {/* Section 7: Contact */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              7. Contact
            </h2>
            <div className="text-gray-700">
              <p>
                Pour toute question concernant ces mentions légales ou le fonctionnement de ce site, 
                vous pouvez nous contacter :
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Email :</span>
                  <a href="mailto:contact@dorian-sarry.fr" className="text-teal-600 hover:text-teal-700">
                    contact@dorian-sarry.fr
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Téléphone :</span>
                  <span>+33 (0)1 23 45 67 89</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}