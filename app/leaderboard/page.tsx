import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import LeaderboardTabs from '@/components/LeaderboardTabs';

export default async function LeaderboardPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const [allTime, daily, weekly, monthly] = await Promise.all([
        supabase
            .from('leaderboard_entries')
            .select('rank, total_points, profile_id, profiles!inner(username, avatar_url)')
            .eq('period', 'all_time')
            .order('rank', { ascending: true })
            .limit(50),
        supabase
            .from('leaderboard_entries')
            .select('rank, total_points, profile_id, profiles!inner(username, avatar_url)')
            .eq('period', 'daily')
            .order('rank', { ascending: true })
            .limit(50),
        supabase
            .from('leaderboard_entries')
            .select('rank, total_points, profile_id, profiles!inner(username, avatar_url)')
            .eq('period', 'weekly')
            .order('rank', { ascending: true })
            .limit(50),
        supabase
            .from('leaderboard_entries')
            .select('rank, total_points, profile_id, profiles(username, avatar_url)')
            .eq('period', 'monthly')
            .order('rank', { ascending: true })
            .limit(50),
    ]);

    const { data: myProfile } = user
        ? await supabase
            .from('profiles')
            .select('id')
            .eq('auth_user_id', user.id)
            .single()
        : { data: null };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
                <p className="text-gray-400 mb-8">Top coders ranked by points.</p>
                <LeaderboardTabs
                    allTime={(allTime.data ?? []) as any}
                    daily={(daily.data ?? []) as any}
                    weekly={(weekly.data ?? []) as any}
                    monthly={(monthly.data ?? []) as any}
                    myProfileId={myProfile?.id ?? null}
                />
            </div>
        </main>
    );
}