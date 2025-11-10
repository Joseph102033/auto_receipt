/**
 * Aligo SMS Service
 * https://smartsms.aligo.in/
 */

export interface SendSMSParams {
  to: string | string[];
  message: string;
  from?: string;
  title?: string; // LMS/MMS 제목
}

export interface AligoResponse {
  result_code: string; // "1" = 성공
  message: string;
  msg_id?: string;
  success_cnt?: number;
  error_cnt?: number;
  msg_type?: string; // "SMS" | "LMS" | "MMS"
}

/**
 * Send SMS using Aligo API
 */
export async function sendSMS(params: SendSMSParams): Promise<AligoResponse> {
  const apiKey = process.env.ALIGO_API_KEY;
  const userId = process.env.ALIGO_USER_ID;
  const senderPhone = params.from || process.env.ALIGO_SENDER_PHONE;
  const testMode = process.env.ALIGO_TEST_MODE === 'true' ? 'Y' : 'N';

  // Validation
  if (!apiKey || !userId || !senderPhone) {
    throw new Error(
      'Aligo configuration is missing. Please check environment variables (ALIGO_API_KEY, ALIGO_USER_ID, ALIGO_SENDER_PHONE).'
    );
  }

  // Prepare recipients
  const recipients = Array.isArray(params.to) ? params.to : [params.to];

  // Filter out empty phone numbers
  const validRecipients = recipients.filter((phone) => phone && phone.trim() !== '');

  if (validRecipients.length === 0) {
    throw new Error('No valid recipient phone numbers provided');
  }

  // Format phone numbers (remove hyphens) and join with comma
  const receiverNumbers = validRecipients.map((phone) => phone.replace(/-/g, '')).join(',');

  // Determine message type based on length
  // SMS: 90 bytes (한글 45자, 영문 90자)
  // LMS: 2000 bytes (한글 1000자, 영문 2000자)
  const messageBytes = Buffer.byteLength(params.message, 'utf8');
  const msgType = messageBytes > 90 ? 'LMS' : 'SMS';

  // Prepare form data
  const formData = new URLSearchParams();
  formData.append('key', apiKey);
  formData.append('user_id', userId);
  formData.append('sender', senderPhone.replace(/-/g, ''));
  formData.append('receiver', receiverNumbers);
  formData.append('msg', params.message);
  formData.append('msg_type', msgType);
  formData.append('testmode_yn', testMode);

  // Add title for LMS
  if (msgType === 'LMS' && params.title) {
    formData.append('title', params.title);
  }

  try {
    const response = await fetch('https://apis.aligo.in/send/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Aligo API error: ${response.status} - ${errorText}`);
    }

    const result = (await response.json()) as AligoResponse;

    // Check result code
    if (result.result_code !== '1') {
      throw new Error(`Aligo API failed: ${result.message}`);
    }

    return result;
  } catch (error) {
    console.error('Failed to send SMS via Aligo:', error);
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

/**
 * Get remaining SMS balance from Aligo
 */
export async function getSMSBalance(): Promise<number> {
  const apiKey = process.env.ALIGO_API_KEY;
  const userId = process.env.ALIGO_USER_ID;

  if (!apiKey || !userId) {
    throw new Error('Aligo configuration is missing');
  }

  const formData = new URLSearchParams();
  formData.append('key', apiKey);
  formData.append('user_id', userId);

  try {
    const response = await fetch('https://apis.aligo.in/remain/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (result.result_code === '1') {
      return parseInt(result.SMS_CNT || '0', 10);
    }

    throw new Error(`Failed to get SMS balance: ${result.message}`);
  } catch (error) {
    console.error('Failed to get SMS balance:', error);
    throw error;
  }
}
