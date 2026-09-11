import React from 'react';

const BlogStepList = ({ steps }) => {
  if (!steps) return null;

  return (
    <div className="space-y-4 pt-2">
      {steps.map((step) => (
        <div 
          key={step.number}
          className="bg-[#090b0e] border border-zinc-800/80 rounded-2xl p-6 sm:p-7 flex items-start gap-4 sm:gap-5 hover:border-zinc-700/80 transition-colors"
        >
          <span className="font-mono text-sm sm:text-base font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-3.5 py-2 rounded-xl shrink-0">
            {step.number}
          </span>
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogStepList;
