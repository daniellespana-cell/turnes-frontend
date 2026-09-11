import React from 'react';
import { Zap } from 'lucide-react';

const BlogComparisonTable = ({ table }) => {
  if (!table) return null;

  return (
    <div className="space-y-4 pt-2">
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#090b0e] shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-zinc-800 bg-[#121720] text-zinc-200 font-extrabold uppercase tracking-wider text-xs sm:text-sm">
              {table.headers.map((h, hIdx) => (
                <th key={hIdx} className={`p-4 sm:p-5 ${hIdx === 1 ? 'bg-emerald-950/40 text-emerald-300 border-x border-emerald-500/20' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 text-sm sm:text-base">
            {table.rows.map((row, rIdx) => {
              if (row.cells && Array.isArray(row.cells)) {
                return (
                  <tr key={rIdx} className="hover:bg-zinc-900/30 transition-colors">
                    {row.cells.map((cellText, cIdx) => (
                      <td 
                        key={cIdx} 
                        className={`p-4 sm:p-5 align-top leading-relaxed ${
                          cIdx === 0 
                            ? 'font-bold text-white bg-zinc-950/40 w-1/4' 
                            : cIdx === 1 
                              ? 'font-semibold text-emerald-200 bg-emerald-950/20 border-x border-emerald-500/20' 
                              : 'text-zinc-300'
                        }`}
                      >
                        {cIdx === 1 && (
                          <div className="flex items-center gap-1.5 mb-1 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                            <Zap size={14} className="fill-emerald-400" />
                            <span>Ventaja Turnes</span>
                          </div>
                        )}
                        <span>{cellText}</span>
                      </td>
                    ))}
                  </tr>
                );
              }

              return (
                <tr key={rIdx} className={row.isTurnes ? 'bg-emerald-950/20 font-medium' : 'hover:bg-zinc-900/40 transition-colors'}>
                  <td className="p-4 sm:p-5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {row.isTurnes && <Zap size={15} className="text-emerald-400 fill-emerald-400" />}
                      <span>{row.name}</span>
                    </div>
                    {row.isTurnes && (
                      <span className="inline-block mt-1 text-xs text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded font-bold">
                        RECOMENDADO
                      </span>
                    )}
                  </td>
                  <td className="p-4 sm:p-5 text-zinc-300">{row.cost}</td>
                  <td className="p-4 sm:p-5 text-zinc-300">{row.time}</td>
                  <td className="p-4 sm:p-5 text-zinc-300">{row.validation}</td>
                  {row.workerFee && (
                    <td className="p-4 sm:p-5">
                      <span className={row.isTurnes ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                        {row.workerFee}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {table.note && (
        <p className="text-xs sm:text-sm text-zinc-500 italic leading-relaxed">{table.note}</p>
      )}
    </div>
  );
};

export default BlogComparisonTable;
