import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Supported grid column layout configurations across responsive breakpoints (Mobile - Tablet - Desktop). */
type ColConfig = '1-2-3' | '1-2-4' | '4-8-12' | '1-1-2' | '1-2-5';

/** Properties configured for the ResponsiveGrid component. */
interface ResponsiveGridProps {
  /** Inner grid elements/cards. */
  children: ReactNode;
  /** Optional custom CSS classes. */
  className?: string;
  /** Predefined column configurations mapping breakpoints to grid-template-column settings. */
  cols?: ColConfig;
  /** Size of gaps between grid items. */
  gap?: 'sm' | 'md' | 'lg';
}

/** Mapping of configuration keys to corresponding tailwind grid responsive class modifiers. */
const colMap: Record<ColConfig, string> = {
  '1-2-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '1-2-4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  '4-8-12': 'grid-cols-4 md:grid-cols-8 lg:grid-cols-12',
  '1-1-2': 'grid-cols-1 md:grid-cols-1 lg:grid-cols-2',
  '1-2-5': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5',
};

/** Mapping of gap keys to tailwind gap spacing sizes. */
const gapMap = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

/**
 * A highly reusable layout component offering predefined CSS Grid layouts and gap spacing.
 * Ensures consistent breakpoints across all dashboard views.
 *
 * @param {ResponsiveGridProps} props - Component properties.
 * @returns {JSX.Element} The rendered Grid container.
 */
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
