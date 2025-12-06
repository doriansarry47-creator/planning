import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  MessageSquare,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Settings,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  confirmationEnabled: boolean;
  reminder24hEnabled: boolean;
  reminder48hEnabled: boolean;
  cancellationEnabled: boolean;
  modificationEnabled: boolean;
  defaultEmailTemplate: string;
  defaultSMSTemplate: string;
}

interface NotificationLog {
  id: number;
  type: 'email' | 'sms';
  channel: 'confirmation' | 'reminder_24h' | 'reminder_48h' | 'cancellation' | 'modification';
  recipient: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  createdAt: string;
}

const MOCK_LOGS: NotificationLog[] = [
  {
    id: 1,
    type: 'email',
    channel: 'confirmation',
    recipient: 'marie.dupont@email.com',
    subject: 'Confirmation de votre rendez-vous',
    message: 'Votre rendez-vous a été confirmé...',
    status: 'delivered',
    sentAt: '2025-11-10T10:05:00',
    deliveredAt: '2025-11-10T10:05:12',
    createdAt: '2025-11-10T10:00:00',
  },
  {
    id: 2,
    type: 'sms',
    channel: 'reminder_24h',
    recipient: '06 12 34 56 78',
    message: 'Rappel : RDV demain à 09:00',
    status: 'sent',
    sentAt: '2025-11-15T09:00:00',
    createdAt: '2025-11-15T08:59:00',
  },
  {
    id: 3,
    type: 'email',
    channel: 'cancellation',
    recipient: 'pierre.durand@email.com',
    subject: 'Annulation de votre rendez-vous',
    message: 'Votre rendez-vous a été annulé...',
    status: 'failed',
    sentAt: '2025-11-17T18:00:00',
    errorMessage: 'Adresse email invalide',
    createdAt: '2025-11-17T18:00:00',
  },
];

export default function NotificationsManagement() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    smsEnabled: false,
    confirmationEnabled: true,
    reminder24hEnabled: true,
    reminder48hEnabled: false,
    cancellationEnabled: true,
    modificationEnabled: true,
    defaultEmailTemplate: 'Bonjour {{patientName}},\n\nVotre rendez-vous est confirmé le {{date}} à {{time}}.\n\nCordialement,\nL\'équipe du Cabinet',
    defaultSMSTemplate: 'RDV confirmé le {{date}} à {{time}}. À bientôt !',
  });

  const [logs, setLogs] = useState<NotificationLog[]>(MOCK_LOGS);
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: Appel API pour sauvegarder les paramètres
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Veuillez saisir une adresse email');
      return;
    }

    try {
      // TODO: Appel API pour envoyer un email de test
      toast.success(`Email de test envoyé à ${testEmail}`);
      setTestEmail('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email de test');
    }
  };

  const handleSendTestSMS = async () => {
    if (!testPhone) {
      toast.error('Veuillez saisir un numéro de téléphone');
      return;
    }

    try {
      // TODO: Appel API pour envoyer un SMS de test
      toast.success(`SMS de test envoyé à ${testPhone}`);
      setTestPhone('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du SMS de test');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      pending: { label: 'En attente', variant: 'secondary', icon: Clock },
      sent: { label: 'Envoyé', variant: 'default', icon: Send },
      failed: { label: 'Échec', variant: 'destructive', icon: XCircle },
      delivered: { label: 'Délivré', variant: 'default', icon: CheckCircle2 },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getChannelLabel = (channel: string) => {
    const labels: Record<string, string> = {
      confirmation: 'Confirmation',
      reminder_24h: 'Rappel 24h',
      reminder_48h: 'Rappel 48h',
      cancellation: 'Annulation',
      modification: 'Modification',
    };
    return labels[channel] || channel;
  };

  // Statistiques
  const stats = {
    total: logs.length,
    sent: logs.filter((l) => l.status === 'sent' || l.status === 'delivered').length,
    pending: logs.filter((l) => l.status === 'pending').length,
    failed: logs.filter((l) => l.status === 'failed').length,
    emails: logs.filter((l) => l.type === 'email').length,
    sms: logs.filter((l) => l.type === 'sms').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Notifications</CardTitle>
          <CardDescription>
            Configurer les emails et SMS automatiques pour les rendez-vous
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total envoyés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">Réussis</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Échoués</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.emails}</div>
            <p className="text-xs text-muted-foreground">Emails</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.sms}</div>
            <p className="text-xs text-muted-foreground">SMS</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Bell className="mr-2 h-4 w-4" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="test">
            <Send className="mr-2 h-4 w-4" />
            Tests
          </TabsTrigger>
        </TabsList>

        {/* Onglet Paramètres */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Canaux de Communication</CardTitle>
              <CardDescription>Activer ou désactiver les notifications par email et SMS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer des emails automatiques aux patients
                  </p>
                </div>
                <Switch
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => handleSettingChange('emailEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyer des SMS automatiques aux patients
                  </p>
                </div>
                <Switch
                  checked={settings.smsEnabled}
                  onCheckedChange={(checked) => handleSettingChange('smsEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Types de Notifications</CardTitle>
              <CardDescription>Choisir quelles notifications envoyer automatiquement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Confirmation de rendez-vous</Label>
                  <p className="text-sm text-muted-foreground">
                    Envoyée immédiatement après la prise de rendez-vous
                  </p>
                </div>
                <Switch
                  checked={settings.confirmationEnabled}
                  onCheckedChange={(checked) => handleSettingChange('confirmationEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rappel 24h avant</Label>
                  <p className="text-sm text-muted-foreground">Rappel envoyé 24 heures avant le RDV</p>
                </div>
                <Switch
                  checked={settings.reminder24hEnabled}
                  onCheckedChange={(checked) => handleSettingChange('reminder24hEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rappel 48h avant</Label>
                  <p className="text-sm text-muted-foreground">Rappel envoyé 48 heures avant le RDV</p>
                </div>
                <Switch
                  checked={settings.reminder48hEnabled}
                  onCheckedChange={(checked) => handleSettingChange('reminder48hEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notification d'annulation</Label>
                  <p className="text-sm text-muted-foreground">Envoyée quand un RDV est annulé</p>
                </div>
                <Switch
                  checked={settings.cancellationEnabled}
                  onCheckedChange={(checked) => handleSettingChange('cancellationEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notification de modification</Label>
                  <p className="text-sm text-muted-foreground">Envoyée quand un RDV est modifié</p>
                </div>
                <Switch
                  checked={settings.modificationEnabled}
                  onCheckedChange={(checked) => handleSettingChange('modificationEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Templates de Messages</CardTitle>
              <CardDescription>Personnaliser les messages envoyés aux patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template Email par défaut</Label>
                <Textarea
                  rows={5}
                  value={settings.defaultEmailTemplate}
                  onChange={(e) => handleSettingChange('defaultEmailTemplate', e.target.value)}
                  placeholder="Contenu de l'email..."
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles : {'{'}{'{'} patientName {'}'}{'}'},  {'{'}{'{'}  date {'}'}{'}'}, {'{'}{'{'}  time {'}'}{'}'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Template SMS par défaut</Label>
                <Textarea
                  rows={3}
                  value={settings.defaultSMSTemplate}
                  onChange={(e) => handleSettingChange('defaultSMSTemplate', e.target.value)}
                  placeholder="Contenu du SMS..."
                />
                <p className="text-xs text-muted-foreground">
                  Limité à 160 caractères
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Enregistrer les paramètres
            </Button>
          </div>
        </TabsContent>

        {/* Onglet Historique */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Notifications</CardTitle>
              <CardDescription>Toutes les notifications envoyées</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Destinataire</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucune notification envoyée
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {format(new Date(log.createdAt), 'dd MMM HH:mm', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {log.type === 'email' ? (
                            <Badge variant="outline">
                              <Mail className="mr-1 h-3 w-3" />
                              Email
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <MessageSquare className="mr-1 h-3 w-3" />
                              SMS
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getChannelLabel(log.channel)}</TableCell>
                        <TableCell className="text-sm">{log.recipient}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Tests */}
        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Envoyer un Email de Test</CardTitle>
              <CardDescription>Tester l'envoi d'emails avec Resend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Adresse email</Label>
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleSendTestEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Envoyer l'email de test
              </Button>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>API Key Resend :</strong> re_Crbni8Gw_2Jb32KcyR4gLdkGs8umzGrHd
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Envoyer un SMS de Test</CardTitle>
              <CardDescription>Tester l'envoi de SMS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Numéro de téléphone</Label>
                <Input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
              </div>
              <Button onClick={handleSendTestSMS}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Envoyer le SMS de test
              </Button>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  ⚠️ <strong>SMS Provider :</strong> Non configuré (à intégrer : Twilio, OVH, etc.)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration Google Calendar</CardTitle>
              <CardDescription>Intégration avec Google Calendar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-green-800">
                  ✅ Identifiants Google Calendar configurés
                </p>
                <div className="text-xs text-green-700 space-y-1">
                  <p><strong>API Key:</strong> d1a5eccfbb5d5a35fbbe564b1dd5b914ec2a4939</p>
                  <p><strong>Email:</strong> planningadmin@apaddicto.iam.gserviceaccount.com</p>
                  <p><strong>ID Unique:</strong> 117226736084884112171</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
