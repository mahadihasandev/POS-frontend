# Engineering System Rules & AI Agent Instructions

> **Universal Core Mandate**: **ALWAYS WRITE CLEAN CODE.**
> Every line of code written in this repository must be purposeful, minimal, elegant, strictly typed, and free of clutter. Dead code, commented-out blocks, unused files, and redundant abstractions are strictly forbidden.

---

## 1. Non-Negotiable Architectural Tenets

1. **Always Write Clean Code (Zero Bloat Policy)**:
   - Never introduce unnecessary files, placeholder folders, or dead code.
   - Delete any temporary scripts, debug artifacts, or unused imports immediately.
   - Keep files concise, focused, and aligned with the Single Responsibility Principle (SRP).
2. **Zero Inline Business Logic in Controllers**:
   - HTTP Controllers must only parse incoming requests/DTOs, delegate execution to a single dedicated Action, and return an API Resource or View.
   - Controllers exceeding 25 lines per method violate architectural standards.
3. **Zero Inline Raw JSX/HTML for Complex Sections**:
   - `page.tsx` or Blade view files must not contain inline multi-element layout blocks, hardcoded card grids, or ad-hoc data tables.
   - Every UI element strictly belongs to:
     - `components/ui` (reusable primitives: Button, Card, Badge).
     - `components/shared` (cross-cutting layout/display: PageHeader, MetricCard, DataTable).
     - `features/{domain}/components` (feature-specific section components: DashboardStats, CheckoutForm).
4. **Stateless API vs Stateful Dashboard Isolation**:
   - API routes (`/api/v1/*`) are strictly stateless, authenticated via Bearer tokens, and MUST return JSON with explicit HTTP status codes (never redirect on unauthenticated 401).
   - Admin routes (`/admin/*`) are stateful, protected by session cookies, CSRF tokens, and render atomic Blade components (`<x-layout>`, `<x-card>`, `<x-table>`).
5. **Strict Typing Everywhere**:
   - **PHP (8.3+)**: `declare(strict_types=1);` on every PHP file. All arguments and returns must have explicit native types. No untyped parameters.
   - **TypeScript**: `strict: true`, zero `any` usage. Prefer discriminated unions, typed DTO interfaces, and RTK Query generated/typed endpoints.
6. **No N+1 Queries & Safe Eloquent Access**:
   - Eloquent strict mode enabled in non-production environments (`preventLazyLoading`, `preventSilentlyDiscardingAttributes`, `preventAccessingMissingAttributes`).
   - All relations must be eager-loaded using `with()` or cached Redis projections.

---

## 2. Backend (Laravel 13 Octane / FrankenPHP) Architecture

### 2.1 Directory Structure & Boundaries
```
backend/
├── app/
│   ├── Actions/{Domain}/          # Single-purpose invocable domain operations
│   ├── DTOs/{Domain}/             # Readonly typed data transfer objects
│   ├── Enums/                     # Backed PHP enums for domain states
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/v1/            # API Responders (Stateless)
│   │   │   └── Admin/             # Blade Responders (Stateful)
│   │   ├── Requests/{Domain}/     # Form Requests (Validation & Authorization)
│   │   └── Resources/Api/v1/      # JSON API transformers
│   ├── Jobs/{Domain}/             # Async queue jobs with backoff & retry
│   ├── Models/                    # Strict Eloquent Entities (no raw query building)
│   ├── Providers/                 # Application service providers (Strict Eloquent, Rate Limits)
│   └── Services/{Domain}/         # Infrastructure services (Redis caching, Payment gateways)
├── bootstrap/app.php              # Dual routing (stateless API v1 + stateful web admin)
├── database/migrations/           # Strictly typed migrations with composite indexes
├── resources/views/
│   ├── components/                # Reusable Blade components (<x-layout>, <x-card>, <x-table>)
│   └── admin/                     # Admin views utilizing atomic Blade components
└── routes/
    ├── api.php                    # Stateless API routes
    ├── web.php                    # Stateful admin dashboard routes
    └── console.php                # CLI commands
```

### 2.2 ADR & Action Design
- Every Action must have a single public method (either `execute(...)` or `__invoke(...)`).
- Database transactions (`DB::transaction(...)`) live inside Actions, never in controllers or jobs.
- Actions receive primitive types or validated DTOs, never `Illuminate\Http\Request` instances.

### 2.3 Database, Migrations & Indexes
- Foreign keys must always use `cascadeOnDelete()` or `restrictOnDelete()` explicitly.
- Add composite indexes for frequently combined queries (e.g., `['tenant_id', 'status', 'created_at']`).
- Use monetary values as 64-bit integers (cents) or strict `decimal(12, 4)`.

### 2.4 High-Performance Caching & Queues
- Use Redis via `phpredis` for all transient, high-read endpoints.
- High-concurrency read queries must use atomic locks (`Cache::lock(...)`) to prevent cache stampedes.
- Asynchronous queued jobs must implement `ShouldQueue`, explicit retry count (`$tries`), and backoff strategies (`$backoff`).

---

## 3. Frontend (Next.js 15 App Router & RTK Query) Architecture

### 3.1 Directory Structure & Component Layers
```
frontend/src/
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

### 3.2 State Management & Data Fetching
- Server data MUST be managed exclusively via RTK Query (`apiSlice.ts` and extended feature slices).
- RTK Query tag invalidation MUST be defined declaratively for write mutations (`providesTags`, `invalidatesTags`).
- Client UI state (e.g., drawer toggles, active filters) lives in RTK slices or local React state, never mixed with server response state.

### 3.3 Atomic Component Guidelines
- **UI Primitives (`components/ui`)**: Zero business logic, purely presentational, accepts polymorphic styling via `clsx`/`tailwind-merge`.
- **Shared Components (`components/shared`)**: Structural patterns reusable across >1 feature.
- **Section Components (`features/{domain}/components`)**: Encapsulates data fetching or state orchestration for a distinct section.
- **Page (`app/**/page.tsx`)**: Responsible ONLY for assembling section components and injecting page metadata.

---

## 4. DRY Enforcement Matrix: When to Extract?

| Scenario | Clean Code Rule | Extraction Destination |
| :--- | :--- | :--- |
| Database query repeated in 2+ places | Never duplicate SQL/query logic | Custom Model Scope or Query Class |
| Multi-step mutation / side effect | Single Responsibility | `app/Actions/{Domain}/{ActionName}.php` |
| Request validation logic | Never validate in Controller | `app/Http/Requests/{Domain}/{RequestName}.php` |
| UI element used in 2+ domains | Component duplication | `components/shared/{ComponentName}.tsx` |
| UI style variant repeated 3+ times | No repeated raw Tailwind strings | `components/ui/{primitive}.tsx` |
| API Query / Mutation | Never use manual `fetch` / `axios` | RTK Query slice (`features/{domain}/api/`) |

---

## 5. Clean Code Audit Checklist

Before declaring any task or PR complete:
1. **Zero Unused Code**: Are there any unused imports, variables, dead functions, or obsolete files? Delete them.
2. **Strict Types Checked**: Does PHP have `declare(strict_types=1);` and full type annotations? Does TypeScript pass `tsc --noEmit` without `any`?
3. **SRP Maintained**: Are controllers thin? Are business operations isolated in single Actions?
4. **Atomic UI Segregated**: Are sections isolated into feature components instead of dumped inline into `page.tsx`?
