'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-grayscale-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-grayscale-900">문서 제출 관리 시스템</h1>
        <p className="text-grayscale-600 mt-2">로그인 페이지로 이동 중...</p>
      </div>
    </div>
  );
}

