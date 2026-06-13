import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tgzwvyaiquxwphhbdndy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnend2eWFpcXV4d3BoaGJkbmR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjc5OTgsImV4cCI6MjA5NjYwMzk5OH0.ieP-ghxcb4ai-VBmVzXgZurcBZcEnpsIHrl6gdQ93Nc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing profile insert with role="ambassador"...');
  // Generate a random ID to avoid collision
  const id = '168e843d-cb83-426e-a968-' + Math.random().toString(36).substr(2, 12);
  const { data, error } = await supabase.from('profiles').insert([{
    id: 'e7330a19-ba30-461a-b8ed-e9ed7f0eb8d7', // let's try upserting/inserting with an existing or new profile
    name: 'Test Role User',
    role: 'ambassador'
  }]);
  
  if (error) {
    console.error('Error inserting with role="ambassador":', error);
  } else {
    console.log('Successfully inserted role="ambassador":', data);
  }
}

test();
