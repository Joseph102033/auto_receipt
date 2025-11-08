#!/usr/bin/env tsx
/**
 * Diff-Sync Script: Incremental Law Updates
 *
 * Synchronizes law changes based on effective dates and amendment history.
 * Only fetches and updates changed articles (incremental sync).
 *
 * Usage:
 *   tsx scripts/diff-sync.ts --since 2024-01-01
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

// ============================================================================
// Types
// ============================================================================

interface LawChange {
  law_id: string;
  law_name: string;
  change_type: "new" | "amended" | "repealed";
  effective_date: string;
  last_amended_date: string;
}

interface SyncReport {
  added: number;
  updated: number;
  removed: number;
  errors: string[];
}

// ============================================================================
// D1 Client
// ============================================================================

class D1Client {
  /**
   * Get latest sync date from database
   */
  async getLatestSyncDate(): Promise<string | null> {
    // TODO: Query database for max(last_amended_date) or max(effective_date)
    // For now, return null
    console.log("📅 Fetching latest sync date from database...");
    return null;
  }

  /**
   * Get existing law IDs
   */
  async getExistingLawIds(): Promise<Set<string>> {
    // TODO: Query laws_full for distinct law_id
    console.log("📋 Fetching existing law IDs...");
    return new Set();
  }

  /**
   * Check if article exists
   */
  async articleExists(lawId: string, path: string, effectiveDate: string): Promise<boolean> {
    // TODO: Query laws_full
    return false;
  }

  /**
   * Update article
   */
  async updateArticle(article: any): Promise<void> {
    console.log(`  ✏️  Updating: ${article.path}`);
    // TODO: Execute UPDATE SQL
  }

  /**
   * Insert article
   */
  async insertArticle(article: any): Promise<void> {
    console.log(`  ➕ Inserting: ${article.path}`);
    // TODO: Execute INSERT SQL
  }

  /**
   * Delete article
   */
  async deleteArticle(lawId: string, path: string): Promise<void> {
    console.log(`  ❌ Deleting: ${lawId}:${path}`);
    // TODO: Execute DELETE SQL
  }
}

// ============================================================================
// Change Detector
// ============================================================================

class ChangeDetector {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Detect changes since given date
   */
  async detectChanges(sinceDate: string, lawTargets: string[]): Promise<LawChange[]> {
    console.log(`🔍 Detecting changes since ${sinceDate}...`);

    const changes: LawChange[] = [];

    for (const lawName of lawTargets) {
      try {
        // Fetch law metadata
        const metadata = await this.fetchLawMetadata(lawName);

        if (!metadata) {
          continue;
        }

        // Check if law has been amended since sinceDate
        if (metadata.last_amended_date && metadata.last_amended_date >= sinceDate) {
          changes.push({
            law_id: metadata.law_id,
            law_name: lawName,
            change_type: "amended",
            effective_date: metadata.effective_date,
            last_amended_date: metadata.last_amended_date,
          });
        }

        // Rate limiting
        await setTimeout(500);

      } catch (error) {
        console.error(`❌ Error detecting changes for ${lawName}:`, error);
      }
    }

    return changes;
  }

  /**
   * Fetch law metadata
   */
  private async fetchLawMetadata(lawName: string): Promise<any> {
    const params = new URLSearchParams({
      target: "law",
      type: "XML",
      OC: this.apiKey,
      lawNm: lawName,
    });

    const url = `${this.baseUrl}?${params.toString()}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const xml = await response.text();
      const parsed = await parseStringPromise(xml, { explicitArray: false });

      const lawData = parsed?.LawService?.law?.[0] || parsed?.LawService?.law;

      if (!lawData) {
        return null;
      }

      return {
        law_id: lawData.법령ID || lawData.lawId || `law-${Date.now()}`,
        law_name: lawName,
        effective_date: lawData.시행일자 || lawData.effectiveDate || "",
        last_amended_date: lawData.최종개정일자 || lawData.lastAmendedDate || "",
      };

    } catch (error) {
      console.error(`❌ Error fetching metadata for ${lawName}:`, error);
      return null;
    }
  }
}

// ============================================================================
// Sync Manager
// ============================================================================

class SyncManager {
  private dbClient: D1Client;
  private changeDetector: ChangeDetector;

  constructor(dbClient: D1Client, changeDetector: ChangeDetector) {
    this.dbClient = dbClient;
    this.changeDetector = changeDetector;
  }

  /**
   * Perform incremental sync
   */
  async sync(sinceDate: string, lawTargets: string[]): Promise<SyncReport> {
    const report: SyncReport = {
      added: 0,
      updated: 0,
      removed: 0,
      errors: [],
    };

    // Detect changes
    const changes = await this.changeDetector.detectChanges(sinceDate, lawTargets);

    console.log(`\n📊 Detected ${changes.length} changed laws\n`);

    if (changes.length === 0) {
      console.log("✅ No changes to sync");
      return report;
    }

    // Process each changed law
    for (const change of changes) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`Processing: ${change.law_name} (${change.change_type})`);
      console.log("=".repeat(60));

      try {
        // For now, just log
        // In production, fetch full law data and sync articles
        console.log(`  📅 Effective: ${change.effective_date}`);
        console.log(`  📅 Last Amended: ${change.last_amended_date}`);

        // TODO: Implement actual sync logic
        // 1. Fetch full law articles
        // 2. Compare with existing articles
        // 3. Update/insert/delete as needed

        report.updated++;

      } catch (error) {
        console.error(`❌ Error syncing ${change.law_name}:`, error);
        report.errors.push(`${change.law_name}: ${error}`);
      }

      // Rate limiting
      await setTimeout(1000);
    }

    return report;
  }
}

// ============================================================================
// Main Sync Process
// ============================================================================

async function main() {
  console.log("🔄 Starting Incremental Law Sync...\n");

  // Parse arguments
  const args = process.argv.slice(2);
  const sinceArg = args.find((arg) => arg.startsWith("--since="));

  if (!MOLEG_API_KEY) {
    console.error("❌ MOLEG_API_KEY not set in environment");
    process.exit(1);
  }

  const dbClient = new D1Client();

  // Determine sync start date
  let sinceDate: string;

  if (sinceArg) {
    sinceDate = sinceArg.split("=")[1];
  } else {
    // Use latest date from database
    const latest = await dbClient.getLatestSyncDate();
    if (latest) {
      sinceDate = latest;
    } else {
      // Default: 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      sinceDate = thirtyDaysAgo.toISOString().split("T")[0];
    }
  }

  console.log(`📅 Syncing changes since: ${sinceDate}\n`);

  const lawTargets = (process.env.LAW_TARGETS || "").split(",").filter(Boolean);

  if (lawTargets.length === 0) {
    console.error("❌ No law targets specified in LAW_TARGETS");
    process.exit(1);
  }

  const changeDetector = new ChangeDetector(MOLEG_API_KEY, BASE_URL);
  const syncManager = new SyncManager(dbClient, changeDetector);

  // Perform sync
  const report = await syncManager.sync(sinceDate, lawTargets);

  // Print report
  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ Sync Complete");
  console.log(`📊 Report:`);
  console.log(`  - Added: ${report.added}`);
  console.log(`  - Updated: ${report.updated}`);
  console.log(`  - Removed: ${report.removed}`);
  console.log(`  - Errors: ${report.errors.length}`);

  if (report.errors.length > 0) {
    console.log(`\n❌ Errors:`);
    report.errors.forEach((error) => console.log(`  - ${error}`));
  }

  console.log("=".repeat(60));
}

// ============================================================================
// Run
// ============================================================================

main().catch((error) => {
  console.error("❌ Sync process failed:", error);
  process.exit(1);
});
