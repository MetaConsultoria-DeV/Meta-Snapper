'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Properties configured for the responsive Drawer container. */
interface DrawerProps {
  /** If true, opens the drawer layout onto the canvas view. */
  isOpen: boolean;
  /** Event handler triggered to close the drawer layout (e.g. click overlay). */
  onClose: () => void;
  /** Inner content elements to render. */
  children: ReactNode;
}

/**
 * Mobile-responsive Drawer overlay container.
 * Displays a slide-in sidebar menu on smaller viewports with a dimming backdrop overlay.
 *
 * @param {DrawerProps} props - Component properties.
 * @returns {JSX.Element} The rendered mobile drawer container.
 */
export function Drawer({ isOpen, onClose, children }: DrawerProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50',
          'w-64 bg-sidebar text-sidebar-foreground',
          'overflow-y-auto',
          'transition-transform duration-300 ease-in-out',
          'md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {children}
      </aside>
    </>
  );
}
