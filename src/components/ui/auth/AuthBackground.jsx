import React from 'react';


const AuthBackground = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-30%] right-[20%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-30%] left-[20%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
        </div>
    );
};

export default AuthBackground;
