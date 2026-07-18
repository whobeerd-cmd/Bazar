import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export async function getCityOptions(supabase: Supabase) {
  const { data } = await supabase.from("cities").select("id, name").order("name");
  return data ?? [];
}
