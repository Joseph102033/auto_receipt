/**
 * Participant API Functions - Supabase Implementation
 */

import { createClient } from '@/lib/supabase/client';
import {
  Participant,
  CreateParticipantInput,
  UpdateParticipantInput,
  BulkImportParticipant,
  ParticipantFilter,
  ParticipantStats,
} from './types';

/**
 * Fetch all participants with optional filtering
 */
export async function fetchParticipants(filter?: ParticipantFilter): Promise<Participant[]> {
  const supabase = createClient();

  let query = supabase
    .from('profiles')
    .select('*')
    .order('name');

  // Apply filters
  if (filter?.status && filter.status !== 'all') {
    query = query.eq('status', filter.status);
  }

  if (filter?.department && filter.department !== 'all') {
    query = query.eq('department', filter.department);
  }

  if (filter?.search) {
    query = query.or(`name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,department.ilike.%${filter.search}%,position.ilike.%${filter.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((profile: any) => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    department: profile.department,
    position: profile.position,
    status: profile.status,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }));
}

/**
 * Fetch a single participant by ID
 */
export async function fetchParticipant(id: string): Promise<Participant | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    department: data.department,
    position: data.position,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Fetch participant statistics
 */
export async function fetchParticipantStats(): Promise<ParticipantStats> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('status');

  if (error) {
    throw new Error(error.message);
  }

  const total = data?.length || 0;
  const active = data?.filter((p) => p.status === 'active').length || 0;
  const inactive = data?.filter((p) => p.status === 'inactive').length || 0;

  return { total, active, inactive };
}

/**
 * Create a new participant (requires admin to create via Supabase Auth)
 * Note: In production, this should be handled through proper auth signup flow
 */
export async function createParticipant(input: CreateParticipantInput): Promise<Participant> {
  const supabase = createClient();

  // This is a simplified version - in production, you'd use Supabase Auth signup
  // For now, we'll just update/insert profile data
  throw new Error('Creating participants should be done through Supabase Auth signup');
}

/**
 * Update an existing participant
 */
export async function updateParticipant(input: UpdateParticipantInput): Promise<Participant> {
  const supabase = createClient();

  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.department !== undefined) updateData.department = input.department;
  if (input.position !== undefined) updateData.position = input.position;
  if (input.status !== undefined) updateData.status = input.status;

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    department: data.department,
    position: data.position,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Delete a participant
 */
export async function deleteParticipant(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('profiles').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Bulk import participants
 * Note: Similar to createParticipant, this should go through proper auth flow
 */
export async function bulkImportParticipants(
  participants: BulkImportParticipant[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  throw new Error('Bulk import should be done through proper Supabase Auth signup flow');
}

/**
 * Fetch unique departments
 */
export async function fetchDepartments(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('department')
    .not('department', 'is', null);

  if (error) {
    throw new Error(error.message);
  }

  const departments = Array.from(new Set(data?.map((p) => p.department).filter((d) => d)));

  return departments as string[];
}
