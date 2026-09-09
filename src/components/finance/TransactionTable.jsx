import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Download, FileSpreadsheet, ReceiptText } from 'lucide-react';
import { formatCurrency } from '../../services/financeService';
import ShiftSettlementReceiptModal from './ShiftSettlementReceiptModal';
import { AccountingExportService } from '../../services/accountingExportService';

const TransactionTable = ({ transactions = [], businessName = "Empresa Turnes", isLoading, empresa = {} }) => {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState(null);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
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

  const handleExportCSV = () => {
    try {
      setIsExportingCSV(true);
      const recordsToExport = filteredTransactions.map(t => ({
        fecha: t.dateFull || t.date,
        referencia: t.reference || t.id,
        tipo_movimiento: t.type === 'deposit' ? 'RECARGA' : 'PAGO_TURNO',
        concepto: t.business || t.title || 'Movimiento',
        monto_total: t.amount,
        tarifa_operativa: t.amount,
        comision_turnes: 0,
        empresa_nombre: businessName,
        empresa_nit: empresa.nit_rut || 'N/A',
        trabajador_nombre: t.counterpart || 'N/A'
      }));
      AccountingExportService.downloadCSV(recordsToExport, {
        nombre_comercial: businessName,
        nit_rut: empresa.nit_rut
      });
    } catch (err) {
      console.error('Error exportando contabilidad CSV:', err);
    } finally {
      setIsExportingCSV(false);
    }
  };

  const downloadInvoice = async () => {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

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
      tx.business || tx.title || 'Movimiento',
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

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={filter}
            onChange={handleFilterChange}
            className="bg-zinc-900 border border-white/5 text-zinc-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg outline-none hover:text-zinc-200 transition-colors cursor-pointer uppercase tracking-wider"
          >
            <option value="all" className="bg-[#0f0f10]">Todos</option>
            <option value="deposit" className="bg-[#0f0f10]">Recargas</option>
            <option value="payment" className="bg-[#0f0f10]">Pagos</option>
          </select>

          {/* Exportar a Siigo / Alegra / Excel (CSV con UTF-8 BOM) */}
          <button
            onClick={handleExportCSV}
            disabled={isExportingCSV || filteredTransactions.length === 0}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 py-1.5 px-3 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            type="button"
            title="Exportar archivo contable delimitado por ';' con UTF-8 BOM para Siigo, Alegra o Excel"
          >
            <FileSpreadsheet size={13} className="text-emerald-400" />
            <span>{isExportingCSV ? 'Exportando...' : 'Excel / Siigo'}</span>
          </button>

          {/* Exportar Resumen PDF */}
          <button
            onClick={downloadInvoice}
            disabled={filteredTransactions.length === 0}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white py-1.5 px-2.5 rounded-lg hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            type="button"
            aria-label="Descargar PDF de movimientos"
          >
            <Download size={13} className="text-zinc-500" strokeWidth={2} />
            <span>PDF</span>
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
              <th className="px-5 py-3 text-right text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Soporte</th>
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
                  <td className="px-5 py-3.5 text-right"><div className="h-4 w-12 bg-zinc-800 rounded ml-auto"></div></td>
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
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedTxForReceipt(tx)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-all cursor-pointer group"
                        type="button"
                        title="Ver comprobante oficial de liquidación"
                      >
                        <ReceiptText size={12} className="text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                        <span>Recibo</span>
                      </button>
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

      {/* 🧾 COMPROBANTE CANÓNICO WEB IMPRIMIBLE (The Stripe Model) */}
      <ShiftSettlementReceiptModal
        isOpen={!!selectedTxForReceipt}
        onClose={() => setSelectedTxForReceipt(null)}
        transaction={selectedTxForReceipt}
        empresa={{ nombre_comercial: businessName, nit_rut: empresa?.nit_rut }}
      />
    </div>
  );
};

export default TransactionTable;