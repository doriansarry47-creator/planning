import React from 'react';
import { Loader2, Heart } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loading({ 
  size = 'md', 
  text, 
  fullScreen = false, 
  className = '' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const loadingContent = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Spinning loader */}
        <Loader2 className={`${sizeClasses[size]} text-teal-600 animate-spin`} />
        
        {/* Heart pulse animation in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} text-teal-400 animate-pulse`} />
        </div>
      </div>
      
      {text && (
        <p className={`mt-3 text-gray-600 ${textSizeClasses[size]} text-center max-w-xs`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {loadingContent}
        </div>
      </div>
    );
  }

  return loadingContent;
}

// Skeleton loading component for content placeholders
export function Skeleton({ 
  className = '', 
  variant = 'rectangular' 
}: { 
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}) {
  const baseClasses = 'animate-pulse bg-gray-200';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
}

// Loading spinner for inline use
export function Spinner({ 
  size = 'md', 
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
  );
}