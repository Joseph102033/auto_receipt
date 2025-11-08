'use client';

import { useState, use as usePromise, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ParticipantLayout } from '@/components/layout/participant-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/ui/file-upload';
import { useRound } from '@/features/rounds/hooks/useRounds';
import { useCreateSubmission } from '@/features/submissions/hooks/useSubmissions';
import { Upload, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface DocumentSubmission {
  documentName: string;
  file: File | null;
  notApplicable: boolean;
  notApplicableReason?: string;
}

export default function ParticipantSubmitPage(props: { params: Promise<{ id: string }> }) {
  const { id: roundId } = usePromise(props.params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const participantId = searchParams.get('participantId');
  const participantName = searchParams.get('participantName');

  const { data: round, isLoading: loadingRound } = useRound(roundId);
  const createSubmission = useCreateSubmission();

  const [documentSubmissions, setDocumentSubmissions] = useState<Record<string, DocumentSubmission>>({});
  const [amountTransport, setAmountTransport] = useState('');
  const [amountAccommodation, setAmountAccommodation] = useState('');
  const [amountEtc, setAmountEtc] = useState('0');
  const [amountNote, setAmountNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize document submissions when round data is loaded
  useEffect(() => {
    if (round?.requiredDocuments) {
      const initial: Record<string, DocumentSubmission> = {};
      round.requiredDocuments.forEach((doc) => {
        initial[doc] = {
          documentName: doc,
          file: null,
          notApplicable: false,
        };
      });
      setDocumentSubmissions(initial);
    }
  }, [round]);

  const handleFileChange = (documentName: string, file: File) => {
    setDocumentSubmissions((prev) => ({
      ...prev,
      [documentName]: {
        ...prev[documentName],
        file,
        notApplicable: false,
      },
    }));
  };

  const handleNotApplicableChange = (documentName: string, checked: boolean) => {
    setDocumentSubmissions((prev) => ({
      ...prev,
      [documentName]: {
        ...prev[documentName],
        file: checked ? null : prev[documentName].file,
        notApplicable: checked,
      },
    }));
  };

  const handleReasonChange = (documentName: string, reason: string) => {
    setDocumentSubmissions((prev) => ({
      ...prev,
      [documentName]: {
        ...prev[documentName],
        notApplicableReason: reason,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!round) return;
    if (!participantId) {
      alert('참석자 정보가 없습니다. 참석자 명단에서 다시 선택해주세요.');
      return;
    }

    // Validation
    const allDocumentsHandled = Object.values(documentSubmissions).every(
      (doc) => doc.file !== null || doc.notApplicable
    );

    if (!allDocumentsHandled) {
      alert('모든 문서에 대해 파일을 업로드하거나 "해당 없음"을 선택해주세요.');
      return;
    }

    // Validate amounts
    if (!amountTransport || !amountAccommodation) {
      alert('운임과 숙박비는 필수 입력 항목입니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit each document
      const promises = Object.values(documentSubmissions).map((doc) => {
        return createSubmission.mutateAsync({
          roundId,
          participantId, // Use participantId from URL params
          documentName: doc.documentName,
          file: doc.file,
          status: doc.notApplicable ? 'not_applicable' : 'submitted',
          notApplicableReason: doc.notApplicableReason,
          amountTransport: parseInt(amountTransport),
          amountAccommodation: parseInt(amountAccommodation),
          amountEtc: parseInt(amountEtc),
          amountNote,
        });
      });

      await Promise.all(promises);

      alert('문서가 성공적으로 제출되었습니다.');
      router.push(`/participant/rounds/${roundId}`);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('문서 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingRound) {
    return (
      <ParticipantLayout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-grayscale-600">차수 정보를 불러오는 중...</p>
        </div>
      </ParticipantLayout>
    );
  }

  if (!round) {
    return (
      <ParticipantLayout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-red-600">차수를 찾을 수 없습니다</p>
        </div>
      </ParticipantLayout>
    );
  }

  return (
    <ParticipantLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link href={`/participant/rounds/${roundId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            참석자 명단으로
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-grayscale-900">{round.title}</h1>
          <p className="text-grayscale-600 mt-1">{round.description}</p>
          {participantName && (
            <p className="text-lg font-medium text-primary mt-2">
              제출자: {participantName}
            </p>
          )}
          <p className="text-sm text-grayscale-500 mt-1">
            마감: {format(new Date(round.endDate), 'yyyy-MM-dd')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Information */}
          <Card>
            <CardHeader>
              <CardTitle>금액 정보</CardTitle>
              <CardDescription>운임, 숙박비, 기타 금액을 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amountTransport">
                    운임 <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="amountTransport"
                    type="number"
                    value={amountTransport}
                    onChange={(e) => setAmountTransport(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amountAccommodation">
                    숙박비 <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="amountAccommodation"
                    type="number"
                    value={amountAccommodation}
                    onChange={(e) => setAmountAccommodation(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amountEtc">기타</Label>
                  <Input
                    id="amountEtc"
                    type="number"
                    value={amountEtc}
                    onChange={(e) => setAmountEtc(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountNote">금액 메모 (선택)</Label>
                <Textarea
                  id="amountNote"
                  value={amountNote}
                  onChange={(e) => setAmountNote(e.target.value)}
                  placeholder="금액 관련 특이사항을 입력하세요"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Document Submissions */}
          {round.requiredDocuments.map((documentName) => {
            const submission = documentSubmissions[documentName] || {
              documentName,
              file: null,
              notApplicable: false,
            };

            return (
              <Card key={documentName}>
                <CardHeader>
                  <CardTitle className="text-lg">{documentName}</CardTitle>
                  <CardDescription>
                    파일을 업로드하거나 해당 없음을 선택하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>파일 업로드</Label>
                    <FileUpload
                      onFileChange={(file) => handleFileChange(documentName, file)}
                      accept=".pdf,.doc,.docx,.hwp,.jpg,.jpeg,.png"
                      className={submission.notApplicable ? 'opacity-50 pointer-events-none' : ''}
                    >
                      <div className="flex flex-col items-center justify-center py-8">
                        {submission.file ? (
                          <>
                            <FileText className="h-12 w-12 text-primary mb-2" />
                            <p className="text-sm font-medium text-grayscale-900">
                              {submission.file.name}
                            </p>
                            <p className="text-xs text-grayscale-500 mt-1">
                              용량: {(submission.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 text-grayscale-400 mb-2" />
                            <p className="text-sm text-grayscale-600">
                              클릭하여 파일을 선택하세요
                            </p>
                            <p className="text-xs text-grayscale-500 mt-1">
                              PDF, DOC, DOCX, HWP, JPG, PNG 파일 업로드 가능
                            </p>
                          </>
                        )}
                      </div>
                    </FileUpload>
                  </div>

                  {/* Not Applicable Option */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`notApplicable-${documentName}`}
                        checked={submission.notApplicable}
                        onCheckedChange={(checked) =>
                          handleNotApplicableChange(documentName, !!checked)
                        }
                      />
                      <Label htmlFor={`notApplicable-${documentName}`}>해당 없음</Label>
                    </div>

                    {submission.notApplicable && (
                      <div className="space-y-2">
                        <Label htmlFor={`reason-${documentName}`}>사유 (선택)</Label>
                        <Textarea
                          id={`reason-${documentName}`}
                          value={submission.notApplicableReason || ''}
                          onChange={(e) => handleReasonChange(documentName, e.target.value)}
                          placeholder="해당 없음 사유를 입력하세요"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>

                  {/* Validation Message */}
                  {!submission.file && !submission.notApplicable && (
                    <p className="text-sm text-red-600">
                      파일 업로드 또는 해당 없음 선택이 필요합니다
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/participant/rounds/${roundId}`)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? '제출 중...' : '제출하기'}
            </Button>
          </div>
        </form>
      </div>
    </ParticipantLayout>
  );
}
