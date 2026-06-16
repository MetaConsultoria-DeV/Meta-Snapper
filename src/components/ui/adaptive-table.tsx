'use client';

import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface AdaptiveTableProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  minWidth?: number;
}

export function AdaptiveTable({ children, className, style, minWidth }: AdaptiveTableProps) {
  const tableStyle: CSSProperties | undefined = minWidth ? { minWidth: `${minWidth}px`, ...style } : style;
  return (
    <div className={cn('overflow-x-auto', className)} style={tableStyle}>
      <table className="w-full text-sm md:text-base">{children}</table>
    </div>
  );
}
