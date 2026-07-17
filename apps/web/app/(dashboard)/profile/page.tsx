import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";
import { AvatarUploader } from "./AvatarUploader";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url, email_verified, created_at")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Профиль</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

      <div className="mt-6">
        <AvatarUploader userId={user.id} currentAvatarUrl={profile?.avatar_url ?? null} />
      </div>

      <ProfileForm
        defaultFullName={profile?.full_name ?? ""}
        defaultPhone={profile?.phone ?? ""}
      />

      {!profile?.email_verified && (
        <p className="mt-6 max-w-md rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Email ещё не подтверждён — проверьте почту и перейдите по ссылке из письма.
        </p>
      )}
    </div>
  );
}
