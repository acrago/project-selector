# New Evaluation Page Layouts

This folder contains two different layout options for the New Evaluation page:

## Option A (Current/Active): Full-Width Navigation Cards
**Files:** 
- `NewEvaluation.tsx` (landing page)
- `EvaluationCollections.tsx` (collections listing)
- `EvaluationBenchmarks.tsx` (benchmarks listing)

### Features:
- Full-width selection cards with large icons
- "Evaluation Collection" and "Standardized Benchmarks" cards
- Hover effects on cards (border color and shadow)
- Navigation to dedicated pages for each type
- **Collections page**: Search + 4-column responsive grid
- **Benchmarks page**: Search + Category filters + 4-column responsive grid
- Each item card has "Run" button
- Blue labels for Collections, Orange labels for Benchmarks

### Pages:
- `/develop-train/evaluations/new` - Landing page with type selection
- `/develop-train/evaluations/collections` - All evaluation collections
- `/develop-train/evaluations/benchmarks` - All standardized benchmarks

### Use Case:
Best for clear separation between Collections and Benchmarks with dedicated browsing experiences for each type.

---

## Option B: Split Detail View with Drawer
**File:** `NewEvaluation-OptionB.tsx`

### Features:
- All cards displayed in a responsive grid (1-4 per row depending on screen size)
- Type filter toggle at top (All | Collections | Benchmarks)
- Category filters for benchmarks (Capability | Quality | Safety)
- Click a card to open a detail panel (drawer) on the right
- Detail panel shows full information and "New evaluation" button
- Conditional/cascading filtering with breadcrumb navigation
- Visual color coding (Blue for Collections, Orange for Benchmarks)
- Smart "Clear filters" that preserves parent type selection

### Use Case:
Best for users who want to browse all options at once and compare items quickly without losing context.

---

## Switching Between Layouts

To switch to **Option B**, copy the file:
```bash
cp NewEvaluation-OptionB.tsx NewEvaluation.tsx
```

To restore **Option A**, use git:
```bash
git checkout NewEvaluation.tsx
```

Or manually restore from this README's description of the side-by-side layout.

---

## Key Differences Summary

| Feature | Option A (Side-by-Side) | Option B (Split Detail) |
|---------|------------------------|-------------------------|
| Layout Type | Two-column selection → results | Single grid with drawer |
| Initial View | Empty (select a type first) | All items visible |
| Filtering | Category filters in toolbar | Toggle groups with cascading logic |
| Details | Console log on click | Drawer panel with full info |
| Cards per Row | Fixed ~3 | Responsive 1-4 |
| Best For | Guided selection | Exploration & comparison |
