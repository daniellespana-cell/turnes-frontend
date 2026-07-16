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

const RegisterPageContent = () => {
    const { role, setRole } = useRegister();
    const { isOnboardingTrapped, confirmGoogleRole, isRoleLoading, emergencyLogout } = useOnboarding();

    // The Active Form depending on Selection
    const renderForm = () => {
        if (!role) return null;
        const FormComponent = FORM_COMPONENTS[role];
        const title = role === 'company' ? "Cuenta de Empresa" : "Cuenta de Candidato";
        const subtitle = role === 'company' ? "Publica ofertas y gestiona talento." : "Encuentra tu próximo empleo.";
        
        return (
            <FormContainer onBack={() => setRole(null)} title={title} subtitle={subtitle}>
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
    
    // Map URL param to internal role type
    let initialRole = null;
    if (roleUrl === 'empresa' || roleUrl === 'company') initialRole = 'company';
    if (roleUrl === 'talento' || roleUrl === 'jobseeker' || roleUrl === 'postulante') initialRole = 'jobseeker';

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