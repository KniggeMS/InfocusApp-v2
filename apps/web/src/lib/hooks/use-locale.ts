'use client';

import { useRouter, usePathname } from 'next/navigation';

/**
 * Gets the current locale from the pathname
 */
export function useLocale() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  
  // Return the first segment if it's a valid locale, otherwise 'en'
  const locale = segments[1];
  return ['en', 'de'].includes(locale) ? locale : 'en';
}

/**
 * Creates a locale-aware navigation helper
 */
export function useLocaleNavigation() {
  const router = useRouter();
  const locale = useLocale();

  return {
    push: (path: string) => {
      // Ensure the path starts with the current locale
      const localePath = path.startsWith('/') ? path : `/${path}`;
      const fullPath = localePath.startsWith(`/${locale}/`) || localePath === `/${locale}`
        ? localePath
        : `/${locale}${localePath}`;
      router.push(fullPath);
    },
    replace: (path: string) => {
      const localePath = path.startsWith('/') ? path : `/${path}`;
      const fullPath = localePath.startsWith(`/${locale}/`) || localePath === `/${locale}`
        ? localePath
        : `/${locale}${localePath}`;
      router.replace(fullPath);
    },
    back: () => router.back(),
    locale,
  };
}