'use client';

import { ReactNode, useEffect } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
    }
  }, []);

  return <>{children}</>;
}
