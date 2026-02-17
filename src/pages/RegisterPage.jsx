import React from 'react';
import { RegisterProvider, useRegister } from '../context/RegisterContext';
import RoleSelection from '../components/RoleSelection';
import JobSeekerForm from '../components/forms/JobSeekerForm';
import CompanyForm from '../components/forms/CompanyForm';
import AuthNavbar from '../components/layout/AuthNavbar'; // ✅ New Navbar
import FormContainer from '../components/layout/FormContainer';
import AntigravityBackground from '../components/layout/AntigravityBackground';

// --- CONFIGURATION MAPPING ---
const FORM_COMPONENTS = {
    jobseeker: JobSeekerForm,
    company: CompanyForm
};

const RegisterPageContent = () => {
    const { role, setRole } = useRegister();
    const ActiveComponent = role ? FORM_COMPONENTS[role] : RoleSelection;

    // Dynamic Header Info
    const headerInfo = role === 'company'
        ? { title: "Cuenta de Empresa", subtitle: "Publica ofertas y gestiona talento." }
        : { title: "Cuenta de Candidato", subtitle: "Encuentra tu próximo empleo." };

    // Use a simplified logic for the container: if role selected, wrap in FormContainer to handle Back
    const content = role ? (
        <FormContainer
            onBack={() => setRole(null)}
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
        >
            <ActiveComponent />
        </FormContainer>
    ) : (
        <ActiveComponent setRole={setRole} />
    );

    return (
        <div className="min-h-screen w-full bg-[#09090b] font-sans flex flex-col items-center justify-center text-white selection:bg-emerald-500/30 relative overflow-hidden">

            {/* --- ANTIGRAVITY ANIMATED BACKGROUND --- */}
            <AntigravityBackground role={role} />

            {/* --- NAVBAR --- */}
            <AuthNavbar />

            {/* --- MAIN CONTENT --- */}
            <div className="w-full max-w-2xl relative z-10 p-4">

                {/* Header only if no role selected (to avoid clutter when filling form) */}
                {!role && (
                    <div className="text-center mb-8 animate-fade-in-up">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            Crea tu cuenta
                        </h1>
                        <p className="text-zinc-400">
                            Únete a la red profesional de Turnes.
                        </p>
                    </div>
                )}

                <div className={`transition-all duration-500 w-full max-w-md mx-auto ${role ? 'mt-4' : ''}`}>
                    {content}
                </div>

            </div>

            {/* Footer Micro */}
            <div className="absolute bottom-4 text-center w-full z-10 pointer-events-none">
                <p className="text-[10px] text-zinc-600">
                    Turnes™ Secure Registration
                </p>
            </div>
        </div>
    );
};

const RegisterPage = () => (
    <RegisterProvider>
        <RegisterPageContent />
    </RegisterProvider>
);

export default RegisterPage;