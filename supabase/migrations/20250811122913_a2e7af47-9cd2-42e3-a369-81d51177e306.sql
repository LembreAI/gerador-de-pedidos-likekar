-- Drop the existing unique constraint that only allows one vehicle per client
ALTER TABLE public.veiculos DROP CONSTRAINT IF EXISTS unique_vehicle_per_client;

-- Add a new unique constraint on placa (plate) that allows multiple NULL values
-- This prevents duplicate plates while allowing empty/null plates
CREATE UNIQUE INDEX idx_veiculos_placa_unique 
ON public.veiculos (placa) 
WHERE placa IS NOT NULL AND placa != '';