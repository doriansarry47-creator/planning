import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  label: string;
  icon: LucideIcon;
  color: 'sage' | 'therapy' | 'cream' | 'orange';
  illustration?: JSX.Element;
}

const colorClasses = {
  sage: {
    bg: 'bg-gradient-to-br from-sage-50 to-sage-100',
    border: 'border-sage-200',
    text: 'text-sage-600',
    textValue: 'text-sage-900',
    icon: 'text-sage-500'
  },
  therapy: {
    bg: 'bg-gradient-to-br from-therapy-50 to-therapy-100',
    border: 'border-therapy-200',
    text: 'text-therapy-600',
    textValue: 'text-therapy-900',
    icon: 'text-therapy-500'
  },
  cream: {
    bg: 'bg-gradient-to-br from-cream-50 to-cream-100',
    border: 'border-cream-200',
    text: 'text-cream-600',
    textValue: 'text-cream-900',
    icon: 'text-cream-600'
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    border: 'border-orange-200',
    text: 'text-orange-600',
    textValue: 'text-orange-900',
    icon: 'text-orange-500'
  }
};

export function MetricCard({ title, value, label, icon: Icon, color, illustration }: MetricCardProps) {
  const classes = colorClasses[color];

  return (
    <Card className={`${classes.bg} ${classes.border} backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden`}>
      <CardContent className="p-6">
        {/* Illustration d'arrière-plan */}
        {illustration && (
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-2">
            {illustration}
          </div>
        )}
        
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className={`text-sm font-medium ${classes.text} mb-1`}>{title}</p>
            <p className={`text-3xl font-bold ${classes.textValue}`}>{value}</p>
            <p className={`text-sm ${classes.text}`}>{label}</p>
          </div>
          <Icon className={`h-12 w-12 ${classes.icon}`} />
        </div>
      </CardContent>
    </Card>
  );
}

// Illustrations SVG thématiques pour la thérapie sensorimotrice
export const TherapyIllustrations = {
  // Illustration pour les rendez-vous (cœur avec mouvement)
  HeartFlow: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="currentColor">
      <path d="M60 25c-8-15-35-15-35 10 0 15 35 35 35 35s35-20 35-35c0-25-27-25-35-10z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
      <circle cx="60" cy="45" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="45" cy="55" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="75" cy="55" r="2" fill="currentColor" opacity="0.4" />
      {/* Ondulations représentant le mouvement sensoriel */}
      <path d="M30 75 Q40 70, 50 75 T70 75 T90 75" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
      <path d="M35 85 Q45 80, 55 85 T75 85 T90 85" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
    </svg>
  ),

  // Illustration pour les patients (silhouette avec aura)
  PersonAura: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="currentColor">
      <circle cx="60" cy="35" r="15" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
      <path d="M35 85 Q60 65, 85 85 L85 105 L35 105 Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
      {/* Aura énergétique */}
      <ellipse cx="60" cy="70" rx="40" ry="50" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2" />
      <ellipse cx="60" cy="70" rx="35" ry="43" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.15" />
      <ellipse cx="60" cy="70" rx="30" ry="36" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.1" />
    </svg>
  ),

  // Illustration pour le temps/calendrier (horloge organique)
  TimeFlow: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="currentColor">
      <circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
      {/* Aiguilles */}
      <line x1="60" y1="60" x2="60" y2="35" stroke="currentColor" strokeWidth="3" opacity="0.4" />
      <line x1="60" y1="60" x2="80" y2="60" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      {/* Points d'heure organiques */}
      <circle cx="60" cy="25" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="95" cy="60" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="60" cy="95" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="25" cy="60" r="2" fill="currentColor" opacity="0.5" />
      {/* Flux temporel */}
      <path d="M20 40 Q40 20, 60 40 Q80 20, 100 40" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2" />
    </svg>
  ),

  // Illustration pour les notifications/alertes (onde sonore)
  SoundWave: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="currentColor">
      <circle cx="40" cy="60" r="8" fill="currentColor" opacity="0.4" />
      {/* Ondes sonores */}
      <path d="M55 60 Q65 50, 75 60 Q85 70, 95 60" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
      <path d="M52 60 Q67 45, 82 60 Q97 75, 112 60" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
      <path d="M49 60 Q69 40, 89 60 Q109 80, 120 60" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
      {/* Particules */}
      <circle cx="70" cy="45" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="85" cy="55" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="95" cy="70" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  )
};