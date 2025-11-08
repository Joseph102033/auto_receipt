/**
 * Admin Page: Laws Rules
 * Browse and manage curated checklist rules from laws_ruleset table
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://safe-ops-studio-workers.yosep102033.workers.dev';

interface ChecklistRule {
  id: number;
  law_id: string;
  law_name: string;
  path: string;
  title: string | null;
  requirement: string;
  checklist: string[];
  category: string;
  synonyms: string | null;
  penalty_ref: string | null;
  source_url: string | null;
  ruleset_version: string;
  created_at: string;
}

interface CategoryStats {
  category: string;
  count: number;
}

const CATEGORIES = ['추락', '끼임', '화학물질', '기계', '감전', '화재·폭발'];

export default function LawsRulesAdmin() {
  const [rules, setRules] = useState<ChecklistRule[]>([]);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [category, setCategory] = useState('');
  const [version, setVersion] = useState('');
  const [lawName, setLawName] = useState('');
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  // Fetch rules
  const fetchRules = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (category) params.set('category', category);
      if (version) params.set('version', version);
      if (lawName) params.set('law_name', lawName);

      const response = await fetch(`${API_BASE_URL}/api/laws-rules?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setRules(data.data.records);
        setTotal(data.data.total);
      } else {
        setError(data.error || 'Failed to fetch rules');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch category stats
  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (version) params.set('version', version);

      const response = await fetch(`${API_BASE_URL}/api/category-stats?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchRules();
    fetchStats();
  }, [offset, version]);

  const handleSearch = () => {
    setOffset(0);
    fetchRules();
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

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (version) params.set('version', version);
    params.set('limit', '1000');

    window.open(`${API_BASE_URL}/api/laws-rules.csv?${params.toString()}`, '_blank');
  };

  return (
    <>
      <Head>
        <title>체크리스트 룰셋 관리 | Safe OPS Studio Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">체크리스트 룰셋 관리</h1>
            <p className="text-gray-600">laws_ruleset 테이블의 큐레이션된 체크리스트 규칙을 관리합니다</p>
          </div>

          {/* Category Stats */}
          {stats.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">카테고리별 통계</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {stats.map((stat) => (
                  <div key={stat.category} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stat.count}</div>
                    <div className="text-sm text-gray-600">{stat.category}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.reduce((sum, s) => sum + s.count, 0)}</div>
                  <div className="text-sm text-gray-600">전체 규칙</div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">검색 필터</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">전체</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">버전</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="예: v1.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

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

            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? '검색 중...' : '검색'}
              </button>

              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                CSV 다운로드
              </button>
            </div>
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
              총 <span className="font-semibold text-gray-900">{total}</span>개 규칙 |
              현재 페이지: <span className="font-semibold">{offset + 1} ~ {Math.min(offset + limit, total)}</span>
            </p>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                        {rule.category}
                      </span>
                      <span className="text-sm text-gray-500">{rule.path}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {rule.title || rule.law_name}
                    </h3>
                    <p className="text-sm text-gray-600">{rule.law_name}</p>
                  </div>
                  <div className="text-sm text-gray-500">ID: {rule.id}</div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 요구사항</h4>
                  <p className="text-gray-900">{rule.requirement}</p>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">✅ 체크리스트</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {rule.checklist.map((item, idx) => (
                      <li key={idx} className="text-gray-900">{item}</li>
                    ))}
                  </ul>
                </div>

                {rule.synonyms && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">🔖 동의어</h4>
                    <p className="text-sm text-gray-600">{rule.synonyms}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div>버전: {rule.ruleset_version}</div>
                  <div>생성일: {new Date(rule.created_at).toLocaleDateString('ko-KR')}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {rules.length > 0 && (
            <div className="bg-white shadow rounded-lg px-4 py-3 flex items-center justify-between mt-6">
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
          )}
        </div>
      </div>
    </>
  );
}
