// src/context/ProfileContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AgeStatus = 'unknown' | 'verified21' | 'verified18Med' | 'denied';

export type UserProfile = {
  id: string;
  displayName: string;
  createdAt: string;
  ageStatus: AgeStatus;
  role?: 'consumer' | 'clinician' | 'coach';
};

type ProfileState = {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  loading: boolean;
  setActiveProfileById: (id: string | null) => void;
  addProfile: (displayName: string, role?: UserProfile['role']) => Promise<UserProfile>;
  updateProfileAgeStatus: (id: string, ageStatus: AgeStatus) => Promise<void>;
  reloadProfiles: () => Promise<void>;
};

const ProfileContext = createContext<ProfileState | undefined>(undefined);

const STORAGE_KEY = 'carta:profiles';

function createId() {
  return `profile-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reloadProfiles();
  }, []);

  const reloadProfiles = async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setProfiles([]);
        setActiveProfileId(null);
      } else {
        const parsed: UserProfile[] = JSON.parse(raw);
        setProfiles(parsed);
        if (!parsed.find(p => p.id === activeProfileId)) {
          setActiveProfileId(parsed[0]?.id ?? null);
        }
      }
    } catch (e) {
      console.warn('Failed to load profiles', e);
    } finally {
      setLoading(false);
    }
  };

  const persistProfiles = async (next: UserProfile[]) => {
    setProfiles(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const setActiveProfileById = (id: string | null) => {
    setActiveProfileId(id);
  };

  const addProfile = async (displayName: string, role?: UserProfile['role']) => {
    const newProfile: UserProfile = {
      id: createId(),
      displayName: displayName.trim() || 'User',
      createdAt: new Date().toISOString(),
      ageStatus: 'unknown',
      role,
    };
    const next = [...profiles, newProfile];
    await persistProfiles(next);
    setActiveProfileId(newProfile.id);
    return newProfile;
  };

  const updateProfileAgeStatus = async (id: string, ageStatus: AgeStatus) => {
    const next = profiles.map(p => (p.id === id ? { ...p, ageStatus } : p));
    await persistProfiles(next);
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId) ?? null;

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        loading,
        setActiveProfileById,
        addProfile,
        updateProfileAgeStatus,
        reloadProfiles,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfiles must be used within ProfileProvider');
  }
  return ctx;
};
