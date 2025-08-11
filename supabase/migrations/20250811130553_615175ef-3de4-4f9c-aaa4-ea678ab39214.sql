-- Option A: All authenticated users share the same data across clientes, veiculos, pedidos, produtos_pedido
-- We update RLS policies to allow all authenticated users to SELECT/INSERT/UPDATE/DELETE

-- CLIENTES
DROP POLICY IF EXISTS "Users can manage their clientes" ON public.clientes;
DROP POLICY IF EXISTS "Users can view their clientes" ON public.clientes;

CREATE POLICY "Authenticated can view all clientes"
ON public.clientes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert clientes"
ON public.clientes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update clientes"
ON public.clientes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete clientes"
ON public.clientes
FOR DELETE
TO authenticated
USING (true);

-- VEICULOS
DROP POLICY IF EXISTS "Users can manage vehicles of their clients" ON public.veiculos;
DROP POLICY IF EXISTS "Users can view vehicles of their clients" ON public.veiculos;

CREATE POLICY "Authenticated can view all veiculos"
ON public.veiculos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert veiculos"
ON public.veiculos
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update veiculos"
ON public.veiculos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete veiculos"
ON public.veiculos
FOR DELETE
TO authenticated
USING (true);

-- PEDIDOS
DROP POLICY IF EXISTS "Users can manage their pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Users can view their pedidos" ON public.pedidos;

CREATE POLICY "Authenticated can view all pedidos"
ON public.pedidos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert pedidos"
ON public.pedidos
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update pedidos"
ON public.pedidos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete pedidos"
ON public.pedidos
FOR DELETE
TO authenticated
USING (true);

-- PRODUTOS_PEDIDO
DROP POLICY IF EXISTS "Users can manage products of their orders" ON public.produtos_pedido;
DROP POLICY IF EXISTS "Users can view products of their orders" ON public.produtos_pedido;

CREATE POLICY "Authenticated can view all produtos_pedido"
ON public.produtos_pedido
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert produtos_pedido"
ON public.produtos_pedido
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update produtos_pedido"
ON public.produtos_pedido
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete produtos_pedido"
ON public.produtos_pedido
FOR DELETE
TO authenticated
USING (true);
