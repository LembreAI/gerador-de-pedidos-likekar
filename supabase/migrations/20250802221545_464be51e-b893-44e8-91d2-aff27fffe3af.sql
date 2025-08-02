-- Adicionar campo para armazenar dados originais do PDF extraído
ALTER TABLE pedidos ADD COLUMN dados_pdf_original jsonb;