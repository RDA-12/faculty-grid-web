# AGENTS.md

Guidelines and architecture reference for AI agents working in **faculty-grid-web** (a Next.js university administration platform with Indonesian UI copy, `<html lang="id">`).

---

## 1. Core Guardrails & Working Principles

- **Never assume anything outside this repository**: Do not guess backend endpoints, request/response shapes, types, schemas, environment variables, or helpers. Always inspect existing files in this repository first.
- **Ask clarifying questions**: If requirements, scope, edge cases, or target behavior are unclear, ask the user before proceeding.
- **Always choose the simplest solution**: Prefer straightforward implementations that match existing patterns in the codebase over abstractions, extra layers, or unnecessary complexity.
- **Never implement before plan approval**: Always present a plan and wait for explicit user approval before creating or editing implementation files.
- **Always ask before creating a new module**: Before creating a new feature module under `src/lib/<module>/` or `src/components/<module>/`, explicitly ask the user and explain:
  1. Why a new module is needed (instead of adding to an existing module).
  2. What domain entities the new module will manage.
- **Never commit changes automatically**: Never run `git commit` (or push) unless the user explicitly instructs you to commit.

---

## 2. Mandatory Agent Workflow

Follow this exact sequence for every task:

1. **Inspect & clarify**:
   - Read the relevant files in the repository.
   - Ask clarifying questions if any requirement is ambiguous. Do not assume anything not present in the repository.
2. **Run preflight tests**:
   - Run the existing test suite for the related modules/components before planning changes:
     ```bash
     npx vitest run <related-files-or-directories>
     ```
   - **Early exit**: If any preflight test fails, **stop immediately** and report the failure to the user. Do not proceed.
3. **Create a plan**:
   - Design the simplest solution following existing repository patterns.
   - Explicitly list the tests to add or update to verify the implementation.
   - If a new module is required, ask the user first with the justification and the entities it will manage.
4. **Revise plan when needed**:
   - Refine the plan based on user feedback until the user explicitly approves it. **Do not implement before approval.**
5. **Implement the approved plan**:
   - Write the implementation and tests strictly according to the approved plan.
6. **Run related tests**:
   - Run `npx vitest run <related-files-or-directories>` (and `npm test` if broad verification is needed).
   - **Early exit after 3 attempts**: If tests still fail after trying up to **3 distinct solutions**, stop immediately and report the errors and attempted solutions to the user.
7. **Run lint**:
   - Run `npm run lint` (`oxlint --type-aware src/ test/`) and ensure **0 warnings and 0 errors**.
8. **Run formatter**:
   - Run `npm run format` (`prettier --write */**/*{.ts,.tsx}`) to format TypeScript/TSX files (optionally confirm with `npm run format:check`).
9. **Report without committing**:
   - Summarize changes and verification results. Leave git commits to the user unless explicitly instructed otherwise.

---

## 3. Project Overview & Directory Structure

- **Routing**: Next.js App Router (`src/app/`) using file-based routing, React Compiler (`reactCompiler: true`), `cacheComponents: true`, `partialPrefetching: true`, and `typedRoutes: true` in `next.config.ts`.
- **Path alias**: `@/*` maps to `./src/*` (`tsconfig.json`).
- **Module separation**:
  - `src/app/` — Pages, layouts, loading UI, and API route handlers only.
  - `src/lib/` — Feature-based non-page logic (`auth/`, `faculties/`, `programs/`) and shared infrastructure (`common/`, `utils.ts`).
  - `src/components/ui/` — Exclusively shadcn/ui primitives.
  - `src/components/<feature>/` — Feature-scoped custom components (`auth/`, `faculties/`, `programs/`) and shared UI (`common/`, `nav/`, `root/`).
  - `test/` — Shared Vitest/React Testing Library helpers and HTTP mock fixtures.

```text
src/
├── proxy.ts                              # Route auth guard (/dashboard* protected; /login & / public)
├── app/
│   ├── globals.css                       # Tailwind v4 + shadcn theme CSS variables
│   ├── layout.tsx                        # RootLayout (Inter font, AppQueryClientProvider, ThemeProvider, Toaster)
│   ├── loading.tsx                       # Global loading spinner
│   ├── page.tsx                          # Root route (redirected by proxy.ts)
│   ├── login/page.tsx                    # Login page
│   ├── dashboard/
│   │   ├── layout.tsx                    # Dashboard shell with DashboardSidebar
│   │   ├── page.tsx                      # Dashboard home
│   │   ├── faculties/
│   │   │   ├── page.tsx                  # Faculties list page (SSR initial fetch + searchParams)
│   │   │   └── [id]/page.tsx             # Faculty detail page
│   │   └── programs/
│   │       └── page.tsx                  # Programs page
│   └── api/
│       ├── auth/
│       │   ├── logout/route.ts           # GET: clears iron-session and redirects to /login
│       │   └── refresh/route.ts          # POST: refreshes accessToken via BACKEND_API_URL/auth/refresh
│       └── proxy/[...path]/route.ts      # GET/POST/PUT/DELETE proxy attaching Bearer token from session
├── components/
│   ├── ui/                               # shadcn/ui components ONLY (radix-maia style)
│   ├── common/                           # Shared app UI (e.g., page-scaffold.tsx)
│   ├── nav/                              # Navigation UI (e.g., dashboard-sidebar.tsx)
│   ├── root/                             # Root providers (query-client-provider.tsx)
│   ├── auth/                             # Auth UI + *.spec.tsx
│   ├── faculties/                        # Faculties UI + *.spec.tsx
│   └── programs/                         # Programs UI + *.spec.tsx
└── lib/
    ├── utils.ts                          # createQueryString, re-exports cn from 'cn'
    ├── common/                           # Shared non-UI infrastructure
    │   ├── config.ts                     # DEFAULT_STALE_TIME (20m), DEFAULT_TOAST_DURATION (4s)
    │   ├── logger.ts                     # tslog sublogger factory with sensitive key/path masking
    │   ├── pagination.ts                 # Pagination, PaginationResult, PaginatedData<T>, PaginationQuerySchema
    │   ├── query-client.ts               # Shared TanStack QueryClient instance
    │   ├── types.ts                      # ActionState, ValidationError, ResponseError, parseZodError
    │   ├── user-session.ts               # iron-session helpers (setSession, getSessionData, clearSessionData)
    │   └── http-client/
    │       ├── common.http-client.ts     # createHttpClient(axios) + HTTPResponse / PaginatedHTTPResponse
    │       ├── common.http-client.spec.ts
    │       ├── http-client.browser.ts    # Browser client -> /api/proxy with 401 refresh & single retry
    │       └── http-client.server.ts     # Server-only client -> BACKEND_API_URL (no 401 refresh)
    ├── auth/                             # auth.schema.ts, auth.action.ts, auth.action.spec.ts
    ├── faculties/                        # faculty.types.ts, faculties.schema.ts, faculties.query.ts,
    │                                     # faculties.action.ts, faculties.hook.tsx + *.spec.ts(x)
    └── programs/                         # program.types.ts, programs.schema.ts, programs.query.ts,
                                          # programs.action.ts, programs.hook.tsx + *.spec.ts(x)
test/
├── rtl-helper.tsx                        # Custom render & renderHook wrapped in QueryClientProvider + Toaster
└── mock/
    ├── http-client.ts                    # Mock HTTPClient (get, post, delete vi.fn())
    └── http-response/                    # Typed per-endpoint mock fixtures (common, auth, user, faculty, program)
```

---

## 4. Packages & Tech Stack

Based on `package.json`:

- **Core Framework**: `next` (`16.4.6`), `react` (`19.3.1`), `react-dom` (`19.3.1`), `typescript`, `babel-plugin-react-compiler`, `server-only`
- **UI & Styling**: `shadcn`, `radix-ui`, `@base-ui/react` (used by `src/components/ui/combobox.tsx`), `tailwindcss` v4 (`@tailwindcss/postcss`), `tw-animate-css`, `lucide-react`, `class-variance-authority`, `cn`, `next-themes`, `sonner`
- **Data Fetching & Tables**: `@tanstack/react-query` v5, `@tanstack/react-table` v9, `axios` (configured with `adapter: 'fetch'`), `use-debounce`
- **Forms & Validation**: `react-hook-form`, `@hookform/resolvers`, `zod` v4
- **Auth Session & Logging**: `iron-session`, `tslog`
- **Testing**: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@vitest/coverage-v8`
- **Linting, Formatting & Git Hooks**: `oxlint`, `oxlint-tsgolint`, `prettier`, `husky`

---

## 5. Layer Implementation & Testing Patterns

### 5.1 Common Infrastructure (`src/lib/common/`)

- **HTTP Client (`http-client/`)**:
  - `createHttpClient(axios)` in `common.http-client.ts` wraps an `Axios` instance with `validateStatus: () => true` and returns `{ post, get, delete }` normalizing responses into `HTTPResponse<T>` or `PaginatedHTTPResponse<T>`.
  - `http-client.server.ts` imports `'server-only'`, targets `process.env.BACKEND_API_URL ?? 'http://localhost:8000'`, and intentionally **does not** refresh 401 tokens (the client owns data and handles refresh).
  - `http-client.browser.ts` targets `${process.env.NEXT_PUBLIC_SITE_URL}/api/proxy` and installs a response interceptor that on `401` (unless `originalConfig._retry` is already set) calls `POST /api/auth/refresh` and retries the request once.
  - **Testing (`common.http-client.spec.ts`)**: Pass a mock Axios object (`{ get, post, delete }`) into `createHttpClient` and verify endpoint URLs, query param serialization, headers/payloads, and normalized success/error return objects.
- **Types & Validation (`types.ts`, `pagination.ts`)**:
  - `ActionState<TRequest, TData>` is the standard return contract across queries and actions: `{ errors?: ValidationError<TRequest>, data?: TData, error?: ResponseError }`.
  - `parseZodError(error)` flattens Zod field errors into the first message string per field (`{ errors }`).
  - `PaginationQuerySchema` defines `page` (default `1`) and `pageSize` (default `10`); `PaginatedData<T>` holds `{ data: T[], pagination: PaginationResult }`.
- **Session & Logging (`user-session.ts`, `logger.ts`)**:
  - `user-session.ts` reads/writes `accessToken` and `refreshToken` in an encrypted `iron-session` cookie (`cookieName: 'session'`, `process.env.SESSION_PASSWORD`).
  - `getLogger(name)` creates a `tslog` sublogger (hidden when `NODE_ENV === 'test'`, masking `password`, `authorization`, `*.accessToken`, `*.refreshToken`).

### 5.2 Domain Types (`src/lib/<feature>/<entity>.types.ts`)

- Singular entity filename (e.g., `faculty.types.ts`, `program.types.ts`).
- Defines plain TypeScript `type` definitions and `enum`s for the domain entity (e.g., `Faculty`, `Program`, `ProgramDegreeLevel`).

### 5.3 Schemas (`src/lib/<feature>/<feature>.schema.ts`)

- Uses Zod v4 (`import z from 'zod'`) for request validation (`Create<Entity>Schema`) and query parameters (`<Feature>QueryScheme` combined via `.and(PaginationQuerySchema)`).
- Exports inferred types (`z.infer<typeof Create...Schema>` for mutations; `z.input<typeof ...QueryScheme>` for query params).
- User-facing validation error messages are written in Indonesian (e.g., `'Wajib diisi'`, `'Form tidak valid'`).

### 5.4 Queries (`src/lib/<feature>/<feature>.query.ts` & `.spec.ts`)

- **Implementation**:
  - Export `Get<Feature>QueryResult = ActionState<null, PaginatedData<Entity>>`.
  - Accept `httpClient: HTTPClient` as the first parameter (dependency injection so both Server Components and Client Hooks can call the same query) plus optional `<Feature>QueryParams`.
  - Log via `getLogger`, call `httpClient.get<Entity>(endpoint, {}, params ?? {})`, map `response.error` to `{ error: { status: response.status, ...response.error } }`, or return `{ data: { data: response.data ?? [], pagination: response.pagination! } }`.
- **Testing**:
  - Pass `test/mock/http-client.ts` into the query function.
  - Mock `httpClient.get` using fixtures from `test/mock/http-response/<entity>.response.ts`.
  - Verify error propagation, paginated success mapping, endpoint path, and query params forwarding.

### 5.5 Actions (`src/lib/<feature>/<feature>.action.ts` & `.spec.ts`)

- **Implementation**:
  - **Client-side CRUD actions** (`faculties.action.ts`, `programs.action.ts`): Include `import 'client-only'` and use `http-client.browser`. Validate inputs with `<Schema>.safeParse(...)`, return `parseZodError(parsedResult.error)` on failure, call `httpClient.post` / `httpClient.delete`, and return `ActionState<TRequest, TData>`.
  - **Server Actions** (`auth.action.ts`): Include `'use server'`, use `(state, formData)` signature for `useActionState`, validate via `LoginSchema.safeParse`, call `http-client.server`, save session via `setSession`, and call `redirect('/')`.
- **Testing**:
  - Mock the corresponding `http-client` module with `vi.mock(...)` (plus `user-session` and `next/navigation` for server actions).
  - Return fixtures from `test/mock/http-response/*.response.ts`.
  - Verify Zod validation errors, backend error mapping, success return values/side effects, and exact `httpClient` method arguments.

### 5.6 React Query Hooks (`src/lib/<feature>/<feature>.hook.tsx` & `.spec.tsx`)

- **Implementation**:
  - Mark `'use client'`. Define a module query key constant (e.g., `const FACULTIES_KEY = ['faculties'] as const`).
  - **Read hook** (`use<Feature>(initialState?, params?)`): Calls `useQuery` with `queryKey: params ? [...KEY, params] : KEY`, `queryFn: () => get<Feature>Query(httpClient, params)`, and `initialData: initialState`. Returns `{ <items>: data?.data ?? null, error: isFetching ? null : (data?.error ?? null), isLoading: isFetching, refresh: () => { void refetch() } }`.
  - **Mutation hooks** (`useCreate<Entity>`, `useDelete<Entity>`): Accept an optional `onSettled(vars, res)` callback. Configure `useMutation` with a `mutationKey`; in `onSettled`, invalidate the feature query key (`queryClient.invalidateQueries({ queryKey: KEY })`) when `data && !data.error`, then invoke `onSettled`. Track pending mutations via `useMutationState({ filters: { mutationKey, status: 'pending' }, select })` and return `{ <action>, pendingCreation / pendingDeletion }`.
- **Testing**:
  - Import `renderHook`, `act`, `waitFor` from `test/rtl-helper.tsx` (wraps hooks in `TestQueryClientProvider`, which clears the shared `queryClient` on render).
  - Mock `./<feature>.query` and `./<feature>.action`.
  - Verify: `initialState` hydration does not trigger fetch, empty `initialState` fetches with/without params, `refresh()` sets loading/clears error/handles failures, mutation `onSettled` callbacks on success & failure, `pendingCreation`/`pendingDeletion` transitions using deferred promises + `act`, and query cache invalidation on mutation success.

### 5.7 UI Components (`src/components/<feature>/*.tsx` & `.spec.tsx`)

- **Implementation**:
  - Use `src/components/ui/` exclusively for shadcn/ui primitives (do not mix feature business logic into `ui/`). Note: `combobox.tsx` uses `@base-ui/react` and integrates `useDialogContentContainer` from `dialog.tsx`; `pagination.tsx` disables the button when `href` is `null`/`undefined`.
  - Mark interactive components with `'use client'`; keep layout/presentation wrappers (`PageScaffold`, `DashboardSidebar`) as Server Components.
  - **Forms**:
    - Feature forms (`FacultyForm`, `ProgramForm`) use `react-hook-form` + `zodResolver`, shadcn `FieldSet`/`FieldGroup`/`Field`/`FieldLabel`/`FieldError`, `Controller` for custom controls (`FacultiesCombobox`, `ProgramDegreeSelector`), mutation hooks for submit, disabled submit button + `<Spinner />` while pending, and `sonner` `toast` feedback in the hook `onSettled` callback.
    - Server-action form (`LoginForm`) uses React 19 `useActionState` with `<form action={action}>`.
  - **Tables & Dialogs**:
    - Tables (`FacultiesTable`) use `@tanstack/react-table` v9 (`tableFeatures({})`, `createColumnHelper`, `useTable`, `<table.FlexRender />`), shadcn `Table*`, row `DropdownMenu` actions (`FacultyActions`), a controller hook + `AlertDialog` (`useFacultyDeleteDialog` + `FacultyActionDeleteDialog`), and a `useRef` map to dismiss per-item loading toasts.
    - Add-button dialogs (`AddFacultyButton`, `AddProgramButton`) wrap forms in shadcn `Dialog` and call `toast.dismiss()` on `onOpenChange`.
  - **Lists & Search**:
    - `FacultiesList` handles `401` by calling `router.replace('/api/auth/logout')`, renders `Empty` with a retry button on errors, renders `<Spinner />` while loading, and syncs `page` / `pageSize` via `useSearchParams` + `createQueryString`.
    - `FacultiesSearchBar` uses `react-hook-form` + `zodResolver` and updates URL search params (`page=1`, `search`) via `router.push`.
    - `FacultiesCombobox` debounces search input (`useDebounce`, 500ms) before passing `{ search }` to `useFaculties`.
- **Testing**:
  - Always import `{ render, screen, act, waitFor, within, type UserEvent }` from `test/rtl-helper.tsx` (automatically wraps in `QueryClientProvider` + `Toaster` and provides `user: userEvent.setup()`).
  - `rtl.vitest.setup.ts` runs globally before tests: loads `@testing-library/jest-dom/vitest`, runs `toast.dismiss()`, `vi.clearAllMocks()`, and `cleanup()` in `afterEach`, and stubs `window.matchMedia`, `scrollIntoView`, `hasPointerCapture`, and `releasePointerCapture`.
  - Structure specs into `describe('Render', ...)`, `describe('Interactions', ...)`, and (when applicable) `describe('Side Effects', ...)`.
  - Mock feature actions/queries/hooks and `next/navigation` (`useRouter`, `useSearchParams`), query elements semantically (`getByRole`, `getByLabelText`, `within`), and assert Sonner toasts inside `screen.getByRole('region', { name: /notifications/i })`.

### 5.8 App Router Pages, Proxy & Route Handlers (`src/app/` & `src/proxy.ts`)

- Type pages, layouts, and route handlers with Next.js global helpers (`PageProps<'/...'>`, `LayoutProps<'/...'>`, `RouteContext<'/...'>`, and `Route` from `'next'`).
- Dynamic authenticated pages (e.g., `dashboard/faculties/page.tsx`) export `export const instant = false`, call `await connection()` (`next/server`), parse `searchParams`/`params`, fetch initial data with `http-client.server`, wrap content in `<PageScaffold>`, and pass `initial={result.error?.status === 401 ? undefined : result}` so the client refetches and refreshes expired tokens on 401.
- `src/proxy.ts` checks `getSessionData().accessToken` and redirects unauthenticated users away from `/dashboard*` to `/login`, and authenticated users away from `/` or `/login` to `/dashboard`.
- Route handlers:
  - `/api/proxy/[...path]` forwards `GET`, `POST`, `PUT`, `DELETE` to `BACKEND_API_URL` with `Authorization: Bearer <accessToken>` and handles `204` responses cleanly.
  - `/api/auth/refresh` exchanges `session.refreshToken` at `BACKEND_API_URL/auth/refresh`, updates session on `200`, or clears session and returns `401`.
  - `/api/auth/logout` clears session and redirects to `/login`.

---

## 6. Commands, Linting & Code Style

- **Test commands**:
  - Run targeted tests: `npx vitest run <path-or-pattern>`
  - Run all unit/component tests: `npm test` (`vitest run`)
  - Watch mode: `npm run test:watch`
  - Coverage: `npm run test:cov`
- **Lint & type-aware checks**:
  - `npm run lint` (`oxlint --type-aware src/ test/`)
  - `.oxlintrc.json` enforces `typescript/no-floating-promises: "error"` (mark intentionally unawaited promises with `void`, e.g., `void refetch()`). `typescript/no-explicit-any` is `"off"`.
- **Formatting**:
  - `npm run format` (`prettier --write */**/*{.ts,.tsx}`)
  - `npm run format:check` (`prettier --check */**/*{.ts,.tsx}`)
  - `.prettierrc`: `singleQuote: true`, `trailingComma: "all"`, `semi: false`.
- **Next.js helpers**:
  - `npm run type-gen` (`next typegen`)
  - `npm run build` (`next build`)
- **Mock fixtures**:
  - Place new endpoint mock data in `test/mock/http-response/<entity>.response.ts` using `HTTPEndpointResponseMock` and `safeGetResponse` from `test/mock/http-response/common.response.ts`.
