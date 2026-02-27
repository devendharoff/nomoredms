export default function Loading() {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-green-500/20 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
            </div>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] font-black animate-pulse">Loading Resources...</p>
        </div>
    );
}
