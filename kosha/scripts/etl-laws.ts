#!/usr/bin/env tsx
/**
 * ETL Script: National Law Information API → D1 Database
 *
 * Fetches all articles from specified Korean occupational safety laws
 * and loads them into the laws_full table.
 *
 * Usage:
 *   tsx scripts/etl-laws.ts --laws "산업안전보건기준에 관한 규칙,산업안전보건법 시행규칙"
 */

import "dotenv/config";
import { parseStringPromise } from "xml2js";
import { setTimeout } from "timers/promises";

// ============================================================================
// Configuration
// ============================================================================

const MOLEG_API_KEY = process.env.MOLEG_API_KEY || "";
const BASE_URL = process.env.BASE_URL_MOLEG || "https://www.law.go.kr/DRF/lawService.do";
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const DATABASE_ID = process.env.D1_DATABASE_ID || "";

const RETRY_MAX = 3;
const RETRY_DELAY_MS = 2000;
const RATE_LIMIT_DELAY_MS = 1000;

// ============================================================================
// Types
// ============================================================================

interface LawArticle {
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
  source_url: string;
}

interface APIResponse {
  law_id: string;
  law_name: string;
  articles: any[];
}

// ============================================================================
// API Client
// ============================================================================

class MolegAPIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch law by name
   */
  async fetchLawByName(lawName: string): Promise<APIResponse | null> {
    const params = new URLSearchParams({
      target: "law",
      type: "XML",
      OC: this.apiKey,
      lawNm: lawName,
    });

    const url = `${this.baseUrl}?${params.toString()}`;

    console.log(`📡 Fetching law: ${lawName}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("RATE_LIMIT");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xml = await response.text();
      const parsed = await parseStringPromise(xml, { explicitArray: false });

      // Extract law ID and articles from API response
      // NOTE: Adjust this based on actual API response structure
      const lawData = parsed?.LawService?.law?.[0] || parsed?.LawService?.law;

      if (!lawData) {
        console.warn(`⚠️  No law data found for: ${lawName}`);
        return null;
      }

      return {
        law_id: lawData.법령ID || lawData.lawId || `law-${Date.now()}`,
        law_name: lawName,
        articles: this.extractArticles(lawData),
      };
    } catch (error) {
      console.error(`❌ Error fetching law ${lawName}:`, error);
      throw error;
    }
  }

  /**
   * Extract articles from law data
   */
  private extractArticles(lawData: any): any[] {
    // NOTE: This is a simplified extraction
    // Adjust based on actual API response structure
    const articles = [];
    const rawArticles = lawData.조문 || lawData.articles || [];

    if (Array.isArray(rawArticles)) {
      return rawArticles;
    } else if (rawArticles) {
      return [rawArticles];
    }

    return articles;
  }

  /**
   * Retry with exponential backoff
   */
  async fetchWithRetry(lawName: string): Promise<APIResponse | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= RETRY_MAX; attempt++) {
      try {
        const result = await this.fetchLawByName(lawName);
        return result;
      } catch (error: any) {
        lastError = error;

        if (error.message === "RATE_LIMIT") {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.warn(`⏳ Rate limited. Retrying in ${delay}ms (attempt ${attempt}/${RETRY_MAX})`);
          await setTimeout(delay);
        } else {
          console.error(`❌ Attempt ${attempt}/${RETRY_MAX} failed:`, error.message);
          if (attempt < RETRY_MAX) {
            await setTimeout(RETRY_DELAY_MS);
          }
        }
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }
}

// ============================================================================
// Article Parser
// ============================================================================

class ArticleParser {
  /**
   * Parse raw article into structured format
   */
  parseArticle(rawArticle: any, lawId: string, lawName: string): LawArticle[] {
    const results: LawArticle[] = [];

    // Extract article number (조)
    const articleNo = this.extractArticleNo(rawArticle);
    const articleTitle = rawArticle.조문제목 || rawArticle.title || null;
    const articleText = rawArticle.조문내용 || rawArticle.text || "";

    // Check if article has sub-clauses (항)
    const clauses = this.extractClauses(rawArticle);

    if (clauses.length > 0) {
      // Article has sub-clauses
      clauses.forEach((clause, clauseIdx) => {
        const clauseNo = `제${clauseIdx + 1}항`;
        const items = this.extractItems(clause);

        if (items.length > 0) {
          // Clause has items (호/목)
          items.forEach((item, itemIdx) => {
            const itemNo = `제${itemIdx + 1}호`;
            const path = `${articleNo}-${clauseNo}-${itemNo}`;

            results.push({
              law_id: lawId,
              law_name: lawName,
              article_no: articleNo,
              clause_no: clauseNo,
              item_no: itemNo,
              path,
              title: articleTitle,
              text: item.text || "",
              effective_date: rawArticle.시행일자 || null,
              last_amended_date: rawArticle.개정일자 || null,
              source_url: this.buildSourceUrl(lawId, articleNo),
            });
          });
        } else {
          // Clause without items
          const path = `${articleNo}-${clauseNo}`;

          results.push({
            law_id: lawId,
            law_name: lawName,
            article_no: articleNo,
            clause_no: clauseNo,
            item_no: null,
            path,
            title: articleTitle,
            text: clause.text || "",
            effective_date: rawArticle.시행일자 || null,
            last_amended_date: rawArticle.개정일자 || null,
            source_url: this.buildSourceUrl(lawId, articleNo),
          });
        }
      });
    } else {
      // Simple article without sub-clauses
      const path = articleNo;

      results.push({
        law_id: lawId,
        law_name: lawName,
        article_no: articleNo,
        clause_no: null,
        item_no: null,
        path,
        title: articleTitle,
        text: articleText,
        effective_date: rawArticle.시행일자 || null,
        last_amended_date: rawArticle.개정일자 || null,
        source_url: this.buildSourceUrl(lawId, articleNo),
      });
    }

    return results;
  }

  private extractArticleNo(rawArticle: any): string {
    return rawArticle.조문번호 || rawArticle.articleNo || "제0조";
  }

  private extractClauses(rawArticle: any): any[] {
    const clauses = rawArticle.항 || rawArticle.clauses || [];
    return Array.isArray(clauses) ? clauses : (clauses ? [clauses] : []);
  }

  private extractItems(clause: any): any[] {
    const items = clause.호 || clause.items || [];
    return Array.isArray(items) ? items : (items ? [items] : []);
  }

  private buildSourceUrl(lawId: string, articleNo: string): string {
    return `https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=${lawId}#${articleNo}`;
  }
}

// ============================================================================
// D1 Database Client
// ============================================================================

class D1Client {
  private accountId: string;
  private databaseId: string;

  constructor(accountId: string, databaseId: string) {
    this.accountId = accountId;
    this.databaseId = databaseId;
  }

  /**
   * Insert or update law articles
   */
  async upsertArticles(articles: LawArticle[]): Promise<void> {
    console.log(`💾 Upserting ${articles.length} articles to D1...`);

    // Use wrangler d1 execute for batch insert
    // In production, use Cloudflare D1 API
    const sql = this.buildUpsertSQL(articles);

    // For now, just log the SQL
    // In production, execute via wrangler or D1 REST API
    console.log(`📝 Generated SQL (${sql.length} chars)`);

    // TODO: Execute SQL via wrangler d1 execute or D1 REST API
    // Example: await this.executeSql(sql);
  }

  private buildUpsertSQL(articles: LawArticle[]): string {
    const lines: string[] = [];

    articles.forEach((article) => {
      const values = [
        this.escape(article.law_id),
        this.escape(article.law_name),
        this.escape(article.article_no),
        this.escape(article.clause_no),
        this.escape(article.item_no),
        this.escape(article.path),
        this.escape(article.title),
        this.escape(article.text),
        this.escape(article.effective_date),
        this.escape(article.last_amended_date),
        this.escape(article.source_url),
      ].join(", ");

      lines.push(`INSERT OR REPLACE INTO laws_full (law_id, law_name, article_no, clause_no, item_no, path, title, text, effective_date, last_amended_date, source_url) VALUES (${values});`);
    });

    return lines.join("\n");
  }

  private escape(value: any): string {
    if (value === null || value === undefined) {
      return "NULL";
    }
    return `'${String(value).replace(/'/g, "''")}'`;
  }
}

// ============================================================================
// Main ETL Process
// ============================================================================

async function main() {
  console.log("🚀 Starting Law ETL Process...\n");

  // Parse command line arguments
  const args = process.argv.slice(2);
  const lawsArg = args.find((arg) => arg.startsWith("--laws="));
  const lawTargets = lawsArg
    ? lawsArg.split("=")[1].split(",")
    : (process.env.LAW_TARGETS || "").split(",").filter(Boolean);

  if (!MOLEG_API_KEY) {
    console.error("❌ MOLEG_API_KEY not set in environment");
    process.exit(1);
  }

  if (lawTargets.length === 0) {
    console.error("❌ No law targets specified");
    console.error("Usage: tsx scripts/etl-laws.ts --laws=\"법령명1,법령명2\"");
    process.exit(1);
  }

  console.log(`📋 Target laws: ${lawTargets.join(", ")}\n`);

  const apiClient = new MolegAPIClient(MOLEG_API_KEY, BASE_URL);
  const parser = new ArticleParser();
  const dbClient = new D1Client(ACCOUNT_ID, DATABASE_ID);

  let totalArticles = 0;

  for (const lawName of lawTargets) {
    try {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`Processing: ${lawName}`);
      console.log("=".repeat(60));

      // Fetch law data
      const lawData = await apiClient.fetchWithRetry(lawName.trim());

      if (!lawData) {
        console.warn(`⚠️  Skipping ${lawName} (no data)`);
        continue;
      }

      // Parse articles
      const allArticles: LawArticle[] = [];

      for (const rawArticle of lawData.articles) {
        const parsed = parser.parseArticle(rawArticle, lawData.law_id, lawData.law_name);
        allArticles.push(...parsed);
      }

      console.log(`✅ Parsed ${allArticles.length} article entries`);

      // Upsert to database
      if (allArticles.length > 0) {
        await dbClient.upsertArticles(allArticles);
        totalArticles += allArticles.length;
      }

      // Rate limiting
      await setTimeout(RATE_LIMIT_DELAY_MS);

    } catch (error) {
      console.error(`❌ Failed to process ${lawName}:`, error);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ ETL Complete`);
  console.log(`📊 Total articles processed: ${totalArticles}`);
  console.log("=".repeat(60));
}

// ============================================================================
// Run
// ============================================================================

main().catch((error) => {
  console.error("❌ ETL process failed:", error);
  process.exit(1);
});
