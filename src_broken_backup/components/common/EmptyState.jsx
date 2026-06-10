
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 space-y-3 opacity-60">
        <div className="p-3 rounded-full bg-zinc-800/50 border border-transparent">
          <Icon size={20} className="text-zinc-500" />
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{title}</p>
          {description && <p className="text-[10px] text-zinc-600 mt-1 max-w-[200px] mx-auto">{description}</p>}
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="mt-2 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center justify-center py-20 px-4 border border-dashed border-white/5 rounded-[2rem] bg-black/20 backdrop-blur-sm"
    >
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative p-5 rounded-2xl bg-zinc-900/50 border border-transparent ">
          <Icon size={40} className="text-zinc-500 group-hover:text-purple-400 transition-colors duration-500" />
        </div>
      </div>

      <h3 className="text-zinc-300 font-bold text-lg uppercase tracking-widest text-center max-w-md mx-auto">
        {title}
      </h3>

      {description && (
        <p className="text-zinc-500 text-sm text-center max-w-sm mx-auto mt-3 leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="mt-8 px-6 py-2.5 rounded-full bg-zinc-100 text-black font-bold text-xs uppercase tracking-[0.15em] hover:bg-white hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all duration-300"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;