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
 * GET /api/participants
 * Fetch all participants with optional filtering
 */
export async function fetchParticipants(filter?: ParticipantFilter): Promise<Participant[]> {
  const supabase = createClient();

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply search filter
  if (filter?.search) {
    query = query.or(
      `name.ilike.%${filter.search}%,email.ilike.%${filter.search}%,department.ilike.%${filter.search}%,position.ilike.%${filter.search}%`
    );
  }

  // Apply department filter
  if (filter?.department && filter.department !== 'all') {
    query = query.eq('department', filter.department);
  }

  // Apply status filter
  if (filter?.status && filter.status !== 'all') {
    query = query.eq('status', filter.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`참여자 조회 실패: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    department: item.department,
    position: item.position,
    status: item.status || 'active',
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }));
}

/**
 * GET /api/participants/:id
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
    status: data.status || 'active',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * GET /api/participants/stats
 * Fetch participant statistics
 */
export async function fetchParticipantStats(): Promise<ParticipantStats> {
  const supabase = createClient();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('status');

  if (error) {
    throw new Error(`통계 조회 실패: ${error.message}`);
  }

  const total = profiles?.length || 0;
  const active = profiles?.filter((p) => p.status === 'active').length || 0;
  const inactive = profiles?.filter((p) => p.status === 'inactive').length || 0;

  return {
    total,
    active,
    inactive,
  };
}

/**
 * POST /api/participants
 * Create a new participant
 */
export async function createParticipant(input: CreateParticipantInput): Promise<Participant> {
  const supabase = createClient();

  // Check for duplicate email
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', input.email)
    .single();

  if (existing) {
    throw new Error('이미 등록된 이메일입니다');
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password: Math.random().toString(36).slice(-8) + 'Aa1!', // Random temporary password
    options: {
      data: {
        name: input.name,
        phone: input.phone,
        department: input.department,
        position: input.position,
      },
    },
  });

  if (authError) {
    throw new Error(`사용자 생성 실패: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error('사용자 생성 실패');
  }

  // Update profile with additional info
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      name: input.name,
      phone: input.phone,
      department: input.department,
      position: input.position,
      status: 'active',
    })
    .eq('id', authData.user.id)
    .select()
    .single();

  if (profileError || !profile) {
    throw new Error(`프로필 업데이트 실패: ${profileError?.message}`);
  }

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    department: profile.department,
    position: profile.position,
    status: profile.status || 'active',
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

/**
 * PUT /api/participants/:id
 * Update an existing participant
 */
export async function updateParticipant(input: UpdateParticipantInput): Promise<Participant> {
  const supabase = createClient();

  // Check for duplicate email (excluding current participant)
  if (input.email) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', input.email)
      .neq('id', input.id)
      .single();

    if (existing) {
      throw new Error('이미 등록된 이메일입니다');
    }
  }

  const updateData: any = {};
  if (input.name) updateData.name = input.name;
  if (input.email) updateData.email = input.email;
  if (input.phone) updateData.phone = input.phone;
  if (input.department) updateData.department = input.department;
  if (input.position) updateData.position = input.position;
  if (input.status) updateData.status = input.status;

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`참여자 업데이트 실패: ${error?.message}`);
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    department: data.department,
    position: data.position,
    status: data.status || 'active',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * DELETE /api/participants/:id
 * Delete a participant
 */
export async function deleteParticipant(id: string): Promise<void> {
  const supabase = createClient();

  // Set status to inactive instead of actually deleting
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'inactive' })
    .eq('id', id);

  if (error) {
    throw new Error(`참여자 삭제 실패: ${error.message}`);
  }
}

/**
 * POST /api/participants/bulk
 * Bulk import participants
 */
export async function bulkImportParticipants(
  participants: BulkImportParticipant[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const participant of participants) {
    try {
      await createParticipant(participant);
      success++;
    } catch (error: any) {
      errors.push(`${participant.email}: ${error.message}`);
      failed++;
    }
  }

  return { success, failed, errors };
}

/**
 * GET /api/participants/departments
 * Fetch unique departments
 */
export async function fetchDepartments(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('department')
    .not('department', 'is', null);

  if (error) {
    throw new Error(`부서 목록 조회 실패: ${error.message}`);
  }

  const departments = Array.from(
    new Set(data?.map((p) => p.department).filter((d) => d))
  ) as string[];

  return departments.sort();
}
