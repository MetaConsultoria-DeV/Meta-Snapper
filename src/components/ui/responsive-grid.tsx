// src/components/ui/responsive-grid.tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * ResponsiveGrid adapts column count by breakpoint:
 * - Mobile (<768px): 4 columns (or custom)
 * - Tablet (768-1023px): 8 columns (or custom)
 * - Desktop (1024px+): 12 columns (or custom)
 */
export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 4, tablet: 8, desktop: 12 },
  gap = 'md',
}: ResponsiveGridProps) {
  const gapMap = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const gridClass = cn(
    'grid',
    `grid-cols-${cols.mobile}`,
    `md:grid-cols-${cols.tablet}`,
    `lg:grid-cols-${cols.desktop}`,
    gapMap[gap],
    className,
  );

  return <div className={gridClass}>{children}</div>;
}
