import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Esto evita que GoTrue intente usar la API de Locks del navegador concurrentemente
    flowType: 'pkce', 
    storageKey: 'mi-app-disco-storage',
  },
});