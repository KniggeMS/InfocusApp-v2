# InFocus Web App

The InFocus web application built with Next.js 13+ (App Router), TypeScript, Tailwind CSS, React Query, and next-intl for internationalization.

## Features

- **Next.js 13+ App Router** - Modern React framework with file-based routing
- **Internationalization (i18n)** - Multi-language support with next-intl (English, German)
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React Query (TanStack Query)** - Powerful data fetching and state management
- **Axios** - HTTP client with interceptors for authentication and locale headers
- **React Hot Toast** - Beautiful notifications
- **Responsive Design** - Mobile-first responsive layouts
- **Centralized Auth** - Token-based authentication with automatic refresh

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install dependencies (from project root)
pnpm install
```

### Environment Variables

Create a `.env.local` file in the `apps/web` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Override default locale (defaults to 'en')
NEXT_PUBLIC_DEFAULT_LOCALE=en

# Optional: Override supported locales (defaults to 'en,de')
NEXT_PUBLIC_SUPPORTED_LOCALES=en,de
```

For production deployment, see [Deploying to Vercel](#deploying-to-vercel) for required environment variables.

### Development

```bash
# Start development server
pnpm dev

# The app will be available at http://localhost:3000
```

### Building

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Testing

```bash
# Run tests
pnpm test

# Run linting
pnpm lint

# Run type checking
pnpm typecheck
```

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/          # Locale-based routing
│   │   │   ├── layout.tsx     # Locale-specific layout with i18n provider
│   │   │   ├── page.tsx       # Localized home page
│   │   │   ├── (auth)/        # Auth routes group
│   │   │   │   ├── login/     # Login page
│   │   │   │   └── register/  # Registration page
│   │   │   ├── watchlist/     # Watchlist page
│   │   │   ├── search/        # Search page
│   │   │   ├── family/        # Family groups page
│   │   │   └── settings/      # Settings page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Root redirect page
│   ├── components/
│   │   ├── layout/            # Layout components (Navigation, PageShell)
│   │   ├── i18n/              # Internationalization components (LocaleSwitcher)
│   │   └── ui/                # Reusable UI components (Button, Input, Card)
│   ├── lib/
│   │   ├── api/               # API client with locale headers
│   │   ├── context/           # React contexts (auth with locale-aware navigation)
│   │   ├── hooks/             # Custom React hooks (including locale utilities)
│   │   ├── i18n/             # Internationalization configuration
│   │   ├── providers/         # Provider components (QueryProvider)
│   │   └── utils/             # Utility functions
│   ├── messages/              # Translation files
│   │   ├── en.json           # English translations
│   │   └── de.json           # German translations
│   ├── messages.d.ts          # TypeScript definitions for messages
│   └── app/globals.css        # Global styles
├── public/                     # Static assets
├── middleware.ts              # Next.js middleware with locale detection
├── next.config.js             # Next.js configuration with next-intl
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

## Routes

- `/` - Root redirect to preferred locale (en/de based on Accept-Language header or cookie)
- `/[locale]` - Localized home page
- `/[locale]/login` - User login
- `/[locale]/register` - User registration  
- `/[locale]/watchlist` - User's watchlist (protected)
- `/[locale]/search` - Search for movies/TV shows (protected)
- `/[locale]/family` - Family groups management (protected)
- `/[locale]/settings` - User settings (protected)

## Internationalization (i18n)

The app uses [next-intl](https://next-intl-docs.vercel.app/) for internationalization:

### Supported Locales
- **English (en)** - Default locale
- **German (de)**

### Locale Detection
1. **URL Path** - `/en/...` or `/de/...` takes precedence
2. **Cookie** - `locale` cookie for user preference persistence
3. **Accept-Language Header** - Browser language detection for first-time visitors
4. **Fallback** - English (en) as default

### Translation Structure
Translations are organized by namespace in `src/messages/[locale].json`:

```json
{
  "common": { "loading": "Loading...", "save": "Save" },
  "navigation": { "home": "Home", "watchlist": "Watchlist" },
  "auth": { "login": "Login", "email": "Email" },
  "watchlist": { "title": "My Watchlist" },
  "search": { "title": "Search" },
  "family": { "title": "Family" },
  "settings": { "title": "Settings" },
  "media": { "movie": "Movie", "tvShow": "TV Show" }
}
```

### Using Translations
```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');
  return <button>{t('save')}</button>; // "Save" or "Speichern"
}
```

### Locale Switching
The `LocaleSwitcher` component provides language switching with:
- Cookie persistence
- URL path updates
- Automatic page refresh with new locale

### API Integration
All API requests include the `Accept-Language` header based on current locale:

```typescript
// Automatic in apiClient
headers: {
  'Accept-Language': getCurrentLocale() // 'en' or 'de'
}
```

## API Integration

The app uses Axios with interceptors for API communication:

- **Base URL**: Configured via `NEXT_PUBLIC_API_URL`
- **Authentication**: Automatic token injection in request headers
- **Token Refresh**: Automatic token refresh on 401 responses
- **Error Handling**: Centralized error handling with toast notifications

## Authentication Flow

1. User logs in or registers
2. Access and refresh tokens are stored in localStorage
3. Access token is automatically added to API requests
4. On token expiration (401), the refresh token is used to get a new access token
5. If refresh fails, user is redirected to login

## State Management

React Query is used for server state management:

- **Caching**: Automatic caching of API responses
- **Refetching**: Smart refetching on window focus and reconnect
- **Optimistic Updates**: Immediate UI updates with background sync
- **Loading States**: Built-in loading and error states

## UI Components

Reusable components built with Tailwind CSS:

- **Button** - Multiple variants (primary, secondary, outline, ghost, danger)
- **Input** - Form input with label and error states
- **Card** - Container component for content sections
- **Navigation** - Top navigation bar with authentication state
- **PageShell** - Page wrapper with title and description

## Deploying to Vercel

The InFocus web app is designed for seamless deployment to Vercel. For complete deployment instructions, including environment setup, CORS configuration, and validation steps, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Start

1. **Prerequisites**: Ensure backend API is deployed and accessible
2. **Environment Variables**: Configure `NEXT_PUBLIC_API_URL` in Vercel dashboard
3. **Deploy**: Import GitHub repository to Vercel with root directory `apps/web`
4. **Validate**: Run smoke tests to verify authentication and API connectivity

### Required Environment Variables

```env
# Production
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# Optional: For preview deployments
NEXT_PUBLIC_API_URL_PREVIEW=https://your-staging-api.com
```

### Key Configuration Points

- **Root Directory**: Set to `apps/web` when importing to Vercel
- **CORS**: Ensure backend `CORS_ORIGIN` includes your Vercel domain
- **API URL**: Do NOT include `/api` prefix in `NEXT_PUBLIC_API_URL`

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Ensure all tests pass: `pnpm test`
4. Ensure linting passes: `pnpm lint`
5. Ensure type checking passes: `pnpm typecheck`

## License

MIT
