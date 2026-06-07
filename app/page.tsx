'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  useEffect(() => {
    supabase.from('challenges').select('*').limit(1)
      .then(({ data, error }) => {
        console.log('Supabase test:', data, error);
      });
  }, []);

  return <h1>VanillaArena</h1>;
}