'use client';

import { User } from '@/types';
import { dataStore } from './data';

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userId = localStorage.getItem('currentUserId');
  if (!userId) return null;
  
  return dataStore.getUser(userId) || null;
}

export function setCurrentUser(user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currentUserId', user.id);
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('currentUserId');
}

export function login(email: string, name: string, role: 'user' = 'user'): User | null {
  // Only allow login for user@trustrate.com and owner@trustrate.com
  if (email !== 'user@trustrate.com' && email !== 'owner@trustrate.com') {
    return null;
  }
  
  let user = dataStore.getUserByEmail(email);
  
  if (!user) {
    // Create user only if they don't exist
    user = dataStore.createUser({
      name,
      email,
      role,
    });
  }
  
  setCurrentUser(user);
  return user;
}

