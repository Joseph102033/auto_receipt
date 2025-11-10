/**
 * Remind Overdue Participants API
 * POST /api/rounds/[id]/remind-overdue
 *
 * Send SMS reminder to participants who haven't submitted required documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/sms/solapi';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id: roundId } = await params;

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    // Get round details
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('title, end_date, required_documents')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    // Get round participants
    const { data: roundParticipants, error: rpError } = await supabase
      .from('round_participants')
      .select('participant_id')
      .eq('round_id', roundId);

    if (rpError) {
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
    }

    if (!roundParticipants || roundParticipants.length === 0) {
      return NextResponse.json({ message: 'No participants in this round' }, { status: 200 });
    }

    const participantIds = roundParticipants.map(rp => rp.participant_id);

    // Get submissions for this round
    const { data: submissions, error: subError } = await supabase
      .from('submissions')
      .select('participant_id, document_name, status')
      .eq('round_id', roundId)
      .in('participant_id', participantIds);

    if (subError) {
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    // Find participants with incomplete submissions
    const requiredDocs = (round.required_documents as string[]) || [];
    const overdueParticipantIds = new Set<string>();

    for (const participantId of participantIds) {
      const participantSubs = submissions?.filter(s => s.participant_id === participantId) || [];

      // Check if all required documents are submitted
      const submittedDocs = participantSubs
        .filter(s => s.status === 'submitted')
        .map(s => s.document_name);

      const missingDocs = requiredDocs.filter(doc => !submittedDocs.includes(doc));

      if (missingDocs.length > 0) {
        overdueParticipantIds.add(participantId);
      }
    }

    if (overdueParticipantIds.size === 0) {
      return NextResponse.json({
        message: 'All participants have submitted required documents',
        overdueCount: 0,
      });
    }

    // Get overdue participants' details
    const { data: overdueParticipants, error: partError } = await supabase
      .from('profiles')
      .select('id, name, phone')
      .in('id', Array.from(overdueParticipantIds));

    if (partError || !overdueParticipants) {
      return NextResponse.json({ error: 'Failed to fetch participant details' }, { status: 500 });
    }

    // Filter participants with valid phone numbers
    const participantsWithPhone = overdueParticipants.filter(p => p.phone && p.phone.trim() !== '');

    if (participantsWithPhone.length === 0) {
      return NextResponse.json({
        message: 'No overdue participants have phone numbers',
        overdueCount: overdueParticipantIds.size,
        withPhone: 0,
      });
    }

    // Prepare SMS message
    const message = `[코샤 서류 제출 알림]\n${round.title}\n마감일: ${new Date(round.end_date).toLocaleDateString('ko-KR')}\n미제출 서류가 있습니다. 서류를 확인하고 제출해 주세요.`;

    // Send SMS to overdue participants
    const phoneNumbers = participantsWithPhone.map(p => p.phone);

    try {
      const smsResult = await sendSMS({
        to: phoneNumbers,
        message,
      });

      // Create notifications in database
      const notifications = participantsWithPhone.map(p => ({
        type: 'sms',
        status: 'unread',
        priority: 'high',
        title: `${round.title} - 서류 제출 독촉`,
        message,
        recipient_id: p.id,
        recipient_name: p.name,
        recipient_email: p.phone, // Store phone in email field for now
        sender_id: user.id,
        sender_name: profile.role,
        round_id: roundId,
        round_title: round.title,
      }));

      await supabase.from('notifications').insert(notifications);

      return NextResponse.json({
        success: true,
        message: 'SMS reminders sent successfully',
        overdueCount: overdueParticipantIds.size,
        smsSentCount: participantsWithPhone.length,
        groupId: smsResult.groupId,
        totalCount: smsResult.count.total,
        successCount: smsResult.count.sentSuccess,
        failedCount: smsResult.count.sentFailed,
      });
    } catch (smsError: any) {
      console.error('Failed to send SMS:', smsError);

      return NextResponse.json(
        {
          error: 'Failed to send SMS reminders',
          details: smsError.message,
          overdueCount: overdueParticipantIds.size,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Remind overdue error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
