# Frontend Engineering System Rules & AI Agent Instructions

> **Universal Core Mandate**: **ALWAYS WRITE CLEAN CODE.**
> Every line of code written in this repository must be purposeful, minimal, elegant, strictly typed, and free of clutter. Dead code, commented-out blocks, unused files, and redundant abstractions are strictly forbidden.

---

## 1. Non-Negotiable Frontend Tenets

1. **Always Write Clean Code (Zero Bloat Policy)**:
   - Never introduce unnecessary files, placeholder folders, or dead code.
   - Delete any temporary scripts, debug artifacts, or unused imports immediately.
   - Keep files concise, focused, and aligned with the Single Responsibility Principle (SRP).
2. **Zero Inline Raw JSX/HTML for Complex Sections**:
   - `page.tsx` must not contain inline multi-element layout blocks, hardcoded card grids, or ad-hoc data tables.
   - Every UI element strictly belongs to:
     - `components/ui` (reusable primitives: Button, Card, Badge).
     - `components/shared` (cross-cutting layout/display: PageHeader, MetricCard, DataTable).
     - `features/{domain}/components` (feature-specific section components: DashboardStats, CheckoutForm).
3. **Strict TypeScript (Zero `any`)**:
   - `strict: true` in `tsconfig.json`. Zero `any` usage.
   - Prefer discriminated unions, typed DTO interfaces, and RTK Query generated/typed endpoints.
4. **State Management Isolation**:
   - Server data MUST be managed exclusively via RTK Query (`apiSlice.ts` and extended feature slices).
   - RTK Query tag invalidation MUST be defined declaratively for write mutations (`providesTags`, `invalidatesTags`).
   - Client UI state (e.g., drawer toggles, active filters) lives in RTK slices or local React state, never mixed with server response state.

---

## 2. Frontend (Next.js 15 App Router & RTK Query) Architecture

### 2.1 Directory Structure & Component Layers
```
src/
├── app/                       # Next.js App Router (Routing, Layouts, Metadata)
├── components/
│   ├── ui/                    # Primitive atomic components (shadcn/ui, buttons, badges)
│   └── shared/                # Cross-feature reusables (MetricCard, PageHeader, DataTable)
├── features/{feature}/
│   ├── api/                   # RTK Query slice injections (e.g. orderApi.ts)
│   ├── components/            # Domain-specific section components (DashboardStats.tsx)
│   ├── hooks/                 # Feature-specific custom hooks
│   └── types/                 # TypeScript interfaces and response schemas
└── store/
    ├── store.ts               # Redux Toolkit store definition
    ├── hooks.ts               # Typed useAppDispatch & useAppSelector
    └── api/apiSlice.ts        # Base RTK Query API slice (token injection, tags)
```

### 2.2 Atomic Component Guidelines
- **UI Primitives (`components/ui`)**: Zero business logic, purely presentational, accepts polymorphic styling via `clsx`/`tailwind-merge`.
- **Shared Components (`components/shared`)**: Structural patterns reusable across >1 feature.
- **Section Components (`features/{domain}/components`)**: Encapsulates data fetching or state orchestration for a distinct section.
- **Page (`app/**/page.tsx`)**: Responsible ONLY for assembling section components and injecting page metadata.

---

## 3. DRY Enforcement Matrix: When to Extract?

| Scenario | Clean Code Rule | Extraction Destination |
| :--- | :--- | :--- |
| UI element used in 2+ domains | Component duplication | `components/shared/{ComponentName}.tsx` |
| UI style variant repeated 3+ times | No repeated raw Tailwind strings | `components/ui/{primitive}.tsx` |
| API Query / Mutation | Never use manual `fetch` / `axios` | RTK Query slice (`features/{domain}/api/`) |
| Complex client state logic | Custom Hook | `features/{domain}/hooks/use{HookName}.ts` |
| Shared data model / response schema | Single Source of Truth | `features/{domain}/types/` |

---

## 4. Frontend Clean Code Audit Checklist

Before declaring any frontend task or PR complete:
1. **Zero Unused Code**: Are there any unused imports, dead functions, console logs, or obsolete files? Delete them.
2. **Strict TypeScript Passed**: Does the code compile with `tsc --noEmit` without errors or `any` types?
3. **Atomic UI Segregated**: Are sections isolated into feature components instead of dumped inline into `page.tsx`?
4. **RTK Query Tags Defined**: Do mutations properly invalidate relevant tags for instant cache updates?
5. **Responsive & Accessible**: Is the layout fully responsive and styled consistently using Design System tokens?
