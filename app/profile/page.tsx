'use client';

import React from 'react';
import { AppProviders } from '@/app/providers';
import { ProfileScreen } from './ProfileScreen';

export default function ProfilePage() {
  return (
    <AppProviders>
      <ProfileScreen />
    </AppProviders>
  );
}
