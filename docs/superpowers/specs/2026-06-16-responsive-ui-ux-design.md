# Responsive UI/UX Redesign — BDU Frontend

**Date:** 2026-06-16  
**Status:** Design Phase  
**Author:** Claude Code + Davi  
**Scope:** Complete responsive overhaul of BDU Meta Consultoria dashboard

---

## 1. Problem Statement

Current frontend is **broken on mobile and tablet:**
- Text/components clipped or overflowing
- Horizontal scroll on mobile
- Elements too small to interact with
- Layout shifts and misalignments
- Sidebar always visible (doesn't work on small screens)

**Goal:** Make the entire app functional and usable on mobile (320px+), tablet, and desktop without losing current visual design.

---

## 2. Responsiveness Strategy

### 2.1 Breakpoint Architecture

| Device | Width | Sidebar | Layout | Columns |
|--------|-------|---------|--------|---------|
| Mobile | <768px | Drawer (hamburger) | Full-width content | 4 |
| Tablet | 768px–1023px | Collapsed (76px) | Sidebar + content | 8 |
| Desktop | 1024px+ | Fixed (260px) | Sidebar + content | 12 |

### 2.2 Layout Changes by Breakpoint

**Desktop (1024px+):**
- Sidebar: Fixed 260px (or collapsed 76px toggle)
- TopBar: Full width
- Content: Flex with padding
- Current structure maintained

**Tablet (768px–1023px):**
- Sidebar: Collapsed to 76px icon-only view
- TopBar: Compact but functional
- Content: Adjusted padding, narrower for readability
- Navigation icons always visible

**Mobile (<768px):**
- Sidebar: Hidden by default → Drawer (hamburger menu)
- TopBar: Compact, hamburger left, logo center, actions right
- Content: Full-width, no side padding constraints
- Drawer: Overlay on top of content, dark backdrop

### 2.3 Typography & Spacing

- **Font sizes:** Minimum 16px on mobile (readable without zoom)
- **Touch targets:** Minimum 44px height/width (mobile-friendly)
- **Padding:** Relative units (rem), not hardcoded px
  - Mobile: 1rem (16px)
  - Tablet: 1.5rem (24px)
  - Desktop: 1.5rem–2rem (24–32px)
- **Line height:** Maintain current (good contrast)
- **Colors & fonts:** No changes to visual identity

### 2.4 Grid System

Use Tailwind CSS Grid with responsive columns:

```jsx
// Example pattern
<div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
  {/* Cards auto-adjust */}
</div>
```

- **Mobile:** 4 columns (larger cards, single/double column layouts)
- **Tablet:** 8 columns (medium cards, 2–3 per row)
- **Desktop:** 12 columns (current layouts, 3–4 per row)

---

## 3. Component Refactoring

### 3.1 Core Components (High Priority)

| Component | Current Status | Changes | Responsiveness |
|-----------|---|---|---|
| **Card** | Exists in primitives | Add padding/border variants | Shrink padding in mobile |
| **Table** | Exists | Add horizontal scroll in mobile, collapse cols | Stack or scroll on mobile |
| **Chart** | Exists in charts.tsx | Make container responsive | Shrink on mobile, full width |
| **Form** | Via Base UI | Ensure 44px+ touch targets | Full width on mobile |
| **Button** | Exists | Maintain current style | Ensure 48px min height |

### 3.2 New Components (If Needed)

- **ResponsiveGrid:** Wrapper component for 4/8/12 column adaptation
- **MobileMenu/Drawer:** Sidebar as off-canvas menu on mobile
- **AdaptiveTable:** Table with horizontal scroll, optional column collapse
- **ResponsiveChart:** Chart container that resizes with viewport

### 3.3 Global Components (Sidebar & TopBar)

**Sidebar (Responsive):**
- Desktop: Fixed 260px or 76px (toggle collapse)
- Tablet: Always collapsed 76px
- Mobile: Hidden → Drawer on hamburger click
- Drawer: Full-height overlay, slides from left, backdrop overlay

**TopBar (Responsive):**
- Desktop: Full layout, all controls visible
- Tablet: Compact, same structure
- Mobile: Hamburger | Logo | Period selector (maybe dropdown)
- Ensure spacing/padding adjusts for small screens

---

## 4. Pages & Groups

### 4.1 Page Grouping Strategy

**Group 1: Dashboard (High Priority)**
- `/` (home page)
- Refactor: Layout grid, card sizes, period selector

**Group 2: Financeiro (High Priority)**
- `/financeiro`
- Refactor: Tables (horizontal scroll), charts, form inputs

**Group 3: Comercial + Análises (High Priority)**
- `/comercial`, `/analises`
- Refactor: Charts, cards, data displays

**Group 4: Projetos + Serviços (Medium Priority)**
- `/projetos`, `/servicos`
- Refactor: Similar patterns to Groups 1–3

**Group 5: Mapa de Pessoas (Medium Priority)**
- `/mapa-pessoas`
- Refactor: Unique layout (if applicable)

---

## 5. Multi-Agent Orchestration

### 5.1 Team Structure

| Role | Responsibility |
|------|---|
| **Agent Gerente** | Components base, coordination, final integration |
| **Agent 1** | Group 1 (Dashboard) |
| **Agent 2** | Group 2 (Financeiro) |
| **Agent 3** | Group 3 (Comercial + Análises) |
| **Agent 4** | Group 4 (Projetos + Serviços) — *if needed* |
| **Agent 5** | Group 5 (Mapa de Pessoas) — *if needed* |

### 5.2 Execution Phases

**Phase 0 — Component Foundation (Sequential, Gerente)**
1. Analyze current structure
2. Create/refactor base components (Card, Button, Table, Charts, Forms)
3. Build ResponsiveGrid wrapper
4. Create MobileMenu/Drawer component
5. Refactor Sidebar & TopBar for responsiveness
6. Test components in isolation (mobile/tablet/desktop)
7. Commit: `refactor: responsive component library + drawer navigation`
8. Notify agents → ready for integration

**Phase 1 — Page Refactoring (Parallel, Agents 1–3)**
- Each agent refactors their page group
- Uses new responsive components from Phase 0
- Tests on 3 breakpoints (mobile, tablet, desktop)
- Handles edge cases: empty states, overflow, touch interactions
- Creates PR per group with testing notes

**Phase 2 — QA Testing (Parallel, Agents)**
- Agent tests their group on real devices (or emulator)
- Reports issues in PR comments
- Verifies: no overflow, touch targets OK, layout shifts

**Phase 3 — Integration & Polish (Sequential, Gerente)**
1. Review & merge all PRs
2. Test full app flow across breakpoints
3. Fix any cross-page issues (navigation, global state)
4. Refactor sidebar/topbar if needed after seeing full app
5. Final commit: `refactor: complete responsive redesign`
6. Deploy to staging for final QA

---

## 6. Success Criteria

### Functional
- ✅ **No horizontal overflow** on any breakpoint
- ✅ **Touch targets:** ≥44px on mobile
- ✅ **Tables:** Horizontal scroll on mobile, readable content
- ✅ **Charts:** Responsive containers, no clipping
- ✅ **Forms:** Full-width inputs on mobile, proper spacing
- ✅ **Navigation:** Drawer works smoothly, sidebar responsive

### Visual/UX
- ✅ **Sidebar:** Hamburger on mobile, icons only on tablet, full on desktop
- ✅ **TopBar:** Scales appropriately, logo/menu visible
- ✅ **Content:** Readable at all sizes (16px min font)
- ✅ **Spacing:** Consistent padding, no overcrowding
- ✅ **No layout shifts:** CLS = 0 (Cumulative Layout Shift)

### Testing
- ✅ Manual testing: iPhone SE (320px), iPhone 12 (390px), iPad (768px), Desktop (1440px)
- ✅ Chrome DevTools responsive mode validated
- ✅ All pages tested on 3+ breakpoints
- ✅ No console errors/warnings

### Code Quality
- ✅ Components reusable & well-documented
- ✅ Tailwind classes organized (no duplication)
- ✅ No hardcoded widths/heights (use rem, %, flex)
- ✅ Git history clean (logical commits)

---

## 7. Technical Details

### 7.1 Technology Stack (No Changes)
- Next.js 16.2.7
- React 19.2.4
- Tailwind CSS 4
- Lucide React (icons)
- Base UI React (components)

### 7.2 File Structure (Proposed Additions)
```
src/
  components/
    layout/
      sidebar.tsx (refactored)
      topbar.tsx (refactored)
      drawer.tsx (new - mobile menu)
      app-shell.tsx (refactored)
    ui/
      responsive-grid.tsx (new)
      adaptive-table.tsx (new - if needed)
      card.tsx (refactored)
      button.tsx (refactored)
    dashboard/
      (existing - refactored for responsiveness)
  app/
    page.tsx (refactored)
    [other pages] (refactored per group)
```

### 7.3 Tailwind Configuration
- Ensure breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- Use `lg:` prefix for desktop, `md:` for tablet, no prefix for mobile
- Utility classes for responsive padding/sizing already available

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Sidebar drawer overlap with content | Medium | Use `z-index` layers, test on real devices |
| Parallel PRs conflict | Medium | Gerente reviews merge order, resolves conflicts |
| Mobile-first breaks desktop layout | High | Gerente tests after each phase |
| Missing edge cases (long text, special chars) | Medium | Agents test with real data, not just stubs |

---

## 9. Timeline Estimate

- **Phase 0:** 2–3 days (Gerente alone)
- **Phase 1:** 3–4 days (parallel agents, ~1 day per group)
- **Phase 2:** 1–2 days (parallel QA)
- **Phase 3:** 1–2 days (integration, final tests)

**Total:** ~1–1.5 weeks (depends on complexity of existing components)

---

## 10. Next Steps

1. ✅ Design approved
2. ⏭️ Invoke `writing-plans` to create detailed implementation plan
3. Dispatch agents per phases
4. Track PRs & merge conflicts
5. Final testing & deployment

---

**Design Status:** Ready for implementation planning
