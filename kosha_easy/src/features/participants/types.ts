/**
 * Participant Management Types
 *
 * Type definitions for the Participant entity and related structures
 */

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateParticipantInput {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
}

export interface UpdateParticipantInput {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  status?: 'active' | 'inactive';
}

export interface BulkImportParticipant {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
}

export interface ParticipantFilter {
  search?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'all';
}

export interface ParticipantStats {
  total: number;
  active: number;
  inactive: number;
}
