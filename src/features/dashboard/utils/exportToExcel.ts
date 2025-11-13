/**
 * Excel Export Utility
 *
 * Utility functions for exporting data to Excel
 */

import * as XLSX from 'xlsx';

interface ParticipantSubmission {
  name: string;
  email: string;
  department?: string;
  position?: string;
  status: string;
  submittedAt?: string;
}

/**
 * Export participant submissions to Excel
 */
export function exportParticipantsToExcel(
  participants: ParticipantSubmission[],
  roundTitle: string
) {
  // Prepare data for Excel
  const data = participants.map((p) => ({
    이름: p.name,
    이메일: p.email,
    부서: p.department || '-',
    직급: p.position || '-',
    상태: getStatusText(p.status),
    제출일: p.submittedAt || '-',
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 15 }, // 이름
    { wch: 30 }, // 이메일
    { wch: 15 }, // 부서
    { wch: 15 }, // 직급
    { wch: 15 }, // 상태
    { wch: 20 }, // 제출일
  ];
  worksheet['!cols'] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '제출 현황');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${roundTitle}_제출현황_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
}

/**
 * Export detailed statistics to Excel
 */
export function exportStatisticsToExcel(
  stats: {
    total: number;
    submitted: number;
    notSubmitted: number;
    notApplicable: number;
    submissionRate: number;
  },
  departmentStats: Array<{
    department: string;
    total: number;
    submitted: number;
    notSubmitted: number;
  }>,
  roundTitle: string
) {
  // Overall statistics
  const overallStats = [
    { 항목: '전체 참여자', 값: stats.total },
    { 항목: '제출 완료', 값: stats.submitted },
    { 항목: '미제출', 값: stats.notSubmitted },
    { 항목: '해당 없음', 값: stats.notApplicable },
    { 항목: '제출률', 값: `${stats.submissionRate}%` },
  ];

  // Department statistics
  const deptStats = departmentStats.map((d) => ({
    부서: d.department,
    전체: d.total,
    '제출 완료': d.submitted,
    미제출: d.notSubmitted,
    제출률: `${((d.submitted / d.total) * 100).toFixed(1)}%`,
  }));

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Add overall statistics sheet
  const overallSheet = XLSX.utils.json_to_sheet(overallStats);
  XLSX.utils.book_append_sheet(workbook, overallSheet, '전체 통계');

  // Add department statistics sheet
  const deptSheet = XLSX.utils.json_to_sheet(deptStats);
  XLSX.utils.book_append_sheet(workbook, deptSheet, '부서별 통계');

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${roundTitle}_통계_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
}

/**
 * Export receipt summary to Excel
 *
 * Exports aggregated receipt data with budget codes in the format:
 * 연번 | 차수명 | 날짜 | 구분 | 예산코드 | 참가자명 | 금액
 */
export function exportReceiptSummaryToExcel(
  receiptData: Array<{
    participantName: string;
    amountTransport: number;
    amountAccommodation: number;
  }>,
  roundInfo: {
    title: string;
    startDate: string;
    endDate: string;
    budgetCodeTransport?: string;
    budgetCodeAccommodation?: string;
  }
) {
  // Prepare data rows
  const data: any[] = [];
  let rowNumber = 1;

  // Format date range
  const dateRange = `${roundInfo.startDate} ~ ${roundInfo.endDate}`;

  // Create rows for each participant (2 rows per participant: transport + accommodation)
  receiptData.forEach((item) => {
    // Transport row (운임/여비)
    if (item.amountTransport > 0) {
      data.push({
        연번: rowNumber++,
        차수명: roundInfo.title,
        날짜: dateRange,
        구분: '여비',
        예산코드: roundInfo.budgetCodeTransport || '',
        참가자명: item.participantName,
        금액: item.amountTransport,
      });
    }

    // Accommodation row (숙박비)
    if (item.amountAccommodation > 0) {
      data.push({
        연번: rowNumber++,
        차수명: roundInfo.title,
        날짜: dateRange,
        구분: '숙박',
        예산코드: roundInfo.budgetCodeAccommodation || '',
        참가자명: item.participantName,
        금액: item.amountAccommodation,
      });
    }
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 8 },  // 연번
    { wch: 25 }, // 차수명
    { wch: 25 }, // 날짜
    { wch: 12 }, // 구분
    { wch: 20 }, // 예산코드
    { wch: 15 }, // 참가자명
    { wch: 12 }, // 금액
  ];
  worksheet['!cols'] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '영수증 취합');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${roundInfo.title}_영수증취합_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
}

/**
 * Helper function to convert status to Korean text
 */
function getStatusText(status: string): string {
  switch (status) {
    case 'submitted':
      return '제출 완료';
    case 'not_submitted':
      return '미제출';
    case 'not_applicable':
      return '해당 없음';
    default:
      return status;
  }
}
