'use client';

'use client';

import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface AdaptiveTableProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function AdaptiveTable({ children, className, style }: AdaptiveTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)} style={style}>
      <table className="w-full text-sm md:text-base">{children}</table>
    </div>
  );
}
