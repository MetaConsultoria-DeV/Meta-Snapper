'use client';

import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/** Properties configured for the AdaptiveTable component. */
interface AdaptiveTableProps {
  /** Table row and column element children to render. */
  children: ReactNode;
  /** Optional custom CSS classes for the container. */
  className?: string;
  /** Custom CSS inline styles to apply directly to the outer container. */
  style?: CSSProperties;
  /** Minimum width in pixels to prevent column squeezing on smaller viewports. Triggers horizontal scroll bar if container is smaller. */
  minWidth?: number;
}

/**
 * A responsive scroll-container wrapper for standard HTML tables.
 * Prevents layout breakages on mobile screens by enabling horizontal scrolling when necessary.
 *
 * @param {AdaptiveTableProps} props - Component properties.
 * @returns {JSX.Element} The rendered scroll container and table elements.
 */
export function AdaptiveTable({ children, className, style, minWidth }: AdaptiveTableProps) {
  const tableStyle: CSSProperties | undefined = minWidth ? { minWidth: `${minWidth}px`, ...style } : style;
  return (
    <div className={cn('overflow-x-auto', className)} style={tableStyle}>
      <table className="w-full text-sm md:text-base">{children}</table>
    </div>
  );
}
