import React from 'react';

const BlogCallout = ({ callout }) => {
  if (!callout) return null;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#090b0e] border border-zinc-800 border-l-4 border-l-emerald-500 text-base sm:text-lg text-zinc-200 space-y-2.5 shadow-lg">
      <span className="font-bold text-emerald-400 uppercase tracking-wider block text-xs sm:text-sm">
        {callout.badge}
      </span>
      <p className="leading-relaxed font-normal">{callout.text}</p>
    </div>
  );
};

export default BlogCallout;
