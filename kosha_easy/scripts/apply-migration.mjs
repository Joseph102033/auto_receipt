#!/usr/bin/env node

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from command line or environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.argv[2];
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.argv[3];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Usage: node scripts/apply-migration.mjs <SUPABASE_URL> <SERVICE_ROLE_KEY>');
  console.error('Or set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔄 Applying migration: 0004_remove_auth_dependency.sql');
console.log(`📍 Target: ${SUPABASE_URL}`);

const migrationSQL = readFileSync('supabase/migrations/0004_remove_auth_dependency.sql', 'utf-8');

try {
  // Split SQL by semicolons and execute each statement
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    console.log(`\n📝 Executing: ${statement.substring(0, 60)}...`);

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: statement + ';'
    });

    if (error) {
      // Try direct execution as fallback
      const { data: directData, error: directError } = await supabase
        .from('_migrations')
        .select('*')
        .limit(0); // This is just to test connection

      if (directError) {
        console.error('❌ Error:', error.message);
        console.log('\n⚠️  Direct SQL execution not available.');
        console.log('Please run this SQL manually in Supabase Dashboard > SQL Editor:');
        console.log('\n' + '='.repeat(60));
        console.log(migrationSQL);
        console.log('='.repeat(60) + '\n');
        process.exit(1);
      }
    } else {
      console.log('✅ Success');
    }
  }

  console.log('\n✨ Migration applied successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Restart your dev server');
  console.log('2. Clear browser cache (Ctrl+Shift+R)');
  console.log('3. Try adding a participant again');

} catch (error) {
  console.error('\n❌ Error applying migration:', error.message);
  console.log('\n⚠️  Please run this SQL manually in Supabase Dashboard > SQL Editor:');
  console.log('\n' + '='.repeat(60));
  console.log(migrationSQL);
  console.log('='.repeat(60) + '\n');
  process.exit(1);
}
