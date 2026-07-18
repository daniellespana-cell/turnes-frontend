import { supabase } from './supabaseClient';
import { BaseService } from './base/BaseService';
import { financeMapper } from '../utils/financeMapper';

/**
 * 🛡️ ADMIN SERVICE
 * Servicio central para los KPI y lógica de alto nivel transaccional del panel de administración.
 */
export const AdminService = {
    /**
     * Obtiene métricas del sistema utilizando peticiones optimizadas { head: true }
     * NUNCA descarga el payload json, solo cuenta el header HTTP para evitar colapsos de memoria
     * escalando O(1) en transferencia de red.
     */
    /**
     * Obtiene métricas del sistema utilizando peticiones optimizadas { head: true }
     * @param {string|null} startDate - Fecha inicial ISO
     * @param {string|null} endDate - Fecha final ISO
     */
    async getMetrics(startDate = null, endDate = null) {
        try {
            const buildQuery = (table, extraFilters = null) => {
                let q = supabase.from(table).select('*', { count: 'exact', head: true });
                if (startDate) q = q.gte('created_at', startDate);
                if (endDate) q = q.lte('created_at', endDate);
                if (extraFilters) q = extraFilters(q);
                return q;
            };

            // Definir consultas con claves explícitas para evitar índices frágiles
            const queriesMap = {
                totalUsers: buildQuery('perfiles'),
                empresas: buildQuery('perfiles', q => q.eq('rol', 'empresa')),
                postulantes: buildQuery('perfiles', q => q.eq('rol', 'postulante')),
                verificados: buildQuery('perfiles', q => q.eq('verificado', true)),
                totalVacancies: buildQuery('vacantes'),
                activeVacancies: buildQuery('vacantes', q => q.eq('status', 'activa')),
                pendingVerifications: buildQuery('verification_requests', q => q.eq('status', 'pending')),
                approvedVerifications: buildQuery('verification_requests', q => q.eq('status', 'approved'))
            };

            const keys = Object.keys(queriesMap);
            const promises = Object.values(queriesMap);

            // Ejecución concurrente ultra rápida sin arrastrar datos crudos
            const results = await Promise.all(promises);

            // Verificamos posibles errores globales (timeout o ACL/RLS)
            const errorObj = results.find(r => r.error);
            if (errorObj) throw errorObj.error;

            // Reconstruir mapa de resultados
            const metrics = {};
            keys.forEach((key, index) => {
                metrics[key] = results[index].count || 0;
            });

            return {
                data: {
                    users: { 
                        total: metrics.totalUsers, 
                        empresas: metrics.empresas, 
                        postulantes: metrics.postulantes, 
                        verificados: metrics.verificados 
                    },
                    vacancies: { 
                        total: metrics.totalVacancies, 
                        active: metrics.activeVacancies 
                    },
                    verifications: { 
                        pending: metrics.pendingVerifications, 
                        approved: metrics.approvedVerifications 
                    }
                },
                error: null
            };
        } catch (error) {
            console.error('🔥 AdminService Metrics Error:', error);
            // Seguimos el proxy de seguridad del BaseService
            return { data: null, error };
        }
    },

    /**
     * 🛡️ ZERO TRUST BAN: Invoca la Edge Function para banear a nivel de Auth Server
     * @param {string} userId
     */
    async suspendUser(userId) {
        try {
            const { data, error } = await supabase.functions.invoke('admin-ban-user', {
                body: { targetUserId: userId }
            });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('🔥 Error suspendiendo usuario:', error);
            return { data: null, error };
        }
    },

    /**
     * Envía enlace oficial de reseteo de clave usando Supabase Auth.
     * @param {string} email
     */
    async resetUserPassword(email) {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('🔥 Error enviando reset de password:', error);
            return { data: null, error };
        }
    },

    /**
     * Obtener detalle completo de una solicitud para auditoría y revisión (Admin Only)
     * Desacopla la lógica de red del componente UI.
     */
    async getVerificationDetail(id) {
        const query = supabase
            .from('verification_requests')
            .select(`
                *,
                perfiles (
                    id, nombre_display, avatar_url, verificado, rol,
                    empresas (nombre_comercial, nit_rut, logo_url, sector_industrial)
                )
            `)
            .eq('id', id)
            .single();
        
        return await BaseService.handle(query);
    },

    /**
     * Directorio de Perfiles: Pagina todos los usuarios de la plataforma de manera eficiente.
     * @param {string} roleFilter 'all', 'empresa', 'postulante'
     * @param {number} limit Límite de paginación
     * @param {number} offset Offset de paginación
     */
    async getUsers(roleFilter = 'all', limit = 50, offset = 0) {
        let query = supabase
            .from('perfiles')
            .select(`
                id, 
                nombre_display, 
                email, 
                rol, 
                verificado, 
                avatar_url,
                created_at,
                empresas (nombre_comercial, nit_rut)
            `)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
            
        if (roleFilter !== 'all') {
            query = query.eq('rol', roleFilter);
        }
            
        return await BaseService.handle(query);
    },

    /**
     * Extrae KPIs matemáticos globales sin sufrir por límites de paginación.
     * Utiliza el RPC (Remote Procedure Call) inyectado en Base de Datos para que
     * PostgreSQL haga el trabajo pesado en milisegundos y nos devuelva un JSON.
     */
    async getGlobalFinancialKPIs() {
        try {
            // Intento Primario: Ejecutar RPC nativo (Saneamiento Senior)
            const { data, error } = await supabase.rpc('rpc_admin_financial_kpis');
            
            if (error) {
                console.error('🔥 Ledger RPC Error:', JSON.stringify(error, null, 2));
                throw error;
            }
            
            if (!data) return { grossInflow: 0, grossOutflow: 0, netRevenue: 0, count: 0 };

            return {
                data: {
                    grossInflow: Number(data.gross_inflow) || 0,
                    grossOutflow: Number(data.gross_outflow) || 0,
                    netRevenue: Number(data.net_revenue) || 0,
                    count: Number(data.total_transactions) || 0
                },
                error: null
            };
        } catch (error) {
            console.error('🔥 Motor KPI Ledger Fallback. Intentando cálculo en cliente para los últimos registros...');
            try {
                // VULN-FIX: Paginación segura para calcular el Ledger completo en el fallback
                let inFlow = 0;
                let outFlow = 0;
                let totalCount = 0;
                
                const pageSize = 5000;
                let page = 0;
                let hasMore = true;

                while (hasMore) {
                    const from = page * pageSize;
                    const to = from + pageSize - 1;

                    const { data, error: fbError } = await supabase
                        .from('movimientos')
                        .select('monto')
                        .order('created_at', { ascending: false })
                        .range(from, to);

                    if (fbError) throw fbError;

                    if (!data || data.length === 0) {
                        hasMore = false;
                        break;
                    }

                    for (let i = 0; i < data.length; i++) {
                        const m = Number(data[i].monto) || 0;
                        if (m > 0) inFlow += m;
                        else outFlow += Math.abs(m);
                    }

                    totalCount += data.length;
                    
                    if (data.length < pageSize) {
                        hasMore = false;
                    } else {
                        page++;
                    }
                }

                return {
                    data: {
                        grossInflow: inFlow,
                        grossOutflow: outFlow,
                        netRevenue: inFlow - outFlow,
                        count: totalCount
                    },
                    error: null
                };
            } catch (fallbackErr) {
                console.error('🔥 Fallo en Fallback Final:', fallbackErr);
                return { 
                    data: { grossInflow: 0, grossOutflow: 0, netRevenue: 0, count: 0 }, 
                    error: fallbackErr 
                };
            }
        }
    },

    /**
     * Ledger Global: Auditoría directa de ingresos y egresos de TODO el sistema.
     * Utiliza un Join Manual (In-Memory) para evitar crashes por caché de Foreign Keys
     * faltantes en Supabase entre Billeteras y Perfiles.
     */
    async getAllMovements(limit = 100, offset = 0) {
        // 1. Extraer el Ledger crudo
        const { data: movimientos, error } = await supabase
            .from('movimientos')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
            
        if (error) return { data: null, error };
        if (!movimientos || movimientos.length === 0) return { data: [], error: null };

        // 2. Extraer contrapartes validando nulos
        const billeteraIds = [...new Set(movimientos.map(m => m.billetera_id).filter(Boolean))];
        
        const { data: perfiles } = await supabase
            .from('perfiles')
            .select(`
                id, 
                nombre_display, 
                email, 
                rol, 
                empresas (nombre_comercial)
            `)
            .in('id', billeteraIds);

        // 3. Compilar matriz cruzada manual
        const perfilesMap = {};
        if (perfiles) {
            perfiles.forEach(p => perfilesMap[p.id] = p);
        }

        const dataEnriquecida = movimientos.map(trx => ({
            ...trx,
            billeteras: {
                perfiles: perfilesMap[trx.billetera_id] || null
            }
        }));

        return { data: financeMapper.mapTransactions(dataEnriquecida), error: null };
    },

    /**
     * Extrae el Leaderboard Financiero (Billeteras con mayor liquidez en Turnes).
     * Utiliza un Join Manual (In-Memory) para evitar crashes por caché de Foreign Keys
     * faltantes en Supabase entre billeteras y perfiles.
     */
    async getCompanyBalances(limit = 100) {
        // 1. Extraer billeteras ordenadas por saldo
        const { data: billeteras, error } = await supabase
            .from('billeteras')
            .select('id, saldo, updated_at')
            .order('saldo', { ascending: false })
            .limit(limit);

        if (error) return { data: null, error };
        if (!billeteras || billeteras.length === 0) return { data: [], error: null };

        // 2. Extraer perfiles validando nulos
        const userIds = [...new Set(billeteras.map(b => b.user_id || b.id).filter(Boolean))];

        const { data: perfiles } = await supabase
            .from('perfiles')
            .select(`
                id, 
                nombre_display, 
                email, 
                rol, 
                avatar_url,
                empresas (nombre_comercial)
            `)
            .in('id', userIds);

        // 3. Compilar matriz cruzada manual
        const perfilesMap = {};
        if (perfiles) {
            perfiles.forEach(p => perfilesMap[p.id] = p);
        }

        const dataEnriquecida = billeteras.map(b => ({
            ...b,
            perfiles: perfilesMap[b.user_id || b.id] || null
        }));

        return { data: dataEnriquecida, error: null };
    },

    /**
     * Suscribirse a cambios globales en el Ledger (Admin Realtime)
     */
    subscribeToAllMovements(callback) {
        return supabase
            .channel('admin-ledger-all')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'movimientos'
            }, callback)
            .subscribe();
    },

    unsubscribe(channel) {
        if (channel) supabase.removeChannel(channel);
    }
};

export default AdminService;
