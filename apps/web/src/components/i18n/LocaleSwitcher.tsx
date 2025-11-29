'use client';

import { useRouter, usePathname } from 'next/navigation';
import { SUPPORTED_LOCALES, setLocaleCookie, type Locale } from '@/lib/i18n/locale';
import { Button } from '@/components/ui/Button';

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    // Extract the current path without locale
    const segments = pathname.split('/');
    const currentLocale = segments[1];
    
    let newPath = pathname;
    if (SUPPORTED_LOCALES.includes(currentLocale as Locale)) {
      // Replace current locale
      segments[1] = newLocale;
      newPath = segments.join('/');
    } else {
      // Add locale prefix
      newPath = `/${newLocale}${pathname}`;
    }

    // Set cookie and navigate
    setLocaleCookie(newLocale);
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="flex items-center space-x-2">
      {SUPPORTED_LOCALES.map((locale) => (
        <Button
          key={locale}
          variant={pathname.includes(`/${locale}`) ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => handleLocaleChange(locale)}
          className="min-w-[3rem]"
        >
          {locale.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}