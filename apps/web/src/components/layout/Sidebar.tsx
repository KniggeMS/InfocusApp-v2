'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    MonitorPlay,
    Tv,
    CheckCircle,
    Heart,
    List,
    Share2,
    PlusCircle,
    Settings,
    Clapperboard,
    Sparkles,
    Plus,
    Loader2
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function Sidebar() {
    const t = useTranslations('Navigation');
    const pathname = usePathname();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Helper for active link styling
    const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
            >
                <Icon size={20} />
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col sticky top-0 h-screen z-20">
            {/* Header */}
            <div className="p-6 flex items-center justify-between text-cyan-400">
                <div className="flex items-center gap-2">
                    <Clapperboard size={28} />
                    <h1 className="text-2xl font-bold tracking-tight text-white">CineLog</h1>
                </div>
                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="text-slate-500 hover:text-white transition-colors"
                    title="Settings"
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-grow px-4 space-y-1 overflow-y-auto pb-4 custom-scrollbar">
                <NavItem href="/" icon={LayoutDashboard} label={t('overview')} />

                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('my_lists')}
                </div>
                <NavItem href="/watchlist" icon={MonitorPlay} label={t('planned')} />
                <NavItem href="/watching" icon={Tv} label={t('watching')} />
                <NavItem href="/watched" icon={CheckCircle} label={t('seen')} />
                <NavItem href="/favorites" icon={Heart} label={t('favorites')} />

                {/* Custom Lists Placeholder */}
                <div className="pt-4 pb-2 px-4 flex items-center justify-between group cursor-pointer">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custom Lists</span>
                    <button className="text-slate-500 hover:text-cyan-400 transition-colors">
                        <PlusCircle size={14} />
                    </button>
                </div>

                {/* Add Button */}
                <div className="pt-6">
                    <button
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-900/20 transition-all hover:scale-[1.02]"
                    >
                        <Plus size={20} />
                        <span>Add Movie</span>
                    </button>
                </div>
            </nav>

            {/* AI Widget */}
            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                            <Sparkles size={14} className="text-purple-400" />
                            AI Tip
                        </h4>
                    </div>
                    <p className="text-xs text-slate-500">
                        Get personalized recommendations based on your watchlist.
                    </p>
                </div>
            </div>
        </aside>
    );
}
