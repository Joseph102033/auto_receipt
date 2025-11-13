/**
 * Solapi (구 Coolsms) SMS Service
 * https://solapi.com/
 */

import crypto from 'crypto';

export interface SendSMSParams {
  to: string | string[];
  message: string;
  from?: string;
  subject?: string; // LMS/MMS 제목
}

export interface SolapiMessage {
  to: string;
  from: string;
  text: string;
  type?: 'SMS' | 'LMS' | 'MMS';
  subject?: string;
}

export interface SolapiResponse {
  groupId: string;
  to: string;
  from: string;
  type: string;
  statusMessage: string;
  country: string;
  messageId: string;
  statusCode: string;
  accountId: string;
}

export interface SolapiBatchResponse {
  groupId: string;
  count: {
    total: number;
    sentTotal: number;
    sentFailed: number;
    sentSuccess: number;
    sentPending: number;
    sentReplacement: number;
    refund: number;
    registeredFailed: number;
    registeredSuccess: number;
  };
  accountId: string;
}

/**
 * Generate random salt for Solapi API authentication
 */
function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get authentication signature for Solapi API
 * Signature = HMAC-SHA256(dateTime + salt, apiSecret)
 */
function getSignature(apiSecret: string, dateTime: string, salt: string): string {
  const hmac = crypto.createHmac('sha256', apiSecret);
  hmac.update(dateTime + salt);
  return hmac.digest('hex');
}

/**
 * Send SMS using Solapi API
 */
export async function sendSMS(params: SendSMSParams): Promise<SolapiBatchResponse> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const senderPhone = params.from || process.env.SOLAPI_SENDER_PHONE;

  // Validation
  if (!apiKey || !apiSecret || !senderPhone) {
    throw new Error(
      'Solapi configuration is missing. Please check environment variables (SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER_PHONE).'
    );
  }

  // Prepare recipients
  const recipients = Array.isArray(params.to) ? params.to : [params.to];

  // Filter out empty phone numbers
  const validRecipients = recipients.filter((phone) => phone && phone.trim() !== '');

  if (validRecipients.length === 0) {
    throw new Error('No valid recipient phone numbers provided');
  }

  // Determine message type based on length
  // SMS: 90 bytes (한글 45자, 영문 90자)
  // LMS: 2000 bytes (한글 1000자, 영문 2000자)
  const messageBytes = Buffer.byteLength(params.message, 'utf8');
  const msgType = messageBytes > 90 ? 'LMS' : 'SMS';

  // Prepare messages array
  const messages: SolapiMessage[] = validRecipients.map((phone) => {
    const message: SolapiMessage = {
      to: phone.replace(/-/g, ''),
      from: senderPhone.replace(/-/g, ''),
      text: params.message,
      type: msgType,
    };

    // Add subject for LMS
    if (msgType === 'LMS' && params.subject) {
      message.subject = params.subject;
    }

    return message;
  });

  // Generate authentication
  const dateTime = new Date().toISOString(); // ISO 8601 format
  const salt = generateSalt();
  const signature = getSignature(apiSecret, dateTime, salt);

  // Prepare request body
  const requestBody = {
    messages,
  };

  try {
    const response = await fetch('https://api.solapi.com/messages/v4/send-many', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${dateTime}, salt=${salt}, signature=${signature}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Solapi API error: ${response.status} - ${errorData.errorMessage || JSON.stringify(errorData)}`
      );
    }

    const result = (await response.json()) as SolapiBatchResponse;
    return result;
  } catch (error) {
    console.error('Failed to send SMS via Solapi:', error);
    throw error;
  }
}

/**
 * Send single SMS (simplified version)
 */
export async function sendSingleSMS(params: SendSMSParams): Promise<SolapiResponse> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const senderPhone = params.from || process.env.SOLAPI_SENDER_PHONE;

  if (!apiKey || !apiSecret || !senderPhone) {
    throw new Error('Solapi configuration is missing');
  }

  const to = Array.isArray(params.to) ? params.to[0] : params.to;

  // Determine message type
  const messageBytes = Buffer.byteLength(params.message, 'utf8');
  const msgType = messageBytes > 90 ? 'LMS' : 'SMS';

  const message: SolapiMessage = {
    to: to.replace(/-/g, ''),
    from: senderPhone.replace(/-/g, ''),
    text: params.message,
    type: msgType,
  };

  if (msgType === 'LMS' && params.subject) {
    message.subject = params.subject;
  }

  const dateTime = new Date().toISOString(); // ISO 8601 format
  const salt = generateSalt();
  const signature = getSignature(apiSecret, dateTime, salt);

  const requestBody = {
    message,
  };

  try {
    const response = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${dateTime}, salt=${salt}, signature=${signature}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Solapi API error: ${response.status} - ${errorData.errorMessage || JSON.stringify(errorData)}`
      );
    }

    const result = (await response.json()) as SolapiResponse;
    return result;
  } catch (error) {
    console.error('Failed to send single SMS via Solapi:', error);
    throw error;
  }
}

/**
 * Get SMS balance from Solapi
 */
export async function getSMSBalance(): Promise<number> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Solapi configuration is missing');
  }

  const dateTime = new Date().toISOString(); // ISO 8601 format
  const salt = generateSalt();
  const signature = getSignature(apiSecret, dateTime, salt);

  try {
    const response = await fetch('https://api.solapi.com/cash/v1/balance', {
      method: 'GET',
      headers: {
        Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${dateTime}, salt=${salt}, signature=${signature}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get balance: ${errorData.errorMessage}`);
    }

    const result = await response.json();
    return parseInt(result.balance || '0', 10);
  } catch (error) {
    console.error('Failed to get SMS balance:', error);
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
