const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables relative to this config directory if needed
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY; // Service key to manage buckets

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('⚡ Supabase Client initialized successfully');
} else {
  console.error('❌ Supabase URL or Secret Key is missing in environment variables!');
}

module.exports = supabase;
