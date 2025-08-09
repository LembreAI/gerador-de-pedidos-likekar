
-- Permitir que administradores vejam todos os perfis
create policy "Admins can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (is_admin(auth.uid()));

-- Opcional: permitir que administradores atualizem qualquer perfil
-- (útil se você quiser editar dados de perfis pela UI no futuro)
create policy "Admins can update all profiles"
  on public.profiles
  for update
  to authenticated
  using (is_admin(auth.uid()));
