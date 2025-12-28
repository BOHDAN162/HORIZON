import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ProfileData = {
  displayName: string;
  handle: string;
  avatarUrl?: string;
  bio: string;
  allowContact: boolean;
};

type ProfileContextValue = {
  profile: ProfileData;
  updateProfile: (patch: Partial<ProfileData>) => void;
  updateBio: (bio: string) => void;
  setAllowContact: (value: boolean) => void;
};

const DEFAULT_PROFILE: ProfileData = {
  displayName: 'Bohdan',
  handle: 'bohdan162',
  avatarUrl: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=240&q=80',
  bio: 'Ты — человек, который соединяет креативность с научным подходом. Твои интересы в искусстве, технологиях и исследованиях говорят о том, что ты любишь генерировать новые идеи и воплощать их через практику.',
  allowContact: true,
};

const STORAGE_KEY = 'horizon:profile';

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ProfileData>;
        setProfile({ ...DEFAULT_PROFILE, ...parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  const updateProfile = useMemo(
    () => (patch: Partial<ProfileData>) => setProfile((prev) => ({ ...prev, ...patch })),
    []
  );

  const updateBio = useMemo(() => (bio: string) => setProfile((prev) => ({ ...prev, bio })), []);

  const setAllowContact = useMemo(
    () => (value: boolean) => setProfile((prev) => ({ ...prev, allowContact: value })),
    []
  );

  const value = useMemo(
    () => ({
      profile,
      updateProfile,
      updateBio,
      setAllowContact,
    }),
    [profile, updateProfile, updateBio, setAllowContact]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
};
