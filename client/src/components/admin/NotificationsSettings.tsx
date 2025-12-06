import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  MessageSquare,
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Settings,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'email' | 'sms';
  event: 'confirmation' | 'reminder' | 'cancellation' | 'modification';
  enabled: boolean;
}

const defaultTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Confirmation de RDV - Email',
    subject: 'Confirmation de votre rendez-vous',
    body: `Bonjour {{patient_name}},

Votre rendez-vous a été confirmé :

📅 Date : {{appointment_date}}
🕐 Heure : {{appointment_time}}
👨‍⚕️ Praticien : {{practitioner_name}}
📍 Lieu : {{location}}

Si vous avez besoin de modifier ou d'annuler ce rendez-vous, veuillez nous contacter.

Cordialement,
L'équipe médicale`,
    type: 'email',
    event: 'confirmation',
    enabled: true,
  },
  {
    id: '2',
    name: 'Rappel RDV 24h - Email',
    subject: 'Rappel : Rendez-vous demain',
    body: `Bonjour {{patient_name}},

Nous vous rappelons votre rendez-vous prévu demain :

📅 Date : {{appointment_date}}
🕐 Heure : {{appointment_time}}
👨‍⚕️ Praticien : {{practitioner_name}}

À bientôt !`,
    type: 'email',
    event: 'reminder',
    enabled: true,
  },
  {
    id: '3',
    name: 'Confirmation de RDV - SMS',
    subject: '',
    body: 'RDV confirmé le {{appointment_date}} à {{appointment_time}} avec {{practitioner_name}}. Cabinet au {{location}}.',
    type: 'sms',
    event: 'confirmation',
    enabled: true,
  },
  {
    id: '4',
    name: 'Rappel RDV 24h - SMS',
    subject: '',
    body: 'Rappel : RDV demain {{appointment_date}} à {{appointment_time}} avec {{practitioner_name}}.',
    type: 'sms',
    event: 'reminder',
    enabled: true,
  },
  {
    id: '5',
    name: 'Annulation de RDV - Email',
    subject: 'Annulation de votre rendez-vous',
    body: `Bonjour {{patient_name}},

Votre rendez-vous du {{appointment_date}} à {{appointment_time}} a été annulé.

Motif : {{cancellation_reason}}

N'hésitez pas à reprendre rendez-vous en ligne ou par téléphone.

Cordialement,
L'équipe médicale`,
    type: 'email',
    event: 'cancellation',
    enabled: true,
  },
];

const availableTokens = [
  { token: '{{patient_name}}', description: 'Nom du patient' },
  { token: '{{appointment_date}}', description: 'Date du RDV' },
  { token: '{{appointment_time}}', description: 'Heure du RDV' },
  { token: '{{practitioner_name}}', description: 'Nom du praticien' },
  { token: '{{location}}', description: 'Lieu du RDV' },
  { token: '{{cancellation_reason}}', description: 'Motif d\'annulation' },
  { token: '{{appointment_type}}', description: 'Type de consultation' },
];

export default function NotificationsSettings() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(templates[0]);
  
  // Configuration globale
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [resendApiKey] = useState('re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd');
  
  // Configuration des délais de rappel
  const [reminder24h, setReminder24h] = useState(true);
  const [reminder48h, setReminder48h] = useState(false);
  const [reminderCustom, setReminderCustom] = useState(false);
  const [customReminderHours, setCustomReminderHours] = useState('12');

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;

    setTemplates(prev => 
      prev.map(t => t.id === selectedTemplate.id ? selectedTemplate : t)
    );
    
    toast.success('Modèle enregistré avec succès');
  };

  const handleToggleTemplate = (id: string) => {
    setTemplates(prev => 
      prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t)
    );
  };

  const handleTestEmail = async () => {
    try {
      toast.info('Envoi de l\'email de test...');
      
      // Simuler l'envoi d'un email de test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Email de test envoyé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email de test');
    }
  };

  const handleTestSMS = async () => {
    try {
      toast.info('Envoi du SMS de test...');
      
      // Simuler l'envoi d'un SMS de test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('SMS de test envoyé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du SMS de test');
    }
  };

  const getEventBadgeColor = (event: string) => {
    switch (event) {
      case 'confirmation':
        return 'bg-green-500';
      case 'reminder':
        return 'bg-blue-500';
      case 'cancellation':
        return 'bg-red-500';
      case 'modification':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventLabel = (event: string) => {
    switch (event) {
      case 'confirmation':
        return 'Confirmation';
      case 'reminder':
        return 'Rappel';
      case 'cancellation':
        return 'Annulation';
      case 'modification':
        return 'Modification';
      default:
        return event;
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration globale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration des notifications
          </CardTitle>
          <CardDescription>
            Activez et configurez les notifications automatiques par email et SMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Configuration */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold">Notifications Email</div>
                <div className="text-sm text-muted-foreground">
                  Via Resend API - {emailEnabled ? 'Actif' : 'Inactif'}
                </div>
              </div>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>

          {emailEnabled && (
            <div className="ml-8 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">API Key configurée</span>
                <Badge variant="secondary" className="ml-2">
                  {resendApiKey.substring(0, 12)}...
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleTestEmail}>
                <Send className="mr-2 h-4 w-4" />
                Envoyer un email de test
              </Button>
            </div>
          )}

          <Separator />

          {/* SMS Configuration */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-semibold">Notifications SMS</div>
                <div className="text-sm text-muted-foreground">
                  {smsEnabled ? 'Actif' : 'Inactif'} - Configuration requise
                </div>
              </div>
            </div>
            <Switch
              checked={smsEnabled}
              onCheckedChange={setSmsEnabled}
            />
          </div>

          {smsEnabled && (
            <div className="ml-8 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Configuration SMS nécessaire (Twilio, etc.)</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleTestSMS} disabled={!smsEnabled}>
                <Send className="mr-2 h-4 w-4" />
                Envoyer un SMS de test
              </Button>
            </div>
          )}

          <Separator />

          {/* Reminder Configuration */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Configuration des rappels automatiques
            </h3>
            
            <div className="space-y-3 ml-7">
              <div className="flex items-center justify-between">
                <Label htmlFor="reminder-24h" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Rappel 24 heures avant
                </Label>
                <Switch
                  id="reminder-24h"
                  checked={reminder24h}
                  onCheckedChange={setReminder24h}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reminder-48h" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Rappel 48 heures avant
                </Label>
                <Switch
                  id="reminder-48h"
                  checked={reminder48h}
                  onCheckedChange={setReminder48h}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-custom" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Rappel personnalisé
                  </Label>
                  <Switch
                    id="reminder-custom"
                    checked={reminderCustom}
                    onCheckedChange={setReminderCustom}
                  />
                </div>
                {reminderCustom && (
                  <div className="flex items-center gap-2 ml-6">
                    <Input
                      type="number"
                      min="1"
                      max="168"
                      value={customReminderHours}
                      onChange={(e) => setCustomReminderHours(e.target.value)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">heures avant</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates de notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Modèles de notifications</CardTitle>
          <CardDescription>
            Personnalisez vos messages automatiques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms">
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Liste des templates email */}
                <div className="space-y-2">
                  {templates.filter(t => t.type === 'email').map(template => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getEventBadgeColor(template.event)}>
                            {getEventLabel(template.event)}
                          </Badge>
                          <Switch
                            checked={template.enabled}
                            onCheckedChange={() => handleToggleTemplate(template.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="font-medium text-sm">{template.name}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Éditeur de template */}
                <div className="md:col-span-2 space-y-4">
                  {selectedTemplate && selectedTemplate.type === 'email' ? (
                    <>
                      <div className="space-y-2">
                        <Label>Nom du modèle</Label>
                        <Input
                          value={selectedTemplate.name}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            name: e.target.value
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Sujet</Label>
                        <Input
                          value={selectedTemplate.subject}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            subject: e.target.value
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Corps du message</Label>
                        <Textarea
                          value={selectedTemplate.body}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            body: e.target.value
                          })}
                          rows={10}
                          className="font-mono text-sm"
                        />
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Variables disponibles :</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {availableTokens.map((token) => (
                            <div key={token.token} className="flex items-center gap-2">
                              <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                                {token.token}
                              </code>
                              <span className="text-xs text-muted-foreground">
                                {token.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button onClick={handleSaveTemplate} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer le modèle
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Sélectionnez un modèle pour le modifier
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Liste des templates SMS */}
                <div className="space-y-2">
                  {templates.filter(t => t.type === 'sms').map(template => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-950'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getEventBadgeColor(template.event)}>
                            {getEventLabel(template.event)}
                          </Badge>
                          <Switch
                            checked={template.enabled}
                            onCheckedChange={() => handleToggleTemplate(template.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="font-medium text-sm">{template.name}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Éditeur de template SMS */}
                <div className="md:col-span-2 space-y-4">
                  {selectedTemplate && selectedTemplate.type === 'sms' ? (
                    <>
                      <div className="space-y-2">
                        <Label>Nom du modèle</Label>
                        <Input
                          value={selectedTemplate.name}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            name: e.target.value
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Message SMS</Label>
                          <span className="text-xs text-muted-foreground">
                            {selectedTemplate.body.length} / 160 caractères
                          </span>
                        </div>
                        <Textarea
                          value={selectedTemplate.body}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            body: e.target.value
                          })}
                          rows={5}
                          maxLength={160}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Les SMS sont limités à 160 caractères
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Variables disponibles :</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {availableTokens.slice(0, 4).map((token) => (
                            <div key={token.token} className="flex items-center gap-2">
                              <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                                {token.token}
                              </code>
                              <span className="text-xs text-muted-foreground">
                                {token.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button onClick={handleSaveTemplate} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer le modèle
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Sélectionnez un modèle pour le modifier
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
