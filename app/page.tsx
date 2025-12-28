'use client';

import React, { useState } from 'react';
import { LandingScreen } from '@/components/LandingScreen';
import UniverseScreen from '@/app/(client)/UniverseScreen';
import { ThemeProvider } from '@/lib/useTheme';

export default function Home() {
  const [view, setView] = useState<'landing' | 'universe'>('landing');

  return (
    <ThemeProvider>
      <main className="relative min-h-screen">
        {view === 'landing' ? (
          <LandingScreen onEnterUniverse={() => setView('universe')} />
        ) : (
          <UniverseScreen onBack={() => setView('landing')} />
        )}
      </main>
    </ThemeProvider>
  );
}
