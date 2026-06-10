-- Saneamiento Matemático de Financial Ledger v2
-- Calcula la matemática agregada (SUM) en milisegundos a nivel de Base de Datos
-- Lógica matemática Senior: Todo monto > 0 es un Ingreso, todo monto < 0 es un Egreso.
-- Cero nombres de columnas "quemados" o obsoletos.

CREATE OR REPLACE FUNCTION rpc_admin_financial_kpis()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_in numeric;
    total_out numeric;
    count_trx bigint;
BEGIN
    SELECT COALESCE(SUM(monto), 0) INTO total_in FROM movimientos WHERE monto > 0;
    SELECT COALESCE(SUM(ABS(monto)), 0) INTO total_out FROM movimientos WHERE monto < 0;
    SELECT COUNT(id) INTO count_trx FROM movimientos;

    RETURN json_build_object(
        'gross_inflow', total_in,
        'gross_outflow', total_out,
        'net_revenue', total_in - total_out,
        'total_transactions', count_trx
    );
END;
$$;
