'use client';
import { useState } from 'react';
import Image from 'next/image';

const rankMedal: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

type Entry = {
    rank: number;
    total_points: number;
    profile_id: string;
    profiles: { username: string; avatar_url: string | null } | null;
};

interface Props {
    allTime: Entry[];
    monthly: Entry[];
    daily: Entry[];
    weekly: Entry[];
    myProfileId: string | null;
}

const tabs = [
    { key: 'all_time', label: 'All Time' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'daily', label: 'Daily' },
];

export default function LeaderboardTabs({ allTime, monthly, daily, weekly, myProfileId }: Props) {
    const [active, setActive] = useState('all_time');

    const data: Record<string, Entry[]> = {
        all_time: allTime,
        monthly,
        weekly,
        daily,
    };

    const entries = data[active];

    return (
        <div>
            {/* Tab bar */}
            <div className="flex gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActive(tab.key)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition ${active === tab.key
                                ? 'bg-yellow-400 text-black'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Entries */}
            {!entries || entries.length === 0 ? (
                <div className="bg-[#111] border border-white/10 rounded-xl p-8 text-center text-gray-500 text-sm">
                    No entries yet for this period.
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {entries.map((entry) => {
                        const profile = entry.profiles;
                        const isMe = myProfileId === entry.profile_id;

                        return (
                            <div
                                key={entry.profile_id}
                                className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition ${isMe
                                        ? 'bg-yellow-400/10 border-yellow-400/40'
                                        : 'bg-[#111] border-white/10'
                                    }`}
                            >
                                <div className="w-8 text-center font-bold text-lg">
                                    {rankMedal[entry.rank] ?? entry.rank}
                                </div>

                                {profile?.avatar_url ? (
                                    <Image
                                        src={profile.avatar_url}
                                        alt={profile.username}
                                        width={36}
                                        height={36}
                                        className="rounded-full border border-white/20"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                                        {profile?.username?.[0]?.toUpperCase()}
                                    </div>
                                )}

                                <div className="flex-1">
                                    <p className={`font-semibold text-sm ${isMe ? 'text-yellow-400' : 'text-white'}`}>
                                        {profile?.username} {isMe && '(you)'}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="font-bold text-yellow-400">{entry.total_points}</p>
                                    <p className="text-gray-500 text-xs">points</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}