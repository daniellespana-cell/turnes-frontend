import { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { classifyWompiConcept } from '../../domain/admin.config';

/**
 * 💰 useAdminFinances — Hook de lógica financiera del admin
 * Extrae todo el estado, fetching, filtrado y exportación CSV.
 */
export const useAdminFinances = () => {
    const { showToast } = useToast();
    const [ledger, setLedger] = useState([]);
    const [balances, setBalances] = useState([]);
    const [globalKPIs, setGlobalKPIs] = useState({ grossInflow: 0, grossOutflow: 0, netRevenue: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('ledger');
    const [searchQuery, setSearchQuery] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [ledgerRes, kpiRes, balancesRes] = await Promise.all([
                AdminService.getAllMovements(100, 0),
                AdminService.getGlobalFinancialKPIs(),
                AdminService.getCompanyBalances(100)
            ]);

            if (ledgerRes.error || kpiRes.error || balancesRes.error) {
                showToast('Fallo Crítico al consultar capa transaccional.', 'error');
            }

            setLedger(ledgerRes.data || []);
            setBalances(balancesRes.data || []);
            if (kpiRes.data) setGlobalKPIs(kpiRes.data);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        load();
        
        // 🚀 ADMIN REALTIME: Auditoría viva de movimientos
        const channel = AdminService.subscribeToAllMovements(() => {
            load();
        });

        return () => {
            if (channel) AdminService.unsubscribe(channel);
        };
    }, [load]);

    // --- FILTRADO (Memoizado) ---
    const normalizedQuery = useMemo(() => searchQuery.toLowerCase().trim(), [searchQuery]);

    /** Helper puro: verifica si un perfil coincide con la query de búsqueda */
    const matchesSearch = useCallback((profile, extraFields = []) => {
        if (!normalizedQuery) return true;
        const fields = [
            profile?.nombre_display || '',
            profile?.email || '',
            profile?.empresas?.nombre_comercial || '',
            ...extraFields
        ];
        return fields.some(f => f.toLowerCase().includes(normalizedQuery));
    }, [normalizedQuery]);

    const filteredLedger = useMemo(() => {
        return ledger.filter(t => {
            // Filtro de dirección (in/out)
            if (filter === 'in' && (t.monto || 0) <= 0) return false;
            if (filter === 'out' && (t.monto || 0) >= 0) return false;

            // Filtro de búsqueda
            if (normalizedQuery) {
                const profile = t.billeteras?.perfiles;
                const txRef = t.id || '';
                const concepto = t.concepto || '';
                if (!matchesSearch(profile, [txRef, concepto])) return false;
            }
            return true;
        });
    }, [ledger, filter, normalizedQuery, matchesSearch]);

    const filteredBalances = useMemo(() => {
        return balances.filter(b => matchesSearch(b.perfiles));
    }, [balances, matchesSearch]);

    // --- WOMPI GATEWAY (Solo transacciones verificadas por pasarela de pagos) ---
    const [wompiFilter, setWompiFilter] = useState('all');

    const wompiLedger = useMemo(() => {
        return ledger
            .filter(t => !!t.metadata?.wompi_id)
            .filter(t => {
                if (wompiFilter === 'all') return true;
                const category = classifyWompiConcept(t.concepto);
                if (wompiFilter === 'recarga') return category.label === 'Recarga de Billetera';
                if (wompiFilter === 'plan') return category.label === 'Compra de Plan';
                if (wompiFilter === 'verificacion') return category.label === 'Verificación KYC';
                return true;
            })
            .filter(t => {
                if (!normalizedQuery) return true;
                const profile = t.billeteras?.perfiles;
                const txRef = t.id || '';
                const wompiRef = t.metadata?.wompi_id || '';
                return matchesSearch(profile, [txRef, wompiRef]);
            });
    }, [ledger, wompiFilter, normalizedQuery, matchesSearch]);

    const wompiKPIs = useMemo(() => {
        let totalVolume = 0;
        const totalCount = wompiLedger.length;
        const byCategory = {};

        wompiLedger.forEach(trx => {
            const monto = Math.abs(trx.monto || 0);
            totalVolume += monto;
            const cat = classifyWompiConcept(trx.concepto);
            if (!byCategory[cat.label]) byCategory[cat.label] = { count: 0, volume: 0, ...cat };
            byCategory[cat.label].count++;
            byCategory[cat.label].volume += monto;
        });

        return { totalVolume, totalCount, byCategory: Object.values(byCategory) };
    }, [wompiLedger]);

    // --- EXPORTACIÓN CSV (con cleanup de ObjectURL) ---
    const handleExport = useCallback(() => {
        let objectUrl = null;
        try {
            const headers = ['ID Transacción', 'Fecha ISO', 'Contraparte', 'Contexto', 'Monto (COP)', 'Flujo', 'Verificación Externa'];
            const rows = filteredLedger.map(trx => {
                const perfilObj = trx.billeteras?.perfiles || {};
                const userName = (perfilObj.empresas?.nombre_comercial || perfilObj.nombre_display || 'Entidad Desconocida').replace(/,/g, '');
                const contextClean = (trx.concepto || 'Operación Interna').replace(/,/g, '');

                return [
                    `TRX-${trx.id}`,
                    new Date(trx.created_at).toISOString(),
                    userName,
                    contextClean,
                    trx.monto || 0,
                    (trx.monto || 0) > 0 ? 'INGRESO' : 'EGRESO',
                    trx.metadata?.wompi_id ? 'WOMPI_VERIFICADO' : 'LEDGER_INTERNO'
                ].join(',');
            });

            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            objectUrl = URL.createObjectURL(blob);
            link.href = objectUrl;
            link.download = `turnes_ledger_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            showToast('Ledger descargado con éxito.', 'success');
        } catch (err) {
            showToast('Error procesando el archivo CSV.', 'error');
        } finally {
            // Prevenir memory leak: liberar ObjectURL
            if (objectUrl) {
                setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            }
        }
    }, [filteredLedger, showToast]);

    return {
        loading,
        globalKPIs,
        filter, setFilter,
        activeTab, setActiveTab,
        searchQuery, setSearchQuery,
        filteredLedger,
        filteredBalances,
        handleExport,
        // Wompi Gateway
        wompiLedger,
        wompiKPIs,
        wompiFilter, setWompiFilter
    };
};
