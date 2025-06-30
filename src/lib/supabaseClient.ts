import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cfrwucpfoxplmvayociv.supabase.co"; // Ex: 'https://xxxxxx.supabase.co'
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmcnd1Y3Bmb3hwbG12YXlvY2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NDgwODksImV4cCI6MjA2MTEyNDA4OX0.fF2epuCoea5un2gyLeRBec2Fvs_p7lcH6Xv_8w1Q6eI"; // Ex: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
