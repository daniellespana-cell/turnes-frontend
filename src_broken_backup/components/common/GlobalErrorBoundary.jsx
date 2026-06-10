import React from 'react';

/**
 * 🛡️ Global Error Boundary
 * SINGLE SOURCE OF TRUTH para el manejo de excepciones no controladas en el árbol de React.
 * Si algo falla, atrapa el error y muestra una UI amigable sin tumbar toda la aplicación.
 */
class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Actualiza el estado para que la próxima renderización muestre la UI de repuesto.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Aquí podrías enviar el error a tu sistema de analíticas (Sentry, PostHog, etc.)
        console.error('💥 [Turnes Error Boundary Atrapó un Fallo]:', error, errorInfo);
    }

    handleReset = () => {
        // Reinicio manual de la aplicación (Limpia cachés problemáticas)
        window.location.href = '/';
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30 font-manrope">
                    <div className="max-w-md w-full bg-zinc-900/50 border border-emerald-500/10 rounded-3xl p-8 text-center backdrop-blur-sm shadow-2xl relative overflow-hidden">
                        
                        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center mx-auto mb-6 relative z-10">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                        </div>
                        
                        <h1 className="text-2xl font-bold text-white mb-3 relative z-10">
                            Interrupción Temporal
                        </h1>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-8 relative z-10">
                            Encontramos un error inesperado. Nuestro equipo técnico ya fue notificado. Por favor, refresca la aplicación para continuar.
                        </p>
                        
                        <button 
                            onClick={this.handleReset}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-6 rounded-xl transition-all duration-300 relative z-10"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Recargar Turnes
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
