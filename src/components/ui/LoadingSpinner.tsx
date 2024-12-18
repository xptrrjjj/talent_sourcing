import React from 'react';
import { Loader } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: Props) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader 
      className={clsx(
        'animate-spin text-magentiq',
        sizeClasses[size],
        className
      )} 
    />
  );
}