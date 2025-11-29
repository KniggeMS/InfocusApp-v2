import { redirect } from 'next/navigation';
import { getLocaleFromHeaders } from '@/lib/i18n/server';

// This page handles the root URL "/" and redirects to the appropriate locale
export default async function RootPage() {
  // Get preferred locale from Accept-Language header
  const preferredLocale = getLocaleFromHeaders();

  // Redirect to the locale-specific home page
  redirect(`/${preferredLocale}`);
}