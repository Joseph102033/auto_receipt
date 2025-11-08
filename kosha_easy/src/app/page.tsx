'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield, Upload, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-grayscale-900">KOSHA Easy</h1>
            </div>
            <Link href="/login">
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                관리자 로그인
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Main CTA */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-grayscale-900 mb-6">
              문서 제출 관리 시스템
            </h2>
            <p className="text-xl text-grayscale-600 mb-8">
              간편하고 안전한 문서 제출 및 관리 플랫폼
            </p>
            <Link href="/participant/rounds">
              <Button size="lg" className="text-lg px-8 py-6">
                <Upload className="h-5 w-5 mr-2" />
                문서 제출하기
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary-600" />
                </div>
                <CardTitle>간편한 제출</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  로그인 없이 빠르고 간편하게 문서를 제출할 수 있습니다
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-success-600" />
                </div>
                <CardTitle>실시간 확인</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  제출 현황을 실시간으로 확인하고 관리할 수 있습니다
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>안전한 보관</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  제출된 문서는 안전하게 암호화되어 보관됩니다
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border">
            <h3 className="text-2xl font-bold text-grayscale-900 mb-6 text-center">
              이용 방법
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h4 className="font-semibold text-grayscale-900 mb-2">차수 선택</h4>
                <p className="text-sm text-grayscale-600">
                  제출할 차수를 선택합니다
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h4 className="font-semibold text-grayscale-900 mb-2">문서 업로드</h4>
                <p className="text-sm text-grayscale-600">
                  필요한 문서를 업로드합니다
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h4 className="font-semibold text-grayscale-900 mb-2">제출 완료</h4>
                <p className="text-sm text-grayscale-600">
                  제출이 완료되었습니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-grayscale-600">
            <p>&copy; 2025 KOSHA Easy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

