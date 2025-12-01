'use client';

import { Clapperboard, User as UserIcon, ListPlus, Settings } from 'lucide-react';
import Link from 'next/link';

export function MobileHeader() {
    return (
        <div className="md:hidden flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-cyan-400">
                <Clapperboard size={24} />
                <h1 className="text-xl font-bold text-white">CineLog</h1>
            </div>

            <div className="flex gap-4">
                <button className="text-slate-400 hover:text-white">
                    <UserIcon size={24} />
                </button>
                <button className="text-slate-400 hover:text-white">
                    <ListPlus size={24} />
                </button>
                <button className="text-slate-400 hover:text-white">
                    <Settings size={24} />
                </button>
            </div>
        </div>
    );
}
