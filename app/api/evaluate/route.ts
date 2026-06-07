import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {

  // ── Step 1: Verify user is logged in ──────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // ── Step 2: Get profile id from user ──────────────────────
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // ── Step 3: Parse request body ────────────────────────────
  const { code, challengeId } = await request.json();

  if (!code || !challengeId) {
    return NextResponse.json({ error: 'Missing code or challengeId' }, { status: 400 });
  }

  // ── Step 4: Get challenge details ─────────────────────────
  const { data: challenge } = await supabaseAdmin
    .from('challenges')
    .select('*')
    .eq('id', challengeId)
    .single();

  if (!challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  }

  // ── Step 5: Guard — already passed this challenge? ────────
  const { data: alreadyPassed } = await supabaseAdmin
    .from('submissions')
    .select('id')
    .eq('profile_id', profile.id)
    .eq('challenge_id', challengeId)
    .eq('status', 'passed')
    .maybeSingle();

  if (alreadyPassed) {
    return NextResponse.json({ error: 'Already solved' , alreadySolved: true }, { status: 200 });
  }

  // ── Step 6: Guard — already pending? (double submit) ──────
  const { data: alreadyPending } = await supabaseAdmin
    .from('submissions')
    .select('id')
    .eq('profile_id', profile.id)
    .eq('challenge_id', challengeId)
    .eq('status', 'pending')
    .maybeSingle();

  if (alreadyPending) {
    return NextResponse.json({ error: 'Already evaluating' }, { status: 429 });
  }

  // ── Step 7: Insert pending submission ─────────────────────
  const { data: submission, error: insertError } = await supabaseAdmin
    .from('submissions')
    .insert({
      profile_id: profile.id,
      challenge_id: challengeId,
      code_snapshot: code,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError || !submission) {
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }

  // ── Step 8: Call Groq with timeout ────────────────────────
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const groqResponse = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a strict, automated compiler and senior JavaScript code reviewer.

Evaluate the submitted code against the challenge description provided.

Rules:
- Fail the submission if it contains syntax errors.
- Fail the submission if it uses non-vanilla JS (React, jQuery, TypeScript, etc).
- Fail the submission if the logic does not correctly solve the challenge.
- Score only if the submission passes.

You MUST respond with a single raw JSON object and nothing else.
No markdown. No backticks. No explanation. No preamble.

Response format:
{"passed": boolean, "score": number between 1 and 5 (0 if passed is false), "feedback": "Exactly 2 sentences. If passed, describe a strength and one optimization. If failed, describe the specific error and how to fix it."}`,
        },
        {
          role: 'user',
          content: `Challenge: ${challenge.title}\n\nDescription: ${challenge.description}\n\nSubmitted Code:\n${code}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.1,
    });

    clearTimeout(timeout);

    // ── Step 9: Parse Groq response ───────────────────────
    const raw = groqResponse.choices[0]?.message?.content ?? '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // ── Step 10: Validate shape ───────────────────────────
    if (typeof parsed.passed !== 'boolean' || typeof parsed.score !== 'number') {
      throw new Error('Invalid JSON shape from Groq');
    }

    // ── Step 11: Update submission in DB ──────────────────
    await supabaseAdmin
      .from('submissions')
      .update({
        status: parsed.passed ? 'passed' : 'failed',
        ai_score: parsed.passed ? parsed.score : 0,
        ai_feedback: parsed.feedback,
        points_earned: parsed.passed ? challenge.points_reward + parsed.score : 0,
      })
      .eq('id', submission.id);

    return NextResponse.json({
      passed: parsed.passed,
      score: parsed.score,
      feedback: parsed.feedback,
      pointsEarned: parsed.passed ? challenge.points_reward + parsed.score : 0,
    });

  } catch (err: unknown) {

    clearTimeout(timeout);

    // ── Step 12: Fallback — never leave submission pending ─
    await supabaseAdmin
      .from('submissions')
      .update({
        status: 'failed',
        ai_score: 0,
        ai_feedback: 'Our evaluator ran into an issue. Your code looks fine — please try submitting again.',
      })
      .eq('id', submission.id);

    const isTimeout = (err as Error)?.name === 'AbortError';
    return NextResponse.json({
      passed: false,
      score: 0,
      feedback: isTimeout
        ? 'Evaluation timed out. Please try again.'
        : 'Our evaluator ran into an issue. Please try submitting again.',
    }, { status: 200 });
  }
}