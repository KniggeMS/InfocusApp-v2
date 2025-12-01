
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { aiApi } from '@/lib/api/ai';
import { useAuth } from '@/lib/context/auth-context';
import Image from 'next/image';

export interface AvatarGeneratorProps {
    onGenerate?: (url: string) => void;
}

export function AvatarGenerator({ onGenerate }: AvatarGeneratorProps) {
    const { user } = useAuth();
    const [username, setUsername] = useState(user?.displayName || user?.name || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!username) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await aiApi.generateAvatar(username);
            if (response.avatarUrl) {
                if (onGenerate) {
                    onGenerate(response.avatarUrl);
                }
            } else {
                setError('Failed to generate avatar. Please try again.');
            }
        } catch (err) {
            console.error('Avatar generation error:', err);
            setError('An error occurred while generating the avatar.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-2">
                <label htmlFor="username" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Generate from Name
                </label>
                <div className="flex space-x-2">
                    <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter name..."
                        disabled={isLoading}
                        className="bg-slate-900 border-slate-700"
                    />
                    <Button onClick={handleGenerate} disabled={isLoading || !username} variant="secondary">
                        {isLoading ? '...' : 'Generate'}
                    </Button>
                </div>
                <p className="text-[10px] text-slate-500">
                    Enter a keyword to generate a unique AI avatar style.
                </p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
