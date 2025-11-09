/**
 * Round API Functions - Supabase Implementation
 */

import { createClient } from '@/lib/supabase/client';
import { Round, RoundWithStats, CreateRoundInput, UpdateRoundInput, Participant } from './types';

/**
 * Fetch all rounds with statistics
 */
export async function fetchRounds(): Promise<RoundWithStats[]> {
  const supabase = createClient();

  const { data: rounds, error } = await supabase
    .from('rounds')
    .select(`
      *,
      round_participants (
        participant_id
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Calculate stats for each round
  const roundsWithStats = await Promise.all(
    (rounds || []).map(async (round: any) => {
      const participantIds = round.round_participants.map((rp: any) => rp.participant_id);

      // Count submissions for this round
      const { data: submissions } = await supabase
        .from('submissions')
        .select('participant_id, status')
        .eq('round_id', round.id)
        .in('participant_id', participantIds);

      const submittedCount = submissions?.filter(
        (s) => s.status === 'submitted' || s.status === 'not_applicable'
      ).length || 0;

      return {
        id: round.id,
        title: round.title,
        description: round.description,
        startDate: round.start_date,
        endDate: round.end_date,
        budgetCodeTransport: round.budget_code_transport,
        budgetCodeAccommodation: round.budget_code_accommodation,
        participants: participantIds,
        requiredDocuments: round.required_documents || [],
        createdAt: round.created_at,
        updatedAt: round.updated_at,
        participantCount: participantIds.length,
        submittedCount,
        notSubmittedCount: participantIds.length - submittedCount,
      };
    })
  );

  return roundsWithStats;
}

/**
 * Fetch a single round by ID
 */
export async function fetchRound(id: string): Promise<Round | null> {
  const supabase = createClient();

  const { data: round, error } = await supabase
    .from('rounds')
    .select(`
      *,
      round_participants (
        participant_id
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  if (!round) {
    return null;
  }

  const participantIds = round.round_participants.map((rp: any) => rp.participant_id);

  return {
    id: round.id,
    title: round.title,
    description: round.description,
    startDate: round.start_date,
    endDate: round.end_date,
    budgetCodeTransport: round.budget_code_transport,
    budgetCodeAccommodation: round.budget_code_accommodation,
    participants: participantIds,
    requiredDocuments: round.required_documents || [],
    createdAt: round.created_at,
    updatedAt: round.updated_at,
  };
}

/**
 * Create a new round
 */
export async function createRound(input: CreateRoundInput): Promise<Round> {
  const supabase = createClient();

  // Insert round
  const { data: round, error } = await supabase
    .from('rounds')
    .insert({
      title: input.title,
      description: input.description,
      start_date: input.startDate,
      end_date: input.endDate,
      budget_code_transport: input.budgetCodeTransport,
      budget_code_accommodation: input.budgetCodeAccommodation,
      required_documents: input.requiredDocuments,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Insert round participants
  if (input.participants && input.participants.length > 0) {
    const roundParticipants = input.participants.map((participantId) => ({
      round_id: round.id,
      participant_id: participantId,
    }));

    const { error: rpError } = await supabase
      .from('round_participants')
      .insert(roundParticipants);

    if (rpError) {
      // Rollback: delete the round
      await supabase.from('rounds').delete().eq('id', round.id);
      throw new Error(rpError.message);
    }
  }

  return {
    id: round.id,
    title: round.title,
    description: round.description,
    startDate: round.start_date,
    endDate: round.end_date,
    budgetCodeTransport: round.budget_code_transport,
    budgetCodeAccommodation: round.budget_code_accommodation,
    participants: input.participants,
    requiredDocuments: round.required_documents || [],
    createdAt: round.created_at,
    updatedAt: round.updated_at,
  };
}

/**
 * Update an existing round
 */
export async function updateRound(input: UpdateRoundInput): Promise<Round> {
  const supabase = createClient();

  // Update round
  const updateData: any = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.startDate !== undefined) updateData.start_date = input.startDate;
  if (input.endDate !== undefined) updateData.end_date = input.endDate;
  if (input.budgetCodeTransport !== undefined) updateData.budget_code_transport = input.budgetCodeTransport;
  if (input.budgetCodeAccommodation !== undefined) updateData.budget_code_accommodation = input.budgetCodeAccommodation;
  if (input.requiredDocuments !== undefined) updateData.required_documents = input.requiredDocuments;

  const { data: round, error } = await supabase
    .from('rounds')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Update participants if provided
  if (input.participants !== undefined) {
    // Delete existing participants
    await supabase.from('round_participants').delete().eq('round_id', input.id);

    // Insert new participants
    if (input.participants.length > 0) {
      const roundParticipants = input.participants.map((participantId) => ({
        round_id: input.id,
        participant_id: participantId,
      }));

      const { error: rpError } = await supabase
        .from('round_participants')
        .insert(roundParticipants);

      if (rpError) {
        throw new Error(rpError.message);
      }
    }
  }

  // Fetch updated round with participants
  const updatedRound = await fetchRound(input.id);
  if (!updatedRound) {
    throw new Error('Round not found after update');
  }

  return updatedRound;
}

/**
 * Delete a round
 */
export async function deleteRound(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('rounds').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Fetch rounds for the current participant
 */
export async function fetchParticipantRounds(): Promise<Array<Round & {
  submittedCount?: number;
  totalDocuments?: number;
}>> {
  const supabase = createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Fetch rounds where user is a participant
  const { data: roundParticipants, error } = await supabase
    .from('round_participants')
    .select(`
      round_id,
      rounds (
        *
      )
    `)
    .eq('participant_id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  // Transform data and get submission status
  const rounds = await Promise.all(
    (roundParticipants || []).map(async (rp: any) => {
      const round = rp.rounds;
      const requiredDocuments = round.required_documents || [];

      // Get submission count for this participant in this round
      const { data: submissions } = await supabase
        .from('submissions')
        .select('id, status')
        .eq('round_id', round.id)
        .eq('participant_id', user.id)
        .in('status', ['submitted', 'not_applicable']);

      return {
        id: round.id,
        title: round.title,
        description: round.description,
        startDate: round.start_date,
        endDate: round.end_date,
        // Budget codes are admin-only, not exposed to participants
        participants: [],
        requiredDocuments,
        createdAt: round.created_at,
        updatedAt: round.updated_at,
        submittedCount: submissions?.length || 0,
        totalDocuments: requiredDocuments.length,
      };
    })
  );

  return rounds.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Fetch all available participants
 */
export async function fetchParticipants(): Promise<Participant[]> {
  const supabase = createClient();

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('status', 'active')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return profiles || [];
}
