# Responsive UI/UX — Implementation Checklist

## Quick Reference

**Total Items:** 45+  
**Priority:** CRITICAL → HIGH → MEDIUM → LOW  
**Estimated Effort:** 8–10 tasks across Phases 0–3

---

## Phase 0: Foundation (CRITICAL) — Blocks all other work

### Layout Shell (AppShell)
- [ ] Remove hardcoded `h-screen` → use min-h-screen + responsive adjustments
- [ ] Add drawer state: `isDrawerOpen` boolean, toggle handler
- [ ] Import Drawer component (to be created)
- [ ] Show sidebar on lg+, hide on md-down (use Drawer instead)
- [ ] Update main padding: `px-4 md:px-6 lg:px-8`
- [ ] Change parent `overflow-hidden` → allow scroll on mobile

**Estimated:** 1 task

### Drawer Component (NEW)
- [ ] Create `src/components/layout/drawer.tsx`
- [ ] Mobile-only (hidden on lg+)
- [ ] Slide-in from left, overlay backdrop
- [ ] Close on overlay click or navigation
- [ ] Z-index: 50+
- [ ] Smooth animation (CSS transition or Framer Motion)

**Estimated:** 1 task

### TopBar Responsiveness
- [ ] Add hamburger button visible on md-down, hidden on lg+
- [ ] Breadcrumb truncate: `truncate` or `md:block hidden` for long text
- [ ] Search: collapse to icon-only on mobile (hidden on sm/md)
- [ ] Period selector: dropdown/modal on mobile instead of inline chips
- [ ] Reduce height on mobile: `h-14 md:h-16` (if needed)
- [ ] Reduce gaps: `gap-2 md:gap-4`

**Estimated:** 1 task

---

## Phase 1: Components (HIGH) — Affects all pages

### Sidebar Responsiveness
- [ ] Hide on desktop if drawer is primary (or show lg+)
- [ ] Adjust width for tablet: maybe 220px on md
- [ ] Scale icon: `size-4 md:size-[18px]`
- [ ] Truncate label on sm
- [ ] Remove badges on sm/md

**Estimated:** 1 task

### Card Component Variants
- [ ] Add padding variants to CSS:
  - `.card--pad-sm`: 12px
  - `.card--pad-md`: 18px (current)
  - `.card--pad-lg`: 22px
- [ ] Make card__head responsive: `flex-col md:flex-row`
- [ ] Scale card__title: `text-sm md:text-base lg:text-[15.5px]`
- [ ] Scale card__sub: `text-xs md:text-[12px]`
- [ ] Adjust gap: `gap-2 md:gap-3`

**Estimated:** 1 task

### Grid Utilities (Critical)
- [ ] Remove custom breakpoints (1180px, 860px)
- [ ] Create mobile-first grid classes:
  ```css
  .cols-1 { grid-template-columns: 1fr; }
  .md\:cols-2 { grid-template-columns: repeat(2, 1fr); }
  .lg\:cols-3 { grid-template-columns: repeat(3, 1fr); }
  .xl\:cols-4 { grid-template-columns: repeat(4, 1fr); }
  ```
- [ ] Update gap: `gap-4 md:gap-5` (or use Tailwind `gap-` classes)
- [ ] Test on all pages using `.grid-mvp`

**Estimated:** 1 task

---

## Phase 2: Charts & Tables (MEDIUM) — Improves UX

### Funnel3D Chart
- [ ] Make SVG container 100% width
- [ ] Dynamic viewBox based on viewport (or single fixed viewBox that scales)
- [ ] Scale internal geometry on mobile (smaller stage heights, paddings)
- [ ] Scale font inside SVG: check if `fontSize` adapts with viewBox
- [ ] Test overflow on 375px viewport

**Estimated:** 1 task

### BarChart Component
- [ ] Responsive height: `height: window.innerWidth < 768 ? 100 : 130`
- [ ] Or use CSS: `height: 100px; @media (min-width: 768px) { height: 130px; }`
- [ ] Scale label font: `text-[10px] md:text-[11px]`
- [ ] Adjust bar gap: `gap-1.5 md:gap-2.5`
- [ ] Reduce max-width on mobile: `max-w-[16px] md:max-w-[20px]`

**Estimated:** 0.5 task

### Donut Chart
- [ ] Responsive size: `size={window.innerWidth < 768 ? 100 : 132}`
- [ ] Or use CSS container query / media query
- [ ] Scale thickness proportionally: `thickness={window.innerWidth < 768 ? 14 : 18}`
- [ ] Adjust center text size

**Estimated:** 0.5 task

### Table Component
- [ ] Create wrapper for horizontal scroll on mobile: `<TableScroll>`
- [ ] Add: `overflow-x-auto overflow-y-hidden` on mobile
- [ ] Scale font: `text-xs md:text-sm` for table body
- [ ] Scale padding: `px-2 py-2 md:px-3 md:py-3` in th/td
- [ ] Keep sticky header but ensure it works on mobile

**Estimated:** 1 task

---

## Phase 3: Primitives & Polish (MEDIUM)

### KPI Tile
- [ ] Responsive padding: `px-3 py-2.5 md:px-5 md:py-4`
- [ ] Scale value font: `text-lg md:text-[28px]`
- [ ] Scale label font: `text-xs md:text-[12.5px]`
- [ ] Scale icon: `size-6 md:size-[30px]`
- [ ] Adjust gap: `gap-1 md:gap-2`

**Estimated:** 0.5 task

### Badge, EntityPill, Button
- [ ] Ensure all have responsive font/padding
- [ ] Touch targets: min 44px on mobile
- [ ] Review button sizes (sm: 6px | default: 8px | lg: 9px)
- [ ] Scale icon sizes in buttons

**Estimated:** 0.5 task

### Responsive Typography Scale (globals.css)
- [ ] Add mobile-first font scale:
  ```css
  /* Mobile: smaller */
  body { font-size: 14px; }
  h1 { font-size: 24px; }
  h2 { font-size: 18px; }
  h3 { font-size: 16px; }
  
  /* Tablet+ */
  @media (min-width: 768px) {
    body { font-size: 15px; }
    h1 { font-size: 32px; }
    h2 { font-size: 20px; }
  }
  ```

**Estimated:** 0.5 task

---

## Phase 4: Pages & Integration (LOW)

### Homepage (`src/app/page.tsx`)
- [ ] Test grid-mvp at all breakpoints
- [ ] Hero section responsive: stack stats on mobile
- [ ] System connected: horizontal scroll → vertical stack on mobile
- [ ] Signals grid: 1 column mobile → 3 columns desktop

**Estimated:** Testing only, no code changes needed if components are responsive

### Other Pages (Comercial, Financeiro, Analises, etc.)
- [ ] Similar testing
- [ ] Adjust any hardcoded widths/heights
- [ ] Verify grid layouts

**Estimated:** Testing only

---

## Breakpoint Summary

| Breakpoint | Width | When | Layout |
|-----------|-------|------|--------|
| Default (mobile) | < 640px | Phone | 1 col, sidebar hidden (drawer), compact |
| sm | 640px+ | Large phone | Still compact |
| **md** | **768px+** | **Tablet** | **2 col, sidebar visible (maybe), topbar adjusted** |
| **lg** | **1024px+** | **Desktop** | **3 col, full sidebar, full topbar** |
| xl | 1280px+ | Large desktop | 4 col, max-w applied |
| 2xl | 1536px+ | Very large | Same as xl |

**Key Transitions:**
- **sm → md (768px):** Show sidebar, adjust topbar
- **md → lg (1024px):** Full layout, 3-column grids
- **lg → xl (1280px):** 4-column grids, max content width

---

## Testing Checklist

Before marking task complete, verify:

### Mobile (375px iPhone SE)
- [ ] Layout doesn't overflow horizontally
- [ ] Drawer opens/closes smoothly
- [ ] TopBar fits without overflow
- [ ] Cards stack vertically
- [ ] Charts render at correct size
- [ ] Tables scroll horizontally
- [ ] Touch targets are 44px+
- [ ] Text is readable (not too small)

### Tablet (768px iPad)
- [ ] Sidebar appears (if using responsive sidebar)
- [ ] Grid is 2-column
- [ ] TopBar shows more elements
- [ ] Charts are medium size
- [ ] Proper spacing between cards

### Desktop (1024px+ Desktop)
- [ ] Full layout with sidebar
- [ ] Grid is 3-column (or 4 on xl)
- [ ] All topbar elements visible
- [ ] Charts at full size
- [ ] Spacing matches design

### Cross-Device
- [ ] Landscape orientation works (mobile, tablet)
- [ ] No layout shift when scrollbar appears
- [ ] Drawer z-index correct
- [ ] Popovers position correctly
- [ ] Performance acceptable (no jank)

---

## Files to Create

1. **`src/components/layout/drawer.tsx`**
   - Mobile navigation drawer
   - Overlay, slide-in animation
   - Close handlers

2. **`src/components/ui/table-scroll.tsx`** (optional)
   - Wrapper for tables on mobile
   - Horizontal scroll container

3. **Update `src/app/globals.css`**
   - Responsive variants
   - Mobile-first media queries
   - Grid utilities

---

## Files to Update

1. `src/components/layout/app-shell.tsx`
2. `src/components/layout/sidebar.tsx`
3. `src/components/layout/topbar.tsx`
4. `src/components/dashboard/primitives.tsx`
5. `src/components/dashboard/charts.tsx`
6. `src/app/globals.css` (major updates)
7. Page components using grids/cards (verify, no changes usually needed)

---

## Notes

- **No Tailwind config file needed** — use defaults
- **Standard breakpoints:** sm (640), md (768), lg (1024), xl (1280)
- **Mobile-first:** Default styles for mobile, then `md:` overrides
- **Don't over-engineer:** Solve responsive problems as they arise in testing
- **Keep existing CSS:** Add responsive variants, don't refactor
- **Z-index strategy:** Drawer (50) > Popover (40) > Sidebar (10)

---

**Status:** Ready for Phase 0 implementation  
**Next Step:** Create Drawer component + update AppShell
