import React from 'react';
import { Download, Search } from 'lucide-react';
import Spinner from '../../components/ui/Spinner';
import FinanceKpiCards from '../../components/admin/finance/FinanceKpiCards';
import LedgerTable from '../../components/admin/finance/LedgerTable';
import BalancesTable from '../../components/admin/finance/BalancesTable';
import WompiGateway from '../../components/admin/finance/WompiGateway';

import { ListFilter, Users, CreditCard } from 'lucide-react';
import { useAdminFinances } from '../../hooks/admin/useAdminFinances';
import { FLOW_TABS, FINANCE_TABS } from '../../domain/admin.config';

/**
 * 💰 ADMIN FINANCES PAGE — Orquestador Puro
 * Toda la lógica vive en useAdminFinances.
 * Toda la UI pesada vive en componentes de admin/finance/.
 */
const AdminFinancesPage = () => {
    const {
        loading, globalKPIs,
        filter, setFilter,
        activeTab, setActiveTab,
        searchQuery, setSearchQuery,
        filteredLedger, filteredBalances,
        handleExport,
        wompiLedger, wompiKPIs, wompiFilter, setWompiFilter
    } = useAdminFinances();

    if (loading) {
        return (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
                <Spinner size="xl" variant="blue" text="Cargando Ledger Financiero..." />
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4 md:p-8 overflow-y-auto font-manrope">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-white">Ledger <span className="text-emerald-400">Financiero Central</span></h1>
                        <p className="text-zinc-500 text-xs mt-1">
                            Auditoría absoluta ({globalKPIs.count.toLocaleString()} operaciones en red). Cero manipulación matemática.
                        </p>
                    </div>
                </div>

                {/* KPI Cards */}
                <FinanceKpiCards globalKPIs={globalKPIs} />

                {/* Toolbar: Tabs + Search */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex bg-black/50 p-1 rounded-xl border border-white/5 w-full lg:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {FINANCE_TABS.map(tab => {
                            const IconMap = { ledger: ListFilter, wompi: CreditCard, balances: Users };
                            const TabIcon = IconMap[tab.id] || ListFilter;
                            const activeColors = { ledger: 'text-emerald-400', wompi: 'text-purple-400', balances: 'text-blue-400' };
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 lg:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    type="button"
                                    aria-label="Acción">
                                    <TabIcon size={16} className={activeTab === tab.id ? activeColors[tab.id] : ''} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="relative w-full lg:w-96">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-zinc-500" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar empresa, correo o ID..."
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'ledger' ? (
                    <div className="space-y-4">
                        {/* Quick Filters + Export */}
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto whitespace-nowrap scrollbar-hide w-full md:w-auto">
                                {FLOW_TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setFilter(tab.id)}
                                        aria-label={`Filtrar por ${tab.label}`}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                                            filter === tab.id
                                                ? `bg-zinc-800 ${tab.id === 'in' ? 'text-emerald-400' : tab.id === 'out' ? 'text-red-400' : 'text-white'}`
                                                : 'text-zinc-500 hover:text-white'
                                        }`}
                                        type="button">
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleExport}
                                aria-label="Exportar a CSV Local"
                                className="w-full md:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-widest transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                                type="button">
                                <Download size={14} /> Exportar CSV
                            </button>
                        </div>
                        <div className="bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden relative">
                            <LedgerTable data={filteredLedger} loading={false} />
                        </div>
                    </div>
                ) : activeTab === 'wompi' ? (
                    <WompiGateway
                        wompiLedger={wompiLedger}
                        wompiKPIs={wompiKPIs}
                        wompiFilter={wompiFilter}
                        setWompiFilter={setWompiFilter}
                    />
                ) : (
                    <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
                        <BalancesTable data={filteredBalances} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFinancesPage;
