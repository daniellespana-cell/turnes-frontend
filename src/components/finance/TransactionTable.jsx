import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Download } from 'lucide-react';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../../services/financeService';

const TransactionTable = ({ transactions, businessName = "Empresa Turnes", isLoading }) => {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredTransactions = transactions.filter(tx =>
    filter === 'all' ? true : tx.type === filter
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter changes
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const downloadInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Reporte de Movimientos - Turnes", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Cliente: ${businessName}`, 14, 32);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 38);

    const tableColumn = ["ID", "Detalle", "Tipo", "Fecha", "Monto"];
    const tableRows = filteredTransactions.map(tx => [
      tx.id.slice(0, 8),
      tx.title,
      tx.type === 'recharge' ? 'Recarga' : 'Pago',
      tx.date,
      formatCurrency(tx.amount)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0] }
    });

    doc.save(`Turnes_Reporte.pdf`);
  };

  return (
    <div className="bg-[#0f0f10] border border-transparent rounded-2xl overflow-hidden font-sans">
      <div className="px-5 py-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Movimientos</h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filter}
            onChange={handleFilterChange}
            className="bg-transparent text-zinc-500 text-[10px] font-bold px-2 py-1 outline-none hover:text-zinc-300 transition-colors cursor-pointer uppercase tracking-wider"
          >
            <option value="all" className="bg-[#0f0f10]">Todos</option>
            <option value="deposit" className="bg-[#0f0f10]">Recargas</option>
            <option value="payment" className="bg-[#0f0f10]">Pagos</option>
          </select>

          <button
            onClick={downloadInvoice}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white py-1.5 px-2.5 rounded-lg hover:bg-white/5 transition-all group"
            type="button"
            aria-label="Acción">
            <Download size={13} className="text-zinc-600 group-hover:text-zinc-300 transition-colors" strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Exportar</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-900/30">
            <tr>
              <th className="px-5 py-3 text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Detalle</th>
              <th className="px-5 py-3 text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Fecha</th>
              <th className="px-5 py-3 text-right text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {isLoading ? (
              // SKELETON ROWS
              ([1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-3.5"><div className="h-4 w-32 bg-zinc-800 rounded"></div></td>
                  <td className="px-5 py-3.5"><div className="h-4 w-20 bg-zinc-800 rounded"></div></td>
                  <td className="px-5 py-3.5 text-right"><div className="h-4 w-16 bg-zinc-800 rounded ml-auto"></div></td>
                </tr>
              )))
            ) : (
              currentTransactions.map((tx) => {
                const isIncome = tx.type === 'deposit';
                return (
                  <tr key={tx.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center bg-zinc-900 border border-transparent transition-colors ${
                          isIncome ? 'text-emerald-500' : 'text-amber-500'
                        }`}>
                          {isIncome ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-300">{tx.business}</p>
                          <p className="text-[9px] text-zinc-600 font-mono mt-0.5">#{tx.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-zinc-500 font-medium">{tx.date}</td>
                    <td className={`px-5 py-3.5 text-right font-black tracking-tight text-xs ${
                      isIncome ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* PAGINACIÓN */}
      {!isLoading && totalPages > 1 && (
        <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              type="button"
              aria-label="Acción">
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              type="button"
              aria-label="Acción">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;