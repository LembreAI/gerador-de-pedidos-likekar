-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cargo TEXT DEFAULT 'user',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de vendedores
CREATE TABLE public.vendedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  comissao DECIMAL(5,2) DEFAULT 5.00,
  vendas_total INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de instaladores
CREATE TABLE public.instaladores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  especialidade TEXT,
  cidade TEXT,
  estado TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf_cnpj TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de veículos
CREATE TABLE public.veiculos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER,
  placa TEXT,
  cor TEXT,
  chassi TEXT,
  combustivel TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de pedidos
CREATE TABLE public.pedidos (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id) ON DELETE CASCADE,
  vendedor_id UUID REFERENCES public.vendedores(id),
  instalador_id UUID REFERENCES public.instaladores(id),
  responsavel_nome TEXT NOT NULL,
  responsavel_telefone TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  valor_total DECIMAL(10,2) DEFAULT 0.00,
  observacoes TEXT,
  pdf_original_url TEXT,
  pdf_gerado_url TEXT,
  data_instalacao DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de produtos do pedido
CREATE TABLE public.produtos_pedido (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id TEXT NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  quantidade INTEGER DEFAULT 1,
  valor_unitario DECIMAL(10,2) DEFAULT 0.00,
  valor_total DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de configurações da empresa
CREATE TABLE public.configuracoes_empresa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_empresa TEXT NOT NULL,
  cnpj TEXT,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instaladores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_empresa ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para vendedores
CREATE POLICY "Users can view their vendedores" ON public.vendedores
FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can manage their vendedores" ON public.vendedores
FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);

-- Políticas RLS para instaladores
CREATE POLICY "Users can view their instaladores" ON public.instaladores
FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can manage their instaladores" ON public.instaladores
FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);

-- Políticas RLS para clientes
CREATE POLICY "Users can view their clientes" ON public.clientes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their clientes" ON public.clientes
FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para veículos
CREATE POLICY "Users can view vehicles of their clients" ON public.veiculos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.clientes 
    WHERE clientes.id = veiculos.cliente_id 
    AND clientes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage vehicles of their clients" ON public.veiculos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.clientes 
    WHERE clientes.id = veiculos.cliente_id 
    AND clientes.user_id = auth.uid()
  )
);

-- Políticas RLS para pedidos
CREATE POLICY "Users can view their pedidos" ON public.pedidos
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their pedidos" ON public.pedidos
FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para produtos_pedido
CREATE POLICY "Users can view products of their orders" ON public.produtos_pedido
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.pedidos 
    WHERE pedidos.id = produtos_pedido.pedido_id 
    AND pedidos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage products of their orders" ON public.produtos_pedido
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.pedidos 
    WHERE pedidos.id = produtos_pedido.pedido_id 
    AND pedidos.user_id = auth.uid()
  )
);

-- Políticas RLS para configurações da empresa
CREATE POLICY "Users can view their empresa config" ON public.configuracoes_empresa
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their empresa config" ON public.configuracoes_empresa
FOR ALL USING (auth.uid() = user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendedores_updated_at
  BEFORE UPDATE ON public.vendedores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instaladores_updated_at
  BEFORE UPDATE ON public.instaladores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_veiculos_updated_at
  BEFORE UPDATE ON public.veiculos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracoes_empresa_updated_at
  BEFORE UPDATE ON public.configuracoes_empresa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar profile automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar bucket de storage para PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false);

-- Políticas de storage para PDFs
CREATE POLICY "Users can view their own PDFs" ON storage.objects
FOR SELECT USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own PDFs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own PDFs" ON storage.objects
FOR UPDATE USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);