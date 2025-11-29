# Pull Request: Fix Web Auth Flow

## Summary
This PR updates the web authentication client to align with the new `/auth/me` endpoint and implements HTTP-only refresh cookie-based token management. The changes ensure secure token handling and graceful session recovery.

## Related Issue
- Fixes the auth flow to use new backend `/auth/me` endpoint
- Implements HTTP-only cookie-based refresh tokens
- Improves security by removing refresh tokens from localStorage

## Changes Made

### Core Auth Implementation (commit: 64d0239)

#### 1. API Client (`apps/web/src/lib/api/client.ts`)
- **Changed:** 401 interceptor now calls `apiClient.post('/auth/refresh')` without token body
- **Why:** Refresh token is sent via HTTP-only cookie (automatic browser inclusion)
- **Behavior:** 
  - On 401: attempts token refresh via cookie-based auth
  - On success: updates accessToken in localStorage
  - On failure: clears accessToken and redirects to login

#### 2. AuthProvider (`apps/web/src/lib/context/auth-context.tsx`)
- **Changed:** No longer clears tokens on `getCurrentUser()` failure
- **Why:** Allows 401 interceptor to handle token refresh gracefully
- **Behavior:**
  - Logs warning on getCurrentUser failure instead of clearing tokens
  - Logout only removes accessToken (not refreshToken - it's HTTP-only)
  - Session can recover via automatic token refresh

#### 3. Auth API (`apps/web/src/lib/api/auth.ts`)
- **Removed:** Unused `refreshToken(refreshToken: string)` method
- **Kept:** `getCurrentUser()` calls `/auth/me` endpoint

#### 4. Middleware (`apps/web/middleware.ts`)
- **Changed:** Now checks for `refreshToken` cookie instead of `accessToken`
- **Why:** Better alignment with HTTP-only cookie security model
- **Dev Mode:** Permissive for local testing (no cookie headers in dev)

#### 5. Routes
- **Removed:** `/apps/web/src/app/api/auth/refresh/route.ts`
- **Why:** No longer needed - refresh happens directly via apiClient

### Bug Fixes (commit: 6582a9b)

#### 1. SharedWatchlist Component
- **Fixed:** Removed duplicate filter options in member and status filters
- **Impact:** UI now shows single list of options instead of duplicates

#### 2. Build & Type Issues
- **Fixed:** Removed duplicate `StatusFilter` type definition
- **Fixed:** Updated `FilterControls` to properly use typed props
- **Fixed:** Resolved unused import warnings
- **Fixed:** Added type assertions for callback handlers

### Test Updates

#### New Test Coverage (`updated-auth-flow.test.tsx`)
- ✅ Verifies tokens aren't cleared on getCurrentUser failure
- ✅ Verifies only accessToken is removed on logout
- ✅ Confirms refreshToken stays in HTTP-only cookie

#### Updated Existing Tests
- Removed `refreshToken` from auth API mocks
- Updated to reflect new token handling behavior

#### Jest Configuration Updates
- Fixed Jest setup with proper Babel configuration
- Fixed Next.js compatibility with proper Jest config

## Token Flow Comparison

### Before
```
localStorage: accessToken, refreshToken
POST /auth/refresh with refreshToken in body
Clear both tokens on any error
```

### After
```
localStorage: accessToken (only)
HTTP-only cookie: refreshToken (automatic)
POST /auth/refresh with cookie auto-included
Clear only accessToken on refresh failure
```

## Security Improvements

1. **Refresh Token Protection**
   - Now stored in HTTP-only cookie (not accessible to JavaScript)
   - Cannot be stolen via XSS attacks
   - Automatically included in browser requests

2. **Session Resilience**
   - Graceful token refresh on 401 responses
   - No token clearing on transient errors
   - Session can recover without re-login

3. **Logout Security**
   - Backend clears/revokes refresh token
   - Frontend removes only accessToken
   - HTTP-only cookie automatically cleared by server

## Testing Steps

### Manual Testing
1. **Login Flow**
   ```bash
   - Navigate to /login
   - Enter valid credentials
   - Verify redirects to /watchlist
   - Verify localStorage has accessToken
   - Verify browser has refreshToken cookie
   ```

2. **Protected Routes**
   ```bash
   - Access /watchlist with valid session
   - Verify page loads
   - Verify middleware allows access (has refreshToken cookie)
   ```

3. **Token Refresh**
   ```bash
   - Set accessToken to invalid value in localStorage
   - Make API request
   - Verify 401 interceptor attempts refresh
   - Verify request succeeds with new token
   ```

4. **Logout Flow**
   ```bash
   - Click logout on any page
   - Verify localStorage.accessToken is cleared
   - Verify redirects to /login
   - Verify refreshToken cookie is cleared
   ```

### Automated Tests
```bash
# Run all auth-related tests
npm run test -- auth

# Run integration tests
npm run test -- integration

# Build to verify TypeScript
npm run build
```

## Breaking Changes

❌ None - This is an internal implementation change

## Migration Guide

For users upgrading from previous version:

1. **No action required** for end users
2. **Backend** must have:
   - GET `/auth/me` endpoint (protected, returns user)
   - POST `/auth/refresh` endpoint (accepts HTTP-only cookie)
   - HTTP-only refresh token cookies enabled in responses
3. **Refresh tokens** stored in HTTP-only cookies are automatically managed by the browser

## Checklist

- ✅ Code follows project style and conventions
- ✅ Tests added/updated for new behavior
- ✅ No breaking changes for users
- ✅ Documentation updated
- ✅ Build passes with no errors
- ✅ Auth flow works end-to-end (login → watchlist → logout)
- ✅ Protected routes work correctly
- ✅ Token refresh works on 401 responses
- ✅ Session recovery works via `/auth/me`

## Deployment Notes

1. **No database migrations needed**
2. **Frontend deployment**: Standard Next.js deployment
3. **Backend requirements**: Must support `/auth/me` and HTTP-only cookies
4. **Environment variables**: No changes needed
5. **Cookie settings**: Automatically handled by browser with `withCredentials: true`

## References

- Auth implementation: `apps/api/src/routes/auth.ts`
- Frontend auth flow: `apps/web/src/lib/api/client.ts`
- Auth provider: `apps/web/src/lib/context/auth-context.tsx`
- Middleware: `apps/web/middleware.ts`
- Tests: `apps/web/src/__tests__/updated-auth-flow.test.tsx`

## Questions/Discussion Points

1. Should we add refresh token rotation metrics?
2. Should we log token refresh attempts for audit purposes?
3. Should we implement a grace period for token expiry?
4. Future: CSRF token consideration for additional security?
