'use server';

import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  name: string;
  phone?: string;
  department?: string;
  position?: string;
  role?: 'admin' | 'participant';
}

/**
 * Sign in with email and password
 */
export async function signIn(credentials: SignInCredentials) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Sign up with email and password
 */
export async function signUp(credentials: SignUpCredentials) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        name: credentials.name,
        phone: credentials.phone,
        department: credentials.department,
        position: credentials.position,
        role: credentials.role || 'participant',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get current user profile
 */
export async function getCurrentProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin';
}

/**
 * Redirect to appropriate page based on user role
 */
export async function redirectByRole() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role === 'admin') {
    redirect('/admin/rounds');
  } else {
    redirect('/participant/rounds');
  }
}
