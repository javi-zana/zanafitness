import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MemberDashboard from "./MemberDashboard";
import CoachDashboard from "./CoachDashboard";

const COACH_EMAILS = ["me@javilorenzana.com", "bea.ongg@gmail.com"];

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, plan, status, role")
    .eq("id", user.id)
    .single();

  // Coach access: either role = 'coach' in DB OR email is in the hardcoded coach list
  const isCoach =
    profile?.role === "coach" || COACH_EMAILS.includes(user.email ?? "");

  const profileData = {
    id: user.id,
    email: user.email ?? "",
    plan: profile?.plan ?? undefined,
    status: profile?.status ?? undefined,
    role: isCoach ? "coach" : "member",
  };

  if (isCoach) {
    return <CoachDashboard profile={profileData} />;
  }

  return <MemberDashboard profile={profileData} />;
}
