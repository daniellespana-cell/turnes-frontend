import React from 'react';

/**
 * 🛡️ ErrorBoundary — Turnes Production Safety Net
 *
 * Captura errores de JS en cualquier árbol de componentes hijos.
 * Muestra UI de recuperación en lugar de pantalla blanca.
 * Úsalo envolviendo páginas o secciones críticas.
 *
 * Uso:
 *   <ErrorBoundary>
 *     <ExploreVacancies />
 *   </ErrorBoundary>
 *
 * Con contexto personalizado:
 *   <ErrorBoundary context="ExploreVacancies" onReset={() => navigate(-1)}>
 *     <ExploreVacancies />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // Aquí se conectaría Sentry / LogRocket en producción
        console.error(
            `[ErrorBoundary][${this.props.context || 'App'}]`,
            error,
            info.componentStack
        );
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        this.props.onReset?.();
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-3xl">
                    ⚠️
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white mb-1">
                        Algo salió mal
                    </h2>
                    <p className="text-sm text-zinc-500 max-w-xs">
                        {this.props.message || 'Ocurrió un error inesperado. Intenta de nuevo.'}
                    </p>
                    {import.meta.env.DEV && (
                        <pre className="mt-3 text-left text-[10px] text-red-400 bg-red-950/30 rounded-xl p-3 max-w-sm overflow-auto">
                            {this.state.error?.message}
                        </pre>
                    )}
                </div>
                <button
                    onClick={this.handleReset}
                    className="px-5 py-2.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-xl text-sm font-bold hover:bg-brand-primary/20 transition-colors"
                    type="button"
                    aria-label="Acción">
                    Intentar de nuevo
                </button>
            </div>
        );
    }
}

export default ErrorBoundary;
