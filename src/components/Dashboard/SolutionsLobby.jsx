import React from 'react';
import { Rocket, ShieldCheck, Briefcase, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * SolutionsLobby: Estética iOS con redirección precisa a la ruta /publicar.
 */
export const SolutionsLobby = ({ onCreate }) => {
  const { user, actualizarSaldo } = useAuth();
  const navigate = useNavigate();

  const serviciosEmpresa = [
    {
      id: 'boost',
      title: 'Impulso Urgente',
      icon: Rocket,
      color: 'text-orange-400',
      price: 7000,
      desc: 'Contrata 2.4x más rápido posicionando tu vacante en el top.',
      hasAction: false
    },
    {
      id: 'verify',
      title: 'Verificación Elite',
      icon: ShieldCheck,
      color: 'text-blue-400',
      price: 20000,
      desc: 'Atrae 40% más postulantes con el sello de confianza.',
      actionType: 'buy',
      label: 'Obtener'
    },
    {
      id: 'fixed',
      title: 'Contrato Fijo',
      icon: Briefcase,
      color: 'text-emerald-400',
      price: 19900,
      desc: 'Publica tus ofertas para turnos fijos dependiendo de tu plan contratado.',
      actionType: 'create',
      label: 'Publicar'
    },
  ];

  const handleAction = async (serv) => {
    // REDIRECCIÓN EXACTA A LA RUTA DEFINIDA
    if (serv.actionType === 'create') {
      if (onCreate) onCreate(); // Ejecuta lógica extra si existe
      navigate('/dashboard/publicar'); // <--- Ruta sincronizada con tu App.jsx
      return;
    }

    // LÓGICA DE COMPRA PARA MICROSERVICIOS
    const saldoActual = user?.saldo || 0;
    if (saldoActual >= serv.price) {
      const confirmar = window.confirm(`¿Confirmas la activación de ${serv.title}?`);
      if (confirmar) {
        await actualizarSaldo(saldoActual - serv.price);
        alert(`${serv.title} activado.`);
      }
    } else {
      // Si no hay saldo, mandamos a recargar (ajusta si esta ruta cambia también)
      navigate('/dashboard/finanzas/recargar', { state: { amount: serv.price } });
    }
  };

  return (
    <section className="space-y-3">
      {/* Header Estilo iOS Nano-Scale */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 opacity-40">
          <Sparkles size={8} className="text-purple-400" />
          <h2 className="text-[7px] font-bold text-white uppercase tracking-[0.4em] antialiased">
            Soluciones
          </h2>
        </div>

        {/* Badge Información: Pago único */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <AlertCircle size={8} className="text-amber-500" />
          <span className="text-[6px] font-bold text-amber-500 uppercase tracking-widest">
            Información: Pago único
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {serviciosEmpresa.map((serv) => (
          <div
            key={serv.id}
            className="group bg-zinc-900/10 border border-white/5 p-4 rounded-xl transition-all duration-500 hover:bg-zinc-900/30 flex flex-col justify-between h-full relative overflow-hidden"
          >
            <div>
              <div className={`w-8 h-8 ${serv.color} bg-white/5 rounded-lg flex items-center justify-center mb-3 border border-white/5`}>
                <serv.icon size={14} />
              </div>

              <h4 className="text-[9px] font-bold text-white uppercase tracking-wider mb-1 leading-none antialiased">
                {serv.title}
              </h4>

              <p className="text-[9px] text-zinc-600 leading-tight font-medium tracking-tight mb-4">
                {serv.desc}
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-end justify-between px-0.5">
                <div className="flex flex-col">
                  <span className="text-[5px] font-bold text-zinc-800 uppercase tracking-tighter">Inversión</span>
                  <span className="text-[10px] font-bold text-zinc-300 tabular-nums">
                    ${serv.price.toLocaleString()}
                  </span>
                </div>
                <Zap size={10} className="text-zinc-900 group-hover:text-yellow-500/30 transition-colors" />
              </div>

              {serv.label ? (
                <button
                  onClick={() => handleAction(serv)}
                  className="w-full py-2 bg-brand-primary/90 hover:bg-brand-primary border border-brand-success hover:border-white/70 shadow-md shadow-brand-primary/30 text-white rounded-xl text-[8px] font-bold uppercase tracking-[0.2em] active:scale-95 transition-all antialiased relative overflow-hidden group"
                >
                  <span className="relative z-10">{serv.label}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] z-0" />
                </button>
              ) : (
                <div className="h-[26px]" />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};