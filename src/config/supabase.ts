import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ebscgsvsjdmrlutlcvzc.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVic2Nnc3ZzamRtcmx1dGxjdnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTI2OTQsImV4cCI6MjEwMzQ4ODY5NH0.8LJq_QE9KP1pBYmy7GwSX_Ad9wdCxQzsO4YjYiUWuY4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
