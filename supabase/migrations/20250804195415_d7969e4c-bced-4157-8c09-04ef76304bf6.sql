-- Adicionar coluna instalador_id na tabela produtos_pedido
ALTER TABLE public.produtos_pedido 
ADD COLUMN instalador_id uuid REFERENCES public.instaladores(id);

-- Criar índice para melhorar performance das consultas
CREATE INDEX idx_produtos_pedido_instalador_id ON public.produtos_pedido(instalador_id);