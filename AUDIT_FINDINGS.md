# Task 1: Responsive UI/UX Redesign — Audit Findings

**Date:** 2026-06-16  
**Status:** Analysis Complete — No Commit (Temporary Document)

---

## Executive Summary

The BDU frontend is a React 19 + Next.js 15 + Tailwind CSS 4 application with a sophisticated design system but **lacks mobile responsiveness**. The layout is built for desktop (1200px+) with hardcoded widths and fixed positioning patterns. This audit identifies all changes needed to achieve responsive design across mobile, tablet, and desktop viewports.

---

## 1. Current Structure Analysis

### 1.1 Layout Architecture

**File:** `src/components/layout/app-shell.tsx`

**Current Implementation:**
```typescript
<div className="flex h-screen overflow-hidden">
  <Sidebar collapsed={collapsed} />
  <div className="flex min-w-0 flex-1 flex-col">
    <TopBar ... />
    <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-6">
```

**Issues:**
- `h-screen` + `overflow-hidden` prevents mobile scroll on viewport change
- No drawer toggle for mobile (sidebar always visible on desktop)
- Fixed `p-6` padding not responsive to mobile constraints
- Main content assumes sidebar is always present in layout

**Responsive Need:** Sidebar must collapse into drawer on mobile (< 768px), topbar must accommodate hamburger, padding must be responsive.

---

### 1.2 Sidebar Component

**File:** `src/components/layout/sidebar.tsx`

**Current Implementation:**
```typescript
export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300",
        collapsed ? "w-[76px]" : "w-[260px]",  // Hardcoded px widths
      )}
    >
```

**Issues:**
- Fixed widths: 260px (expanded), 76px (collapsed) don't scale on mobile
- `h-full` + parent `overflow-hidden` prevents scrolling on small screens
- No drawer mode; sidebar always takes space
- Badge, icons, and labels have no mobile breakpoints
- Cannot be hidden completely on mobile

**Responsive Needs:**
1. Create drawer overlay for mobile (hidden on desktop)
2. Keep collapse toggle but make it work with drawer
3. Adjust sidebar width for tablet (maybe 200px expanded)
4. Make navigation items stack better on small screens
5. Create hamburger button in topbar for mobile drawer

---

### 1.3 TopBar Component

**File:** `src/components/layout/topbar.tsx`

**Current Implementation:**
```typescript
export function TopBar({ onToggleSidebar, periodo, onPeriodoChange }: TopBarProps) {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-5">
      <button ... className="grid size-9 place-items-center ...">
        <PanelLeft size={18} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-muted-foreground">BDU</span>
        {/* ... */}
      </div>

      <div className="flex-1" />

      {/* Search (hidden on mobile) */}
      <button className="hidden items-center gap-2 rounded-lg border border-border ... md:flex">
        <Search size={16} />
        <span>Buscar entidade — pessoa, projeto, cliente…</span>
        <kbd className="ml-2 rounded border ... px-1.5 text-[11px]">⌘K</kbd>
      </button>

      {/* Date picker + chips */}
      <div className={cn("relative", naoAplica && "opacity-45")} ...>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
          <button ... className="grid size-7 place-items-center rounded-md ...">
            <Calendar size={15} />
          </button>
          {/* Chips: 30d, sem1, sem2, ano, tudo */}
          {chips.map((c) => (
            <button key={c.key} className="rounded-md px-2.5 py-1 text-xs font-medium ...">
              {c.label}
            </button>
          ))}
        </div>

        {/* Date range picker overlay */}
        {calAberto && !naoAplica && (
          <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[260px] ...">
            {/* Form with two date inputs */}
          </div>
        )}
      </div>

      <button ... className="grid size-9 place-items-center rounded-lg ...">
        <Bell size={18} />
      </button>
    </header>
  );
}
```

**Issues:**
- Search button has `hidden ... md:flex` (good!) but period chips expand infinitely
- Date picker overlay (w-[260px]) overflows on mobile screens
- Breadcrumb text does not truncate; can overflow on mobile
- Period chips squeeze content; no responsive chip layout
- All controls cramped on mobile (gap-4 between items)
- No mobile menu affordance beyond sidebar toggle

**Responsive Needs:**
1. Collapse search input on mobile (show icon-only search button)
2. Move period selector to dropdown/modal on mobile
3. Truncate breadcrumb on small screens
4. Reduce topbar height on mobile (maybe h-14)
5. Make all buttons smaller on mobile
6. Ensure chip buttons stack if needed
7. Position popover correctly on mobile (not off-screen)

---

### 1.4 Card / Container Components

**File:** `src/components/dashboard/primitives.tsx`

**Current Implementation:**
```typescript
export function Card({
  title,
  sub,
  action,
  children,
  pad = true,
  className = "",
  style = {},
}: { ... }) {
  return (
    <div className={"card " + (pad ? "card--pad " : "") + className} style={style}>
      {(title || action) && (
        <div className="card__head">
          <div>
            {title && <div className="card__title">{title}</div>}
            {sub && <div className="card__sub">{sub}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
```

**CSS in globals.css:**
```css
.card {
  background: #fff;
  border: 1px solid var(--meta-navy-10);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  position: relative;
}
.card--pad {
  padding: 22px;  /* Fixed — no responsive padding */
}
.card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.card__title {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 15.5px;  /* Fixed — no mobile scaling */
  color: var(--meta-navy);
  letter-spacing: -0.01em;
}
```

**Issues:**
- Fixed padding (22px) too much for mobile screens
- Card header flex layout assumes space; action buttons may overflow
- Fixed font sizes (15.5px title) too large for mobile
- No gap adjustments for mobile
- Sub-text font (12.5px) unreadable on small screens

**Responsive Needs:**
1. Create padding variants: `card--pad-sm` (12px), `card--pad-md` (18px), `card--pad-lg` (22px)
2. Make card__head responsive: stack on mobile (flex-col)
3. Scale font sizes: md-down get smaller title/text
4. Adjust gaps and margins for small screens
5. Ensure action buttons don't overflow

---

### 1.5 Grid Utilities

**From globals.css:**
```css
.grid-mvp {
  display: grid;
  gap: var(--gap);  /* --gap: 20px — not responsive */
}
.cols-2 {
  grid-template-columns: repeat(2, 1fr);
}
.cols-3 {
  grid-template-columns: repeat(3, 1fr);
}
.cols-4 {
  grid-template-columns: repeat(4, 1fr);
}
@media (max-width: 1180px) {
  .cols-4,
  .cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 860px) {
  .cols-2,
  .cols-3,
  .cols-4 {
    grid-template-columns: 1fr;
  }
}
```

**Issues:**
- Breakpoints (1180px, 860px) are custom; don't align with Tailwind standard (md: 768px, lg: 1024px, xl: 1280px)
- No mobile-first approach (should be `cols-1` baseline)
- Gap (20px) fixed; should be 16px on mobile, 20px on desktop
- Only 3 breakpoints; missing lg/xl handling

**Responsive Needs:**
1. Align breakpoints with Tailwind: sm (640px), md (768px), lg (1024px), xl (1280px)
2. Use mobile-first: `cols-1` by default, then `md:cols-2`, `lg:cols-3`, etc.
3. Make gap responsive: `gap-4` (16px) mobile → `gap-5` (20px) desktop

---

### 1.6 Chart Components

**File:** `src/components/dashboard/charts.tsx`

**Funnel3D:**
```typescript
export function Funnel3D({
  stages,
  onPhase,
}: {
  stages: FunnelStage[];
  onPhase?: (fase: string) => void;
}) {
  const W = 540;  // Hardcoded width
  const cx = 150;  // Hardcoded x-center
  // ...
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", display: "block", overflow: "visible" }}
    >
```

**BarChart:**
```typescript
export function BarChart({
  data,
  height = 130,  // Fixed height
  fmt,
}: { ... }) {
  return (
    <div className="flex items-end justify-between gap-2.5 w-full pt-4" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
          {/* Bar with fixed max-width */}
          <div className="w-full max-w-[20px] bg-meta-navy-10 rounded-full ...">
```

**Donut:**
```typescript
export function Donut({
  segments,
  size = 132,  // Fixed size
  thickness = 18,
  center,
}: { ... }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} ...>
```

**Issues:**
- SVG charts hardcoded to desktop widths (Funnel3D W=540)
- BarChart fixed height (130px) + gap (2.5) assumes desktop
- Donut fixed size (132px) on mobile is too small/large depending on context
- No responsive variants for charts
- Charts in Cards don't adjust for mobile viewport
- Labels may overlap on small screens

**Responsive Needs:**
1. Make Funnel3D width dynamic: 100% of container, scale SVG viewBox
2. Make BarChart height responsive: 100px mobile → 160px desktop
3. Make Donut size responsive: 100px mobile → 140px desktop
4. Add mobile variant for label layout (Funnel3D: horizontal layout on mobile)
5. Adjust chart gaps for mobile (gap-1.5 mobile → gap-2.5 desktop)

---

### 1.7 Tables (from globals.css)

```css
.tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;  /* Fixed */
}
.tbl th {
  /* ... */
  font-size: 11.5px;  /* Fixed */
  padding: 11px 14px;  /* Fixed */
}
.tbl td {
  padding: 12px 14px;  /* Fixed */
  color: var(--meta-navy);
}
```

**Issues:**
- No horizontal scroll wrapper for mobile
- Fixed font sizes (13.5px body, 11.5px header) unreadable on mobile
- Padding (12-14px) too much on small screens
- Sticky header may not work well on mobile with scroll
- No mobile-optimized variant (card layout or collapsed columns)

**Responsive Needs:**
1. Create wrapper with `overflow-x-auto` for mobile
2. Reduce font sizes on mobile: 12px body, 10px header
3. Reduce padding on mobile: 8px table cells
4. Optional: add mobile card layout variant for tables (data-table card)
5. Make sticky header responsive

---

### 1.8 KPI Tiles

**From globals.css:**
```css
.kpi {
  padding: 18px 20px;  /* Fixed */
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}
.kpi__label {
  font-size: 12.5px;  /* Fixed */
  color: var(--meta-navy-50);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 7px;
}
.kpi__val {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 28px;  /* Fixed — way too large on mobile */
  letter-spacing: -0.025em;
  color: var(--meta-navy);
  line-height: 1.1;
  margin-top: 8px;
}
```

**Issues:**
- Fixed padding (18x20px) too much on mobile
- Font size (28px) for KPI value overflows on small screens
- Label (12.5px) + gap (7px) + icon (30px) squeeze on mobile
- Icon (30x30px) too large for mobile

**Responsive Needs:**
1. Padding variants: 12px mobile → 20px desktop
2. Font size: 20px mobile → 28px desktop
3. Icon size: 22px mobile → 30px desktop
4. Gap and margins scale with viewport

---

## 2. Tailwind Configuration Verification

**Location:** `frontend/` (no tailwind.config.js found; using defaults + globals.css overrides)

**Detected Breakpoints:** None configured explicitly  
**Default Tailwind 4 Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Current Usage:**
- `hidden ... md:flex` in TopBar (search button) ✓ Good
- Custom media queries in globals.css (1180px, 860px) ✗ Not standard

**Recommendation:** No Tailwind config needed; use standard breakpoints (sm/md/lg/xl) in all responsive classes.

---

## 3. Change Checklist

### Phase 1: Layout & Shell (Priority: Critical)

- [ ] Update AppShell:
  - Replace hardcoded `h-screen` with responsive height
  - Add drawer state management (isDrawerOpen)
  - Create Drawer component for mobile sidebar
  - Make main padding responsive: `px-4 md:px-6 lg:px-8`
  - Change `overflow-hidden` to allow scroll on mobile

- [ ] Create Drawer component:
  - File: `src/components/layout/drawer.tsx`
  - Mobile-only overlay (hidden on md+)
  - Slide-in animation from left
  - Overlay close on click
  - Z-index stack (50+)

- [ ] Update TopBar:
  - Add mobile hamburger button (show on md-down, hide on lg+)
  - Make breadcrumb truncate on mobile
  - Move date picker to modal/dropdown on mobile
  - Collapse search button to icon-only on mobile
  - Reduce height on mobile: `h-14 md:h-16`
  - Adjust gaps: `gap-2 md:gap-4`

### Phase 2: Sidebar Responsiveness (Priority: High)

- [ ] Update Sidebar:
  - Hide on mobile (display: none) if using drawer
  - Or: Create responsive sidebar (show on lg+, drawer on md-down)
  - Adjust padding on mobile
  - Scale icon sizes: 16px mobile → 18px desktop
  - Make nav items responsive

- [ ] Create Responsive Navigation:
  - Hide badges on mobile
  - Stack labels better
  - Add icon-only mode for smaller widths

### Phase 3: Components & Utilities (Priority: High)

- [ ] Update Card component:
  - Add `pad` variants: `pad-sm` (12px), `pad-md` (18px), `pad-lg` (22px)
  - Make header responsive: `flex-col md:flex-row` on mobile
  - Scale fonts: `text-sm md:text-base` for titles
  - Adjust gap: `gap-2 md:gap-3`

- [ ] Update Grid utilities:
  - Replace custom breakpoints (1180px, 860px) with Tailwind standard
  - Create mobile-first versions:
    - `.cols-1` (default)
    - `md:cols-2`
    - `lg:cols-3`
    - `xl:cols-4`
  - Make gap responsive: `gap-4 md:gap-5`

- [ ] Create Responsive Grid Utility:
  - File: `src/lib/responsive-grid.ts`
  - Or: Add to globals.css with Tailwind classes

### Phase 4: Charts (Priority: Medium)

- [ ] Funnel3D:
  - Make SVG container 100% width
  - Adjust viewBox based on viewport
  - Scale font sizes in SVG
  - Horizontal layout on mobile (optional)

- [ ] BarChart:
  - Responsive height: `100px md:130px lg:160px`
  - Scale label font: `text-[10px] md:text-[11px]`
  - Adjust gap: `gap-1.5 md:gap-2.5`
  - Responsive max-width for bars

- [ ] Donut:
  - Responsive size: `100px md:132px lg:160px`
  - Scale center text
  - Adjust thickness proportionally

### Phase 5: Tables (Priority: Medium)

- [ ] Create table wrapper:
  - File: `src/components/ui/table-scroll.tsx`
  - Horizontal scroll on mobile: `overflow-x-auto`
  - Responsive font: `text-sm md:text-base`
  - Responsive padding: `px-2 py-2 md:px-3 md:py-3`

- [ ] Update table CSS:
  - Scale fonts on mobile
  - Add responsive padding
  - Make sticky header work on mobile

### Phase 6: Primitives (Priority: Medium)

- [ ] Kpi tile:
  - Responsive padding: `px-3 py-2.5 md:px-5 md:py-4`
  - Scale font: `text-lg md:text-[28px]` for value
  - Scale icon: `size-6 md:size-[30px]`
  - Adjust gaps

- [ ] Badge, Entity Pill, Button:
  - Scale fonts and padding on mobile
  - Adjust icon sizes
  - Ensure touch targets (min 44px on mobile)

### Phase 7: Globals CSS (Priority: High)

- [ ] Update globals.css:
  - Replace custom media queries with Tailwind breakpoints
  - Add responsive utility variants
  - Create responsive spacing/font scale
  - Add mobile-first approach to all components

### Phase 8: Responsive Utilities (Priority: Low)

- [ ] Create utility file: `src/lib/responsive.ts`
  - Helper functions for responsive calculations
  - Breakpoint constants
  - Responsive class generators

---

## 4. Tailwind Configuration Status

**File:** Not found (using Tailwind defaults + globals.css overrides)

**Recommendation:**
- No explicit tailwind.config.js needed
- Use standard Tailwind breakpoints (sm/md/lg/xl)
- All responsive behavior can be added via Tailwind classes + globals.css media queries

---

## 5. File Structure Checklist

**To Create:**
- [ ] `src/components/layout/drawer.tsx` — Mobile navigation drawer
- [ ] `src/components/ui/table-scroll.tsx` — Table horizontal scroll wrapper
- [ ] `src/lib/responsive.ts` — Responsive utilities (optional)

**To Update:**
- [ ] `src/components/layout/app-shell.tsx`
- [ ] `src/components/layout/sidebar.tsx`
- [ ] `src/components/layout/topbar.tsx`
- [ ] `src/components/dashboard/primitives.tsx`
- [ ] `src/components/dashboard/charts.tsx`
- [ ] `src/app/globals.css`
- [ ] Component pages using grid/cards

---

## 6. Breakpoint Strategy

**Mobile-First Approach:**
```
Default (mobile): Single column, full width, small spacing
sm (640px+): Still mobile, slightly more space
md (768px+): Tablet, 2 columns, sidebar on desktop path
lg (1024px+): Small desktop, 3 columns, full sidebar visible
xl (1280px+): Large desktop, 4 columns, expanded layout
```

**Key Transitions:**
- **md (768px):** Show/hide sidebar, collapse topbar elements
- **lg (1024px):** Show full sidebar, expand grid to 3 columns
- **xl (1280px):** Expand to 4 columns, max content width (1480px)

---

## 7. Implementation Priority

1. **Critical (Phase 0):** AppShell, Drawer, TopBar responsive — blocks all other work
2. **High (Phase 1):** Card, Grid utilities, Sidebar — affects all pages
3. **Medium (Phase 2):** Charts, Tables, Primitives — improves UX but not blocking
4. **Low (Phase 3):** Utilities file, Storybook stories — nice-to-have

---

## 8. Testing Checklist

After implementation:
- [ ] Mobile (375px): Layout doesn't overflow, drawer works
- [ ] Tablet (768px): Sidebar shows, grid is 2-col
- [ ] Desktop (1024px+): Full layout, sidebar fixed
- [ ] Forms: Touch targets 44px+ on mobile
- [ ] Charts: Responsive SVG sizing
- [ ] Tables: Horizontal scroll on mobile
- [ ] Typography: Text readable at all sizes
- [ ] Topbar: No overflow on any size
- [ ] Sidebar: Drawer closes on navigation
- [ ] Cards: Padding appropriate for all sizes

---

## 9. Notes for Next Phase

1. **No Tailwind config needed** — use defaults + standard breakpoints
2. **Start with AppShell/Drawer** — all other changes depend on it
3. **Use mobile-first approach** — default to mobile, then `md:` for tablet, `lg:` for desktop
4. **Keep existing CSS** — don't refactor; add responsive variants alongside
5. **Test on real devices** — viewport units (vw, vh) can behave unexpectedly
6. **Z-index stack:** Drawer (50+) > Popover (40+) > Sidebar (10+)

---

**End of Audit Document**  
Status: READY FOR IMPLEMENTATION
