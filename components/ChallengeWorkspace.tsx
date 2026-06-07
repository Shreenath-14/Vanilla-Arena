'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';    
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const difficultyColor: Record<string, string> = {
  easy:   'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  hard:   'bg-red-500/20 text-red-400',
};

interface Challenge {
  id: string;
  title: string;
  description: string;
  starter_code: string;
  points_reward: number;
  difficulty: string;
}

interface Props {
  challenge: Challenge;
  userId: string | null;
}

interface EvalResult {
  passed: boolean;
  score: number;
  feedback: string;
  pointsEarned: number;
  alreadySolved?: boolean;
}

export default function ChallengeWorkspace({ challenge, userId }: Props) {
  const [code, setCode] = useState((challenge.starter_code ?? '').replace(/\\n/g, '\n'));
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [alreadySolved, setAlreadySolved] = useState(false);

  // Check on load if user already solved this challenge
  useEffect(() => {
    if (!userId) return;
    const checkSolved = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      if (!profile) return;

      const { data } = await supabase
        .from('submissions')
        .select('status')
        .eq('profile_id', profile.id)
        .eq('challenge_id', challenge.id)
        .eq('status', 'passed')
        .maybeSingle();

      if (data) setAlreadySolved(true);
    };
    checkSolved();
  }, [userId, challenge.id]);

  const handleSubmit = async () => {
    if (!userId) { alert('Please log in to submit.'); return; }
    if (isEvaluating || alreadySolved) return;

    setIsEvaluating(true);
    setResult(null);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, challengeId: challenge.id }),
      });

      const data = await res.json();

      if (data.alreadySolved) {
        setAlreadySolved(true);
        return;
      }

      setResult({
        passed: data.passed,
        score: data.score,
        feedback: data.feedback,
        pointsEarned: data.pointsEarned ?? 0,
      });

      if (data.passed) setAlreadySolved(true);

    } catch {
      setResult({
        passed: false,
        score: 0,
        feedback: 'Something went wrong. Please try again.',
        pointsEarned: 0,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-4 flex items-center gap-4">
        <Link href="/challenges" className="text-gray-400 hover:text-white text-sm transition">← Challenges</Link>
        <h1 className="font-bold text-lg">{challenge.title}</h1>
        <span className={`text-xs px-3 py-1 rounded-full ${difficultyColor[challenge.difficulty]}`}>
          {challenge.difficulty}
        </span>
        <span className="text-xs text-gray-400 ml-auto">{challenge.points_reward} pts</span>
      </div>

      {/* Two column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — description */}
        <div className="w-2/5 border-r border-white/10 p-8 overflow-y-auto flex flex-col gap-6">
          <div>
            <h2 className="font-semibold text-gray-400 mb-3 uppercase text-xs tracking-widest">Challenge</h2>
            <p className="text-gray-300 leading-relaxed">{challenge.description}</p>
          </div>

          {/* Already solved banner */}
          {alreadySolved && !result && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm">
              ✅ You already solved this challenge!
            </div>
          )}

          {/* Result panel */}
          {result && (
            <div className={`p-4 rounded-xl border text-sm ${
              result.passed
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {result.passed ? (
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-base">✅ Passed!</p>
                  <p className="text-green-400 font-semibold">
                    +{result.pointsEarned} pts · Score: {result.score}/5
                  </p>
                  <p className="text-green-200/80">{result.feedback}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-base">❌ Failed</p>
                  <p className="text-red-200/80">{result.feedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Evaluating state */}
          {isEvaluating && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm animate-pulse">
              🤖 AI is reviewing your code...
            </div>
          )}
        </div>

        {/* Right — Monaco Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <MonacoEditor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val ?? '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                readOnly: alreadySolved,
              }}
            />
          </div>

          {/* Submit bar */}
          <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {alreadySolved
                ? '🔒 Challenge solved — editor locked'
                : 'Write your solution and click Submit'}
            </p>
            <button
              onClick={handleSubmit}
              disabled={isEvaluating || alreadySolved}
              className="bg-white text-black px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isEvaluating ? '⏳ Evaluating...' : alreadySolved ? '✅ Solved' : 'Submit Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}