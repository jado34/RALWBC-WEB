import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tgzwvyaiquxwphhbdndy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnend2eWFpcXV4d3BoaGJkbmR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjc5OTgsImV4cCI6MjA5NjYwMzk5OH0.ieP-ghxcb4ai-VBmVzXgZurcBZcEnpsIHrl6gdQ93Nc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Signing in as admin@ralwbc.org...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@ralwbc.org',
    password: 'Olawuwo100'
  });
  
  if (error) {
    console.error('Auth Sign In Error:', error);
  } else {
    console.log('Auth Sign In Success. User ID:', data.user?.id);
    console.log('User Email:', data.user?.email);
    console.log('User Metadata:', data.user?.user_metadata);
    
    // Now fetch profile for this user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();
      
    if (profileError) {
      console.error('Profile Select Error:', profileError);
    } else {
      console.log('Profile associated with User ID:', profile);
    }
  }
}

test();
