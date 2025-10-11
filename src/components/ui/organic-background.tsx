import React from 'react';

interface OrganicBackgroundProps {
  variant?: 'subtle' | 'prominent';
  className?: string;
}

export function OrganicBackground({ variant = 'subtle', className = '' }: OrganicBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Formes organiques inspirées de la carte Dorian Sarry */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-sage-100/60 to-therapy-100/40 blur-3xl"></div>
      <div className="absolute -top-10 right-20 w-60 h-60 rounded-full bg-gradient-to-bl from-cream-100/50 to-sage-50/60 blur-2xl"></div>
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-gradient-to-tl from-therapy-50/40 to-cream-50/50 blur-3xl"></div>
      <div className="absolute bottom-20 -left-16 w-72 h-72 rounded-full bg-gradient-to-tr from-sage-50/50 to-therapy-100/30 blur-2xl"></div>
      <div className="absolute -bottom-20 right-1/4 w-64 h-64 rounded-full bg-gradient-to-bl from-cream-50/60 to-sage-100/40 blur-3xl"></div>
      
      {/* Éléments botaniques subtils */}
      {variant === 'prominent' && (
        <>
          <svg className="absolute top-1/4 left-10 w-24 h-24 text-sage-200/30 transform rotate-12" fill="currentColor" viewBox="0 0 100 100">
            <path d="M50 10 C70 20, 80 40, 70 60 C60 50, 50 40, 50 30 C50 40, 40 50, 30 60 C20 40, 30 20, 50 10 Z" />
          </svg>
          <svg className="absolute bottom-1/4 right-16 w-20 h-20 text-therapy-200/25 transform -rotate-45" fill="currentColor" viewBox="0 0 100 100">
            <path d="M50 15 C65 25, 75 45, 65 65 C55 55, 50 45, 50 35 C50 45, 45 55, 35 65 C25 45, 35 25, 50 15 Z" />
          </svg>
          <svg className="absolute top-2/3 left-1/3 w-16 h-16 text-cream-200/20 transform rotate-90" fill="currentColor" viewBox="0 0 100 100">
            <path d="M50 20 C60 30, 70 50, 60 70 C55 60, 50 50, 50 40 C50 50, 45 60, 40 70 C30 50, 40 30, 50 20 Z" />
          </svg>
        </>
      )}
    </div>
  );
}

// Composant pour les éléments décoratifs botaniques
export function BotanicalElements({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Branches délicates */}
      <svg className="absolute top-8 right-8 w-32 h-32 text-sage-300/40" fill="currentColor" viewBox="0 0 200 200">
        <path d="M100 50 Q120 70, 130 100 Q140 120, 160 130 M100 50 Q80 70, 70 100 Q60 120, 40 130 M100 50 Q100 30, 100 10 M130 100 Q150 110, 170 120 M70 100 Q50 110, 30 120" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none" />
        {/* Feuilles */}
        <ellipse cx="170" cy="120" rx="8" ry="4" transform="rotate(45 170 120)" />
        <ellipse cx="30" cy="120" rx="8" ry="4" transform="rotate(-45 30 120)" />
        <ellipse cx="100" cy="10" rx="6" ry="3" />
        <ellipse cx="160" cy="130" rx="7" ry="3.5" transform="rotate(30 160 130)" />
        <ellipse cx="40" cy="130" rx="7" ry="3.5" transform="rotate(-30 40 130)" />
      </svg>
      
      <svg className="absolute bottom-8 left-8 w-28 h-28 text-therapy-300/35" fill="currentColor" viewBox="0 0 200 200">
        <path d="M50 150 Q70 130, 100 120 Q120 110, 140 100 M50 150 Q70 170, 100 180 Q120 190, 140 200 M50 150 Q30 150, 10 150 M100 120 Q110 100, 120 80 M100 180 Q110 200, 120 220" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none" />
        <ellipse cx="120" cy="80" rx="6" ry="4" transform="rotate(60 120 80)" />
        <ellipse cx="120" cy="220" rx="6" ry="4" transform="rotate(-60 120 220)" />
        <ellipse cx="10" cy="150" rx="5" ry="3" />
        <ellipse cx="140" cy="100" rx="7" ry="3.5" transform="rotate(45 140 100)" />
        <ellipse cx="140" cy="200" rx="7" ry="3.5" transform="rotate(-45 140 200)" />
      </svg>
    </div>
  );
}