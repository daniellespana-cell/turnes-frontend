-- 🔧 PATCH: Agregar coordenadas a vacantes existentes que llegaron con lat/lng NULL
-- Ejecutar en Supabase SQL Editor para reparar las vacantes ya publicadas.
-- Mapea la ciudad guardada en 'direccion_formateada' a las coordenadas del config de geografía.

UPDATE vacantes
SET
    lat = CASE direccion_formateada
        WHEN 'Bogotá D.C.'     THEN 4.6097   WHEN 'Medellín'       THEN 6.2442
        WHEN 'Cali'            THEN 3.4516   WHEN 'Barranquilla'   THEN 10.9685
        WHEN 'Bucaramanga'     THEN 7.1193   WHEN 'Cartagena'      THEN 10.3910
        WHEN 'Cúcuta'          THEN 7.8939   WHEN 'Pereira'        THEN 4.8133
        WHEN 'Manizales'       THEN 5.0702   WHEN 'Santa Marta'    THEN 11.2407
        WHEN 'Ibagué'          THEN 4.4388   WHEN 'Pasto'          THEN 1.2136
        WHEN 'Neiva'           THEN 2.9273   WHEN 'Villavicencio'  THEN 4.1420
        WHEN 'Montería'        THEN 8.7479   WHEN 'Valledupar'     THEN 10.4631
        WHEN 'Armenia'         THEN 4.5338   WHEN 'Tunja'          THEN 5.5352
        WHEN 'Popayán'         THEN 2.4448   WHEN 'Floridablanca'  THEN 7.0624
        WHEN 'Girón'           THEN 7.0682   WHEN 'Piedecuesta'    THEN 6.9875
        WHEN 'Soacha'          THEN 4.5872   WHEN 'Bello'          THEN 6.3373
        WHEN 'Itagüí'          THEN 6.1846   WHEN 'Envigado'       THEN 6.1759
        WHEN 'Sabaneta'        THEN 6.1515   WHEN 'Rionegro'       THEN 6.1534
        WHEN 'Chía'            THEN 4.8647   WHEN 'Cajicá'         THEN 4.9242
        WHEN 'Mosquera'        THEN 4.7059   WHEN 'Madrid'         THEN 4.7324
        WHEN 'Funza'           THEN 4.7171   WHEN 'Palmira'        THEN 3.5394
        WHEN 'Yumbo'           THEN 3.5806   WHEN 'Jamundí'        THEN 3.2612
        WHEN 'Buga'            THEN 3.9009   WHEN 'Soledad'        THEN 10.9184
        WHEN 'Puerto Colombia' THEN 10.9880  WHEN 'Dosquebradas'   THEN 4.8396
        ELSE lat  -- mantener el valor actual si ya tiene o no está en el mapa
    END,
    lng = CASE direccion_formateada
        WHEN 'Bogotá D.C.'     THEN -74.0817  WHEN 'Medellín'       THEN -75.5812
        WHEN 'Cali'            THEN -76.5320  WHEN 'Barranquilla'   THEN -74.7813
        WHEN 'Bucaramanga'     THEN -73.1227  WHEN 'Cartagena'      THEN -75.4794
        WHEN 'Cúcuta'          THEN -72.5078  WHEN 'Pereira'        THEN -75.6961
        WHEN 'Manizales'       THEN -75.5138  WHEN 'Santa Marta'    THEN -74.1990
        WHEN 'Ibagué'          THEN -75.2322  WHEN 'Pasto'          THEN -77.2811
        WHEN 'Neiva'           THEN -75.2818  WHEN 'Villavicencio'  THEN -73.6266
        WHEN 'Montería'        THEN -75.8814  WHEN 'Valledupar'     THEN -73.2532
        WHEN 'Armenia'         THEN -75.6811  WHEN 'Tunja'          THEN -73.3677
        WHEN 'Popayán'         THEN -76.6147  WHEN 'Floridablanca'  THEN -73.0862
        WHEN 'Girón'           THEN -73.1698  WHEN 'Piedecuesta'    THEN -73.0494
        WHEN 'Soacha'          THEN -74.2213  WHEN 'Bello'          THEN -75.5579
        WHEN 'Itagüí'          THEN -75.5991  WHEN 'Envigado'       THEN -75.5917
        WHEN 'Sabaneta'        THEN -75.6171  WHEN 'Rionegro'       THEN -75.3743
        WHEN 'Chía'            THEN -74.0583  WHEN 'Cajicá'         THEN -74.0270
        WHEN 'Mosquera'        THEN -74.2302  WHEN 'Madrid'         THEN -74.2642
        WHEN 'Funza'           THEN -74.2120  WHEN 'Palmira'        THEN -76.3036
        WHEN 'Yumbo'           THEN -76.4951  WHEN 'Jamundí'        THEN -76.5413
        WHEN 'Buga'            THEN -76.2978  WHEN 'Soledad'        THEN -74.7699
        WHEN 'Puerto Colombia' THEN -74.9626  WHEN 'Dosquebradas'   THEN -75.6738
        ELSE lng  -- mantener el valor actual si ya tiene o no está en el mapa
    END
WHERE lat IS NULL OR lng IS NULL;

-- Verificar cuántas se actualizaron:
SELECT COUNT(*) AS vacantes_sin_coords FROM vacantes WHERE lat IS NULL OR lng IS NULL;
SELECT id, titulo, direccion_formateada, lat, lng FROM vacantes ORDER BY created_at DESC LIMIT 10;
