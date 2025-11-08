/**
 * Participant API Functions (Stubbed)
 *
 * TODO: Replace these stub implementations with real API calls
 * when backend is ready
 */

import {
  Participant,
  CreateParticipantInput,
  UpdateParticipantInput,
  BulkImportParticipant,
  ParticipantFilter,
  ParticipantStats,
} from './types';

// Mock data store (simulates a database)
let mockParticipants: Participant[] = [
  {
    id: 'p1',
    name: '김철수',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    department: '개발팀',
    position: '팀장',
    status: 'active',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: 'p2',
    name: '이영희',
    email: 'lee@example.com',
    phone: '010-2345-6789',
    department: '마케팅팀',
    position: '매니저',
    status: 'active',
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
  },
  {
    id: 'p3',
    name: '박민수',
    email: 'park@example.com',
    phone: '010-3456-7890',
    department: '개발팀',
    position: '시니어',
    status: 'active',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString(),
  },
  {
    id: 'p4',
    name: '정수진',
    email: 'jung@example.com',
    phone: '010-4567-8901',
    department: '인사팀',
    position: '주임',
    status: 'active',
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString(),
  },
  {
    id: 'p5',
    name: '최동욱',
    email: 'choi@example.com',
    phone: '010-5678-9012',
    department: '개발팀',
    position: '시니어',
    status: 'inactive',
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date('2024-03-15').toISOString(),
  },
];

/**
 * Simulates network delay
 */
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET /api/participants
 * Fetch all participants with optional filtering
 *
 * TODO: Replace with actual API call
 * Example: return fetch(`/api/participants?${params}`).then(res => res.json())
 */
export async function fetchParticipants(filter?: ParticipantFilter): Promise<Participant[]> {
  await delay();

  let filtered = [...mockParticipants];

  // Apply search filter
  if (filter?.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        p.department?.toLowerCase().includes(searchLower) ||
        p.position?.toLowerCase().includes(searchLower)
    );
  }

  // Apply department filter
  if (filter?.department && filter.department !== 'all') {
    filtered = filtered.filter((p) => p.department === filter.department);
  }

  // Apply status filter
  if (filter?.status && filter.status !== 'all') {
    filtered = filtered.filter((p) => p.status === filter.status);
  }

  return filtered;
}

/**
 * GET /api/participants/:id
 * Fetch a single participant by ID
 *
 * TODO: Replace with actual API call
 * Example: return fetch(`/api/participants/${id}`).then(res => res.json())
 */
export async function fetchParticipant(id: string): Promise<Participant | null> {
  await delay();

  const participant = mockParticipants.find((p) => p.id === id);
  return participant || null;
}

/**
 * GET /api/participants/stats
 * Fetch participant statistics
 *
 * TODO: Replace with actual API call
 */
export async function fetchParticipantStats(): Promise<ParticipantStats> {
  await delay(300);

  return {
    total: mockParticipants.length,
    active: mockParticipants.filter((p) => p.status === 'active').length,
    inactive: mockParticipants.filter((p) => p.status === 'inactive').length,
  };
}

/**
 * POST /api/participants
 * Create a new participant
 *
 * TODO: Replace with actual API call
 * Example: return fetch('/api/participants', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(input)
 * }).then(res => res.json())
 */
export async function createParticipant(input: CreateParticipantInput): Promise<Participant> {
  await delay();

  // Check for duplicate email
  if (mockParticipants.some((p) => p.email === input.email)) {
    throw new Error('이미 등록된 이메일입니다');
  }

  const newParticipant: Participant = {
    id: `p${mockParticipants.length + 1}`,
    ...input,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockParticipants.push(newParticipant);
  return newParticipant;
}

/**
 * PUT /api/participants/:id
 * Update an existing participant
 *
 * TODO: Replace with actual API call
 * Example: return fetch(`/api/participants/${input.id}`, {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(input)
 * }).then(res => res.json())
 */
export async function updateParticipant(input: UpdateParticipantInput): Promise<Participant> {
  await delay();

  const index = mockParticipants.findIndex((p) => p.id === input.id);

  if (index === -1) {
    throw new Error('참여자를 찾을 수 없습니다');
  }

  // Check for duplicate email (excluding current participant)
  if (
    input.email &&
    mockParticipants.some((p) => p.id !== input.id && p.email === input.email)
  ) {
    throw new Error('이미 등록된 이메일입니다');
  }

  const updatedParticipant: Participant = {
    ...mockParticipants[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  mockParticipants[index] = updatedParticipant;
  return updatedParticipant;
}

/**
 * DELETE /api/participants/:id
 * Delete a participant
 *
 * TODO: Replace with actual API call
 * Example: return fetch(`/api/participants/${id}`, { method: 'DELETE' })
 */
export async function deleteParticipant(id: string): Promise<void> {
  await delay();

  const index = mockParticipants.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error('참여자를 찾을 수 없습니다');
  }

  mockParticipants.splice(index, 1);
}

/**
 * POST /api/participants/bulk
 * Bulk import participants
 *
 * TODO: Replace with actual API call
 */
export async function bulkImportParticipants(
  participants: BulkImportParticipant[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  await delay(1000);

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const participant of participants) {
    try {
      // Check for duplicate email
      if (mockParticipants.some((p) => p.email === participant.email)) {
        errors.push(`${participant.email}: 이미 등록된 이메일입니다`);
        failed++;
        continue;
      }

      const newParticipant: Participant = {
        id: `p${mockParticipants.length + 1}`,
        ...participant,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockParticipants.push(newParticipant);
      success++;
    } catch (error) {
      errors.push(`${participant.email}: 등록 실패`);
      failed++;
    }
  }

  return { success, failed, errors };
}

/**
 * GET /api/participants/departments
 * Fetch unique departments
 *
 * TODO: Replace with actual API call
 */
export async function fetchDepartments(): Promise<string[]> {
  await delay(300);

  const departments = Array.from(
    new Set(mockParticipants.map((p) => p.department).filter((d) => d))
  ) as string[];

  return departments;
}
