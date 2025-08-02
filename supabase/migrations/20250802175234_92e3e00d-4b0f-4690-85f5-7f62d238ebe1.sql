-- Add comissao column to instaladores table
ALTER TABLE public.instaladores 
ADD COLUMN comissao NUMERIC DEFAULT 5.00;