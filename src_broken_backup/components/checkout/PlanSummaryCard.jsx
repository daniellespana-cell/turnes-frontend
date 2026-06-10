
const PlanSummaryCard = ({ item }) => {
    if (!item) return null;

    return (
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-transparent rounded-3xl p-6 overflow-hidden relative">
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-${item.accent}-500 to-transparent`} />

            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-white">{item.price}</span>
                <span className="text-xs text-zinc-500 uppercase font-bold">{item.period}</span>
            </div>

            <ul className="space-y-3 mb-6">
                {item.features.map((feat, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-300">
                        <Check size={16} className={`text-${item.accent}-400 shrink-0 mt-0.5`} />
                        <span>{feat}</span>
                    </li>
                ))}
            </ul>

            <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-zinc-500 italic">{item.terms}</p>
            </div>
        </div>
    );
};

export default PlanSummaryCard;
