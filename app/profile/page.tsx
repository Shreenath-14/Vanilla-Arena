import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DiscordIcon from '@/components/DiscordIcon';
import Image from 'next/image';

function getLevelThreshold(level: number): number {
  return (level - 1) * (level - 1) * 50;
}

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('profile_id', profile?.id)
    .single();

  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('awarded_at, badge_definitions(name, description, badge_type, threshold)')
    .eq('profile_id', profile?.id);

  const currentLevelXP = getLevelThreshold(stats?.current_level ?? 1);
  const nextLevelXP = getLevelThreshold((stats?.current_level ?? 1) + 1);
  const progressXP = (stats?.total_points ?? 0) - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const progressPct = Math.min(100, Math.round((progressXP / neededXP) * 100));

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* Profile header */}
        <div className="flex items-center gap-5">
          {profile?.avatar_url && (
            <Image src={profile?.avatar_url ?? ''} alt="avatar" width={64} height={64} className="rounded-full border border-white/20" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile?.username}</h1>
            <p className="text-gray-400 text-sm">Level {stats?.current_level ?? 1} · {stats?.total_points ?? 0} pts</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Points', value: stats?.total_points ?? 0 },
            { label: 'Current Streak', value: `${stats?.current_streak ?? 0} days` },
            { label: 'Challenges Solved', value: stats?.challenges_solved ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-[#111] border border-white/10 rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-yellow-400">{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* XP Progress bar */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300 font-medium">Level {stats?.current_level ?? 1}</span>
            <span className="text-gray-500">{progressXP} / {neededXP} XP to Level {(stats?.current_level ?? 1) + 1}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className="bg-yellow-400 h-3 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-right">{progressPct}% complete</p>
        </div>

        {/* Badges */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Badges</h2>
          {!userBadges || userBadges.length === 0 ? (
            <div className="bg-[#111] border border-white/10 rounded-xl p-6 text-gray-500 text-sm text-center">
              No badges yet — keep solving challenges!
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {userBadges.map((ub: { awarded_at: string; badge_definitions: { name: string; description: string; badge_type: string; threshold: number }[] | null }, i: number) => {
                const badge = ub.badge_definitions?.[0];
                return (
                  <div key={i} className="bg-[#111] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                    <div className="text-3xl">
                      {badge?.badge_type === 'streak' ? '🔥' : '⭐'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{badge?.name}</p>
                      <p className="text-gray-400 text-xs">{badge?.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 rounded-xl border border-[#5865F2]/20 bg-[#5865F2]/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#5865F2]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#7289da]">
                <DiscordIcon size={16} />
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Join the Community</p>
              <p className="text-xs text-gray-500 mt-0.5">Connect with other coders on Discord</p>
            </div>
          </div>
          <a
            href="https://discord.gg/gcbPNN4uw"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#7289da] hover:bg-[#5865F2]/20 transition text-sm font-medium flex-shrink-0"
          >
            Join Discord
          </a>
      </div>
    </div>
    </main >
  );
}