// 🛡️ SENIOR FIX: Importamos Link

const LoginPage = () => {
    return (
        <div className="min-h-screen w-full bg-[#09090b] font-sans flex flex-col items-center justify-center text-white selection:bg-emerald-500/30 relative overflow-hidden">

            {/* --- ANTIGRAVITY ANIMATED BACKGROUND --- */}
            <AntigravityBackground />

            {/* --- NAVBAR --- */}
            <AuthNavbar />

            {/* --- MAIN CONTENT --- */}
            <div className="w-full max-w-[340px] relative z-10 flex flex-col gap-6 animate-fade-in-up p-4">

                <div className="text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                        Bienvenido
                    </h2>
                    <p className="text-zinc-400 text-sm">
                        Ingresa a tu espacio de trabajo.
                    </p>
                </div>

                <div className="w-full">
                    {/* El bug de "Iniciando..." vive dentro de este componente. 
                      Seguramente le falta un bloque 'finally' para apagar el loading si falla la red.
                    */}
                    <LoginForm />
                </div>

                {/* LEGAL FOOTER */}
                <div className="text-center space-y-2">
                    <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[280px] mx-auto">
                        Al continuar, aceptas nuestros{' '}
                        {/* 🛡️ SENIOR FIX: Usamos <Link> en lugar de <a> */}
                        <Link to="/terminos" className="text-zinc-400 hover:text-emerald-400 underline transition-colors">
                            Términos
                        </Link>{' '}
                        y{' '}
                        <Link to="/privacidad" className="text-zinc-400 hover:text-emerald-400 underline transition-colors">
                            Política de Privacidad
                        </Link>.
                    </p>
                    <div className="text-[10px] text-zinc-700">
                        Turnes™ © 2026
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;