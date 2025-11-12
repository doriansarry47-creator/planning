import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from 'lucide-react';
import { toast } from 'sonner';

interface AdminLog {
  adminLogs: {
    id: number;
    action: string;
    entityType: string | null;
    entityId: number | null;
    details: string | null;
    ipAddress: string | null;
    createdAt: Date;
  };
  users: {
    id: number;
    name: string | null;
    email: string | null;
  };
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/trpc/admin.getLogs?input={"json":{"limit":100}}');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.result?.data?.json || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
      toast.error('Impossible de charger les logs d\'activité');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      admin_login: 'bg-blue-100 text-blue-800',
      user_created: 'bg-green-100 text-green-800',
      user_deleted: 'bg-red-100 text-red-800',
      user_suspended: 'bg-orange-100 text-orange-800',
      user_activated: 'bg-green-100 text-green-800',
      appointment_created: 'bg-purple-100 text-purple-800',
      appointment_updated: 'bg-yellow-100 text-yellow-800',
      specialty_created: 'bg-cyan-100 text-cyan-800',
    };

    return (
      <Badge variant="secondary" className={actionColors[action] || 'bg-gray-100 text-gray-800'}>
        {action.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const formatDetails = (details: string | null) => {
    if (!details) return '-';
    try {
      const parsed = JSON.parse(details);
      return Object.entries(parsed).map(([key, value]) => (
        <div key={key} className="text-xs">
          <span className="font-medium">{key}:</span> {String(value)}
        </div>
      ));
    } catch {
      return details;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Journal d'activité
            </CardTitle>
            <CardDescription>
              Historique des actions effectuées par les administrateurs
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Aucune activité enregistrée
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.adminLogs.id}>
                    <TableCell className="text-sm">
                      {new Date(log.adminLogs.createdAt).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.users.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{log.users.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(log.adminLogs.action)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.adminLogs.entityType || '-'}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {formatDetails(log.adminLogs.details)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.adminLogs.ipAddress || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
