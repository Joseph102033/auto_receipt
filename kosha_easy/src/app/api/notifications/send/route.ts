/**
 * Send Notification API
 * POST /api/notifications/send
 *
 * Send notifications to multiple recipients with proper RLS bypass
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createPureClient } from '@/lib/supabase/server';

interface SendNotificationRequest {
  recipientIds: string[];
  type: 'email' | 'sms' | 'system';
  priority?: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  roundId?: string;
}

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

    // Parse request body
    const body: SendNotificationRequest = await request.json();
    const { recipientIds, type, priority = 'medium', title, message, roundId } = body;

    // Validate required fields
    if (!recipientIds || recipientIds.length === 0) {
      return NextResponse.json({ error: 'Recipients are required' }, { status: 400 });
    }

    if (!type || !title || !message) {
      return NextResponse.json({ error: 'Type, title, and message are required' }, { status: 400 });
    }

    // Fetch recipient info
    const { data: recipients, error: recipientsError } = await supabase
      .from('profiles')
      .select('id, name, email, phone')
      .in('id', recipientIds);

    if (recipientsError) {
      return NextResponse.json(
        { error: `Failed to fetch recipients: ${recipientsError.message}` },
        { status: 500 }
      );
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'No valid recipients found' }, { status: 404 });
    }

    // Create notifications for each recipient
    const notifications = recipients.map((recipient) => ({
      type,
      status: 'unread',
      priority,
      title,
      message,
      recipient_id: recipient.id,
      sender_id: user.id,
      round_id: roundId || null,
    }));

    // Insert notifications using service role client to bypass RLS
    try {
      const adminClient = await createPureClient();
      const { data: createdNotifications, error: insertError } = await adminClient
        .from('notifications')
        .insert(notifications)
        .select();

      if (insertError) {
        console.error('Failed to insert notifications:', insertError);
        return NextResponse.json(
          { error: `Failed to create notifications: ${insertError.message}` },
          { status: 500 }
        );
      }

      // Send actual SMS if type is 'sms'
      if (type === 'sms') {
        const phoneNumbers = recipients
          .map((r) => r.phone)
          .filter((phone) => phone && phone.trim() !== '');

        if (phoneNumbers.length > 0) {
          try {
            const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sms/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: phoneNumbers,
                message,
              }),
            });

            if (!smsResponse.ok) {
              console.error('Failed to send SMS:', await smsResponse.text());
            }
          } catch (smsError) {
            console.error('Failed to send SMS:', smsError);
            // Don't throw - notification was saved, just SMS failed
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Notifications sent successfully',
        count: createdNotifications?.length || 0,
        notifications: createdNotifications,
      });
    } catch (clientError) {
      console.error('Failed to create admin client or insert notifications:', clientError);
      return NextResponse.json(
        { error: 'Failed to create notifications' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Send notification error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
