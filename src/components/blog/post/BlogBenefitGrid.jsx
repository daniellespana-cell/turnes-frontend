import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const BlogBenefitGrid = ({ grid }) => {
  if (!grid) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
      {grid.map((g, gIdx) => (
        <div key={gIdx} className="bg-[#090b0e] border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center gap-3 mb-2.5">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <h4 className="text-base sm:text-lg font-bold text-white">{g.title}</h4>
          </div>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">{g.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default BlogBenefitGrid;
