import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RegisterProvider } from '../../context/RegisterContext';
import RoleSelection from '../../components/auth/RoleSelection';
import AuthNavbar from '../../components/layout/AuthNavbar';
import FormContainer from '../../components/layout/FormContainer';
import AntigravityBackground from '../../components/layout/AntigravityBackground';

import { useRegister } from '../../context/RegisterContext';
import JobSeekerForm from '../../components/forms/JobSeekerForm';
import CompanyForm from '../../components/forms/CompanyForm';
// ✅ New Navbar
import { useOnboarding } from '../../hooks/useOnboarding';

// --- CONFIGURATION MAPPING ---
const FORM_COMPONENTS = {
    jobseeker: JobSeekerForm,
    company: CompanyForm
};

// 🟢 Stepper de Registro Reutilizable (Empresas y Postulantes)
const RegistrationStepsHeader = ({ title, steps }) => (
    <div className="w-full text-center mb-6 pt-1 animate-fade-in select-none">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-5">
            {title}
        </h1>

        <div className="flex items-center justify-between max-w-sm mx-auto px-1">
            {/* Paso 1: Activo */}
            <div className="flex flex-col items-center shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-emerald-400 bg-emerald-500/10 text-emerald-400 font-bold text-xs sm:text-sm flex items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.35)]">
                    1
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-emerald-400 mt-2 text-center">
                    {steps[0]}
                </span>
            </div>

            {/* Línea conectora 1 a 2: mitad verde continuo, mitad punteado */}
            <div className="flex-1 flex items-center mx-2 -mt-5">
                <div className="h-[2px] w-1/2 bg-emerald-400" />
                <div className="h-[2px] w-1/2 border-t-2 border-dashed border-zinc-600" />
            </div>

            {/* Paso 2 */}
            <div className="flex flex-col items-center shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-zinc-600 bg-zinc-900 text-zinc-300 font-bold text-xs sm:text-sm flex items-center justify-center">
                    2
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-zinc-300 mt-2 text-center whitespace-nowrap">
                    {steps[1]}
                </span>
            </div>

            {/* Línea conectora 2 a 3: totalmente punteado */}
            <div className="flex-1 flex items-center mx-2 -mt-5">
                <div className="h-[2px] w-full border-t-2 border-dashed border-zinc-600" />
            </div>

            {/* Paso 3 */}
            <div className="flex flex-col items-center shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-zinc-600 bg-zinc-900 text-zinc-300 font-bold text-xs sm:text-sm flex items-center justify-center">
                    3
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-zinc-300 mt-2 text-center whitespace-nowrap">
                    {steps[2]}
                </span>
            </div>
        </div>
    </div>
);

const RegisterPageContent = () => {
    const { role, setRole } = useRegister();
    const { isOnboardingTrapped, confirmGoogleRole, isRoleLoading, emergencyLogout } = useOnboarding();

    // The Active Form depending on Selection
    const renderForm = () => {
        if (!role) return null;
        const FormComponent = FORM_COMPONENTS[role];
        
        const isCompany = role === 'company';
        const headerTitle = isCompany ? "Contrata personal en pocos clics" : "Trabaja en pocos clics";
        const steps = isCompany
            ? ["Regístrate", "Publica una oferta", "Contrata personal"]
            : ["Regístrate", "Completa perfil", "Postúlate a una oferta"];

        return (
            <FormContainer 
                onBack={() => setRole(null)} 
                headerSlot={<RegistrationStepsHeader title={headerTitle} steps={steps} />}
                maxWidth="max-w-md"
            >
                <FormComponent />
            </FormContainer>
        );
    };

    return (
        <div className="min-h-screen w-full bg-[#09090b] font-sans flex flex-col items-center justify-center text-white selection:bg-emerald-500/30 relative overflow-hidden">
            {/* Background & Nav */}
            <AntigravityBackground role={role} />
            <AuthNavbar />
            {/* Main Content */}
            <div className="w-full max-w-2xl relative z-10 p-4 transform transition-all duration-500">
                {!role && (
                    <div className="text-center mb-8 animate-fade-in-up">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Crea tu cuenta</h1>
                        <p className="text-zinc-400">Únete a la red profesional de Turnes.</p>
                    </div>
                )}

                <div className={`w-full max-w-md mx-auto ${role ? 'mt-4' : ''}`}>
                    {role ? (
                        renderForm()
                    ) : (
                        <RoleSelection 
                            setRole={(selected) => isOnboardingTrapped ? confirmGoogleRole(selected) : setRole(selected)} 
                            isGoogleOnboarding={isOnboardingTrapped} 
                            isRoleLoading={isRoleLoading} 
                        />
                    )}
                </div>
            </div>
            {/* Footer / Emergency Exit */}
            <div className="absolute bottom-4 text-center w-full z-10 font-medium">
                {isOnboardingTrapped ? (
                    <div className="flex flex-col items-center justify-center gap-1 animate-fade-in-up">
                        <p className="text-xs text-zinc-400">¿Entraste con la cuenta equivocada?</p>
                        <button
                            onClick={emergencyLogout}
                            className="text-xs text-brand-primary hover:text-emerald-400 underline underline-offset-2 transition-colors"
                            type="button"
                            aria-label="Acción">
                            Cerrar sesión y volver al inicio
                        </button>
                    </div>
                ) : (
                    <p className="text-[10px] text-zinc-600 pointer-events-none">Turnes™ Secure Registration</p>
                )}
            </div>
        </div>
    );
};

const RegisterPage = () => {
    const { roleUrl } = useParams();
    const navigate = useNavigate();
    
    // Map URL param to internal role type (Case Insensitive - Senior Practice)
    let initialRole = null;
    const normalizedRole = roleUrl?.toLowerCase();
    
    if (normalizedRole === 'empresa' || normalizedRole === 'company') initialRole = 'company';
    if (normalizedRole === 'talento' || normalizedRole === 'jobseeker' || normalizedRole === 'postulante') initialRole = 'jobseeker';

    // Handle internal navigation for "onBack" clean URL
    const handleReset = () => {
        if (roleUrl) {
            navigate('/register', { replace: true });
        }
    };

    return (
        <RegisterProvider initialRole={initialRole} onReset={handleReset}>
            <RegisterPageContent />
        </RegisterProvider>
    );
};

export default RegisterPage;