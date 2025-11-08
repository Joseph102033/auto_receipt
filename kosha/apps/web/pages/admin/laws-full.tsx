/**
 * Admin Page: Laws Full
 * Browse and search all law articles from laws_full table
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://safe-ops-studio-workers.yosep102033.workers.dev';

interface LawFullRecord {
  id: number;
  law_id: string;
  law_name: string;
  article_no: string | null;
  clause_no: string | null;
  item_no: string | null;
  path: string;
  title: string | null;
  text: string;
  effective_date: string | null;
  last_amended_date: string | null;
  source_url: string | null;
  created_at: string;
}

export default function LawsFullAdmin() {
  const [records, setRecords] = useState<LawFullRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [lawName, setLawName] = useState('');
  const [lawId, setLawId] = useState('');
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  // Fetch records
  const fetchRecords = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (lawName) params.set('law_name', lawName);
      if (lawId) params.set('law_id', lawId);

      const response = await fetch(`${API_BASE_URL}/api/laws-full?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRecords(data.data.records);
        setTotal(data.data.total);
      } else {
        setError(data.error || 'Failed to fetch records');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [offset]);

  const handleSearch = () => {
    setOffset(0);
    fetchRecords();
  };

  const handlePrev = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleNext = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  return (
    <>
      <Head>
        <title>법령 전수 조회 | Safe OPS Studio Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">법령 전수 조회</h1>
            <p className="text-gray-600">laws_full 테이블의 모든 법령 조항을 조회합니다</p>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">검색 필터</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">법령명</label>
                <input
                  type="text"
                  value={lawName}
                  onChange={(e) => setLawName(e.target.value)}
                  placeholder="예: 산업안전보건법"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">법령 ID</label>
                <input
                  type="text"
                  value={lawId}
                  onChange={(e) => setLawId(e.target.value)}
                  placeholder="예: law-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">페이지당 항목 수</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '검색 중...' : '검색'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              총 <span className="font-semibold text-gray-900">{total}</span>개 조항 |
              현재 페이지: <span className="font-semibold">{offset + 1} ~ {Math.min(offset + limit, total)}</span>
            </p>
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">법령명</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">조항 경로</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">본문</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">시행일</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{record.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.law_name}</td>
                      <td className="px-4 py-3 text-sm font-mono text-blue-600">{record.path}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.title || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="max-w-md truncate" title={record.text}>
                          {record.text}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.effective_date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
              <button
                onClick={handlePrev}
                disabled={offset === 0}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                이전
              </button>

              <span className="text-sm text-gray-700">
                페이지 {Math.floor(offset / limit) + 1} / {Math.ceil(total / limit)}
              </span>

              <button
                onClick={handleNext}
                disabled={offset + limit >= total}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
