# ExpenseGauge App Project Details (Updated)

**Date:** 2025-10-11 (Original) / **Updated:** 2024-XX-XX (Based on current code review)

## 1. Project Overview

ExpenseGauge is a mobile expense management application built with Expo and React Native. It features clean route-grouped navigation, persistent state management using Zustand, and a comprehensive expense tracking flow. A significant enhancement is the implementation of a robust **offline-first strategy** for user expense management, allowing for optimistic updates and automatic syncing of queued requests when connectivity is restored. The application includes both user and administrative functionalities for managing expenses and users.

## 2. Technology Stack

*   **Framework:** Expo + expo-router, React Native 0.79, React 19
*   **Styling:** NativeWind (Tailwind CSS)
*   **State Management:** Zustand (with persistence via AsyncStorage)
*   **Networking:** Axios, `@react-native-community/netinfo`
*   **Machine Learning (for categorization):** `categoryDetector.js`

## 3. Application Structure (frontend/app/)

The application uses file-based routing provided by `expo-router`.

*   **`app/_layout.tsx`**: The root layout that registers main navigation stacks: `(auth)`, `(tabs)`, `admin`, and `expenseModal/[type]`. It applies the theme background and integrates a `ToastManager`. **Crucially, it now includes a `useEffect` hook to initialize the offline queue processing on startup and subscribes to `NetInfo` to automatically trigger queue processing when the device comes online.** The `Appearance.setColorScheme(theme)` call is now handled more appropriately within the component's lifecycle.
*   **`app/(auth)/`**: Handles user authentication.
    *   `_layout.tsx`: Redirects authenticated users to `/(tabs)/home`.
    *   Screens: `index.tsx`, `login.tsx`, `AdminPreview.tsx`.
*   **`app/(tabs)/`**: The main user interface with bottom tabs.
    *   `_layout.tsx`: Renders bottom tabs for `home`, `history`, and `profile`.
    *   **`app/(tabs)/home/`**:
        *   `index.tsx`: Displays a user greeting, total balance, recent transactions, and primary CTAs for adding credit/debit expenses.
        *   `adminView.tsx`: (Potentially for admin home view).
        *   `DeleteModal.tsx`: (For deleting expenses).
        *   `registeruser.tsx`: (For registering new users).
    *   **`app/(tabs)/history/`**:
        *   `index.tsx`: Shows a monthly trend chart, transactions grouped by month, and supports pagination.
        *   `adminAllUsersView.tsx`: Displays paginated admin users (for administrators).
    *   **`app/(tabs)/profile/`**:
        *   `index.tsx`: User profile settings, including theme and password change options.
        *   `changePassword.tsx`, `LogoutModal.tsx`, `theme.tsx`.
*   **`app/admin/`**: Dedicated section for administrative functionalities.
    *   `_layout.tsx`: Admin-specific layout.
    *   `adminUserView.tsx`: For viewing and managing individual user details.
    *   `adminUserHistory.tsx`: For viewing a user's expense history as an admin.
*   **`app/expenseModal/[type.tsx`**: A modal component used for adding new expenses, editing existing expenses, and admin assignments. **This file now integrates the offline queuing mechanism for user expenses and handles optimistic updates with `markAsSynced` calls.**

## 4. Key Features

### 4.1. User Features

*   **Authentication:** User login.
*   **Home Dashboard:** Displays total balance, last synced time, and recent transactions.
*   **Offline Expense Management (Enhanced):**
    *   **Optimistic Updates:** Add new expenses (credit/debit) and edit existing ones immediately update the local UI.
    *   **Offline Queuing:** If the device is offline, expense creation and editing requests are queued locally using `AsyncStorage`.
    *   **Automatic Syncing:** When network connectivity is restored, all queued requests are automatically re-sent to the backend.
    *   **ID Resolution:** Locally generated temporary IDs for new expenses are replaced with backend-assigned IDs upon successful synchronization.
    *   **Sync Status:** Transactions are marked with an `isSynced` flag (`'true'` or `'false'`).
    *   **User Feedback:** Toast messages inform the user when an expense is queued offline.
*   **Transaction History:** View transactions grouped by month with a monthly trend chart. Supports pagination.
*   **Profile Management:** Change password, adjust application theme (light/dark), logout.
*   **Theming:** Supports light and dark modes.

### 4.2. Admin Features

*   **User Management:**
    *   View all users (`adminAllUsersView.tsx`).
    *   View and manage individual user details (`adminUserView.tsx`).
    *   Assign balance to users (`assignBalance` in `adminStore.ts`).
    *   Edit user expenses (`editUserExpenseByAdmin` in `adminStore.ts`).
    *   Remove user expenses (`removeUserExpenseByAdmin` in `adminStore.ts`).
    *   **Improved Sorting:** Admin user lists are now correctly sorted by `createdAt` date.
*   **User History View:** View the expense history of any user (`adminUserHistory.tsx`).

### 4.3. Expense Categorization

*   **`frontend/helper/categoryDetector.js`**: Utilizes a classifier model (`classifier_model.json`) to automatically predict the category of an expense based on its description.

## 5. Data Layer & Caching Strategy

The application uses Zustand for state management, with `AsyncStorage` for persistence.

### 5.1. State Stores (Zustand + persist/AsyncStorage)

*   **`store/expenseStore.ts`**: Persists `cachedExpenses`, `totalBalance`, and `LastSyncedAt`. Provides actions for `addExpense()`, `editExpense()`, `removeExpense()`, `setCachedExpenses()`. **Crucially, it now includes `markAsSynced(id: string, newIdFromBackend: string)` to update temporary IDs and sync status for offline transactions.** The `Transaction` type now includes `isSynced: string | null`.
*   **`store/adminStore.ts`**: Persists `cachedUsers`, `totalUserBalance`, and `LastSyncedAt` for admin-related data. Provides `assignBalance()`, `editUserExpenseByAdmin()`, `removeUserExpenseByAdmin()`, with updated logic for correctly calculating `totalUserBalance`. The `addUser` action now correctly sorts users by `createdAt`.
*   **`store/authStore.ts`**: Persists authentication tokens and user information.
*   **`store/themeStore.ts`**: Persists the user's selected theme.
*   **`store/offlineQueue.ts`**: **A new core component for offline functionality.** It defines `QueuedRequest` with `id`, `method`, `url`, `data`, `timestamp`, and optional `localId`, `type`, `action` metadata. Provides `addToQueue`, `getQueue`, `removeFromQueue`, and `clearQueue` functions to manage offline requests.

### 5.2. Networking (`api/api.ts`)

*   Uses an Axios instance with an authentication interceptor.
*   **Offline Request Queuing:** The interceptor now leverages `@react-native-community/netinfo` to `checkConnection`. If offline, it uses `addToQueue` to persist the original request (including HTTP method, URL, data, and custom metadata from `x-meta` headers) and returns a "fake" `{ data: { offline: true } }` response, allowing the UI to proceed optimistically.
*   **Refresh Token Logic:** Handles 401 Unauthorized errors by attempting to refresh tokens. Resets authentication and expense data, then redirects to the root on refresh token failure.
*   **Hardcoded API URL:** The `API_URL` remains hardcoded.
*   **`x-meta` Header Usage:** The `expenseModal/[type].tsx` file now explicitly adds `x-meta` headers to API calls for adding and editing expenses, providing essential metadata for offline queuing and syncing.

### 5.3. Caching Evaluation Highlights

*   **Strengths:**
    *   **Robust Offline Persistence:** User and theme data are persisted for fast cold starts and offline reads. The new offline queue significantly enhances this for mutations.
    *   **Optimistic Updates with Syncing:** New expense creation and edits are immediately reflected in the UI, with a clear mechanism to resolve temporary IDs and update sync status upon successful backend synchronization.
    *   **Controlled Cache Size:** History view caps its cached list to approximately 21 items.
    *   **Improved Admin State:** Admin user lists are now correctly sorted, and balance calculations are accurate during admin-initiated expense changes.
*   **Gaps/Risks:**
    *   **No Query-Keyed Caching/TTL:** Still lacks a declarative query-keyed caching mechanism with Time-To-Live (TTL) for automatic data invalidation and background revalidation.
    *   **Stale Update Bugs (Partially Addressed):** The `adminAllUsersView.tsx` sorting bug is fixed. The `history/index.tsx` stale cache write would need re-evaluation given the new sync mechanism, but the direct `setCachedExpenses` approach may still be prone to this if not careful.
    *   **`isSynced` Type Inconsistency:** While `isSynced: string | null` is explicitly typed, using a string (`'true'`, `'false'`) instead of a boolean is still a potential source of error and less intuitive for UI rendering.
    *   **No Axios Retry:** `axios-retry` is in dependencies but not yet actively configured for retries on transient network errors.
    *   **Growing State (for admin/all users):** `cachedUsers` can still grow without an explicit eviction policy beyond pagination.
    *   **Admin Offline Queuing:** While admin expense edits call `markAsSynced`, the full `x-meta` based offline queuing and `response.data.offline` feedback loop for admin actions within the `expenseModal` is not as explicitly integrated as for user expenses.

## 6. Offline Strategy Assessment (Updated)

The offline strategy has been significantly improved and is now quite robust for user expense management.

*   **Current State:** Implements an "Optimistic UI + Offline Queue + Automatic Syncing" pattern for user expenses.
    *   Offline mutations (add, edit) are captured and stored in `AsyncStorage` via `offlineQueue.ts` and the `api.ts` interceptor.
    *   `NetInfo` in `_layout.tsx` detects connectivity changes and triggers `processQueue` from `syncQueue.ts`.
    *   `processQueue` re-sends queued requests and uses `markAsSynced` in `expenseStore.ts` to update local state with backend IDs and sync status.
    *   `expenseModal/[type].tsx` provides immediate user feedback (toast) when an operation goes offline.
*   **Verdict:** **Greatly improved.** The building blocks (`offlineQueue.ts`, `isSynced` flag, `NetInfo` integration, `x-meta` headers) are now well-integrated for core user expense functionalities.

## 7. User Experience (UX) Highlights

*   **Navigation:**
    *   Smooth authentication flow with redirection after login.
    *   Clear 3-tab bottom navigation (Home, History, Profile) with custom labels and icons.
*   **Home Screen:** Friendly greeting, clear "Total Balance" with `LastSyncedAt`, and prominent credit/debit buttons.
    *   Recent transaction list with tap-to-expand actions (Edit/Delete).
*   **History Screen:** Monthly trend chart for quick insights and transactions grouped by month for readability.
*   **Profile Screen:** Standard settings for theme and password, with a logout confirmation modal.
*   **Expense Modal:** Thoughtful keyboard handling, dropdown logic, and auto-category detection. Basic validation is present. **Now includes toasts for offline operations, enhancing user feedback.**
*   **Theming:** Supports dark/light mode switching. `Appearance.setColorScheme(theme)` is now correctly managed in `_layout.tsx`.
*   **Toasts:** Global `ToastManager` for feedback, now actively used for offline status.

## 8. Identified Issues & Potential Bugs (Updated)

*   **[stale cache write]** In `app/(tabs)/history/index.tsx`, the use of `expenses.slice(0, 21)` right after `setExpenses(prev => ...)` might still write a stale snapshot if not carefully handled. This should compute from the *new* array.
*   **[isSynced type]** Using strings `'true'/'false'` instead of boolean for `isSynced` still increases risk and UX ambiguity (though now integrated).
*   **[hardcoded API URL]** `api.ts` still uses a hardcoded IP. Should come from env/config.
*   **[nested lists** Nested `FlatList`s in history can still hurt performance on lower-end devices.
*   **[admin offline queuing]** While user expenses leverage the full offline queue, it's not explicitly clear if all admin actions (e.g., assigning balance) use the `x-meta` header for robust offline queuing, or if their offline behavior is more "fire-and-forget" for now with manual `markAsSynced`.
*   **[no axios retry configured]** `axios-retry` is in dependencies but not used for transient network errors.

## 9. Recommendations (Prioritized)

1.  **Refine `isSynced` to Boolean & UI Indicators:**
    *   Change `isSynced` type to `boolean` across all stores and components.
    *   Render a subtle unsynced indicator in lists for items where `isSynced` is `false`.
2.  **Configure `axios-retry`:**
    *   Implement `axios-retry` with appropriate retry policies for idempotent GETs and conditional retries for POST/PATCH/DELETE to handle transient network issues more gracefully.
3.  **Externalize API URL:**
    *   Move `API_URL` to environment variables (`.env` file) to facilitate different environments (development, staging, production).
4.  **Address Stale Cache Write in History:**
    *   In `history/index.tsx`, after computing the new array for `setExpenses`, ensure `setCachedExpenses` uses this *same new array* (e.g., `next.slice(0, 21)`) to avoid writing an outdated snapshot.
5.  **Performance Optimization for History List:**
    *   Avoid nested `FlatList`s; consider using a single-section list with grouped headers or `SectionList` for better performance on large datasets.
6.  **Consider Advanced Caching (e.g., TanStack Query):**
    *   For more declarative caching, invalidation, and background revalidation across the app, explore integrating a library like TanStack Query (React Query). This could further simplify state management and provide more robust data consistency.
7.  **Extend Offline Queuing to All Mutations:**
    *   Ensure all mutation-based API calls (including all admin actions) properly utilize the `x-meta` header and `addToQueue` mechanism for consistent offline handling and feedback.
8.  **Error Handling & UX Polish:**
    *   Normalize API error surfaces to user-friendly messages and toast consistently for all API failures.
    *   Add skeleton/empty states for loading data.
    *   Provide undo for delete (snackbar) and confirm for destructive actions.
    *   Increase touch target sizes and ensure consistent color contrast in light mode.

## 10. Code Quality Notes

*   **Types**: Standardize `Transaction` type across files. Export shared types from a `types.ts` file for better maintainability.
*   **Selectors**: Prefer derived selectors (e.g., `totalBalance`) and memoization to avoid re-sorting or re-calculating on every write.

## 11. File References (Key files for review)

*   Root layout: `app/_layout.tsx` (Updated for offline queue processing)
*   Expense modal: `app/expenseModal/[type].tsx` (Updated for offline queuing and `markAsSynced`)
*   API client: `api/api.ts` (Updated for offline request interception)
*   Network utilities: `api/network.ts`
*   Offline queue processing: `api/syncQueue.ts` (New file)
*   Offline queue store: `store/offlineQueue.ts` (New file)
*   Expense store: `store/expenseStore.ts` (Updated for `isSynced` and `markAsSynced`)
*   Admin store: `store/adminStore.ts` (Updated for sorting and balance calculations)

---