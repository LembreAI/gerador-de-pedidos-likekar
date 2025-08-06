-- Create checklist table for vehicles
CREATE TABLE public.checklist_veiculo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  veiculo_id UUID NOT NULL,
  possui_multimidia BOOLEAN DEFAULT FALSE,
  possui_insulfilm BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.checklist_veiculo ENABLE ROW LEVEL SECURITY;

-- Create policies for checklist access
CREATE POLICY "Users can view checklist of their clients' vehicles" 
ON public.checklist_veiculo 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM veiculos v
  JOIN clientes c ON v.cliente_id = c.id
  WHERE v.id = checklist_veiculo.veiculo_id 
  AND c.user_id = auth.uid()
));

CREATE POLICY "Users can manage checklist of their clients' vehicles" 
ON public.checklist_veiculo 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM veiculos v
  JOIN clientes c ON v.cliente_id = c.id
  WHERE v.id = checklist_veiculo.veiculo_id 
  AND c.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_checklist_veiculo_updated_at
BEFORE UPDATE ON public.checklist_veiculo
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();