import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ColConfig = '1-2-3' | '1-2-4' | '4-8-12' | '1-1-2';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: ColConfig;
  gap?: 'sm' | 'md' | 'lg';
}

const colMap: Record<ColConfig, string> = {
  '1-2-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '1-2-4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  '4-8-12': 'grid-cols-4 md:grid-cols-8 lg:grid-cols-12',
  '1-1-2': 'grid-cols-1 md:grid-cols-1 lg:grid-cols-2',
};

const gapMap = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function ResponsiveGrid({
  children,
  className,
  cols = '4-8-12',
  gap = 'md',
}: ResponsiveGridProps) {
  const gridClass = cn(
    'grid',
    colMap[cols],
    gapMap[gap],
    className,
  );

  return <div className={gridClass}>{children}</div>;
}
