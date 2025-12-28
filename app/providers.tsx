'use client';

import React from 'react';
import { ThemeProvider } from '@/lib/useTheme';
import { ProfileProvider } from '@/lib/useProfile';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <ProfileProvider>{children}</ProfileProvider>
  </ThemeProvider>
);
