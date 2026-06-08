'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('auth_user_id', user.id)
        .single();
      if (profile) setUsername(profile.username);
    };
    getUser();
  }, []);

  return (
    <nav className="border-b border-white/10 bg-[#0a0a0a] px-8 py-4 flex items-center justify-between">
      <Link href="/challenges" className="font-bold text-white text-lg tracking-tight">
        Vanilla<span className="text-yellow-400">Arena</span>
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link href="/challenges" className="text-gray-400 hover:text-white transition">Challenges</Link>
        <Link href="/leaderboard" className="text-gray-400 hover:text-white transition">Leaderboard</Link>
        {username && (
          <Link href="/profile" className="text-yellow-400 hover:text-yellow-300 font-medium transition">
            {username}
          </Link>
        )}
      </div>
    </nav>
  );
}