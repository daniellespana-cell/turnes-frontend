import React from 'react';

const BlogCardGrid = ({ cards }) => {
  if (!cards) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
      {cards.map((c, cIdx) => (
        <div key={cIdx} className="bg-[#090b0e] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
          <div>
            <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
              {cIdx + 1}
            </span>
            <h4 className="font-bold text-white text-base sm:text-lg mb-2.5">{c.title}</h4>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">{c.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogCardGrid;
