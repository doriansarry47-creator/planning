import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  UserCheck, 
  Clock, 
  Target,
  Heart,
  AlertCircle,
  CheckCircle,
  Monitor,
  MapPin
} from 'lucide-react';

interface StatisticsData {
  totalAppointments: number;
  totalPatients: number;
  newPatients: number;
  cancellationRate: number;
  monthlyAppointments: Array<{ month: string; count: number; }>;
  sessionTypes: Array<{ type: string; count: number; color: string; }>;
  appointmentStatus: Array<{ status: string; count: number; color: string; }>;
  referralSources: Array<{ source: string; count: number; }>;
  weeklyTrends: Array<{ week: string; appointments: number; newPatients: number; }>;
}

interface TherapyStatisticsProps {
  data: StatisticsData;
  period?: 'month' | 'quarter' | 'year';
  onPeriodChange?: (period: 'month' | 'quarter' | 'year') => void;
}

export function TherapyStatistics({ data, period = 'month', onPeriodChange }: TherapyStatisticsProps) {
  const COLORS = {
    primary: '#0d9488',
    secondary: '#06b6d4',
    accent: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  };

  const periodLabels = {
    month: 'Ce mois',
    quarter: 'Ce trimestre',  
    year: 'Cette année'
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur de période */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Statistiques - Thérapie Sensorimotrice</h2>
          <p className="text-gray-600">Analyse de votre activité thérapeutique</p>
        </div>
        <div className="flex space-x-2">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange?.(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-teal-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Rendez-vous</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalAppointments}</p>
                <p className="text-sm text-teal-600 flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% vs période précédente
                </p>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <Calendar className="h-8 w-8 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalPatients}</p>
                <p className="text-sm text-blue-600 flex items-center mt-2">
                  <UserCheck className="h-4 w-4 mr-1" />
                  Patients suivis
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Nouveaux Patients</p>
                <p className="text-3xl font-bold text-gray-900">{data.newPatients}</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <Heart className="h-4 w-4 mr-1" />
                  {period === 'month' ? 'Ce mois' : period === 'quarter' ? 'Ce trimestre' : 'Cette année'}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Taux d'Annulation</p>
                <p className="text-3xl font-bold text-gray-900">{data.cancellationRate.toFixed(1)}%</p>
                <p className="text-sm text-orange-600 flex items-center mt-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {data.cancellationRate < 10 ? 'Excellent' : data.cancellationRate < 20 ? 'Bon' : 'À surveiller'}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle des rendez-vous */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-teal-600" />
              Évolution des rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyAppointments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition des types de consultation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-teal-600" />
              Types de consultation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.sessionTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ type, count, percent }) => `${type}: ${count} (${(percent * 100).toFixed(1)}%)`}
                >
                  {data.sessionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Légende personnalisée */}
            <div className="mt-4 flex justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-teal-600 rounded mr-2"></div>
                <span className="text-sm flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Cabinet
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                <span className="text-sm flex items-center">
                  <Monitor className="h-4 w-4 mr-1" />
                  Visioconférence
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tendances hebdomadaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-teal-600" />
              Tendances hebdomadaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke={COLORS.primary} 
                  strokeWidth={3}
                  name="Rendez-vous"
                />
                <Line 
                  type="monotone" 
                  dataKey="newPatients" 
                  stroke={COLORS.accent} 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="Nouveaux patients"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Statut des rendez-vous */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-teal-600" />
              Statut des rendez-vous
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.appointmentStatus.map((status, index) => {
                const percentage = (status.count / data.totalAppointments) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{status.status}</span>
                      <span className="text-sm text-gray-600">{status.count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: status.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources de référencement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-teal-600" />
            Sources de référencement des patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.referralSources} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="source" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="count" fill={COLORS.secondary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Résumé et insights */}
      <Card className="border-l-4 border-l-teal-600">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-teal-600" />
            Insights et recommandations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-teal-900">Points forts</h4>
                  <ul className="text-sm text-teal-700 mt-2 space-y-1">
                    <li>• Croissance régulière du nombre de patients</li>
                    <li>• Taux d'annulation maintenu sous les 15%</li>
                    <li>• Bon équilibre entre consultations en cabinet et visioconférence</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Target className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-900">Opportunités d'amélioration</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Développer les créneaux en soirée pour réduire l'attente</li>
                    <li>• Mettre en place un système de rappels automatiques</li>
                    <li>• Optimiser la communication sur les bienfaits de la thérapie sensorimotrice</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}