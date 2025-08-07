-- Atribuir role de admin para a conta likekarsuporte@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'::user_role
FROM public.profiles p
WHERE p.email = 'likekarsuporte@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = p.user_id
)
ON CONFLICT (user_id, role) DO NOTHING;