
/**
 * 🦴 SKELETON INTELIGENTE (Premium Loading State)
 * Dumb component that displays a loading placeholder for candidate cards.
 */
export const PostulanteSkeleton = () => {
    return (
        <div className="rounded-[2rem] border border-transparent bg-[#0a0a0a] p-5 flex flex-col gap-4 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-zinc-800 rounded" />
                    <div className="h-2 w-1/4 bg-zinc-900 rounded" />
                </div>
            </div>
            <div className="h-10 w-full bg-zinc-900/50 rounded-lg" />
        </div>
    );
};

export default PostulanteSkeleton;
