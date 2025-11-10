import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');

// Parse environment variables
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

// Check if using remote Supabase (not localhost)
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

if (SUPABASE_URL.includes('127.0.0.1') || SUPABASE_URL.includes('localhost')) {
  console.error('❌ .env.local is configured for local Supabase.');
  console.error('Please update .env.local with your remote Supabase credentials:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://zputggbcwulksuxsbrvy.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>');
  process.exit(1);
}

console.log('🔄 Applying migration to remote Supabase...');
console.log(`📍 URL: ${SUPABASE_URL}`);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Read migration file
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '0004_remove_auth_dependency.sql');
const migrationSQL = readFileSync(migrationPath, 'utf-8');

console.log('\n📝 Migration SQL:');
console.log('─'.repeat(60));
console.log(migrationSQL);
console.log('─'.repeat(60));

// Execute SQL statements one by one
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`\n⚙️  Executing ${statements.length} SQL statements...\n`);

let successCount = 0;
let errorCount = 0;

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  const preview = statement.substring(0, 80).replace(/\s+/g, ' ');

  console.log(`[${i + 1}/${statements.length}] ${preview}...`);

  try {
    const { data, error } = await supabase.rpc('exec', {
      query: statement + ';'
    });

    if (error) {
      // exec function might not exist, try direct query
      const { error: queryError } = await supabase
        .from('_dummy')
        .select('*')
        .limit(0);

      // If we can't execute raw SQL through RPC, we need to use REST API directly
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: statement + ';' })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log('  ✅ Success');
      successCount++;
    } else {
      console.log('  ✅ Success');
      successCount++;
    }
  } catch (error) {
    console.log(`  ⚠️  Could not execute via API: ${error.message}`);
    errorCount++;
  }
}

if (errorCount > 0) {
  console.log('\n⚠️  Some statements could not be executed automatically.');
  console.log('\n📋 Please run this SQL manually in Supabase Dashboard > SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/zputggbcwulksuxsbrvy/sql/new');
  console.log('\n' + '='.repeat(60));
  console.log(migrationSQL);
  console.log('='.repeat(60));
  process.exit(1);
} else {
  console.log(`\n✨ Migration completed successfully! (${successCount}/${statements.length} statements executed)`);
  console.log('\n📋 Next steps:');
  console.log('  1. Restart your dev server (Ctrl+C then npm run dev)');
  console.log('  2. Clear browser cache (Ctrl+Shift+R)');
  console.log('  3. Try adding a participant again');
}
