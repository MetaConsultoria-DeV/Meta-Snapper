# Responsive UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor BDU frontend into a fully responsive, mobile-first application with drawer navigation and adaptive components, coordinated by a multi-agent orchestration system.

**Architecture:** 
- **Phase 0 (Sequential):** Build responsive component library + global responsive infrastructure
- **Phase 1 (Parallel):** Agents refactor page groups using Phase 0 components
- **Phase 2 (Parallel):** QA testing on 3 breakpoints
- **Phase 3 (Sequential):** Integration, final testing, production

**Tech Stack:** Next.js 16.2.7, React 19.2.4, Tailwind CSS 4, TypeScript 5

---

## File Structure Map

### New Files (Phase 0)
```
src/components/
  ui/
    responsive-grid.tsx        # New: 4/8/12 column grid wrapper
    adaptive-table.tsx         # New: responsive table with scroll
    responsive-chart.tsx       # New: responsive chart container
  layout/
    drawer.tsx                 # New: mobile navigation drawer
```

### Modified Files (Phase 0)
```
src/components/
  layout/
    sidebar.tsx                # Refactor: responsive, drawer integration
    topbar.tsx                 # Refactor: mobile-friendly, hamburger
    app-shell.tsx              # Refactor: drawer state management
  ui/
    button.tsx                 # Minor: ensure touch target sizes
  dashboard/
    primitives.tsx             # Refactor: Card responsive padding
    charts.tsx                 # Refactor: responsive containers
src/app/
  layout.tsx                   # Minor: CSS imports
  globals.css                  # Update: responsive utilities
```

---

## PHASE 0: Component Foundation (Sequential)

### Task 1: Analyze Current Structure & Document Changes

**Files:**
- Review: `src/components/`, `src/app/layout.tsx`, `src/app/globals.css`
- Create: `PHASE0_CHANGES.md` (temporary doc for coordination)

- [ ] **Step 1: Audit current components**

Open these files and note their current structure:
```
- src/components/layout/sidebar.tsx (line 9-76)
- src/components/layout/topbar.tsx (check if exists)
- src/components/layout/app-shell.tsx (line 43-55)
- src/components/ui/button.tsx (check current styles)
- src/components/dashboard/primitives.tsx (check Card component)
- src/components/dashboard/charts.tsx (check chart containers)
```

Document findings in a temporary markdown file locally (not committed yet).

- [ ] **Step 2: Create a change checklist**

Write down (in a file or note):
- [ ] Sidebar: Add responsive width logic + drawer integration
- [ ] TopBar: Add mobile layout, hamburger button
- [ ] AppShell: Add drawer state (open/close)
- [ ] Card: Add responsive padding variants
- [ ] Table: Add horizontal scroll wrapper
- [ ] Charts: Add responsive container
- [ ] Create responsive-grid utility
- [ ] Create drawer component
- [ ] Update globals.css for responsive classes

- [ ] **Step 3: Verify breakpoints in tailwind config**

Run:
```bash
cd frontend && grep -A5 "screens:" tailwindcss.config.ts || echo "Check tailwind.config.mjs"
```

Expected: Should see breakpoints like `md:`, `lg:`, etc. If missing, we'll update.

- [ ] **Step 4: No commit yet — ready for next task**

---

### Task 2: Create ResponsiveGrid Component

**Files:**
- Create: `src/components/ui/responsive-grid.tsx`
- Test: Manual (will use in pages)

- [ ] **Step 1: Create responsive-grid.tsx**

```typescript
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
```

- [ ] **Step 2: Test grid renders correctly**

Create a simple test file (temporary, for verification):
```bash
cd frontend && npm run dev
```
Then manually add to a page (e.g., home) and verify grid displays correctly.

- [ ] **Step 3: Commit**

```bash
cd frontend && git add src/components/ui/responsive-grid.tsx
git commit -m "feat: add ResponsiveGrid component for 4/8/12 column adaptation"
```

---

### Task 3: Create Drawer Component (Mobile Navigation)

**Files:**
- Create: `src/components/layout/drawer.tsx`

- [ ] **Step 1: Create drawer.tsx**

```typescript
// src/components/layout/drawer.tsx
'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Mobile navigation drawer (off-canvas sidebar).
 * Shows on mobile (<768px), hidden by default.
 * Click backdrop to close.
 */
export function Drawer({ isOpen, onClose, children }: DrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50',
          'w-64 bg-sidebar text-sidebar-foreground',
          'overflow-y-auto',
          'transition-transform duration-300 ease-in-out',
          'md:hidden', // Hide on tablet+ (show sidebar instead)
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {children}
      </aside>
    </>
  );
}
```

- [ ] **Step 2: Verify drawer styling**

Test by rendering in dev mode (will integrate in Task 9).

- [ ] **Step 3: Commit**

```bash
cd frontend && git add src/components/layout/drawer.tsx
git commit -m "feat: add Drawer component for mobile navigation"
```

---

### Task 4: Refactor Card Component for Responsiveness

**Files:**
- Modify: `src/components/dashboard/primitives.tsx`

- [ ] **Step 1: Read current Card component**

```bash
cd frontend && head -50 src/components/dashboard/primitives.tsx
```

Note current structure and className patterns.

- [ ] **Step 2: Update Card with responsive padding**

Example of what to change (replace existing Card):
```typescript
// In primitives.tsx, find and update Card component:

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card',
        'p-4 md:p-6 lg:p-8', // Responsive padding
        'text-card-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}
```

Key change: `p-4 md:p-6 lg:p-8` ensures padding scales by breakpoint.

- [ ] **Step 3: Verify Card padding is responsive**

Run dev server, check on mobile/tablet/desktop.

- [ ] **Step 4: Commit**

```bash
cd frontend && git add src/components/dashboard/primitives.tsx
git commit -m "refactor: make Card component responsive (padding by breakpoint)"
```

---

### Task 5: Refactor Table Component for Responsiveness

**Files:**
- Modify or Create: `src/components/dashboard/primitives.tsx` or new `src/components/ui/adaptive-table.tsx`

- [ ] **Step 1: Create adaptive-table.tsx (new component)**

```typescript
// src/components/ui/adaptive-table.tsx
'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AdaptiveTableProps {
  children: ReactNode;
  className?: string;
}

/**
 * AdaptiveTable wraps a table for mobile responsiveness.
 * On mobile: horizontal scroll enabled
 * On tablet+: normal table layout
 */
export function AdaptiveTable({ children, className }: AdaptiveTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm md:text-base">{children}</table>
    </div>
  );
}
```

- [ ] **Step 2: Test table scrolls on mobile**

Verify in dev mode on narrow viewport.

- [ ] **Step 3: Commit**

```bash
cd frontend && git add src/components/ui/adaptive-table.tsx
git commit -m "feat: add AdaptiveTable component with horizontal scroll on mobile"
```

---

### Task 6: Refactor Charts for Responsiveness

**Files:**
- Modify: `src/components/dashboard/charts.tsx`

- [ ] **Step 1: Read current charts**

```bash
cd frontend && head -100 src/components/dashboard/charts.tsx
```

- [ ] **Step 2: Wrap chart components in responsive container**

Example pattern to apply:

```typescript
// In charts.tsx, wrap any chart container with:

export function ResponsiveChartContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-full h-auto',
        'min-h-64 md:min-h-80 lg:min-h-96', // Scale height by breakpoint
        className,
      )}
    >
      {children}
    </div>
  );
}
```

Apply to existing chart components.

- [ ] **Step 3: Verify charts scale on different screen sizes**

Run dev, test on mobile/tablet/desktop.

- [ ] **Step 4: Commit**

```bash
cd frontend && git add src/components/dashboard/charts.tsx
git commit -m "refactor: add responsive containers to charts"
```

---

### Task 7: Refactor Sidebar for Responsiveness

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Read current sidebar**

```bash
cd frontend && cat src/components/layout/sidebar.tsx
```

Note: Lines 9-76, current structure.

- [ ] **Step 2: Update Sidebar to hide on mobile**

Replace the entire Sidebar component with responsive version (see plan detail).

- [ ] **Step 3: Test sidebar disappears on mobile**

Run dev, resize to mobile width, verify sidebar is gone.

- [ ] **Step 4: Commit**

```bash
cd frontend && git add src/components/layout/sidebar.tsx
git commit -m "refactor: hide sidebar on mobile, keep responsive on tablet+"
```

---

### Task 8: Refactor TopBar for Responsiveness

**Files:**
- Modify: `src/components/layout/topbar.tsx` (if exists, or create)

- [ ] **Step 1: Check if topbar.tsx exists**

```bash
cd frontend && test -f src/components/layout/topbar.tsx && echo "exists" || echo "missing"
```

- [ ] **Step 2: Create/Update TopBar with hamburger button**

(See plan detail for full implementation)

- [ ] **Step 3: Test topbar hamburger appears on mobile**

Run dev, check mobile view shows hamburger button.

- [ ] **Step 4: Commit**

```bash
cd frontend && git add src/components/layout/topbar.tsx
git commit -m "refactor: add responsive TopBar with mobile hamburger"
```

---

### Task 9: Refactor AppShell to Manage Drawer State

**Files:**
- Modify: `src/components/layout/app-shell.tsx`

- [ ] **Step 1: Read current AppShell**

```bash
cd frontend && cat src/components/layout/app-shell.tsx
```

- [ ] **Step 2: Update AppShell to integrate Drawer**

(See plan detail for full implementation)

- [ ] **Step 3: Test drawer opens/closes on mobile**

Run dev, mobile view, click hamburger, verify drawer slides in.

- [ ] **Step 4: Commit**

```bash
cd frontend && git add src/components/layout/app-shell.tsx
git commit -m "refactor: integrate Drawer and manage mobile navigation state"
```

---

### Task 10: Update Global Styles

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Read current globals.css**

```bash
cd frontend && cat src/app/globals.css
```

- [ ] **Step 2: Add responsive utility classes**

(See plan detail for CSS additions)

- [ ] **Step 3: Verify globals.css compiles**

Run:
```bash
cd frontend && npm run build
```

- [ ] **Step 4: Commit**

```bash
cd frontend && git add src/app/globals.css
git commit -m "refactor: add responsive utilities to globals.css"
```

---

### Task 11: Phase 0 Component Testing & Verification

**Files:**
- Test: All components from Phase 0

- [ ] **Step 1: Start dev server and test all breakpoints**

- [ ] **Step 2: Verify no horizontal overflow, touch targets, layout stability**

- [ ] **Step 3: Document Phase 0 complete**

- [ ] **Step 4: Final Phase 0 commit**

---

## PHASE 1–3: Page Refactoring & Multi-Agent Orchestration

*(See main spec for detailed Phase 1-3 breakdown and task instructions)*
