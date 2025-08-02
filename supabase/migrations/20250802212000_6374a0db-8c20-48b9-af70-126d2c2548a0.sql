-- First, let's see the duplicate vehicles
SELECT cliente_id, marca, modelo, ano, placa, COUNT(*) as duplicates
FROM veiculos 
WHERE cliente_id IS NOT NULL
GROUP BY cliente_id, marca, modelo, ano, placa
HAVING COUNT(*) > 1;

-- Remove duplicate vehicles, keeping only the most recent one for each client
DELETE FROM veiculos 
WHERE id NOT IN (
  SELECT DISTINCT ON (cliente_id) id
  FROM veiculos
  ORDER BY cliente_id, created_at DESC
);

-- Add a unique constraint to prevent future duplicates per client
-- (One vehicle per client for now, can be modified later if needed)
ALTER TABLE veiculos ADD CONSTRAINT unique_vehicle_per_client UNIQUE (cliente_id);