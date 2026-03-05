
import { createClient } from '@supabase/supabase-js';
import { AudioGuide } from '../types';

const supabaseUrl = 'https://ebxcirakgqzefjfdxvao.supabase.co';
const supabaseKey = 'sb_publishable_gdqjrCOPmseQiTPXE8jDMw_V1dn1qiR';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchCommunityProgress = async () => {
  const { data, error } = await supabase
    .from('student_progress')
    .select('student_id, date, progress_percent, updated_at')
    .order('updated_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Fetch Community Error:', error);
    return [];
  }
  return data || [];
};
