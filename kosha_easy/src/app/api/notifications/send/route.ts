/**
 * Send Notification API
 * POST /api/notifications/send
 *
 * Send notifications to multiple recipients with proper RLS bypass
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createPureClient } from '@/lib/supabase/server';
import { sendSMS } from '@/lib/sms/solapi';

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

    // Get round info if roundId is provided
    let roundInfo: any = null;
    if (roundId) {
      const { data: round } = await supabase
        .from('rounds')
        .select('title, end_date')
        .eq('id', roundId)
        .single();
      roundInfo = round;
    }

    // Helper function to replace template variables
    const replaceTemplateVariables = (template: string, recipient: any, round: any) => {
      let result = template;

      // Replace participant variables
      result = result.replace(/\{\{participantName\}\}/g, recipient.name || '회원');

      // Replace round variables
      if (round) {
        result = result.replace(/\{\{roundTitle\}\}/g, round.title || '');

        // Calculate days left
        if (round.end_date) {
          const endDate = new Date(round.end_date);
          const today = new Date();
          const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          result = result.replace(/\{\{daysLeft\}\}/g, daysLeft.toString());

          // Format deadline
          const deadline = endDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          result = result.replace(/\{\{deadline\}\}/g, deadline);
        }
      }

      return result;
    };

    // Create notifications for each recipient with personalized messages
    const notifications = recipients.map((recipient) => {
      const personalizedTitle = replaceTemplateVariables(title, recipient, roundInfo);
      const personalizedMessage = replaceTemplateVariables(message, recipient, roundInfo);

      return {
        type,
        status: 'unread',
        priority,
        title: personalizedTitle,
        message: personalizedMessage,
        recipient_id: recipient.id,
        sender_id: user.id,
        round_id: roundId || null,
      };
    });

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
        // Send personalized SMS to each recipient
        const recipientsWithPhone = recipients.filter((r) => r.phone && r.phone.trim() !== '');

        if (recipientsWithPhone.length > 0) {
          try {
            console.log(`Sending personalized SMS to ${recipientsWithPhone.length} recipients`);

            // Send SMS to each recipient with their personalized message
            for (const recipient of recipientsWithPhone) {
              const personalizedMessage = replaceTemplateVariables(message, recipient, roundInfo);

              try {
                await sendSMS({
                  to: recipient.phone,
                  message: personalizedMessage,
                });
                console.log(`SMS sent to ${recipient.name} (${recipient.phone})`);
              } catch (smsError) {
                console.error(`Failed to send SMS to ${recipient.name}:`, smsError);
                // Continue with next recipient even if one fails
              }
            }

            console.log('All SMS sending attempts completed');
          } catch (smsError) {
            console.error('Failed to send SMS:', smsError);
            // Don't throw - notification was saved, just SMS failed
          }
        } else {
          console.log('No valid phone numbers found for SMS');
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
