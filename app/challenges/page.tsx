import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
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

  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Challenges</h1>
        <p className="text-gray-400 mb-8">Solve vanilla JS problems. Get scored by AI.</p>
        <div className="flex flex-col gap-3">
          {challenges?.map((c) => (
            <Link
              key={c.id}
              href={`/challenges/${c.id}`}
              className="flex items-center justify-between bg-[#111] border border-white/10 rounded-xl px-6 py-4 hover:border-white/30 transition"
            >
              <div>
                <p className="font-semibold text-lg">{c.title}</p>
                <p className="text-gray-400 text-sm mt-1">{c.points_reward} pts</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${difficultyColor[c.difficulty]}`}>
                {c.difficulty}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}