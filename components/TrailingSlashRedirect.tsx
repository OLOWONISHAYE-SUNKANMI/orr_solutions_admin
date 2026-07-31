'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function TrailingSlashRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && pathname) {
      if (pathname !== '/' && pathname.endsWith('/')) {
        const search = window.location.search;
        const hash = window.location.hash;
        const newPath = pathname.slice(0, -1) + search + hash;
        router.replace(newPath);
      }
    }
  }, [pathname, router]);

  return null;
}
