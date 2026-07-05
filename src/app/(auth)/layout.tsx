import React from 'react';

/**
 * Auth group layout.
 * Wraps /login and /signup pages.
 * Intentionally minimal — no sidebar or topnav.
 * Session redirect logic lives in src/middleware.ts via Supabase Auth.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
