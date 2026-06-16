'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdaptiveTableProps {
  children: ReactNode;
  className?: string;
}

export function AdaptiveTable({ children, className }: AdaptiveTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm md:text-base">{children}</table>
    </div>
  );
}
