import React from 'react';


const PlanCard = ({ plan, isPrivate = false, onAction, currentPlanId }) => {
  // Verificamos si este plan es el que el usuario ya tiene activo
  const isCurrent = currentPlanId === plan.id;

  return (
    <div className={`p-6 rounded-2xl border transition-all flex flex-col h-full ${
      plan.isPopular 
        ? 'border-brand-success bg-brand-success/5 ring-1 ring-brand-success/50' 
        : 'border-zinc-800 bg-zinc-900'
    }`}>
      {/* Etiqueta de Popularidad */}
      {plan.isPopular && (
        <span className="bg-brand-success text-black text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-4 uppercase tracking-wider">
          Más Popular
        </span>
      )}

      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
      <p className="text-zinc-500 text-xs mt-1 mb-4 leading-relaxed">
        {plan.description}
      </p>

      <div className="mb-6">
        <span className="text-3xl font-extrabold text-white">
          {plan.price}
        </span>
        <span className="text-zinc-500 ml-1 text-sm">{plan.frequency}</span>
      </div>
      
      <ul className="space-y-3 mb-8 flex-grow">
        {/* Renderizamos las características dinámicamente desde el array features */}
        {plan.features.map((feat, i) => (
          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
            <span className="text-brand-success mt-0.5 shrink-0">✓</span> 
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => !isCurrent && onAction(plan.id)}
        // Deshabilitamos el botón solo si es el plan actual dentro del área privada
        disabled={isCurrent && isPrivate}
        className={`w-full py-3 rounded-xl font-bold transition-all border ${
          isCurrent && isPrivate 
            ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-default opacity-80'
            : plan.buttonClass // Usamos los estilos específicos que definiste en companyPlans.js
        }`}
      >
        {/* Lógica Senior: Selección de texto según contexto y estado actual */}
        {isPrivate 
          ? (isCurrent ? plan.cta.private : `Mejorar a ${plan.name}`) 
          : plan.cta.public}
      </button>
    </div>
  );
};

export default PlanCard;