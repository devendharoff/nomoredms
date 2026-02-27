'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-6 p-6 rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">System Malfunction</h2>
            <p className="text-zinc-500 mb-8 max-w-md">The system encountered an unexpected error. Our engineers have been notified.</p>
            <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition active:scale-95"
            >
                <RefreshCw className="h-4 w-4" /> Reboot System
            </button>
        </div>
    );
}
