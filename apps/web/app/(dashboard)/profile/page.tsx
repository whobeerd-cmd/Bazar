import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";
import { AvatarUploader } from "./AvatarUploader";
import { DeleteDataRequestButton } from "./DeleteDataRequestButton";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>;
}) {
  const { required } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, email_verified, created_at, profiles_private(phone)")
    .eq("id", user.id)
    .single();
  const profilePrivate = Array.isArray(profile?.profiles_private)
    ? profile.profiles_private[0]
    : profile?.profiles_private;

  const { data: pendingDataRequest } = await supabase
    .from("data_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Профиль</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

      {required === "1" && !profile?.full_name?.trim() && (
        <p className="mt-4 max-w-md rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          Укажите имя, чтобы продолжить пользоваться личным кабинетом.
        </p>
      )}

      <div className="card mt-6 max-w-md p-6">
        <AvatarUploader userId={user.id} currentAvatarUrl={profile?.avatar_url ?? null} />

        <div className="mt-6 border-t border-border pt-6">
          <ProfileForm
            defaultFullName={profile?.full_name ?? ""}
            defaultPhone={profilePrivate?.phone ?? ""}
          />
        </div>
      </div>

      {!profile?.email_verified && (
        <p className="mt-6 max-w-md rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          Email ещё не подтверждён — проверьте почту и перейдите по ссылке из письма.
        </p>
      )}

      <div className="mt-8 max-w-md border-t border-border pt-6">
        <DeleteDataRequestButton hasPendingRequest={Boolean(pendingDataRequest)} />
      </div>
    </div>
  );
}
