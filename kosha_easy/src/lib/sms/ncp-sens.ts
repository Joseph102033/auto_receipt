/**
 * NCP SENS SMS Service
 * Naver Cloud Platform Simple & Easy Notification Service
 */

import crypto from 'crypto';

export interface SendSMSParams {
  to: string | string[];
  message: string;
  from?: string;
}

export interface SendSMSResponse {
  statusCode: string;
  statusName: string;
  requestId: string;
  requestTime: string;
}

/**
 * Generate HMAC signature for NCP API authentication
 */
function makeSignature(
  method: string,
  url: string,
  timestamp: string,
  accessKey: string,
  secretKey: string
): string {
  const space = ' ';
  const newLine = '\n';

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(method);
  hmac.update(space);
  hmac.update(url);
  hmac.update(newLine);
  hmac.update(timestamp);
  hmac.update(newLine);
  hmac.update(accessKey);

  return hmac.digest('base64');
}

/**
 * Send SMS using NCP SENS
 */
export async function sendSMS(params: SendSMSParams): Promise<SendSMSResponse> {
  const serviceId = process.env.NCP_SERVICE_ID;
  const accessKey = process.env.NCP_ACCESS_KEY;
  const secretKey = process.env.NCP_SECRET_KEY;
  const senderPhone = params.from || process.env.NCP_SENDER_PHONE;

  // Validation
  if (!serviceId || !accessKey || !secretKey || !senderPhone) {
    throw new Error('NCP SENS configuration is missing. Please check environment variables.');
  }

  // Prepare recipients
  const recipients = Array.isArray(params.to) ? params.to : [params.to];

  // Filter out empty phone numbers
  const validRecipients = recipients.filter(phone => phone && phone.trim() !== '');

  if (validRecipients.length === 0) {
    throw new Error('No valid recipient phone numbers provided');
  }

  // Format phone numbers (remove hyphens)
  const formattedRecipients = validRecipients.map(phone => ({
    recipientNo: phone.replace(/-/g, ''),
  }));

  const timestamp = Date.now().toString();
  const method = 'POST';
  const url = `/sms/v2/services/${serviceId}/messages`;

  const signature = makeSignature(method, url, timestamp, accessKey, secretKey);

  const requestBody = {
    type: 'SMS',
    from: senderPhone.replace(/-/g, ''),
    content: params.message,
    messages: formattedRecipients,
  };

  try {
    const response = await fetch(`https://sens.apigw.ntruss.com${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': accessKey,
        'x-ncp-apigw-signature-v2': signature,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`NCP SENS API error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    return result as SendSMSResponse;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
}

/**
 * Validate phone number format (Korean)
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;

  // Remove hyphens
  const cleaned = phone.replace(/-/g, '');

  // Check if it's a valid Korean phone number (10 or 11 digits)
  return /^(01[0-9]|02|0[3-9]{1}[0-9]{1})[0-9]{3,4}[0-9]{4}$/.test(cleaned);
}

/**
 * Format phone number with hyphens
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  const cleaned = phone.replace(/-/g, '');

  // Mobile: 010-1234-5678
  if (cleaned.startsWith('01')) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  // Seoul: 02-123-4567 or 02-1234-5678
  if (cleaned.startsWith('02')) {
    if (cleaned.length === 9) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
  }

  // Other regions: 031-123-4567 or 031-1234-5678
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}
