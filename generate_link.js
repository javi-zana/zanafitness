const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const SERVICE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1];

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: 'bea.ongg@gmail.com',
  });
  if (error) {
    console.error(error);
  } else {
    console.log("MAGIC_LINK:", data.properties.action_link);
  }
}
main();
