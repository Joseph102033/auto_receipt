/**
 * Submission Types
 *
 * Types for document submission with amount tracking
 */

export type SubmissionStatus = 'submitted' | 'not_submitted' | 'not_applicable';

/**
 * Submission - Document submission record with expenses
 */
export interface Submission {
  id: string;
  roundId: string;
  participantId: string;
  documentName: string;
  fileUrl: string | null;
  fileSize: number | null;
  fileType: string | null;
  status: SubmissionStatus;
  notApplicableReason: string | null;

  // Amount fields (required when status is 'submitted')
  amountTransport: number | null;      // 운임 (필수)
  amountAccommodation: number | null;  // 숙박비 (필수)
  amountEtc: number | null;            // 기타 (선택)
  amountNote: string | null;           // 금액 메모 (선택)

  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * SubmissionWithParticipant - Submission with participant info
 */
export interface SubmissionWithParticipant extends Submission {
  participant: {
    id: string;
    name: string;
    email: string;
    department: string | null;
    position: string | null;
  };
}

/**
 * CreateSubmissionRequest - Request payload for creating submission
 */
export interface CreateSubmissionRequest {
  roundId: string;
  participantId: string;
  documentName: string;
  file?: File;
  status: SubmissionStatus;
  notApplicableReason?: string;

  // Amount fields (required when status is 'submitted')
  amountTransport?: number;
  amountAccommodation?: number;
  amountEtc?: number;
  amountNote?: string;
}

/**
 * UpdateSubmissionRequest - Request payload for updating submission
 */
export interface UpdateSubmissionRequest {
  id: string;
  file?: File;
  status?: SubmissionStatus;
  notApplicableReason?: string;

  amountTransport?: number;
  amountAccommodation?: number;
  amountEtc?: number;
  amountNote?: string;
}

/**
 * SubmissionStats - Statistics for submissions
 */
export interface SubmissionStats {
  total: number;
  submitted: number;
  notSubmitted: number;
  notApplicable: number;
  submissionRate: number; // Percentage
}

/**
 * AmountStats - Amount statistics for a round
 */
export interface AmountStats {
  totalTransport: number;
  totalAccommodation: number;
  totalEtc: number;
  totalAmount: number;
  averageTransport: number;
  averageAccommodation: number;
  averageEtc: number;
  averageAmount: number;
}

/**
 * AmountByCategory - Amount breakdown by category
 */
export interface AmountByCategory {
  transport: number;
  accommodation: number;
  etc: number;
  total: number;
}

/**
 * ParticipantAmountSummary - Amount summary per participant
 */
export interface ParticipantAmountSummary {
  participantId: string;
  participantName: string;
  amountTransport: number;
  amountAccommodation: number;
  amountEtc: number;
  totalAmount: number;
  submissionCount: number;
}
