import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const excludeId = req.nextUrl.searchParams.get("exclude");
  const idsParam = req.nextUrl.searchParams.get("ids");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let query = supabase.from("profiles").select("id, nickname, email, avatar_color, role");

  if (idsParam) {
    const ids = idsParam.split(",").filter(Boolean);
    if (ids.length === 0) return NextResponse.json({ profiles: [] });
    query = query.in("id", ids);
  } else {
    if (excludeId) query = query.neq("id", excludeId);
    query = query.order("nickname", { ascending: true });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profiles: data ?? [] });
}
