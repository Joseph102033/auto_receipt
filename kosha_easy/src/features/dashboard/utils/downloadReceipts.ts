/**
 * Batch download receipts utility
 * Downloads all receipt files for a round and packages them as a zip
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { SubmissionWithParticipant } from '@/features/submissions/types';
import { format } from 'date-fns';

/**
 * Download all receipts for a round as a zip file
 */
export async function downloadReceiptsAsZip(
  submissions: SubmissionWithParticipant[],
  roundTitle: string
): Promise<void> {
  const zip = new JSZip();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Filter submissions with files
  const submissionsWithFiles = submissions.filter(
    (s) => s.status === 'submitted' && s.fileUrl
  );

  if (submissionsWithFiles.length === 0) {
    throw new Error('다운로드할 영수증이 없습니다.');
  }

  // Download each file and add to zip
  const downloadPromises = submissionsWithFiles.map(async (submission) => {
    try {
      // Fetch file from URL
      const response = await fetch(submission.fileUrl!);
      if (!response.ok) {
        console.error(`Failed to download file for ${submission.participant.name}`);
        return;
      }

      const blob = await response.blob();

      // Extract file extension from URL or blob type
      const fileExtension = getFileExtension(submission.fileUrl!, blob.type);

      // Format filename: 날짜_차수명_참가자명_구분.확장자
      const filename = `${today}_${roundTitle}_${submission.participant.name}_${submission.documentName}.${fileExtension}`;

      // Add to zip
      zip.file(filename, blob);
    } catch (error) {
      console.error(`Error downloading file for ${submission.participant.name}:`, error);
    }
  });

  // Wait for all downloads
  await Promise.all(downloadPromises);

  // Generate zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Download zip
  const zipFilename = `${today}_${roundTitle}_영수증.zip`;
  saveAs(zipBlob, zipFilename);
}

/**
 * Extract file extension from URL or MIME type
 */
function getFileExtension(url: string, mimeType: string): string {
  // Try to extract from URL first
  const urlParts = url.split('.');
  if (urlParts.length > 1) {
    const ext = urlParts[urlParts.length - 1].split('?')[0];
    if (ext && ext.length <= 5) {
      return ext;
    }
  }

  // Fallback to MIME type
  const mimeToExt: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.hancom.hwp': 'hwp',
  };

  return mimeToExt[mimeType] || 'file';
}

/**
 * Download a single receipt file with formatted name
 */
export async function downloadSingleReceipt(
  submission: SubmissionWithParticipant,
  roundTitle: string
): Promise<void> {
  if (!submission.fileUrl) {
    throw new Error('파일 URL이 없습니다.');
  }

  try {
    const response = await fetch(submission.fileUrl);
    if (!response.ok) {
      throw new Error('파일 다운로드 실패');
    }

    const blob = await response.blob();
    const fileExtension = getFileExtension(submission.fileUrl, blob.type);
    const today = format(new Date(), 'yyyy-MM-dd');
    const filename = `${today}_${roundTitle}_${submission.participant.name}_${submission.documentName}.${fileExtension}`;

    saveAs(blob, filename);
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('파일 다운로드에 실패했습니다.');
  }
}
