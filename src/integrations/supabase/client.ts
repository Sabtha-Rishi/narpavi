// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://atxqmvgwpiptenvuybtu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0eHFtdmd3cGlwdGVudnV5YnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NjYxNjUsImV4cCI6MjA2MzI0MjE2NX0.nAkDE1l-FgV-sVcQwjHcEGGguKS94ga5_N6TBVdUE-0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);