import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import DiscordIcon from '@/components/DiscordIcon';
import Link from 'next/link';

const difficultyColor: Record<string, string> = {
  easy:   'bg-green-500/20 text-green-400 border border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  hard:   'bg-red-500/20 text-red-400 border border-red-500/30',
};

export default async function ChallengesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  // Get challenges
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: true });

  // Get logged in user
  const { data: { user } } = await supabase.auth.getUser();

  // Get solved challenge IDs for this user
  let solvedIds: string[] = [];

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (profile) {
      const { data: solved } = await supabase
        .from('submissions')
        .select('challenge_id')
        .eq('profile_id', profile.id)
        .eq('status', 'passed');

      solvedIds = solved?.map((s: any) => s.challenge_id) ?? [];
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Challenges</h1>
          <p className="text-gray-400">
            Solve vanilla JS problems. Get scored by AI.
            {solvedIds.length > 0 && (
              <span className="ml-2 text-yellow-400 font-medium">
                {solvedIds.length}/{challenges?.length ?? 0} solved
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {challenges?.map((c: any) => {
            const isSolved = solvedIds.includes(c.id);
            return (
              <Link
                key={c.id}
                href={`/challenges/${c.id}`}
                className={`flex items-center justify-between rounded-xl px-6 py-4 border transition group ${
                  isSolved
                    ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                    : 'bg-[#111] border-white/10 hover:border-white/30'
                }`}
              >
                {/* Left — title + pts */}
                <div className="flex items-center gap-4">
                  {/* Solved check or number */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isSolved
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/5 text-gray-500'
                  }`}>
                    {isSolved ? '✓' : challenges.indexOf(c) + 1}
                  </div>

                  <div>
                    <p className={`font-semibold text-base ${isSolved ? 'text-green-300' : 'text-white'}`}>
                      {c.title}
                    </p>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {c.points_reward} pts
                      {isSolved && <span className="text-green-500 ml-2">· Solved</span>}
                    </p>
                  </div>
                </div>

                {/* Right — difficulty + arrow */}
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${difficultyColor[c.difficulty]}`}>
                    {c.difficulty}
                  </span>
                  <span className={`text-lg transition group-hover:translate-x-1 ${
                    isSolved ? 'text-green-500/50' : 'text-gray-600'
                  }`}>→</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 flex items-center justify-between px-6 py-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <div>
            <p className="text-sm font-semibold text-white">Stuck on a challenge?</p>
            <p className="text-xs text-gray-500 mt-0.5">Get help from the community on Discord.</p>
          </div>
          <Link
            href="https://discord.gg/gcbPNN4uw"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#7289da] hover:bg-[#5865F2]/20 transition text-sm font-medium flex-shrink-0"
          >
            <DiscordIcon size={16} />
            Join Discord
          </Link>
        </div>
      </div>
    </main>
  );
}