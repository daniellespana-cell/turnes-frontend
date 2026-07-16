import React from 'react';
import { Link } from 'react-router-dom';

import { useLocation } from 'react-router-dom';
import turnesLogo from "../../assets/logo-turnes.png"; // ✅ Official Logo

// Replicating AnimatedButton from Navbar for perfect consistency
const AnimatedButton = ({ to, label, isSuccess = false }) => (
    <Link
        to={to}
        className={`
      btn relative rounded-xl font-bold overflow-hidden group transition-all duration-300
      text-white border px-5 py-2.5 md:px-6 md:py-3 ml-3 shadow-md flex items-center justify-center text-sm md:text-base
      ${isSuccess
                ? "border-brand-success bg-brand-primary hover:bg-brand-primary/90 hover:border-white/70 shadow-brand-primary/30"
                : "border-transparent bg-transparent hover:bg-white/5 text-zinc-300 hover:text-white"
            }
    `}
    >
        <span className="relative z-10">{label}</span>
    </Link>
);

const AuthNavbar = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    return (
        <nav 
            className="absolute top-0 left-0 w-full z-50 p-6 flex items-center justify-between pointer-events-none"
            style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top))' }}
        >
            {/* Logo Official */}
            <Link to="/" className="flex items-center space-x-2 group pointer-events-auto">
                <img
                    src={turnesLogo}
                    alt="Turnes Logo"
                    className="h-8 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
            </Link>

            {/* Auth Actions with Animated Buttons */}
            <div className="flex items-center gap-2 pointer-events-auto">
                {isLogin ? (
                    <>
                        <span className="text-sm md:text-base text-zinc-400 hidden sm:block font-medium">¿No tienes cuenta?</span>
                        {/* "Regístrate" needs to look like the primary CTA */}
                        <AnimatedButton to="/register" label="Regístrate" isSuccess={true} />
                    </>
                ) : (
                    <>
                        <span className="text-sm md:text-base text-zinc-400 hidden sm:block font-medium">¿Ya tienes cuenta?</span>
                        {/* "Ingresar" also primary for consistency request */}
                        <AnimatedButton to="/login" label="Ingresar" isSuccess={true} />
                    </>
                )}
            </div>
        </nav>
    );
};

export default AuthNavbar;
