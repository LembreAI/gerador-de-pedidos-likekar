-- Limpar emails dos instaladores existentes
UPDATE public.instaladores SET email = '' WHERE email LIKE '%@exemplo.com%';