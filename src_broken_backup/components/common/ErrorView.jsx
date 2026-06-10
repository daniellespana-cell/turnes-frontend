
const ErrorView = ({ message }) => (
    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        role="alert"
        className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
            <Search className="text-red-400" size={24} aria-hidden="true" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Error de Conexión</h3>
        <p className="text-zinc-500 text-sm max-w-xs mb-6">{message}</p>
        <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-zinc-800 text-white text-xs font-bold rounded-xl hover:bg-zinc-700 transition-colors"
        >
            Reintentar
        </button>
    </motion.div>
);

export default ErrorView;
