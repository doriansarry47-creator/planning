import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface Stats {
  totalUsers: number;
  totalPractitioners: number;
  totalAppointments: number;
  todayAppointments: number;
  weekAppointments: number;
  availableSlots: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPractitioners: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    weekAppointments: 0,
    availableSlots: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/trpc/admin.getStats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.result?.data?.json || stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      toast.error('Impossible de charger les statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  const cards = [
    {
      title: 'Rendez-vous du jour',
      value: stats.todayAppointments,
      subtitle: stats.todayAppointments === 0 ? 'Aucun rendez-vous aujourd\'hui' : 'Rendez-vous programmés',
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      title: 'Rendez-vous à venir',
      value: stats.weekAppointments,
      subtitle: 'Cette semaine',
      icon: Clock,
      color: 'text-green-600',
    },
    {
      title: 'Total patients',
      value: stats.totalUsers,
      subtitle: 'Patients enregistrés',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Créneaux disponibles',
      value: stats.availableSlots,
      subtitle: 'Actifs',
      icon: Settings,
      color: 'text-orange-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chargement...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
