'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import UniverseScreen from '@/app/(client)/UniverseScreen';
import { AppProviders } from '@/app/providers';

export default function UniversePage() {
  const router = useRouter();

  return (
    <AppProviders>
      <main className="relative min-h-screen">
        <UniverseScreen onBack={() => router.push('/')} />
      </main>
    </AppProviders>
  );
}
