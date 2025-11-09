/**
 * Round Management Types
 *
 * Type definitions for the Round entity and related structures
 */

export interface Round {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  budgetCodeTransport?: string; // 운임 예산 코드 (관리자 전용)
  budgetCodeAccommodation?: string; // 숙박비 예산 코드 (관리자 전용)
  participants: string[]; // Array of participant IDs
  requiredDocuments: string[]; // Array of required document names
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoundInput {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budgetCodeTransport?: string;
  budgetCodeAccommodation?: string;
  participants: string[];
  requiredDocuments: string[];
}

export interface UpdateRoundInput {
  id: string;
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budgetCodeTransport?: string;
  budgetCodeAccommodation?: string;
  participants?: string[];
  requiredDocuments?: string[];
}

export interface RoundWithStats extends Round {
  participantCount: number;
  submittedCount: number;
  notSubmittedCount: number;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
}
