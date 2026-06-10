import React from 'react';


const PaymentSuccessOverlay = ({ show }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent animate-pulse" />
            </div>
            <div className="text-center animate-bounce z-10 relative">
                <h1 className="text-6xl mb-4">🎉</h1>
                <h2 className="text-3xl font-bold text-white mb-2">¡Todo Listo!</h2>
                <p className="text-zinc-400">Tu compra ha sido procesada.</p>
            </div>
        </div>
    );
};

export default PaymentSuccessOverlay;
