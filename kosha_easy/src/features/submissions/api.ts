/**
 * Submissions API
 *
 * Supabase API functions for document submissions with file upload and amount tracking
 */

import { createClient } from '@/lib/supabase/client';
import type {
  Submission,
  SubmissionWithParticipant,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
  AmountStats,
  ParticipantAmountSummary,
} from './types';

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(file: File, roundId: string, participantId: string): Promise<string> {
  const supabase = createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Upload - Current user:', user?.id);
  console.log('Upload - Participant ID:', participantId);

  // Generate unique file name
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${roundId}/${participantId}/${timestamp}.${fileExt}`;

  console.log('Upload - Attempting to upload:', fileName);
  console.log('Upload - File size:', file.size, 'bytes');

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error details:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error,
    });
    throw new Error(`파일 업로드 실패: ${error.message}`);
  }

  console.log('Upload successful:', data.path);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  const supabase = createClient();

  // Extract file path from URL
  const url = new URL(fileUrl);
  const path = url.pathname.split('/storage/v1/object/public/documents/')[1];

  if (!path) {
    throw new Error('Invalid file URL');
  }

  const { error } = await supabase.storage
    .from('documents')
    .remove([path]);

  if (error) {
    throw new Error(`파일 삭제 실패: ${error.message}`);
  }
}

/**
 * Create a new submission
 */
export async function createSubmission(
  request: CreateSubmissionRequest
): Promise<Submission> {
  const supabase = createClient();

  // Get current user if participantId is not provided
  let participantId = request.participantId;
  if (!participantId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('로그인이 필요합니다');
    }
    participantId = user.id;
  }

  let fileUrl: string | null = null;
  let fileSize: number | null = null;
  let fileType: string | null = null;

  // Upload file if provided
  if (request.file && request.status === 'submitted') {
    fileUrl = await uploadFile(request.file, request.roundId, participantId);
    fileSize = request.file.size;
    fileType = request.file.type;
  }

  // Create submission record
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      round_id: request.roundId,
      participant_id: participantId,
      document_name: request.documentName,
      file_url: fileUrl,
      file_size: fileSize,
      file_type: fileType,
      status: request.status,
      not_applicable_reason: request.notApplicableReason || null,
      amount_transport: request.amountTransport ?? null,
      amount_accommodation: request.amountAccommodation ?? null,
      amount_etc: request.amountEtc ?? 0,
      amount_note: request.amountNote || null,
      submitted_at: request.status === 'submitted' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    // If submission failed and file was uploaded, delete the file
    if (fileUrl) {
      try {
        await deleteFile(fileUrl);
      } catch (deleteError) {
        console.error('Failed to delete uploaded file:', deleteError);
      }
    }
    throw new Error(`제출 실패: ${error.message}`);
  }

  return mapSubmissionFromDb(data);
}

/**
 * Update an existing submission
 */
export async function updateSubmission(
  request: UpdateSubmissionRequest
): Promise<Submission> {
  const supabase = createClient();

  // Get existing submission
  const { data: existing, error: fetchError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', request.id)
    .single();

  if (fetchError) {
    throw new Error(`제출 조회 실패: ${fetchError.message}`);
  }

  let fileUrl = existing.file_url;
  let fileSize = existing.file_size;
  let fileType = existing.file_type;

  // Upload new file if provided
  if (request.file && request.status === 'submitted') {
    // Delete old file if exists
    if (existing.file_url) {
      try {
        await deleteFile(existing.file_url);
      } catch (error) {
        console.error('Failed to delete old file:', error);
      }
    }

    fileUrl = await uploadFile(request.file, existing.round_id, existing.participant_id);
    fileSize = request.file.size;
    fileType = request.file.type;
  }

  // Update submission record
  const { data, error } = await supabase
    .from('submissions')
    .update({
      file_url: fileUrl,
      file_size: fileSize,
      file_type: fileType,
      status: request.status || existing.status,
      not_applicable_reason: request.notApplicableReason || existing.not_applicable_reason,
      amount_transport: request.amountTransport ?? existing.amount_transport,
      amount_accommodation: request.amountAccommodation ?? existing.amount_accommodation,
      amount_etc: request.amountEtc ?? existing.amount_etc,
      amount_note: request.amountNote ?? existing.amount_note,
      submitted_at: request.status === 'submitted' ? new Date().toISOString() : existing.submitted_at,
    })
    .eq('id', request.id)
    .select()
    .single();

  if (error) {
    throw new Error(`제출 업데이트 실패: ${error.message}`);
  }

  return mapSubmissionFromDb(data);
}

/**
 * Fetch submissions for a round
 */
export async function fetchSubmissionsByRound(roundId: string): Promise<SubmissionWithParticipant[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      participant:profiles!participant_id (
        id,
        name,
        email,
        department,
        position
      )
    `)
    .eq('round_id', roundId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`제출 목록 조회 실패: ${error.message}`);
  }

  return data.map((item) => ({
    ...mapSubmissionFromDb(item),
    participant: {
      id: item.participant.id,
      name: item.participant.name,
      email: item.participant.email,
      department: item.participant.department,
      position: item.participant.position,
    },
  }));
}

/**
 * Fetch submissions for a participant
 */
export async function fetchSubmissionsByParticipant(
  participantId: string
): Promise<Submission[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('participant_id', participantId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`제출 목록 조회 실패: ${error.message}`);
  }

  return data.map(mapSubmissionFromDb);
}

/**
 * Fetch a single submission
 */
export async function fetchSubmission(id: string): Promise<Submission> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`제출 조회 실패: ${error.message}`);
  }

  return mapSubmissionFromDb(data);
}

/**
 * Delete a submission
 */
export async function deleteSubmission(id: string): Promise<void> {
  const supabase = createClient();

  // Get submission to delete file
  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('file_url')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`제출 조회 실패: ${fetchError.message}`);
  }

  // Delete file if exists
  if (submission.file_url) {
    try {
      await deleteFile(submission.file_url);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }

  // Delete submission record
  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`제출 삭제 실패: ${error.message}`);
  }
}

/**
 * Get amount statistics for a round
 */
export async function getAmountStatsByRound(roundId: string): Promise<AmountStats> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('submissions')
    .select('amount_transport, amount_accommodation, amount_etc')
    .eq('round_id', roundId)
    .eq('status', 'submitted');

  if (error) {
    throw new Error(`금액 통계 조회 실패: ${error.message}`);
  }

  if (data.length === 0) {
    return {
      totalTransport: 0,
      totalAccommodation: 0,
      totalEtc: 0,
      totalAmount: 0,
      averageTransport: 0,
      averageAccommodation: 0,
      averageEtc: 0,
      averageAmount: 0,
    };
  }

  const totalTransport = data.reduce((sum, item) => sum + (item.amount_transport || 0), 0);
  const totalAccommodation = data.reduce((sum, item) => sum + (item.amount_accommodation || 0), 0);
  const totalEtc = data.reduce((sum, item) => sum + (item.amount_etc || 0), 0);
  const totalAmount = totalTransport + totalAccommodation + totalEtc;
  const count = data.length;

  return {
    totalTransport,
    totalAccommodation,
    totalEtc,
    totalAmount,
    averageTransport: Math.round(totalTransport / count),
    averageAccommodation: Math.round(totalAccommodation / count),
    averageEtc: Math.round(totalEtc / count),
    averageAmount: Math.round(totalAmount / count),
  };
}

/**
 * Get amount summary per participant for a round
 */
export async function getParticipantAmountSummary(
  roundId: string
): Promise<ParticipantAmountSummary[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      participant_id,
      amount_transport,
      amount_accommodation,
      amount_etc,
      participant:profiles!participant_id (
        id,
        name
      )
    `)
    .eq('round_id', roundId)
    .eq('status', 'submitted');

  if (error) {
    throw new Error(`참여자별 금액 조회 실패: ${error.message}`);
  }

  // Group by participant
  const participantMap = new Map<string, ParticipantAmountSummary>();

  data.forEach((item: any) => {
    const participantId = item.participant_id;
    const existing = participantMap.get(participantId);

    if (existing) {
      existing.amountTransport += item.amount_transport || 0;
      existing.amountAccommodation += item.amount_accommodation || 0;
      existing.amountEtc += item.amount_etc || 0;
      existing.totalAmount +=
        (item.amount_transport || 0) +
        (item.amount_accommodation || 0) +
        (item.amount_etc || 0);
      existing.submissionCount += 1;
    } else {
      participantMap.set(participantId, {
        participantId,
        participantName: item.participant.name,
        amountTransport: item.amount_transport || 0,
        amountAccommodation: item.amount_accommodation || 0,
        amountEtc: item.amount_etc || 0,
        totalAmount:
          (item.amount_transport || 0) +
          (item.amount_accommodation || 0) +
          (item.amount_etc || 0),
        submissionCount: 1,
      });
    }
  });

  return Array.from(participantMap.values()).sort((a, b) =>
    a.participantName.localeCompare(b.participantName)
  );
}

/**
 * Map database submission to domain model
 */
function mapSubmissionFromDb(data: any): Submission {
  return {
    id: data.id,
    roundId: data.round_id,
    participantId: data.participant_id,
    documentName: data.document_name,
    fileUrl: data.file_url,
    fileSize: data.file_size,
    fileType: data.file_type,
    status: data.status,
    notApplicableReason: data.not_applicable_reason,
    amountTransport: data.amount_transport,
    amountAccommodation: data.amount_accommodation,
    amountEtc: data.amount_etc,
    amountNote: data.amount_note,
    submittedAt: data.submitted_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
