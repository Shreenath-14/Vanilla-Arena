'use client';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      },
    });
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-2">VanillaArena</h1>
      <p className="text-gray-400 mb-8">Master vanilla JavaScript. Get scored by AI.</p>
      <button
        onClick={handleGitHubLogin}
        className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
      >
        Sign in with GitHub
      </button>
    </main>
  );
}