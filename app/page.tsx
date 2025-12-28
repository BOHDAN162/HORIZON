'use client';

import React, { useState } from 'react';
import { LandingScreen } from '@/components/LandingScreen';
import UniverseScreen from '@/app/(client)/UniverseScreen';
import { AppProviders } from '@/app/providers';

export default function Home() {
  const [view, setView] = useState<'landing' | 'universe'>('landing');

  return (
    <AppProviders>
      <main className="relative min-h-screen">
        {view === 'landing' ? (
          <LandingScreen onEnterUniverse={() => setView('universe')} />
        ) : (
          <UniverseScreen onBack={() => setView('landing')} />
        )}
      </main>
    </AppProviders>
  );
}
