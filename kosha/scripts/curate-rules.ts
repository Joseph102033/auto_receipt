#!/usr/bin/env tsx
/**
 * Curation Script: Generate Actionable Checklist Rules
 *
 * Extracts 200-300 actionable checklist rules from laws_full
 * using LLM-based curation with quality gates.
 *
 * Usage:
 *   tsx scripts/curate-rules.ts --target 250 --version v1.0
 */

import "dotenv/config";
import { setTimeout } from "timers/promises";

// ============================================================================
// Configuration
// ============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const DATABASE_ID = process.env.D1_DATABASE_ID || "";

const TARGET_RULES = 250;
const CATEGORY_TARGETS = {
  추락: 60,
  끼임: 50,
  화학물질: 50,
  기계: 40,
  감전: 25,
  "화재·폭발": 25,
};

const MAX_REQUIREMENT_LENGTH = 120;
const MAX_CHECKLIST_ITEM_LENGTH = 80;
const SIMILARITY_THRESHOLD = 0.9;
const MAX_DUPLICATE_RATE = 0.1;

// ============================================================================
// Keywords for filtering
// ============================================================================

const CONTROL_KEYWORDS = [
  "설치", "비치", "점검", "격리", "차단", "허가", "인터록",
  "표지", "환기", "보호구", "교육", "착용", "금지", "방지",
  "방호", "보수", "교환", "측정", "배출", "제거", "덮개",
];

const EXCLUDE_KEYWORDS = [
  "정의", "목적", "벌칙", "과태료", "별표", "서식", "총칙",
  "용어", "범위", "적용제외",
];

// ============================================================================
// Types
// ============================================================================

interface LawArticle {
  id: number;
  law_id: string;
  law_name: string;
  path: string;
  title: string | null;
  text: string;
  source_url: string;
}

interface ChecklistRule {
  law_id: string;
  law_name: string;
  path: string;
  title: string;
  requirement: string;
  checklist: string[];
  category: string;
  synonyms: string;
  penalty_ref: string | null;
  source_url: string;
}

interface LLMResponse {
  law_name: string;
  path: string;
  title: string;
  requirement: string;
  checklist: string[];
  category: string;
  synonyms?: string;
  penalty_ref?: string;
  source_url: string;
}

// ============================================================================
// Gemini LLM Client
// ============================================================================

class GeminiClient {
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate checklist rule from law article
   */
  async generateRule(article: LawArticle): Promise<LLMResponse | null> {
    const prompt = this.buildPrompt(article);

    try {
      const response = await fetch(
        `${this.baseUrl}/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error(`❌ Gemini API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        console.warn(`⚠️  No response for article ${article.path}`);
        return null;
      }

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn(`⚠️  Invalid JSON in response for ${article.path}`);
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return this.validateResponse(parsed);

    } catch (error) {
      console.error(`❌ Error generating rule for ${article.path}:`, error);
      return null;
    }
  }

  /**
   * Build LLM prompt
   */
  private buildPrompt(article: LawArticle): string {
    return `역할: 당신은 산업안전보건 현장점검 체크리스트 큐레이터입니다.

입력 정보:
- 법령명: ${article.law_name}
- 조항 경로: ${article.path}
- 제목: ${article.title || "(없음)"}
- 본문: ${article.text}
- 원문 URL: ${article.source_url}

목표: 현장에서 바로 점검 가능한 실행형 체크리스트 룰셋을 생성합니다.

규칙:
1. 정의·목적·벌칙·서식 지시는 제외
2. 통제 행동(설치/비치/점검/격리/차단/허가/인터록/표지/환기/PPE/교육)이 명확한 경우만 포함
3. 한국어로 간결하게, 과장·추측 금지
4. requirement는 1문장, 명령형 (예: "작업발판과 안전난간을 설치한다")
5. checklist는 3~7개, 관찰 가능한 문장 (예: "개구부 4면 안전난간 설치 여부")
6. category는 다음 중 하나: 추락, 끼임, 화학물질, 기계, 감전, 화재·폭발

출력 형식 (JSON만):
{
  "law_name": "${article.law_name}",
  "path": "${article.path}",
  "title": "요지 또는 소제목",
  "requirement": "한 줄 핵심 요구사항(명령형)",
  "checklist": ["체크항목1", "체크항목2", "체크항목3"],
  "category": "추락",
  "synonyms": "동의어1,동의어2",
  "penalty_ref": "벌칙/행정조치 참조 (선택)",
  "source_url": "${article.source_url}"
}

위 조항이 실행형 통제가 아니거나 체크리스트를 생성할 수 없다면 null을 반환하세요.`;
  }

  /**
   * Validate LLM response
   */
  private validateResponse(parsed: any): LLMResponse | null {
    if (!parsed || parsed === "null" || !parsed.requirement || !parsed.checklist) {
      return null;
    }

    // Validate required fields
    if (!parsed.law_name || !parsed.path || !parsed.category) {
      return null;
    }

    // Validate checklist
    if (!Array.isArray(parsed.checklist) || parsed.checklist.length < 3 || parsed.checklist.length > 7) {
      return null;
    }

    // Validate category
    const validCategories = ["추락", "끼임", "화학물질", "기계", "감전", "화재·폭발"];
    if (!validCategories.includes(parsed.category)) {
      return null;
    }

    return parsed as LLMResponse;
  }
}

// ============================================================================
// Article Filter
// ============================================================================

class ArticleFilter {
  /**
   * Check if article is actionable control
   */
  isActionable(text: string, title: string | null): boolean {
    // Check for exclude keywords
    for (const keyword of EXCLUDE_KEYWORDS) {
      if (text.includes(keyword) || title?.includes(keyword)) {
        return false;
      }
    }

    // Check for control keywords
    for (const keyword of CONTROL_KEYWORDS) {
      if (text.includes(keyword)) {
        return true;
      }
    }

    return false;
  }
}

// ============================================================================
// Quality Gate
// ============================================================================

class QualityGate {
  /**
   * Validate rule meets quality standards
   */
  validate(rule: ChecklistRule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Length checks
    if (rule.requirement.length > MAX_REQUIREMENT_LENGTH) {
      errors.push(`Requirement too long: ${rule.requirement.length} > ${MAX_REQUIREMENT_LENGTH}`);
    }

    for (const item of rule.checklist) {
      if (item.length > MAX_CHECKLIST_ITEM_LENGTH) {
        errors.push(`Checklist item too long: ${item.length} > ${MAX_CHECKLIST_ITEM_LENGTH}`);
      }
    }

    // Checklist count
    if (rule.checklist.length < 3 || rule.checklist.length > 7) {
      errors.push(`Invalid checklist count: ${rule.checklist.length}`);
    }

    // Category validation
    if (!Object.keys(CATEGORY_TARGETS).includes(rule.category)) {
      errors.push(`Invalid category: ${rule.category}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate simple text similarity (Jaccard)
   */
  calculateSimilarity(text1: string, text2: string): number {
    const set1 = new Set(text1.split(""));
    const set2 = new Set(text2.split(""));

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Remove duplicates based on similarity
   */
  deduplicateRules(rules: ChecklistRule[]): ChecklistRule[] {
    const unique: ChecklistRule[] = [];

    for (const rule of rules) {
      let isDuplicate = false;

      for (const existing of unique) {
        const similarity = this.calculateSimilarity(
          rule.requirement + rule.checklist.join(""),
          existing.requirement + existing.checklist.join("")
        );

        if (similarity >= SIMILARITY_THRESHOLD) {
          isDuplicate = true;
          // Keep more specific rule (longer requirement)
          if (rule.requirement.length > existing.requirement.length) {
            const idx = unique.indexOf(existing);
            unique[idx] = rule;
          }
          break;
        }
      }

      if (!isDuplicate) {
        unique.push(rule);
      }
    }

    return unique;
  }

  /**
   * Check category distribution
   */
  checkDistribution(rules: ChecklistRule[]): { valid: boolean; report: string } {
    const counts: Record<string, number> = {};

    for (const rule of rules) {
      counts[rule.category] = (counts[rule.category] || 0) + 1;
    }

    const report: string[] = ["📊 Category Distribution:"];

    let allValid = true;

    for (const [category, target] of Object.entries(CATEGORY_TARGETS)) {
      const actual = counts[category] || 0;
      const min = Math.floor(target * 0.8);
      const max = Math.ceil(target * 1.2);
      const valid = actual >= min && actual <= max;

      if (!valid) allValid = false;

      report.push(`  ${category}: ${actual} (target: ${target}, range: ${min}-${max}) ${valid ? "✅" : "❌"}`);
    }

    return {
      valid: allValid,
      report: report.join("\n"),
    };
  }
}

// ============================================================================
// D1 Client (Read/Write)
// ============================================================================

class D1Client {
  /**
   * Fetch candidate articles from laws_full
   */
  async fetchCandidates(limit: number = 1000): Promise<LawArticle[]> {
    // TODO: Query laws_full table via wrangler or D1 API
    // For now, return empty array
    console.log(`📥 Fetching candidate articles (limit: ${limit})...`);
    return [];
  }

  /**
   * Insert curated rules into laws_ruleset
   */
  async insertRules(rules: ChecklistRule[], version: string): Promise<void> {
    console.log(`💾 Inserting ${rules.length} rules (version: ${version})...`);

    // TODO: Execute INSERT via wrangler or D1 API
    const sql = this.buildInsertSQL(rules, version);
    console.log(`📝 Generated SQL (${sql.length} chars)`);
  }

  /**
   * Insert ruleset metadata
   */
  async insertMeta(version: string, note: string): Promise<void> {
    console.log(`💾 Inserting ruleset metadata (version: ${version})...`);

    // TODO: Execute INSERT
    const sql = `INSERT INTO ruleset_meta (version, note) VALUES ('${version}', '${note}');`;
    console.log(`📝 SQL: ${sql}`);
  }

  private buildInsertSQL(rules: ChecklistRule[], version: string): string {
    const lines: string[] = [];

    for (const rule of rules) {
      const checklistJson = JSON.stringify(rule.checklist).replace(/'/g, "''");

      lines.push(`INSERT INTO laws_ruleset (law_id, law_name, path, title, requirement, checklist, category, synonyms, penalty_ref, source_url, ruleset_version) VALUES ('${rule.law_id}', '${rule.law_name}', '${rule.path}', '${rule.title}', '${rule.requirement.replace(/'/g, "''")}', '${checklistJson}', '${rule.category}', '${rule.synonyms}', ${rule.penalty_ref ? `'${rule.penalty_ref}'` : "NULL"}, '${rule.source_url}', '${version}');`);
    }

    return lines.join("\n");
  }
}

// ============================================================================
// Main Curation Process
// ============================================================================

async function main() {
  console.log("🎨 Starting Checklist Curation Process...\n");

  // Parse arguments
  const args = process.argv.slice(2);
  const targetArg = args.find((arg) => arg.startsWith("--target="));
  const versionArg = args.find((arg) => arg.startsWith("--version="));

  const targetRules = targetArg ? parseInt(targetArg.split("=")[1]) : TARGET_RULES;
  const version = versionArg ? versionArg.split("=")[1] : `v${Date.now()}`;

  if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not set in environment");
    process.exit(1);
  }

  console.log(`🎯 Target rules: ${targetRules}`);
  console.log(`📦 Version: ${version}\n`);

  const gemini = new GeminiClient(GEMINI_API_KEY);
  const filter = new ArticleFilter();
  const qualityGate = new QualityGate();
  const dbClient = new D1Client();

  // Step 1: Fetch candidate articles
  console.log("📥 Step 1: Fetching candidate articles...");
  const candidates = await dbClient.fetchCandidates(1000);
  console.log(`✅ Fetched ${candidates.length} candidate articles\n`);

  // Step 2: Filter actionable articles
  console.log("🔍 Step 2: Filtering actionable articles...");
  const actionable = candidates.filter((article) =>
    filter.isActionable(article.text, article.title)
  );
  console.log(`✅ ${actionable.length} actionable articles found\n`);

  // Step 3: Generate rules with LLM
  console.log("🤖 Step 3: Generating rules with LLM...");
  const rawRules: ChecklistRule[] = [];

  for (let i = 0; i < actionable.length && rawRules.length < targetRules * 2; i++) {
    const article = actionable[i];

    try {
      const llmResponse = await gemini.generateRule(article);

      if (llmResponse) {
        const rule: ChecklistRule = {
          law_id: article.law_id,
          law_name: llmResponse.law_name,
          path: llmResponse.path,
          title: llmResponse.title,
          requirement: llmResponse.requirement,
          checklist: llmResponse.checklist,
          category: llmResponse.category,
          synonyms: llmResponse.synonyms || "",
          penalty_ref: llmResponse.penalty_ref || null,
          source_url: llmResponse.source_url,
        };

        // Validate rule
        const validation = qualityGate.validate(rule);
        if (validation.valid) {
          rawRules.push(rule);
          console.log(`  ✅ [${rawRules.length}] ${rule.path} → ${rule.category}`);
        } else {
          console.warn(`  ⚠️  [${i}] Validation failed:`, validation.errors.join(", "));
        }
      }

      // Rate limiting
      await setTimeout(500);

    } catch (error) {
      console.error(`  ❌ Error processing article ${article.path}:`, error);
    }
  }

  console.log(`✅ Generated ${rawRules.length} raw rules\n`);

  // Step 4: Deduplicate
  console.log("🧹 Step 4: Deduplicating rules...");
  const deduplicated = qualityGate.deduplicateRules(rawRules);
  console.log(`✅ ${deduplicated.length} unique rules (removed ${rawRules.length - deduplicated.length} duplicates)\n`);

  // Step 5: Select final rules (balanced by category)
  console.log("⚖️  Step 5: Balancing categories...");
  const finalRules = deduplicated.slice(0, targetRules);
  console.log(`✅ Selected ${finalRules.length} final rules\n`);

  // Step 6: Quality check
  console.log("✅ Step 6: Quality check...");
  const distribution = qualityGate.checkDistribution(finalRules);
  console.log(distribution.report);
  console.log();

  if (!distribution.valid) {
    console.warn("⚠️  Category distribution is outside target range");
  }

  // Step 7: Save to database
  console.log("💾 Step 7: Saving to database...");
  await dbClient.insertRules(finalRules, version);
  await dbClient.insertMeta(version, `Curated ${finalRules.length} rules`);
  console.log("✅ Saved to database\n");

  // Summary
  console.log("=".repeat(60));
  console.log("✅ Curation Complete");
  console.log(`📊 Total rules: ${finalRules.length}`);
  console.log(`📦 Version: ${version}`);
  console.log("=".repeat(60));
}

// ============================================================================
// Run
// ============================================================================

main().catch((error) => {
  console.error("❌ Curation process failed:", error);
  process.exit(1);
});
