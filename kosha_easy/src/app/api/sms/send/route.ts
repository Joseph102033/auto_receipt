/**
 * SMS Send API Route
 * POST /api/sms/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, isValidPhoneNumber } from '@/lib/sms/solapi';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Parse request body
    const body = await request.json();
    const { to, message, from } = body;

    // Validation
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    // Validate phone numbers
    const recipients = Array.isArray(to) ? to : [to];
    const invalidNumbers = recipients.filter(phone => !isValidPhoneNumber(phone));

    if (invalidNumbers.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid phone numbers',
          invalidNumbers,
        },
        { status: 400 }
      );
    }

    // Send SMS
    const result = await sendSMS({
      to: recipients,
      message,
      from,
    });

    return NextResponse.json({
      success: true,
      groupId: result.groupId,
      accountId: result.accountId,
      totalCount: result.count.total,
      successCount: result.count.sentSuccess,
      failedCount: result.count.sentFailed,
      pendingCount: result.count.sentPending,
      recipients: recipients.length,
    });
  } catch (error: any) {
    console.error('SMS send error:', error);

    return NextResponse.json(
      {
        error: 'Failed to send SMS',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
