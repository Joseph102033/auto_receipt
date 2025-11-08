'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useBulkImportParticipants } from '../hooks/useParticipants';
import { BulkImportParticipant } from '../types';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkImportDialog({ open, onOpenChange }: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<BulkImportParticipant[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const bulkImportMutation = useBulkImportParticipants();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());

        if (lines.length < 2) {
          setErrors(['CSV 파일이 비어있거나 헤더만 있습니다']);
          return;
        }

        // Parse CSV (simple parser, assuming comma-separated)
        const data: BulkImportParticipant[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim());
          if (values.length >= 2) {
            data.push({
              name: values[0],
              email: values[1],
              phone: values[2] || undefined,
              department: values[3] || undefined,
              position: values[4] || undefined,
            });
          }
        }

        setParsedData(data);
      } catch (error) {
        setErrors(['CSV 파일 파싱에 실패했습니다']);
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      setErrors(['업로드할 데이터가 없습니다']);
      return;
    }

    try {
      const result = await bulkImportMutation.mutateAsync(parsedData);
      if (result.failed === 0) {
        onOpenChange(false);
        setFile(null);
        setParsedData([]);
      } else {
        setErrors(result.errors);
      }
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>참여자 일괄 등록</DialogTitle>
          <DialogDescription>
            CSV 파일로 여러 참여자를 한번에 등록할 수 있습니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* CSV Format Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">CSV 파일 형식</p>
                  <p>이름,이메일,전화번호,부서,직급</p>
                  <p className="text-xs mt-1">예: 홍길동,hong@example.com,010-1234-5678,개발팀,팀장</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Input */}
          <div className="space-y-2">
            <label htmlFor="csv-file" className="block text-sm font-medium">
              CSV 파일 선택
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-grayscale-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary-dark"
            />
          </div>

          {/* Preview */}
          {parsedData.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium">미리보기: {parsedData.length}명</p>
                </div>
                <div className="max-h-40 overflow-y-auto text-sm">
                  {parsedData.slice(0, 5).map((p, i) => (
                    <div key={i} className="py-1 border-b border-grayscale-100">
                      {p.name} ({p.email})
                    </div>
                  ))}
                  {parsedData.length > 5 && (
                    <p className="text-xs text-grayscale-500 mt-2">외 {parsedData.length - 5}명...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <p className="text-sm font-medium text-red-800 mb-2">오류</p>
                <div className="text-sm text-red-600 space-y-1 max-h-32 overflow-y-auto">
                  {errors.map((error, i) => (
                    <p key={i}>• {error}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button
              onClick={handleImport}
              disabled={parsedData.length === 0 || bulkImportMutation.isPending}
            >
              {bulkImportMutation.isPending ? '등록 중...' : '일괄 등록'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
