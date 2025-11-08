/**
 * Law ETL API Handlers
 * Provides read-only access to laws_full and laws_ruleset tables
 */

import { Env } from '../index';

// ============================================================================
// Types
// ============================================================================

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

interface ChecklistRule {
  id: number;
  law_id: string;
  law_name: string;
  path: string;
  title: string | null;
  requirement: string;
  checklist: string; // JSON string
  category: string;
  synonyms: string | null;
  penalty_ref: string | null;
  source_url: string | null;
  ruleset_version: string;
  created_at: string;
}

interface RulesetMeta {
  version: string;
  note: string | null;
  created_at: string;
}

// ============================================================================
// Laws Full Handlers
// ============================================================================

/**
 * Get all law articles from laws_full table
 */
export async function handleGetLawsFull(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const lawName = url.searchParams.get('law_name');
    const lawId = url.searchParams.get('law_id');

    // Build query
    let query = 'SELECT * FROM laws_full WHERE 1=1';
    const params: any[] = [];

    if (lawName) {
      query += ' AND law_name = ?';
      params.push(lawName);
    }

    if (lawId) {
      query += ' AND law_id = ?';
      params.push(lawId);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Execute query
    const result = await env.DB.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM laws_full WHERE 1=1';
    const countParams: any[] = [];

    if (lawName) {
      countQuery += ' AND law_name = ?';
      countParams.push(lawName);
    }

    if (lawId) {
      countQuery += ' AND law_id = ?';
      countParams.push(lawId);
    }

    const countResult = await env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>();
    const total = countResult?.total || 0;

    return Response.json({
      success: true,
      data: {
        records: result.results || [],
        total,
        limit,
        offset,
      },
    });

  } catch (error) {
    console.error('Get laws full error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get law articles',
    }, { status: 500 });
  }
}

// ============================================================================
// Laws Ruleset Handlers
// ============================================================================

/**
 * Get curated checklist rules from laws_ruleset table
 */
export async function handleGetLawsRules(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const category = url.searchParams.get('category');
    const version = url.searchParams.get('version');
    const lawName = url.searchParams.get('law_name');

    // Build query
    let query = 'SELECT * FROM laws_ruleset WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (version) {
      query += ' AND ruleset_version = ?';
      params.push(version);
    }

    if (lawName) {
      query += ' AND law_name = ?';
      params.push(lawName);
    }

    query += ' ORDER BY category, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Execute query
    const result = await env.DB.prepare(query).bind(...params).all();

    // Parse checklist JSON
    const records = (result.results || []).map((record: any) => ({
      ...record,
      checklist: JSON.parse(record.checklist || '[]'),
    }));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM laws_ruleset WHERE 1=1';
    const countParams: any[] = [];

    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (version) {
      countQuery += ' AND ruleset_version = ?';
      countParams.push(version);
    }

    if (lawName) {
      countQuery += ' AND law_name = ?';
      countParams.push(lawName);
    }

    const countResult = await env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>();
    const total = countResult?.total || 0;

    return Response.json({
      success: true,
      data: {
        records,
        total,
        limit,
        offset,
      },
    });

  } catch (error) {
    console.error('Get laws rules error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get checklist rules',
    }, { status: 500 });
  }
}

/**
 * Export checklist rules as CSV
 */
export async function handleExportRulesCSV(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '1000');
    const category = url.searchParams.get('category');
    const version = url.searchParams.get('version');

    // Build query
    let query = 'SELECT * FROM laws_ruleset WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (version) {
      query += ' AND ruleset_version = ?';
      params.push(version);
    }

    query += ' ORDER BY category, id LIMIT ?';
    params.push(limit);

    // Execute query
    const result = await env.DB.prepare(query).bind(...params).all();
    const records = result.results || [];

    // Generate CSV
    const csv = generateCSV(records as ChecklistRule[]);

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="laws_ruleset_${Date.now()}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export rules CSV error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export CSV',
    }, { status: 500 });
  }
}

/**
 * Generate CSV from checklist rules
 */
function generateCSV(records: ChecklistRule[]): string {
  const lines: string[] = [];

  // Header
  lines.push([
    'ID',
    '법령ID',
    '법령명',
    '조항경로',
    '제목',
    '요구사항',
    '체크리스트',
    '카테고리',
    '동의어',
    '벌칙참조',
    '원문URL',
    '버전',
    '생성일시',
  ].join(','));

  // Rows
  for (const record of records) {
    const checklist = JSON.parse(record.checklist || '[]').join('; ');

    lines.push([
      record.id,
      escapeCSV(record.law_id),
      escapeCSV(record.law_name),
      escapeCSV(record.path),
      escapeCSV(record.title || ''),
      escapeCSV(record.requirement),
      escapeCSV(checklist),
      escapeCSV(record.category),
      escapeCSV(record.synonyms || ''),
      escapeCSV(record.penalty_ref || ''),
      escapeCSV(record.source_url || ''),
      escapeCSV(record.ruleset_version),
      escapeCSV(record.created_at),
    ].join(','));
  }

  // Add BOM for Excel UTF-8 support
  return '\uFEFF' + lines.join('\n');
}

/**
 * Escape CSV field
 */
function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

// ============================================================================
// Ruleset Metadata Handlers
// ============================================================================

/**
 * Get ruleset metadata
 */
export async function handleGetRulesetMeta(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const version = url.searchParams.get('version');

    let query: string;
    const params: any[] = [];

    if (version) {
      query = 'SELECT * FROM ruleset_meta WHERE version = ?';
      params.push(version);
    } else {
      query = 'SELECT * FROM ruleset_meta ORDER BY created_at DESC';
    }

    const result = await env.DB.prepare(query).bind(...params).all();

    return Response.json({
      success: true,
      data: result.results || [],
    });

  } catch (error) {
    console.error('Get ruleset meta error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get ruleset metadata',
    }, { status: 500 });
  }
}

/**
 * Get category statistics
 */
export async function handleGetCategoryStats(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const version = url.searchParams.get('version');

    let query = `
      SELECT
        category,
        COUNT(*) as count
      FROM laws_ruleset
    `;

    const params: any[] = [];

    if (version) {
      query += ' WHERE ruleset_version = ?';
      params.push(version);
    }

    query += ' GROUP BY category ORDER BY count DESC';

    const result = await env.DB.prepare(query).bind(...params).all();

    return Response.json({
      success: true,
      data: result.results || [],
    });

  } catch (error) {
    console.error('Get category stats error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get category statistics',
    }, { status: 500 });
  }
}
